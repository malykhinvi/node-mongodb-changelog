
MOCHA_OPTS= --check-leaks
REPORTER = list

test:
	mocha test --reporter $(REPORTER) $(MOCHA_OPTS)

.PHONY: test
