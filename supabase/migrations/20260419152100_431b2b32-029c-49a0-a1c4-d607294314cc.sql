DELETE FROM daily_verse_cache 
WHERE cache_date = CURRENT_DATE 
  AND (verse_data->>'practical_use' IS NULL 
       OR verse_data->>'practical_use' = ''
       OR verse_data->>'explanation' LIKE '%{%"title"%');