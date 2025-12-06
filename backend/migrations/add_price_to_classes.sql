-- Add price column to classes table
ALTER TABLE classes 
ADD COLUMN price DECIMAL(10, 2) DEFAULT 999.00 AFTER duration_minutes;

-- Update existing classes with default price
UPDATE classes SET price = 999.00 WHERE price IS NULL;

-- Make price NOT NULL
ALTER TABLE classes 
MODIFY COLUMN price DECIMAL(10, 2) NOT NULL;
