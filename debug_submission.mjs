
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbGh5a3hhYWhwYnF1dHBiZmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODQzNjcsImV4cCI6MjA5MzI2MDM2N30.szPaM2BXT4HqrzOUjusFsdMBxLNL1oRgWCuMQ2GXslM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugSubmission() {
  console.log('--- Debugging Submission Issues ---')
  
  // 1. Check ppt_submissions table
  console.log('\nChecking ppt_submissions table...')
  const { data: subData, error: subError } = await supabase.from('ppt_submissions').select('*').limit(1)
  if (subError) {
    console.error('❌ ppt_submissions table error:', subError.message)
  } else {
    console.log('✅ ppt_submissions table is accessible.')
  }

  // 2. Check storage bucket
  console.log('\nChecking storage buckets...')
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  if (bucketError) {
    console.error('❌ Storage bucket check failed:', bucketError.message)
    console.log('Note: Anon key might not have permission to list buckets, but let\'s try to list files in ppt-files.')
  } else {
    console.log('✅ Buckets found:', buckets.map(b => b.name))
  }

  // 3. Try to list files in ppt-files bucket
  console.log('\nChecking ppt-files bucket...')
  const { data: files, error: fileError } = await supabase.storage.from('ppt-files').list('submissions')
  if (fileError) {
    console.error('❌ ppt-files bucket/folder error:', fileError.message)
  } else {
    console.log('✅ ppt-files bucket is accessible. Found files:', files.length)
  }
}

debugSubmission()
