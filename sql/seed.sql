USE rose_gifts;

-- Categories
INSERT INTO categories (name, slug) VALUES ('Flowers','flowers'),('Perfumes','perfumes'),('Gift Boxes','boxes'),('Personalized','personalized');

-- Products
INSERT INTO products (name, description, price, category_id, image)
VALUES
('Rose Velvet Box','Luxurious rose box with gourmet chocolates',49.99,3,'https://via.placeholder.com/400x300?text=Rose+Velvet'),
('Eternal Roses Bouquet','Hand-tied bouquet of preserved roses',69.00,1,'https://via.placeholder.com/400x300?text=Flowers'),
('Luxe Perfume Sample','Exquisite perfume sample, 30ml',39.50,2,'https://via.placeholder.com/400x300?text=Perfume');

-- Admin user (generated credentials)
-- Email: admin@rosegifts.test
-- Password: J5aCoehIAs4A!Rg
-- The password is hashed below (bcrypt)
INSERT INTO users (name, email, password_hash, role) VALUES ('Admin','admin@rosegifts.test','$2b$10$hznpARgiersAvg90tczWROubX6iHapvcdM82Hdutz9K3092rKZlx2','admin');

-- Testimonials
INSERT INTO testimonials (name, message, rating) VALUES ('Sarah','Beautiful packaging and on-time delivery',5),('Omar','Perfect anniversary gift, my wife loved it',5);
