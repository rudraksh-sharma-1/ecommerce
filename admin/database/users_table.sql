-- SQL for creating or altering the users table to support enhanced registration fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- If storing password hash, otherwise handled by Auth provider
    full_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    user_type VARCHAR(20) NOT NULL DEFAULT 'individual', -- 'individual' or 'company'
    company_name VARCHAR(255), -- Nullable, only for companies
    role VARCHAR(50) DEFAULT 'customer',
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    -- Add any other fields as needed
    CONSTRAINT user_type_check CHECK (user_type IN ('individual', 'company'))
);

-- If you need to ALTER an existing table, use this example:
-- ALTER TABLE users ADD COLUMN address TEXT;
-- ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- ALTER TABLE users ADD COLUMN user_type VARCHAR(20) DEFAULT 'individual';
-- ALTER TABLE users ADD COLUMN company_name VARCHAR(255);
