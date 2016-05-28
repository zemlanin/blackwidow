SHELL := /bin/bash

bin = $(shell npm bin)
mocha = $(bin)/mocha

src = $(shell pwd)/src
dist = $(shell pwd)/dist

.PHONY: build
build: dist_static dist/js

clean_dist:
	rm -rf $(dist)

.PHONY: dist_static
dist_static:
	mkdir -p $(dist)
	cp -R $(src)/views/* $(dist)
	[ -f CNAME ] && cp CNAME $(dist) || :
	cp -R examples $(dist)

.PHONY: dist/js
dist/js:
	npm run webpack

.PHONY: watch
watch:
	npm run webpack -- --progress --watch

.PHONY: lint
lint:
	npm run standard -- --verbose | npm run snazzy

.PHONY: deploy
deploy: test
	$(MAKE) clean_dist
	DOTENV=.env $(MAKE)
	[ -x deploy.sh ] && ./deploy.sh || echo "no executable deploy.sh found"

.PHONY: test
test:
	NODE_PATH=$(src) $(mocha) --compilers js:babel-register --recursive --require ignore-styles
