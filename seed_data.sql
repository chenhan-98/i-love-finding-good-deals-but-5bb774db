SET search_path TO public;
INSERT INTO deals (title, marketplace, category, price, original_price, discount_percent, product_url, image_url, is_active)
VALUES
('Apple AirPods Pro (2nd Gen)', 'Amazon', 'Electronics', 189.99, 249.99, 24, 'https://amazon.com/deal/airpods-pro', 'https://images.unsplash.com/photo-1606220838315-056192d5e927', TRUE),
('Ninja 10-in-1 Air Fryer Oven', 'Walmart', 'Home & Kitchen', 139.00, 229.00, 39, 'https://walmart.com/deal/ninja-air-fryer', 'https://images.unsplash.com/photo-1614495039368-525273956716', TRUE),
('Threshold 6-Cube Storage Organizer', 'Target', 'Home', 64.00, 90.00, 29, 'https://target.com/deal/storage-organizer', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a', TRUE),
('Samsung 55-inch 4K UHD Smart TV', 'Walmart', 'Electronics', 348.00, 498.00, 30, 'https://walmart.com/deal/samsung-55-4k', 'https://images.unsplash.com/photo-1593784991095-a205069470b6', TRUE),
('Kindle Paperwhite Signature Edition', 'Amazon', 'Books & Media', 139.99, 189.99, 26, 'https://amazon.com/deal/kindle-paperwhite', 'https://images.unsplash.com/photo-1512820790803-83ca734da794', TRUE),
('LEGO Creator 3-in-1 Space Shuttle', 'Target', 'Toys', 31.49, 44.99, 30, 'https://target.com/deal/lego-space-shuttle', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b', TRUE);

INSERT INTO user_interests (device_id, category, keyword, priority)
VALUES
('demo-user-1', 'Electronics', 'Apple', 5),
('demo-user-1', 'Home & Kitchen', 'Air Fryer', 4),
('demo-user-1', 'Toys', 'LEGO', 3);

INSERT INTO favorite_deals (device_id, deal_id)
VALUES
('demo-user-1', 1),
('demo-user-1', 2)
ON CONFLICT (device_id, deal_id) DO NOTHING;

INSERT INTO deal_alerts (device_id, alert_type, query, min_discount, is_enabled)
VALUES
('demo-user-1', 'product', 'AirPods', 20, TRUE),
('demo-user-1', 'category', 'Electronics', 25, TRUE),
('demo-user-1', 'category', 'Home & Kitchen', 30, FALSE);

INSERT INTO shared_deals (device_id, deal_id, channel, message)
VALUES
('demo-user-1', 1, 'sms', 'AirPods deal is live at 24% off!'),
('demo-user-1', 2, 'copy_link', 'Huge air fryer discount today — check this out!');