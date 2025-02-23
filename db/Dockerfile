FROM alpine/psql

RUN apk update && apk add \
		bash \
		envsubst

COPY migrations/ /migrations/

ENTRYPOINT [ "/bin/bash", "-c", "/migrations/docker-entrypoint.sh" ]
