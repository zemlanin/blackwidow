bin = $(shell npm bin)
gulp = $(bin)/gulp
node_static = $(bin)/static

src = $(shell pwd)/src
dist = $(shell pwd)/dist
node_modules = $(shell pwd)/node_modules

build: static js

clean:
	rm -rf $(node_modules) $(dist)

static:
	mkdir -p $(dist)
	cp -R $(src)/css $(dist)/css
	cp -R $(src)/views/ $(dist)
	cp    $(shell pwd)/_redirects $(dist)/_redirects

js:
	$(gulp) jscore jsbundle

js_watch: js
	$(gulp) watch

serve:
	@echo serving at http://127.0.0.1:8000
	@$(node_static) $(dist) -p 8000 -z > /dev/null

watch:
	watchman watch $(src)
	watchman -- trigger $(src) remake '*.html' '*.css' -- make static

unwatch:
	watchman trigger-del $(src) remake
