#!/bin/bash

# PWD should be the frontend dir

for i in `ls ../dto/db | cut -d '.' -f 1`; do
		json-schema-to-zod -i ../dto/db/$i.json -o ./app/dto/db/$i.ts --name ${i}Validator --type $i
done
