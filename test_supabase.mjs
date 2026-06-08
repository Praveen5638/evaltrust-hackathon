
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
const supabaseAnonKey = 'sb_publishable_HLT1Iti1r8yUgWC0c0CRHQ_-uyJ0mPs'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test storage
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    if (storageError) {
      console.error('Storage error:', storageError)
    } else {
      console.log('Buckets:', buckets.map(b => b.name))
    }

    // Test table
    const { data: teams, error: tableError } = await supabase.from('ppt_submissions').select('count', { count: 'exact', head: true })
    if (tableError) {
      console.error('Table error:', tableError)
    } else {
      console.log('ppt_submissions table exists. Data:', teams)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()
