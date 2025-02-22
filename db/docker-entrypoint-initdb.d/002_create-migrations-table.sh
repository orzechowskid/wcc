#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE TABLE public.migrations(
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		created_at TIMESTAMP DEFAULT now(),
		name TEXT UNIQUE NOT NULL
	);
	GRANT ALL ON TABLE public.migrations TO $SERVICE_USER;
EOSQL
