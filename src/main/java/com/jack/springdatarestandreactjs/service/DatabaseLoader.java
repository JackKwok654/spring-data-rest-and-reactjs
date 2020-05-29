package com.jack.springdatarestandreactjs.service;

import com.jack.springdatarestandreactjs.repository.ProductRepository;
import com.jack.springdatarestandreactjs.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component // @Component annotation so that it is automatically picked up by @SpringBootApplication
public class DatabaseLoader implements CommandLineRunner { // It implements Spring Boot’s CommandLineRunner so that it gets run after all the beans are created and registered

	private final ProductRepository repository;

	@Autowired // It uses constructor injection and autowiring to get Spring Data’s automatically created ProductRepository
	public DatabaseLoader(ProductRepository repository) {
		this.repository = repository;
	}

	@Override
	public void run(String... strings) throws Exception { // run() method is invoked with command line arguments, loading up the data
		this.repository.save(new Product("m&m chocolate", 60, "M&M's are multi-colored button-shaped chocolates", 3000, "Hong Kong Island"));
	}
}