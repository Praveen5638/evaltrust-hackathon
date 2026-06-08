-- Create the events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT DEFAULT 'Hackathon 2026',
  created_at TIMESTAMPTZ DEFAULT now(),
  is_final_locked BOOLEAN DEFAULT false,
  is_result_revealed BOOLEAN DEFAULT false
);

-- Insert a default event if table is empty
INSERT INTO public.events (id, event_name)
SELECT gen_random_uuid(), 'Hackathon 2026'
WHERE NOT EXISTS (SELECT 1 FROM public.events);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.events;
CREATE POLICY "Allow public read access" ON public.events
  FOR SELECT USING (true);

-- Allow only organizers to update
DROP POLICY IF EXISTS "Allow organizers to update" ON public.events;
CREATE POLICY "Allow organizers to update" ON public.events
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'organizer'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'organizer'
  );
