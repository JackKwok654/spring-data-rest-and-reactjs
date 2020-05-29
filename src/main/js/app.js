'use strict';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
const React = require('react'); 
const when = require('when'); 
const ReactDOM = require('react-dom'); 
const client = require('./client'); 

const follow = require('./follow');

const root = '/api';

class App extends React.Component { 

	constructor(props) {
		super(props);
		this.state = {products: [], attributes: [], pageSize: 2, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	loadFromServer(pageSize) {
		follow(client, root, [
			{rel: 'products', params: {size: pageSize}}]
		).then(productCollection => {
			return client({
				method: 'GET',
				path: productCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				this.schema = schema.entity;
				this.links = productCollection.entity._links;
				return productCollection;
			});
		}).then(productCollection => {// The second then(employeeCollection ⇒ …​) clause converts the collection of employees into an array of GET promises to fetch each individual resource. This is what you need to fetch an ETag header for each product
			return productCollection.entity._embedded.products.map(product =>
				client({
					method: 'GET',
					path: product._links.self.href
				})
			);
		}).then(productPromises => {
			return when.all(productPromises);
		}).done(products => {
			this.setState({
				products: products,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: this.links
			});
		});
	}

	componentDidMount() { 
		this.loadFromServer(this.state.pageSize);
	}

	onCreate(newProduct) {
		follow(client, root, ['products']).then(response => {
			return client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newProduct,
				headers: {'Content-Type': 'application/json'}
			})
		}).then(response => {
			return follow(client, root, [
				{rel: 'products', params: {'size': this.state.pageSize}}]);
		}).done(response => {
			if (typeof response.entity._links.last !== "undefined") {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		});
	}

	onUpdate(product, updatedProduct) {
		client({
			method: 'PUT',
			path: product.entity._links.self.href,
			entity: updatedProduct,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': product.headers.Etag
			}
		}).done(response => {
			this.loadFromServer(this.state.pageSize);
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' +
					product.entity._links.self.href + '. Your copy is stale.');
			}
		});
	}

	onDelete(product) {
		client({method: 'DELETE', path: product.entity._links.self.href}).done(response => {
			this.loadFromServer(this.state.pageSize);
		});
	}

	onNavigate(navUri) {
		client({
			method: 'GET', 
			path: navUri
		}).then(productCollection => {
			this.links = productCollection.entity._links;

			return productCollection.entity._embedded.products.map(product =>
				client({
					method: 'GET',
					path: product._links.self.href
				})
			);
		}).then(productPromises => {
			return when.all(productPromises);
		}).done(products => {
			this.setState({
				products: products,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}

	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}

	render() {
		return (
			<div>
				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
				<ProductList products={this.state.products}
							  links={this.state.links}
							  pageSize={this.state.pageSize}
							  attributes={this.state.attributes}
							  onNavigate={this.onNavigate}
							  onDelete={this.onDelete}
							  onUpdate={this.onUpdate}
							  updatePageSize={this.updatePageSize}/>
			</div>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const newProduct = {};
		this.props.attributes.forEach(attribute => {
			newProduct[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newProduct);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
			ReactDOM.findDOMNode(this.refs[attribute]).value = '';
		});

		// Navigate away from the dialog to hide it.
		window.location = "#";
	}

	render() {
		const inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={attribute} ref={attribute} className="field"/>
			</p>
		);

		return (
			<div>
				<a href="#createProduct">Create</a>

				<div id="createProduct" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new product</h2>

						<form>
							{inputs}
							<Button onClick={this.handleSubmit}>Create</Button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}

class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const updatedProduct = {};
		this.props.attributes.forEach(attribute => {
			updatedProduct[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.product, updatedProduct);
		window.location = "#";
	}

	render() {
		const inputs = this.props.attributes.map(attribute =>
			<p key={this.props.product.entity[attribute]}>
				<input type="text" placeholder={attribute}
					   defaultValue={this.props.product.entity[attribute]}
					   ref={attribute} className="field"/>
			</p>
		);

		const dialogId = "updateProduct-" + this.props.product.entity._links.self.href;

		return (
			<div key={this.props.product.entity._links.self.href}>
				<a href={"#" + dialogId}>Update</a>
				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update an product</h2>

						<form>
							{inputs}
							<Button onClick={this.handleSubmit}>Update</Button>
						</form>
					</div>
				</div>
			</div>
		)
	}

};

class ProductList extends React.Component{

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		e.preventDefault();
		const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value =
				pageSize.substring(0, pageSize.length - 1);
		}
	}

	handleNavFirst(e){
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

	render() {
		const products = this.props.products.map(product =>
			<Product key={product.entity._links.self.href} 
							product={product}
							attributes={this.props.attributes}
							onUpdate={this.props.onUpdate}
							onDelete={this.props.onDelete}/>
		);

		const navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<Button key="first" onClick={this.handleNavFirst}>&lt;&lt;</Button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<Button key="prev" onClick={this.handleNavPrev}>&lt;</Button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<Button key="next" onClick={this.handleNavNext}>&gt;</Button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<Button key="last" onClick={this.handleNavLast}>&gt;&gt;</Button>);
		}

		return (
			<div>
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
				<Table striped bordered hover variant="dark">
					<tbody>
						<tr>
							<th>Name</th>
							<th>Price</th>
							<th>Description</th>
							<th>Stock</th>
							<th>Location</th>
						</tr>
						{products}
					</tbody>
				</Table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
}

class Product extends React.Component{

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.product);
	}

	render() {
		return (
			<tr>
				<td>{this.props.product.entity.name}</td>
				<td>{this.props.product.entity.price}</td>
				<td>{this.props.product.entity.description}</td>
				<td>{this.props.product.entity.stock}</td>
				<td>{this.props.product.entity.location}</td>
				<td>
					<UpdateDialog product={this.props.product}
								  attributes={this.props.attributes}
								  onUpdate={this.props.onUpdate}/>
				</td>
				<td>
					<Button onClick={this.handleDelete}>Delete</Button>
				</td>
			</tr>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('react')
)