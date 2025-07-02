-- Add type column to enquiries table to distinguish custom printing requests
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'regular' 
CHECK (type IN ('regular', 'custom_printing'));

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries(type);

-- Update existing custom printing enquiries (if any)
-- This will identify them by looking for custom printing related messages
UPDATE enquiries 
SET type = 'custom_printing' 
WHERE message ILIKE '%custom printing%' 
   OR message ILIKE '%custom print%'
   OR message ILIKE '%print request%';
