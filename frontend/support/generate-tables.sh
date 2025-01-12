#!/bin/bash

for i in `find ../../dto/db | grep json`; do
		node ./generate-tables.js $i
done
