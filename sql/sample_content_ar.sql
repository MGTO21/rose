-- محتوى تجريبي عربي لروزا جيفتس (ROSE GIFTS)
USE rose_gifts;

-- إعدادات الموقع (عناوين الهيرو)
INSERT INTO site_settings (key_name, value_text) VALUES
  ('hero_title', 'هدايا فاخرة تُصنع بإتقان'),
  ('hero_subtitle', 'اكتشف صناديق ورد مميزة، عطورًا فاخرة، وتذكارات مُخصصة.'),
  ('hero_cta_text', 'تسوق المجموعات'),
  ('brand_slogan', 'هدية مميزة لك')
ON DUPLICATE KEY UPDATE value_text=VALUES(value_text);

-- مسح الأسئلة الشائعة القديمة ثم إدخال عينات عربية
DELETE FROM faqs;
INSERT INTO faqs (question, answer, sort_order, active) VALUES
  ('كم يستغرق توصيل الطلب؟', 'داخل المدينة من 1 إلى 3 أيام عمل، وخارجها من 3 إلى 5 أيام.', 1, 1),
  ('هل أستطيع إضافة بطاقة مخصصة؟', 'نعم، نوفر بطاقات تهنئة مخصصة ويمكنك كتابة نصك عند الدفع.', 2, 1),
  ('هل تغلفون الهدايا؟', 'كل الطلبات تُغلف بعناية مع لمسات أنيقة جاهزة للإهداء.', 3, 1),
  ('ما هي طرق الدفع المتاحة؟', 'نقبل الدفع عند الاستلام وبطاقات مدى والفيزا والماستر كارد.', 4, 1);

-- مسح البنرات القديمة ثم إدخال عينات عربية
DELETE FROM banners;
INSERT INTO banners (title, subtitle, image_url, link_url, active, sort_order) VALUES
  ('مجموعة الورد المخملي', 'صندوق هدايا فاخر مع شوكولاتة مختارة وعينة عطرية', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop', '/collections.html', 1, 1),
  ('تخفيضات الموسم', 'خصومات حصرية على العطور المختارة هذا الأسبوع', 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop', '/shop.html', 1, 2);
