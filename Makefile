./lib/xmlify.js: ./src/xmlify.ts
	tsc src/xmlify.ts --outDir ./lib/

clean:
	rm -f ./lib/xmlify.js

run: ./lib/xmlify.js
	node ./test/test.js
