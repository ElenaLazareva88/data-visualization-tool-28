ALTER TABLE t_p21765871_data_visualization_t.users
  ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_unique
  ON t_p21765871_data_visualization_t.users (oauth_provider, oauth_id)
  WHERE oauth_provider IS NOT NULL AND oauth_id IS NOT NULL;
