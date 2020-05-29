package com.jack.springdatarestandreactjs.repository;

import com.jack.springdatarestandreactjs.entity.Product;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface ProductRepository extends PagingAndSortingRepository<Product, Long> { 
	// The repository extends Spring Data Commons' CrudRepository/PagingAndSortingRepository and plugs in the type of the domain object and its primary key
}