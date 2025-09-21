const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://csatoabqaxaszgfhrjjj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXRvYWJxYXhhc3pnZmhyampqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjE4NjQsImV4cCI6MjA3MzQzNzg2NH0.pdRXpKaE7uAzPB-li6U9fBpPflAZp9uFIZyHrHSdU80";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupTest123BusinessInfo() {
  try {
    console.log('Setting up business info for Test123 shop...');
    
    // Check if business info already exists
    const { data: existing, error: checkError } = await supabase
      .from('business_info')
      .select('*')
      .eq('business_id', 'test123')
      .single();
    
    if (existing) {
      console.log('✅ Business info for Test123 already exists:');
      console.log(JSON.stringify(existing, null, 2));
      return;
    }
    
    // Insert business info for test123
    const { data, error } = await supabase
      .from('business_info')
      .insert([{
        business_id: 'test123',
        business_name: 'Test Shop 123',
        address: 'Test Address, Test City, Test State 123456',
        gst_number: '99TTTTT0000T1Z5',
        phone: '9876543210',
        email: 'test123@example.com'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error setting up business info:', error);
      return;
    }
    
    console.log('✅ Business info for Test123 created successfully:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n🎉 Test123 login will now skip the business info capture screen!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupTest123BusinessInfo();
