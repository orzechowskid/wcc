#!/bin/bash

###
# see https://github.com/docker-library/postgres/pull/496#issue-214478296
###

source "$(which docker-entrypoint.sh)"

ensure_migrations() {
		local last_migration=$(echo "SELECT name FROM migrations ORDER BY name DESC LIMIT 1" | psql -t | tr -d ' ')
		local filenames=$(ls /migrations/sql | sort)

		if [[ -z "$last_migration" ]]; then
				echo "no migration history found"
		else
				echo "last migration applied: $last_migration"
		fi

		for i in $filenames; do
				if [[ "$i" > "$last_migration" ]]; then
						echo "applying migration $i ..."
						file=$(</migrations/sql/$i)
						echo "BEGIN; $file ; INSERT INTO migrations(name) VALUES('$i'); COMMIT;" | psql -v ON_ERROR_STOP=1
						rc=$?

						if [[ "$rc" != "0" ]]; then
								echo "migration failed with exit code $rc"
								exit 1
						fi
				fi
		done

		echo
		echo "migrations complete"
		echo
}

go() {
		if [ "$(id -u)" = '0' ]; then
				# then restart script as postgres user
				exec gosu postgres "$BASH_SOURCE" "$@"

				return
		fi

		docker_setup_env
		docker_create_db_directories

		# initialize if needed, else just start a temporary server
		if [ -z "$DATABASE_ALREADY_EXISTS" ]; then
				docker_verify_minimum_env
				docker_init_database_dir
				pg_setup_hba_conf
				docker_temp_server_start "$@" -c max_locks_per_transaction=256
				docker_setup_db
				docker_process_init_files /docker-entrypoint-initdb.d/*
		else
				docker_temp_server_start "$@"
		fi

		# run our migrations
		ensure_migrations

		# clean up
		docker_temp_server_stop

		# start the actual server
		exec postgres "$@"
}

go
