
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbGh5a3hhYWhwYnF1dHBiZmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODQzNjcsImV4cCI6MjA5MzI2MDM2N30.szPaM2BXT4HqrzOUjusFsdMBxLNL1oRgWCuMQ2GXslM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  console.log('Testing anonymous insert into ppt_submissions...')
  
  const { data, error } = await supabase
    .from('ppt_submissions')
    .insert([{
      team_name: 'TEST_TEAM_' + Date.now(),
      members: ['Test Member'],
      file_url: 'https://test.com/file.pdf'
    }])
    .select()

  if (error) {
    console.error('❌ Insert failed:', error.message)
    console.error('Code:', error.code)
    console.error('Details:', error.details)
    console.error('Hint:', error.hint)
  } else {
    console.log('✅ Insert successful:', data)
    // Clean up
    await supabase.from('ppt_submissions').delete().eq('id', data[0].id)
  }
}

testInsert()
