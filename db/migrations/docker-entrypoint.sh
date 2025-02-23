#!/bin/bash -e

echo
echo "beginning migrations"
echo

psql_cmd="psql -t -v ON_ERROR_STOP=1 postgres://$POSTGRES_USERNAME:$POSTGRES_PASSWORD@$POSTGRES_HOSTNAME:$POSTGRES_PORT/$POSTGRES_DB"
dbinit_filename="000_init.sql"

last_migration=`echo "SELECT name FROM migrations ORDER BY name DESC LIMIT 1" | $psql_cmd | tr -d ' '`
migration_filenames=$(ls /migrations/sql | sort)

if [[ -z "$last_migration" ]]; then
		echo "no migration history found"
else
		echo "last migration applied: $last_migration"
fi

for i in $migration_filenames; do
		if [[ "$i" > "$last_migration" ]]; then
				echo "applying migration $i..."
				file=$(</migrations/sql/$i)
				echo "BEGIN; $file ; INSERT INTO migrations(name) VALUES('$i'); COMMIT;" | envsubst | $psql_cmd
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
