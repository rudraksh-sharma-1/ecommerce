-- ENQUIRY REPLIES TABLE (for chat functionality)
CREATE TABLE IF NOT EXISTS enquiry_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    admin_id UUID, -- reference to admin user if is_admin = true
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enquiry_replies_enquiry_id ON enquiry_replies(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_replies_created_at ON enquiry_replies(created_at);

-- Add status field to enquiries table if it doesn't exist
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'resolved', 'closed'));
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS admin_reply BOOLEAN DEFAULT FALSE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enquiry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_enquiry_timestamp_trigger ON enquiries;
CREATE TRIGGER update_enquiry_timestamp_trigger
    BEFORE UPDATE ON enquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_enquiry_timestamp();
