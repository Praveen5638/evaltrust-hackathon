import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbGh5a3hhYWhwYnF1dHBiZmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODQzNjcsImV4cCI6MjA5MzI2MDM2N30.szPaM2BXT4HqrzOUjusFsdMBxLNL1oRgWCuMQ2GXslM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function reset() {
    console.log('Starting Database Reset...');

    try {
        // 1. Delete Scores
        console.log('Clearing scores...');
        const { error: e1 } = await supabase.from('scores').delete().not('id', 'is', null);
        if (e1) console.error('Scores error:', e1.message);

        // 2. Delete Teams
        console.log('Clearing teams...');
        const { error: e2 } = await supabase.from('teams').delete().not('id', 'is', null);
        if (e2) console.error('Teams error:', e2.message);

        // 3. Delete PPT Submissions
        console.log('Clearing ppt_submissions...');
        const { error: e3 } = await supabase.from('ppt_submissions').delete().not('id', 'is', null);
        if (e3) console.error('PPT error:', e3.message);

        // 4. Delete Judges
        console.log('Clearing judges...');
        const { error: e4 } = await supabase.from('judges').delete().not('id', 'is', null);
        if (e4) console.error('Judges error:', e4.message);

        // 5. Delete Hackathons
        console.log('Clearing hackathons...');
        const { error: e5 } = await supabase.from('hackathons').delete().not('id', 'is', null);
        if (e5) console.error('Hackathons error:', e5.message);

        console.log('Reset completed successfully!');
        console.log('Note: If RLS is enabled, some rows might not be deleted via the Anon Key.');
    } catch (err) {
        console.error('Reset failed:', err);
    }
}

reset();
