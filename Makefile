SHELL := /bin/bash
UNAME := $(shell uname)

bin = $(shell npm bin)
node_static = $(bin)/static
json = $(bin)/json
browserify = $(bin)/browserify
exorcist = $(bin)/exorcist
uglifyjs = $(bin)/uglifyjs
eslint = $(bin)/eslint

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

build: static js

clean:
	rm -rf $(node_modules) $(dist)

static:
	mkdir -p $(dist)
	cp -R $(src)/css $(dist)/css
	cp -R $(src)/views/* $(dist)
	cp    $(shell pwd)/_redirects $(dist)/_redirects

notify_inprogress:
ifeq ($(UNAME), Darwin)  # https://github.com/tonsky/AnyBar
	@echo "question\c" | nc -4u -w0 localhost 1738
endif

notify_result:
ifeq ($(UNAME), Linux)
	@read code; ([ $$code -eq 0 ] \
		&& echo 'make (blackwidow): success' \
		|| echo 'make (blackwidow): error' \
	) | notify-send; exit $$code
endif
ifeq ($(UNAME), Darwin) # https://github.com/tonsky/AnyBar
	@read code; ([ $$code -eq 0 ] \
		&& echo -n "green" \
		|| echo -n "red" \
	) | nc -4u -w0 localhost 1738; exit $$code
endif

jscore: notify_inprogress
	mkdir -p $(dist)/js
	set -o pipefail && echo $(dependencies) \
		| $(prepend-r) \
		| xargs $(browserify) \
		| $(uglifyjs) --mangle \
		> $(dist)/js/core.js; echo $$? | make notify_result

lint:
	$(eslint) $(src)/js

jsbundle: notify_inprogress
	mkdir -p $(dist)/js
	set -o pipefail && make lint && echo $(dependencies) \
		| $(prepend-x) \
		| xargs $(browserify) $(src)/js/client.js -r $(config_json):config -d \
		| $(exorcist) $(dist)/js/client.js.map \
		> $(dist)/js/client.js; echo $$? | make notify_result

js: jscore jsbundle

serve:
	@echo serving at http://127.0.0.1:8000
	@$(node_static) $(dist) -p 8000 -z > /dev/null

watch:
	# OS X 10.10: https://github.com/facebook/watchman/issues/68
	watchman watch $(shell pwd)
	watchman -- trigger $(shell pwd) rejs 'src/*.js' -- make jsbundle
	watchman -- trigger $(shell pwd) restatic 'src/*.html' -- make static

unwatch:
	watchman trigger-del $(shell pwd) rejs
	watchman trigger-del $(shell pwd) restatic

deploy:
	$(MAKE) config=prod
	bitballoon deploy $(dist)

me a:
	@true

sandwich:
ifeq ($(shell if touch / 2> /dev/null; then id -u; fi),0)
	@echo "Okay."
	@wget -q -O - http://imgs.xkcd.com/comics/sandwich.png > sandwich.png
else
	@echo "What? Make it yourself."
endif

.PHONY: me a sandwich deploy build watch unwatch js jsbundle jscore serve lint static
