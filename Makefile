SHELL := /bin/bash

bin = $(shell npm bin)
node_static = $(bin)/static
webpack = $(bin)/webpack
standard = $(bin)/standard
snazzy = $(bin)/snazzy
mocha = $(bin)/mocha

NODE_PATH = $(shell pwd)
src = $(shell pwd)/src
dist = $(shell pwd)/dist
node_modules = $(shell pwd)/node_modules

.PHONY: build
build: dist_static dist/js

clean_dist:
	rm -rf $(dist)

clean: clean_dist
	rm -rf $(node_modules)

.PHONY: dist_static
dist_static:
	mkdir -p $(dist)
	cp -R $(src)/views/* $(dist)
	[ -f CNAME ] && cp CNAME $(dist) || :
	cp -R examples $(dist)

.PHONY: dist/js
dist/js:
	mkdir -p $(dir $@)
	set -o pipefail && $(MAKE) lint && NODE_PATH=$(NODE_PATH) $(webpack)

.PHONY: watch
watch:
	NODE_PATH=$(NODE_PATH) $(webpack) --progress --watch

.PHONY: lint
lint:
	$(standard) --verbose | $(snazzy)

.PHONY: serve
serve:
	@echo serving at http://127.0.0.1:8000
	@$(node_static) $(dist) -p 8000 -z -c 0 -H '{"Access-Control-Allow-Origin": "*"}' > /dev/null

.PHONY: serve_lan
serve_lan:
	@echo serving at http://helicarrier.local:8000
	@$(node_static) $(dist) -p 8000 -a helicarrier.local -z -c 0 -H '{"Access-Control-Allow-Origin": "*"}' > /dev/null

.PHONY: deploy
deploy:
	$(MAKE) clean_dist
	DOTENV=.env $(MAKE)
	[ -x deploy.sh ] && ./deploy.sh || echo "no executable deploy.sh found"

.PHONY: test
test:
	NODE_PATH=$(src) $(mocha) --compilers js:babel-register --recursive --require ignore-styles
