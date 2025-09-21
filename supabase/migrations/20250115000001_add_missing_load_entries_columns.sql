-- Add missing columns to load_entries table
ALTER TABLE public.load_entries 
ADD COLUMN IF NOT EXISTS supplier_name TEXT,
ADD COLUMN IF NOT EXISTS buy_price_per_kg DECIMAL(10,2);

-- Update existing records to have default values if needed
UPDATE public.load_entries 
SET supplier_name = 'Unknown Supplier' 
WHERE supplier_name IS NULL;

UPDATE public.load_entries 
SET buy_price_per_kg = 0.00 
WHERE buy_price_per_kg IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE public.load_entries 
ALTER COLUMN supplier_name SET NOT NULL,
ALTER COLUMN buy_price_per_kg SET NOT NULL;
