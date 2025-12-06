-- Add class_id column to payments table
ALTER TABLE payments ADD COLUMN class_id INT DEFAULT NULL AFTER plan_id;
ALTER TABLE payments ADD FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;
ALTER TABLE payments ADD INDEX idx_class_id (class_id);

-- Update existing queries to include class_id
-- No data migration needed as new registrations will have class_id
