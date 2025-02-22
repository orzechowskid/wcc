#!/bin/bash -e

# fetch secrets and configure environment
set -a
source .env
set +a

export HOST_UID=$(id -u)
export HOST_GID=$(id -g)

# call setup script for each service
for i in $(ls -d */); do
		pushd $i &> /dev/null

		if [[ -f ./env.template ]]; then
				envsubst "$(printf '${%s} ' $(env | cut -d'=' -f1))" < ./env.template > .env
		fi

		if [[ -f ./setup.sh  ]]; then
				./setup.sh
		fi

		popd &> /dev/null
done

export COMPOSE_BAKE=true

# build images
docker compose -f ./docker-compose.yml build
# start containers
docker compose -f ./docker-compose.yml up -d
