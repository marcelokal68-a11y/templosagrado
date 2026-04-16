ALTER TABLE public.profiles
ADD COLUMN chat_tone TEXT NOT NULL DEFAULT 'reflective'
CHECK (chat_tone IN ('concise', 'reflective'));