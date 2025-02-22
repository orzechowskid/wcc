CREATE SCHEMA IF NOT EXISTS muni;
CREATE TABLE muni.councilors(
	id SERIAL PRIMARY KEY,
	slug varchar(12) UNIQUE NOT NULL,
	first_name varchar(100),
	last_name varchar(100)
);
CREATE TYPE muni.agendatype AS ENUM('citycouncil');
CREATE TABLE muni.agendas(
	id SERIAL PRIMARY KEY,
	slug varchar(12) UNIQUE NOT NULL,
	meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
	raw_text TEXT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
