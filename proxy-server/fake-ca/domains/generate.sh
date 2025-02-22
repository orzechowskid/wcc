#!/bin/bash -e

if [[ -z "$1" ]]; then
		echo "usage: $0 <domain.name>"

		exit 1
elif [[ -d "./$1" ]]; then
		echo "$1 already exists; renewing existing certificate"

		pushd $1 &> /dev/null
else
		mkdir $1
		pushd $1 &> /dev/null

		cp ../extfile.template.config ./$1.ext
		echo "DNS.1 = $1" >> ./$1.ext
		openssl req -new -key ./$1.key -out ./$1.csr \
						-subj "/C=US/ST=Massachusetts/L=Worcester/O=FrobozzCo\CN=FrobozzCo $1"
fi

openssl x509 -req -in ./$1.csr -CA ../../myCA.pem -CAkey ../../myCA.key \
				-CAcreateserial -out ./$1.crt -days 540 -sha256 -extfile ./$1.ext

popd &> /dev/null

echo "domains/$1 created"
