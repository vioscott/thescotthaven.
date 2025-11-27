import { supabase } from './utils/supabase';

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    try {
        // Test 1: Check if we can reach Supabase
        console.log('\n📡 Test 1: Checking Supabase health...');
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('❌ Session check failed:', error);
        } else {
            console.log('✅ Supabase is reachable');
        }

        // Test 2: Try to sign in with test credentials
        console.log('\n🔐 Test 2: Testing authentication...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'vionyedikachi@gmail.com',
            password: 'Victroy10*'
        });

        if (authError) {
            console.error('❌ Auth failed:', authError.message);
            console.error('Error details:', {
                status: authError.status,
                name: authError.name,
                message: authError.message
            });
        } else {
            console.log('✅ Authentication successful!');
            console.log('User:', authData.user?.email);
        }

    } catch (error: any) {
        console.error('❌ Connection test failed:', error.message);
    }
}

// Run the test
testSupabaseConnection();
