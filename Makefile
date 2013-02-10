build:
	@echo build
	@./node_modules/.bin/component install
	@./node_modules/.bin/component build

test: build
	@echo test in browser
	@./node_modules/mocha-phantomjs/bin/mocha-phantomjs test/test-runner.html

.PHONY: test build
