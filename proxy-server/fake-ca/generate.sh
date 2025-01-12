#!/bin/bash -e

if [[ ! -f myCA.key ]]; then
		openssl genrsa -out myCA.key 2048
fi

rm -f myCA.pem
openssl req -x509 -new -nodes -key myCA.key -sha256 -days 730 -out myCA.pem \
				-subj "/C=US/ST=Massachusetts/L=Worcester/O=FrobozzCo/CN=FrobozzCo Certificate Authority"
