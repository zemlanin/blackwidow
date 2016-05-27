SHELL := /bin/bash

bin = $(shell npm bin)
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
	NODE_PATH=$(NODE_PATH) npm run webpack

.PHONY: watch
watch:
	NODE_PATH=$(NODE_PATH) $(webpack) --progress --watch

.PHONY: lint
lint:
	$(standard) --verbose | $(snazzy)

.PHONY: deploy
deploy: test
	$(MAKE) clean_dist
	DOTENV=.env $(MAKE)
	[ -x deploy.sh ] && ./deploy.sh || echo "no executable deploy.sh found"

.PHONY: test
test:
	NODE_PATH=$(src) $(mocha) --compilers js:babel-register --recursive --require ignore-styles
