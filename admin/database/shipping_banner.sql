-- Create the shipping_banners table
CREATE TABLE IF NOT EXISTS public.shipping_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT, -- For desktop
    mobile_image_url TEXT, -- For mobile
    link VARCHAR(255),
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add an index for faster lookups of the active banner
CREATE INDEX IF NOT EXISTS idx_shipping_banners_active ON public.shipping_banners (active);

-- Enable Row Level Security
ALTER TABLE public.shipping_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public shipping banners are viewable by everyone."
ON public.shipping_banners FOR SELECT
USING (true);

-- Create policies for admin access
CREATE POLICY "Admins can manage shipping banners"
ON public.shipping_banners FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');