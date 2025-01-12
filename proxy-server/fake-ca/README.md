# domains/generate.sh

## usage

1. import myCA.pem into your browser (or OS keystore, or wherever) as a trusted CA
2. `cd domains` then generate a new crt/key pair for a hostname of your choice (e.g. `local.host`)
3. add `127.0.0.1  local.host` to `/etc/hosts` (or your platform's equivalent)
4. provide the generated crt/key to your webserver(s)
5. access your app(s) via https://local.host instead of `localhost

## manifest

- myCA.key: private key for our fake CA
- myCA.crt: ssl cert for myCA.key
- <domain>.csr: certificate signing request
- <domain>.crt: ssl cert signed by myCA
- <domain>.key: private key for <domain>.crt
- <domain>.ext: x509 extension config file for <domain>.crt
