install:
	@./tools/7z/7za x tools.7z -otools -y
	@mkdir build
	@mkdir dist
	@yarn install
	
uninstall:
	@rm -rf build
	@rm -rf dist
	@rm -rf node_modules
	@rm -f  tools/*.*

generate-constants:
	@rm -rf build/constants
	@mkdir build/constants
	@node scripts/generate-constants.js
	@cp build/constants/constants.mjs scripts/constants.mjs
	@cp build/constants/constants.d.ts src/ts/_constants.d.ts

dev: generate-constants
	@rm -rf build/debug
	@mkdir build/debug
	@cp src/html/index.html build/debug/index.html
	@node scripts/debug-app.mjs

release: generate-constants
	@rm -rf build/release
	@mkdir build/release
	@yarn html-minifier-terser --collapse-whitespace --remove-comments --remove-attribute-quotes --input-dir src/html/ --output-dir build/release/
	@node scripts/release-app.mjs | node_modules/.bin/uglifyjs --config-file scripts/terser.config.json -o build/release/app.js
	@yarn roadroller build/release/app.js -O2 -o build/release/app.js
	@rm -rf dist
	@mkdir -p dist/src
	@yarn html-inline -i ./build/release/index.html -o ./dist/src/index.html
	@tools/7z/7za a -tzip dist/game.zip ./dist/src/*
	@tools/ect.exe -9 -zip dist/game.zip
	@tools/cloc-1.86 ./src/ts
	@node scripts/file-size.js

bump-build:
	@node scripts/version-bump.js

bump-revision:
	@node scripts/version-bump.js

bump-minor:
	@node scripts/version-bump.js

bump-major:
	@node scripts/version-bump.js

release-build: bump-build release

release-revision: bump-revision release

release-minor: bump-minor release

release-major: bump-major release