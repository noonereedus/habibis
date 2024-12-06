-- Add students
INSERT INTO students (student_id, name) VALUES
('2644476', 'Diba'),
('2563027', 'Liba'),
('2545776', 'Vlad'),
('2521768', 'Mogdads');

-- Add grocery items
INSERT INTO grocery_items (name, price) VALUES
('Bread', 1.00),
('Milk', 1.20),
('Eggs', 2.00),
('Cheese', 2.50),
('Chicken', 6.00),
('Bananas', 1.10),
('Apples', 1.80),
('Carrots', 0.90),
('Broccoli', 0.80),
('Potatoes', 2.00),
('Pasta', 0.70),
('Rice', 1.50),
('Beans', 0.50),
('Ketchup', 1.20),
('Butter', 1.80),
('Oil', 4.00),
('Cereal', 2.00),
('Juice', 1.50),
('Coffee', 2.50),
('Toilet Rolls', 2.00);

-- Add shared orders
INSERT INTO shared_orders (created_by, unique_code) VALUES
('2644476', '5XYD3'), 
('2521768', 'BR3FQ');

-- Add items to shared order 1 (5XYD3)
INSERT INTO shared_order_items (item_id, order_id, student_id, quantity) VALUES
(2, 1, '2644476', 2),
(13, 1, '2545776', 1),
(6, 1, '2563027', 3),
(7, 1, '2563027', 3),
(17, 1, '2644476', 1);

-- Add items to shared order 2 (BR3FQ)
INSERT INTO shared_order_items (item_id, order_id, student_id, quantity) VALUES
(20, 2, '2521768', 12);

-- TODO: Add test data for `student_contributions` once dynamic calculation is implemented
INSERT INTO student_contributions (order_id, student_id) VALUES
(1, '2644476'),
(1, '2545776'),
(1, '2563027'),
(2, '2521768');