FROM postgres:17

COPY docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/
COPY migrations/ /migrations/

ENTRYPOINT /migrations/docker-entrypoint.sh
