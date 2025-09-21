-- Setup business information for Test123 shop
-- This ensures the business info capture screen never shows for Test123

-- Insert business info for test123 if it doesn't exist
INSERT INTO public.business_info (
  business_id,
  business_name,
  address,
  gst_number,
  phone,
  email,
  created_at,
  updated_at
) VALUES (
  'test123',
  'Test Shop 123',
  'Test Address, Test City, Test State 123456',
  '99TTTTT0000T1Z5',
  '9876543210',
  'test123@example.com',
  NOW(),
  NOW()
) ON CONFLICT (business_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  address = EXCLUDED.address,
  gst_number = EXCLUDED.gst_number,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify the data was inserted
SELECT * FROM public.business_info WHERE business_id = 'test123';
