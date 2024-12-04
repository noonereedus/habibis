CREATE DATABASE ssh_shared_orders;

CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,    
    name VARCHAR(100) NOT NULL   
);

CREATE TABLE grocery_items (
    id SERIAL PRIMARY KEY,        
    name VARCHAR(100) NOT NULL, 
    price NUMERIC(10, 2) NOT NULL   
);

CREATE TABLE shared_orders (
    id SERIAL PRIMARY KEY,                     
    created_by VARCHAR(20) REFERENCES students(student_id),              
    creation_time TIMESTAMP DEFAULT NOW(),   
    status VARCHAR(20) DEFAULT 'active',     
    total_cost NUMERIC(10, 2) DEFAULT 0.00,  
    unique_code VARCHAR(5) NOT NULL        
);

CREATE TABLE shared_order_items (
    id SERIAL PRIMARY KEY,             
    item_id  INT REFERENCES grocery_items(id),
    order_id INT REFERENCES shared_orders(id), 
    student_id VARCHAR(20) REFERENCES students(student_id),               
    quantity INT DEFAULT 1,    
    added_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE student_contributions ( 
   order_id INT REFERENCES shared_orders(id), 
   student_id VARCHAR(20) REFERENCES students(student_id),
   individual_total NUMERIC(10, 2) DEFAULT 0.00, 
   delivery_fee_share NUMERIC(10, 2) DEFAULT 0.00, 
   payment_status VARCHAR(20) DEFAULT 'pending', 
   PRIMARY KEY (order_id, student_id) 
);
