-- Add increment_column stored procedure
CREATE OR REPLACE FUNCTION increment_column(model TEXT, col TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE model_usage_feedback SET %I = %I + 1 WHERE model_id = $1', col, col) USING model;
END;
$$ LANGUAGE plpgsql;
