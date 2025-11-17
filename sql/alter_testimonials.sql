USE rose_gifts;
ALTER TABLE testimonials CHANGE name author VARCHAR(255);
ALTER TABLE testimonials CHANGE message content TEXT;
