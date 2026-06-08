
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbGh5a3hhYWhwYnF1dHBiZmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODQzNjcsImV4cCI6MjA5MzI2MDM2N30.szPaM2BXT4HqrzOUjusFsdMBxLNL1oRgWCuMQ2GXslM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpload() {
  console.log('Testing file upload to ppt-files bucket...')
  
  // Create a dummy file buffer
  const content = 'Test PDF content'
  const buffer = Buffer.from(content)
  const fileName = `test_${Date.now()}.pdf`
  const filePath = `submissions/${fileName}`

  const { data, error } = await supabase.storage
    .from('ppt-files')
    .upload(filePath, buffer, {
      contentType: 'application/pdf'
    })

  if (error) {
    console.error('❌ Upload failed:', error.message)
    console.error('Full Error:', error)
  } else {
    console.log('✅ Upload successful:', data)
    // Clean up
    await supabase.storage.from('ppt-files').remove([filePath])
  }
}

testUpload()
