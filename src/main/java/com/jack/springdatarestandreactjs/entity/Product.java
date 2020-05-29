package com.jack.springdatarestandreactjs.entity;

import java.util.Objects;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity // @Entity is a JPA annotation that denotes the whole class for storage in a relational table
public class Product {

	private @Id @GeneratedValue Long id; // @Id and @GeneratedValue are JPA annotations to note the primary key and that is generated automatically when needed
	private String name;
	private int price;
	private String description;
	private int stock;
	private String location;

	private @Version @JsonIgnore Long version;

	private Product() {}

	public Product(String name, int price, String description, int stock, String location) {
		this.name = name;
		this.price = price;
		this.description = description;
		this.stock = stock;
		this.location = location;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Product product = (Product) o;
		return Objects.equals(id, product.id) &&
			Objects.equals(name, product.name) &&
			Objects.equals(price, product.price) &&
			Objects.equals(description, product.description) &&
			Objects.equals(stock, product.stock) &&
			Objects.equals(location, product.location);
	}

	@Override
	public int hashCode() {

		return Objects.hash(id, name, price, description, stock, location);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getPrice() {
		return price;
	}

	public void setPrice(int price) {
		this.price = price;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public int getStock() {
		return stock;
	}

	public void setStock(int stock) {
		this.stock = stock;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public Long getVersion() {
		return version;
	}

	public void setVersion(Long version) {
		this.version = version;
	}

	@Override
	public String toString() {
		return "Product{" +
			"id=" + id +
			", name='" + name + '\'' +
			", price='" + price + '\'' +
			", description='" + description + '\'' +
			", stock='" + stock + '\'' +
			", location='" + location + '\'' +
			'}';
	}
}