-- ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255), -- fallback in case user is not registered
    email VARCHAR(255),
    phone VARCHAR(20),
    message TEXT, -- optional message from user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ENQUIRY ITEMS TABLE (one row per product in the enquiry)
CREATE TABLE IF NOT EXISTS enquiry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255),
    price NUMERIC(10,2),
    quantity INTEGER NOT NULL,
    -- Optionally, add fields for customization or notes
    customization TEXT
);
