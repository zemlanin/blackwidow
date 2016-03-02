SHELL := /bin/bash
NODE_PATH := $(shell pwd)

bin = $(shell npm bin)
node_static = $(bin)/static
webpack = $(bin)/webpack
standard = $(bin)/standard
snazzy = $(bin)/snazzy
mocha = $(bin)/mocha

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
	set -o pipefail && $(MAKE) lint && $(webpack)

.PHONY: watch
watch:
	$(webpack) --progress --watch

.PHONY: lint
lint:
	$(standard) --verbose | $(snazzy)

.PHONY: serve
serve:
	@echo serving at http://127.0.0.1:8000
	@$(node_static) $(dist) -p 8000 -z -c 0 > /dev/null

.PHONY: serve_lan
serve_lan:
	@echo serving at http://helicarrier.local:8000
	@$(node_static) $(dist) -p 8000 -a helicarrier.local -z -c 0 > /dev/null

.PHONY: deploy
deploy:
	$(MAKE) clean_dist
	NODE_ENV=production BWD_CONFIG=config/prod.json $(MAKE)
	[ -x deploy.sh ] && ./deploy.sh || echo "no executable deploy.sh found"

.PHONY: test
test:
	$(mocha) --compilers js:babel-register
