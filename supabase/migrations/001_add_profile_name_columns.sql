-- Add first_name and last_name to user_profiles and optional birthdate/gender
BEGIN;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS first_name character varying;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS last_name character varying;

-- Optional: add birthdate and gender if you want to persist them as well
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS birthdate date;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS gender text;

-- Backfill first_name/last_name from full_name when possible
-- Backfill first_name/last_name from full_name when possible
-- Rule: if full_name has 3 or more tokens, use the last TWO tokens as last_name
-- Examples:
--  "jose alejandro chirino torres" -> first_name = "jose alejandro", last_name = "chirino torres"
--  "jose chirino torres" -> first_name = "jose", last_name = "chirino torres"
WITH parts AS (
  SELECT id, full_name,
         regexp_split_to_array(trim(full_name), '\\s+') AS arr
  FROM public.user_profiles
  WHERE full_name IS NOT NULL
)
UPDATE public.user_profiles u
SET
  first_name = CASE
    WHEN array_length(p.arr,1) >= 3 THEN array_to_string(p.arr[1:array_length(p.arr,1)-2], ' ')
    WHEN array_length(p.arr,1) = 2 THEN p.arr[1]
    ELSE p.arr[1]
  END,
  last_name = CASE
    WHEN array_length(p.arr,1) >= 3 THEN array_to_string(p.arr[array_length(p.arr,1)-1:array_length(p.arr,1)], ' ')
    WHEN array_length(p.arr,1) = 2 THEN p.arr[2]
    ELSE NULL
  END
FROM parts p
WHERE u.id = p.id
  AND (u.first_name IS NULL OR u.first_name = '');

COMMIT;
