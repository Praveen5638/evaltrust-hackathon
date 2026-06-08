import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://walhykxaahpbqutpbfjz.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbGh5a3hhYWhwYnF1dHBiZmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODQzNjcsImV4cCI6MjA5MzI2MDM2N30.szPaM2BXT4HqrzOUjusFsdMBxLNL1oRgWCuMQ2GXslM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
