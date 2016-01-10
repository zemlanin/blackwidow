SHELL := /bin/bash

bin = $(shell npm bin)
node_static = $(bin)/static
json = $(bin)/json
browserify = $(bin)/browserify
exorcist = $(bin)/exorcist
uglifyjs = $(bin)/uglifyjs
eslint = $(bin)/eslint
surge = $(bin)/surge

dependencies = $(shell set -o pipefail && cat package.json | $(json) dependencies | $(json) -ka)

src = $(shell pwd)/src
dist = $(shell pwd)/dist
node_modules = $(shell pwd)/node_modules
ifdef config
	config_json = $(shell pwd)/config.$(config).json
else
	config_json = $(shell pwd)/config.json
endif

prepend-r = sed 's/\([^ ]*\)/-r \1/g' # prepending '-r' to each dependency
prepend-x = sed 's/\([^ ]*\)/-x \1/g' # prepending '-x' to each dependency

.PHONY: build
build: dist_static dist/js/core.js dist/js/cast.js dist/js/main.js

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

dist/js/core.js: package.json
	mkdir -p $(dir $@)
	set -o pipefail && echo $(dependencies) \
		| $(prepend-r) \
		| xargs $(browserify) \
		| $(uglifyjs) --mangle \
		> $@

lint:
	$(eslint) $(src)/js

# too lazy
dist/js/main.js: src/js/[!cast]*.js src/js/*/*.js src/js/*/*/*.js
	mkdir -p $(dir $@)

	set -o pipefail \
	&& make lint \
	&& echo $(dependencies) \
		| $(prepend-x) \
		| xargs $(browserify) $(src)/js/main.js \
			-t babelify \
			-r $(config_json):config \
		> $(dist)/js/main.js

dist/js/cast.js: src/js/cast.js
	mkdir -p $(dir $@)

	set -o pipefail \
	&& make lint \
	&& echo $(dependencies) \
		| $(prepend-x) \
		| xargs $(browserify) $(src)/js/cast.js \
			-t babelify \
			-r $(config_json):config \
		> $(dist)/js/cast.js

serve:
	@echo serving at http://127.0.0.1:8000
	@$(node_static) $(dist) -p 8000 -z -c 0 > /dev/null

serve_lan:
	@echo serving at http://helicarrier.local:8000
	@$(node_static) $(dist) -p 8000 -a helicarrier.local -z -c 0 > /dev/null

watch:
	# OS X 10.10: https://github.com/facebook/watchman/issues/68
	watchman watch $(shell pwd)
	watchman -- trigger $(shell pwd) rejs 'src/*.js' -- make dist/js/main.js
	watchman -- trigger $(shell pwd) restatic 'src/*.html' -- make static

unwatch:
	watchman trigger-del $(shell pwd) rejs
	watchman trigger-del $(shell pwd) restatic

deploy:
	$(MAKE) clean_dist
	$(MAKE) config=prod
	$(surge) $(dist)


.PHONY: deploy watch unwatch serve lint static
