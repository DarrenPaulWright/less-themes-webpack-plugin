const { assert } = require('chai');
const webpack = require('webpack');
const options = require('../webpack.config.js');
const { readFileSync } = require('fs');

describe('Plugin', () => {
	it('should compile with webpack', function(done) {
		this.timeout(20000);

		const expectedFiles = [{
			path: 'src/main.js'
		}, {
			path: 'index.html',
			content: '<!DOCTYPE html>\n' +
				'<html>\n' +
				'  <head>\n' +
				'    <meta charset="utf-8">\n' +
				'    <title>test</title>\n' +
				'  <meta name="viewport" content="width=device-width,initial-scale=1"><script defer="defer" src="src/main.js"></script><link href="styles/main.dark.mobile.min.css" rel="stylesheet"></head>\n' +
				'  <body>\n' +
				'  </body>\n' +
				'</html>'
		}, {
			path: 'styles/main.dark.desktop.min.css',
			content: '.test {\n' +
				'  color: black;\n' +
				'  font-size: 1rem;\n' +
				'}\n' +
				'\n'
		}, {
			path: 'styles/main.dark.mobile.min.css',
			content: '.test {\n' +
				'  color: black;\n' +
				'  font-size: 1.1rem;\n' +
				'}\n' +
				'\n'
		}, {
			path: 'styles/main.light.desktop.min.css',
			content: '.test {\n' +
				'  color: white;\n' +
				'  font-size: 1rem;\n' +
				'}\n' +
				'\n'
		}, {
			path: 'styles/main.light.mobile.min.css',
			content: '.test {\n' +
				'  color: white;\n' +
				'  font-size: 1.1rem;\n' +
				'}\n' +
				'\n'
		}, {
			path: 'styles/two.dark.desktop.min.css',
			content: '.test {\n' +
				'  color: red;\n' +
				'  font-size: 2rem;\n' +
				'}\n' +
				'\n'
		}, {
			path: 'styles/two.dark.mobile.min.css',
			content: '.test {\n' +
				'  color: red;\n' +
				'  font-size: 2.2rem;\n' +
				'}\n' +
				'\n'
		}, {
			path: 'styles/two.light.desktop.min.css',
			content: '.test {\n' +
				'  color: blue;\n' +
				'  font-size: 2rem;\n' +
				'}\n' +
				'\n'
		}, {
			path: 'styles/two.light.mobile.min.css',
			content: '.test {\n' +
				'  color: blue;\n' +
				'  font-size: 2.2rem;\n' +
				'}\n' +
				'\n'
		}];

		webpack(options, function(err, stats) {
			if (err) {
				return done(err);
			}
			else if (stats.hasErrors()) {
				return done(new Error(stats.toString()));
			}

			const files = stats.toJson().assets.map(x => x.name);

			expectedFiles.forEach((expected) => {
				assert.isTrue(files.includes(expected.path));

				if (expected.content) {
					const actualContent = readFileSync('dist/' + expected.path, 'utf8');

					assert.strictEqual(actualContent, expected.content);
				}
			});

			assert.strictEqual(files.length, expectedFiles.length);

			done();
		});
	});
});
