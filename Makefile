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
build: dist_static dist/js/core.js dist/js/cast.js

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

.PHONY: notify_inprogress
notify_inprogress:
	@# https://github.com/tonsky/AnyBar || https://github.com/limpbrains/somebar
	@# http://stackoverflow.com/a/24198520
	@echo "question\c" | (nc -4u -z localhost 1738 && nc -4u -w0 localhost 1738)

.PHONY: notify_result
notify_result:
	@# https://github.com/tonsky/AnyBar || https://github.com/limpbrains/somebar
	@# http://stackoverflow.com/a/24198520
	@read code; ([ $$code -eq 0 ] \
		&& echo -n "green" \
		|| echo -n "red" \
	) | (nc -4u -z localhost 1738 && nc -4u -w0 localhost 1738); exit $$code

dist/js/core.js: package.json
	$(MAKE) notify_inprogress
	mkdir -p $(dir $@)
	set -o pipefail && echo $(dependencies) \
		| $(prepend-r) \
		| xargs $(browserify) \
		| $(uglifyjs) --mangle \
		> $@; echo $$? | make notify_result

lint:
	$(eslint) $(src)/js

dist/js/cast.js: src/js/*.js
	$(MAKE) notify_inprogress
	mkdir -p $(dir $@)

	set -o pipefail \
	&& make lint \
	&& echo $(dependencies) \
		| $(prepend-x) \
		| xargs $(browserify) $(src)/js/cast.js \
			-t babelify \
			-r $(config_json):config \
		> $(dist)/js/cast.js \
	; echo $$? | make notify_result

serve:
	@echo serving at http://127.0.0.1:8000
	@$(node_static) $(dist) -p 8000 -z -c 0 > /dev/null

serve_lan:
	@echo serving at http://helicarrier.local:8000
	@$(node_static) $(dist) -p 8000 -a helicarrier.local -z -c 0 > /dev/null

watch:
	# OS X 10.10: https://github.com/facebook/watchman/issues/68
	watchman watch $(shell pwd)
	watchman -- trigger $(shell pwd) rejs 'src/*.js' -- make dist/js/cast.js
	watchman -- trigger $(shell pwd) restatic 'src/*.html' -- make static

unwatch:
	watchman trigger-del $(shell pwd) rejs
	watchman trigger-del $(shell pwd) restatic

deploy:
	$(MAKE) clean_dist
	$(MAKE) config=prod
	$(surge) $(dist)


.PHONY: deploy watch unwatch serve lint static
