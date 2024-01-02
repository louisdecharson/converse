CREATE TABLE IF NOT EXISTS HISTORY (
       timestamp DATETIME,
       user TEXT,
       model TEXT,
       model_provider TEXT,
       prompt_instructions TEXT,
       user_content TEXT,
       response TEXT,
       prompt_tokens INTEGER,
       completion_tokens INTEGER,
       total_tokens INTEGER
)
CREATE TABLE IF NOT EXISTS PROMPT_CONFIGS (
       date_created DATETIME,
       name TEXT,
       prompt_instructions TEXT,
       action_name TEXT,
       description TEXT
);

CREATE TABLE IF NOT EXISTS PRICING (
       valid_from DATETIME,
       model TEXT,
       model_provider TEXT,
       input_price_per_token REAL,
       output_price_per_token REAL
)
