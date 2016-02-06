SHELL := /bin/bash

bin = $(shell npm bin)
node_static = $(bin)/static
webpack = $(bin)/webpack
standard = $(bin)/standard
snazzy = $(bin)/snazzy
surge = $(bin)/surge
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
	set -o pipefail && make lint && $(webpack)

.PHONY: lint
lint:
	$(standard) --verbose | $(snazzy)

serve:
	@echo serving at http://127.0.0.1:8000
	@$(node_static) $(dist) -p 8000 -z -c 0 > /dev/null

serve_lan:
	@echo serving at http://helicarrier.local:8000
	@$(node_static) $(dist) -p 8000 -a helicarrier.local -z -c 0 > /dev/null

deploy:
	$(MAKE) clean_dist
	NODE_ENV=production $(MAKE)
	$(surge) $(dist)

.PHONY: test
test:
	$(mocha) --compilers js:babel-register


.PHONY: deploy serve
