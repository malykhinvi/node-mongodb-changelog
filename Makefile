
MOCHA_OPTS= --check-leaks
REPORTER = list

test:
	NODE_PATH=. mocha test --reporter $(REPORTER) $(MOCHA_OPTS)

.PHONY: test
