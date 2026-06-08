
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
const supabaseAnonKey = 'sb_publishable_HLT1Iti1r8yUgWC0c0CRHQ_-uyJ0mPs'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verify() {
  console.log('--- Verification Script ---')
  
  // 1. Check if events table exists and can be read
  const { data, error } = await supabase.from('events').select('*').limit(1)
  if (error) {
    console.error('❌ Events table not found or not readable. Did you run the SQL script in Supabase?', error.message)
    return
  }
  console.log('✅ Events table is readable. Found:', data)

  // 2. Try to update (should fail with anon key if RLS is correct, or succeed if not locked down yet)
  // Actually, anon key shouldn't be able to update if we set the policy to 'organizer' role.
  const { error: updateError } = await supabase.from('events').update({ is_final_locked: true }).eq('id', data[0].id)
  if (updateError) {
    console.log('✅ Update failed as expected for anonymous user:', updateError.message)
  } else {
    console.warn('⚠️ Warning: Anonymous update succeeded. Ensure RLS is enabled and "organizer" role check is working.')
  }
}

verify()
