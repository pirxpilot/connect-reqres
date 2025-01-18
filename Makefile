check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	node --test

test-coverage:
	node --test --experimental-test-coverage

.PHONY: check lint test
