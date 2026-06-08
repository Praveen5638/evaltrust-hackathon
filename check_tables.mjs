import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbGh5a3hhYWhwYnF1dHBiZmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODQzNjcsImV4cCI6MjA5MzI2MDM2N30.szPaM2BXT4HqrzOUjusFsdMBxLNL1oRgWCuMQ2GXslM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
    const tables = ['hackathons', 'ppt_submissions', 'teams', 'scores', 'judges'];
    
    for (const table of tables) {
        console.log(`Checking table: ${table}...`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`  Error in ${table}:`, error.message);
        } else {
            console.log(`  Table ${table} exists. Rows found:`, data.length);
        }
    }
}

checkTables();
