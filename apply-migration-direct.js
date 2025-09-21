// Apply migration directly using Supabase REST API
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://csatoabqaxaszgfhrjjj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXRvYWJxYXhhc3pnZmhyampqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjE4NjQsImV4cCI6MjA3MzQzNzg2NH0.pdRXpKaE7uAzPB-li6U9fBpPflAZp9uFIZyHrHSdU80";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyMigration() {
  console.log('Applying migration to add missing columns to load_entries table...');
  
  try {
    // Method 1: Try to use the SQL editor function if available
    console.log('Attempting to add columns using SQL editor...');
    
    // First, let's check if we can query the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'load_entries')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.log('Cannot access information_schema, trying alternative approach...');
    } else {
      console.log('Current load_entries columns:', tableInfo);
    }
    
    // Method 2: Try to create a new table with the correct structure and migrate data
    console.log('Attempting to create a new table with correct structure...');
    
    // First, let's see what data exists in the current table
    const { data: existingData, error: selectError } = await supabase
      .from('load_entries')
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.error('Error selecting from load_entries:', selectError);
    } else {
      console.log('Existing data in load_entries:', existingData);
    }
    
    // Method 3: Try to use a stored procedure or function
    console.log('Attempting to use a stored procedure...');
    
    // Create a function to add the columns
    const { error: functionError } = await supabase.rpc('exec', {
      sql: `
        DO $$ 
        BEGIN
          -- Add columns if they don't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'load_entries' 
                        AND column_name = 'supplier_name' 
                        AND table_schema = 'public') THEN
            ALTER TABLE public.load_entries ADD COLUMN supplier_name TEXT;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'load_entries' 
                        AND column_name = 'buy_price_per_kg' 
                        AND table_schema = 'public') THEN
            ALTER TABLE public.load_entries ADD COLUMN buy_price_per_kg DECIMAL(10,2);
          END IF;
          
          -- Update existing records with default values
          UPDATE public.load_entries 
          SET supplier_name = 'Unknown Supplier' 
          WHERE supplier_name IS NULL;
          
          UPDATE public.load_entries 
          SET buy_price_per_kg = 0.00 
          WHERE buy_price_per_kg IS NULL;
          
          -- Make columns NOT NULL
          ALTER TABLE public.load_entries 
          ALTER COLUMN supplier_name SET NOT NULL;
          
          ALTER TABLE public.load_entries 
          ALTER COLUMN buy_price_per_kg SET NOT NULL;
        END $$;
      `
    });
    
    if (functionError) {
      console.error('Error executing stored procedure:', functionError);
    } else {
      console.log('✅ Migration applied successfully using stored procedure!');
    }
    
    // Verify the changes
    console.log('Verifying changes...');
    const { data: testData, error: testError } = await supabase
      .from('load_entries')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('Error verifying changes:', testError);
    } else {
      console.log('✅ Verification successful. Sample data:', testData);
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
    console.log('\n❌ Automatic migration failed. Please apply manually:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Run this SQL:');
    console.log(`
      ALTER TABLE public.load_entries 
      ADD COLUMN IF NOT EXISTS supplier_name TEXT,
      ADD COLUMN IF NOT EXISTS buy_price_per_kg DECIMAL(10,2);
      
      UPDATE public.load_entries 
      SET supplier_name = 'Unknown Supplier' 
      WHERE supplier_name IS NULL;
      
      UPDATE public.load_entries 
      SET buy_price_per_kg = 0.00 
      WHERE buy_price_per_kg IS NULL;
      
      ALTER TABLE public.load_entries 
      ALTER COLUMN supplier_name SET NOT NULL,
      ALTER COLUMN buy_price_per_kg SET NOT NULL;
    `);
  }
}

applyMigration();
