CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE IF NOT EXISTS app.users(
	id SERIAL PRIMARY KEY,
	slug varchar(12) UNIQUE NOT NULL,
	first_name varchar(100),
	last_name varchar(100),
	email_address varchar(100),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
