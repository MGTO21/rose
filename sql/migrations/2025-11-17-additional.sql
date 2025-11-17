-- Additional content tables for ROSE GIFTS
USE rose_gifts;

CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value_text TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(500),
  image_url VARCHAR(512),
  link_url VARCHAR(512),
  active TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic settings
INSERT INTO site_settings (key_name, value_text) VALUES
('brand_slogan', 'A Special Gift For You')
ON DUPLICATE KEY UPDATE value_text=VALUES(value_text);

-- Sample FAQs
INSERT INTO faqs (question, answer, sort_order, active) VALUES
('ما هي مدة التوصيل؟', 'يتم التوصيل خلال 1-3 أيام داخل المدينة، و3-5 أيام خارجها.', 1, 1),
('هل يمكن تخصيص الهدايا؟', 'نعم، نوفر بطاقات مخصصة وإضافات خاصة حسب الطلب.', 2, 1)
ON DUPLICATE KEY UPDATE question=VALUES(question);
USE rose_gifts;

-- Site settings (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional seed for settings
INSERT INTO site_settings (`key`,`value`) VALUES
('hero_title','Luxury gifts, crafted with love'),
('hero_subtitle','Discover exclusive floral boxes, perfumes, and personalized keepsakes.'),
('hero_cta_text','Shop Collections')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
