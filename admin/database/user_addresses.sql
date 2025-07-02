-- Create the user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_name VARCHAR(255) NOT NULL, -- Name for this address (e.g., "Home", "Office", "Vacation Home")
    is_default BOOLEAN DEFAULT FALSE,
    street_address VARCHAR(255) NOT NULL,
    suite_unit_floor VARCHAR(255),
    house_number VARCHAR(50),
    locality VARCHAR(255),
    area VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(255) NOT NULL,
    landmark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- Create a unique constraint for default address (only one default address per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_default_address 
ON user_addresses(user_id) 
WHERE is_default = TRUE;

-- Create RLS policies for the user_addresses table
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own addresses
CREATE POLICY select_own_addresses ON user_addresses
FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own addresses
CREATE POLICY insert_own_addresses ON user_addresses
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own addresses
CREATE POLICY update_own_addresses ON user_addresses
FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own addresses
CREATE POLICY delete_own_addresses ON user_addresses
FOR DELETE USING (auth.uid() = user_id);

-- Policy for administrators to access all records
CREATE POLICY admin_all_access ON user_addresses
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- Create a function to ensure only one default address per user
CREATE OR REPLACE FUNCTION set_address_as_default()
RETURNS TRIGGER AS $$
BEGIN
    -- If the new address is marked as default
    IF NEW.is_default THEN
        -- Unmark any existing default addresses for this user
        UPDATE user_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id 
          AND id != NEW.id
          AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to ensure only one default address per user
CREATE OR REPLACE TRIGGER ensure_single_default_address
BEFORE INSERT OR UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION set_address_as_default();

-- Optional: Migration script to transfer existing user addresses to the new table
-- This needs to run once after the table is created
INSERT INTO user_addresses (
    user_id, 
    address_name, 
    is_default,
    street_address, 
    suite_unit_floor, 
    house_number,
    locality, 
    area, 
    city, 
    state, 
    postal_code, 
    country, 
    landmark
)
SELECT 
    id as user_id,
    'Primary Address' as address_name, 
    true as is_default,
    street_address,
    suite_unit_floor,
    house_number,
    locality,
    area,
    city,
    state,
    postal_code,
    country,
    landmark
FROM users
WHERE street_address IS NOT NULL
  AND city IS NOT NULL
  AND state IS NOT NULL
  AND country IS NOT NULL;
