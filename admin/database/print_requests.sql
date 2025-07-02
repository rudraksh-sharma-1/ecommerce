-- PRINT REQUESTS TABLE (Enhanced version with price and chat functionality)
CREATE TABLE IF NOT EXISTS print_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_type VARCHAR(100) NOT NULL,
    size VARCHAR(10),
    color VARCHAR(50),
    quantity INTEGER DEFAULT 1,
    position VARCHAR(20), -- front, back, left, right, center
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
    admin_note TEXT,
    
    -- NEW PRICE FIELDS
    estimated_price DECIMAL(10,2) DEFAULT 0.00, -- Admin can set estimated price
    final_price DECIMAL(10,2) DEFAULT 0.00, -- Final quoted price
    price_notes TEXT, -- Admin notes about pricing
    
    -- ENQUIRY INTEGRATION
    enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL, -- Link to enquiry for chat
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_print_requests_user_id ON print_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_print_requests_status ON print_requests(status);
CREATE INDEX IF NOT EXISTS idx_print_requests_enquiry_id ON print_requests(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_print_requests_created_at ON print_requests(created_at);

-- PRINT REQUEST REPLIES TABLE (for chat functionality specific to print requests)
CREATE TABLE IF NOT EXISTS print_request_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    print_request_id UUID REFERENCES print_requests(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    admin_id UUID, -- reference to admin user if is_admin = true
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for print request replies
CREATE INDEX IF NOT EXISTS idx_print_request_replies_request_id ON print_request_replies(print_request_id);
CREATE INDEX IF NOT EXISTS idx_print_request_replies_created_at ON print_request_replies(created_at);

-- Create trigger to update updated_at timestamp for print_requests
CREATE OR REPLACE FUNCTION update_print_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_print_request_timestamp_trigger ON print_requests;
CREATE TRIGGER update_print_request_timestamp_trigger
    BEFORE UPDATE ON print_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_print_request_timestamp();

-- Add price field to existing print_requests table if it doesn't exist
ALTER TABLE print_requests ADD COLUMN IF NOT EXISTS estimated_price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE print_requests ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE print_requests ADD COLUMN IF NOT EXISTS price_notes TEXT;
ALTER TABLE print_requests ADD COLUMN IF NOT EXISTS enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL;
ALTER TABLE print_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update enquiries table to support custom printing type if not exists
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'custom_printing', 'product_inquiry', 'support'));

-- Update status options for print_requests if needed
ALTER TABLE print_requests DROP CONSTRAINT IF EXISTS print_requests_status_check;
ALTER TABLE print_requests ADD CONSTRAINT print_requests_status_check 
    CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected'));
