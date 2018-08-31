.PHONY: build

build: Dockerfile
	docker build -t remind101/r101-negapollo .

shell:
	docker run --rm -it -v $(shell pwd):/home/app remind101/r101-negapollo bash

run: build
	docker run -p 9000:8080 remind101/r101-negapollo ./bin/web

test:
	yarn test
