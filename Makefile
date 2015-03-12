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

jscore:
	# OS X: https://github.com/tonsky/AnyBar
	echo "white\c" | nc -4u -w0 localhost 1738
	@$(gulp) jscore || (echo "red\c" | nc -4u -w0 localhost 1738)

jsbundle:
	# OS X: https://github.com/tonsky/AnyBar
	echo "white\c" | nc -4u -w0 localhost 1738
	$(gulp) jsbundle || (echo "red\c" | nc -4u -w0 localhost 1738)

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
