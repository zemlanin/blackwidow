bin = $(shell npm bin)
gulp = $(bin)/gulp
node_static = $(bin)/static

src = $(shell pwd)/src
dist = $(shell pwd)/dist
node_modules = $(shell pwd)/node_modules

UNAME := $(shell uname)
nofify_error =		@':'
nofify_success =	@':'
nofify_inprogress = @':'

ifeq ($(UNAME), Linux)
	nofify_error =		(notify-send 'make (blackwidow): error')
	nofify_success =	(notify-send 'make (blackwidow): success')
endif
ifeq ($(UNAME), Darwin)
	# OS X: https://github.com/tonsky/AnyBar
	nofify_error =		(echo "red\c"		| nc -4u -w0 localhost 1738)
	nofify_success =	(echo "green\c"		| nc -4u -w0 localhost 1738)
	nofify_inprogress = (echo "question\c"	| nc -4u -w0 localhost 1738)
endif

build: static js

clean:
	rm -rf $(node_modules) $(dist)

static:
	mkdir -p $(dist)
	cp -R $(src)/css $(dist)/css
	cp -R $(src)/views/ $(dist)
	cp    $(shell pwd)/_redirects $(dist)/_redirects

jscore:
	$(nofify_inprogress)
	@$(gulp) jscore\
		&& $(nofify_success)\
		|| $(nofify_error)

jsbundle:
	$(nofify_inprogress)
	@$(gulp) jsbundle\
		&& $(nofify_success)\
		|| $(nofify_error)

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
	bitballoon deploy $(dist)
