-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255) NOT NULL,
  class_date DATE NOT NULL,
  class_time TIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  plan_id VARCHAR(50) DEFAULT 'all' COMMENT 'free, basic, pro, or all',
  meeting_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_class_date (class_date),
  INDEX idx_plan_id (plan_id)
);

-- Sample data
INSERT INTO classes (title, description, instructor, class_date, class_time, duration_minutes, plan_id, meeting_link) VALUES
('E-commerce Growth Hacking', 'Learn advanced strategies to scale your e-commerce business rapidly', 'Amitabh Kumar', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '19:00:00', 120, 'pro', 'https://zoom.us/meeting-pro-1'),
('Packaging Design Secrets', 'Master the art of creating eye-catching product packaging', 'Rahul Sharma', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '18:00:00', 90, 'pro', 'https://zoom.us/meeting-pro-2'),
('Advanced SEO & Traffic', 'Boost your online visibility and drive qualified traffic', 'Priya Singh', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '19:00:00', 120, 'pro', 'https://zoom.us/meeting-pro-3'),
('Customer Psychology & Sales', 'Understand buyer psychology to increase conversions', 'Vikram Patel', DATE_ADD(CURDATE(), INTERVAL 9 DAY), '18:30:00', 90, 'pro', 'https://zoom.us/meeting-pro-4'),
('E-commerce Fundamentals', 'Get started with the basics of online selling', 'Amitabh Kumar', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', 120, 'basic', 'https://zoom.us/meeting-basic-1'),
('Product Photography 101', 'Learn to capture stunning product photos', 'Rahul Sharma', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '18:00:00', 90, 'basic', 'https://zoom.us/meeting-basic-2'),
('Introduction to E-commerce', 'Start your journey in online business', 'Amitabh Kumar', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', 60, 'free', 'https://zoom.us/meeting-free-1');
