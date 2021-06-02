const { assert } = require('chai');
const webpack = require('webpack');
const singleEntryOptions = require('../webpack.config.js');
const multiEntryOptions = require('../webpack.multi.config.js');
const { readFileSync } = require('fs');

describe('Plugin', () => {
	const buildTest = (options, expectedFiles) => {
		return function(done) {
			this.timeout(20000);

			webpack(options, (err, stats) => {
				if (err) {
					return done(err);
				}
				if (stats.hasErrors()) {
					return done(new Error(stats.toString()));
				}

				const files = stats.toJson().assets.map((x) => x.name);

				assert.deepEqual(files.length, expectedFiles.length, 'wrong number of files. actual: ' + JSON.stringify(files, null, 4));

				expectedFiles.forEach((expected) => {
					assert.isTrue(files.includes(expected.path), 'expected file ' + expected.path + ' not found in ' + JSON.stringify(files));

					if (expected.content) {
						const actualContent = readFileSync('dist/' + expected.path, 'utf8');

						assert.strictEqual(actualContent, expected.content);
					}
				});

				done();
			});
		};
	};

	it('should compile with a single entry point', buildTest(
		singleEntryOptions,
		[{
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
		}]
	));

	it('should compile with multi entry points', buildTest(
		multiEntryOptions,
		[{
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
				'.test2 {\n' +
				'  color: black;\n' +
				'  font-size: 1rem;\n' +
				'}\n' +
				'.component {\n' +
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
				'.test2 {\n' +
				'  color: black;\n' +
				'  font-size: 1.1rem;\n' +
				'}\n' +
				'.component {\n' +
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
				'.test2 {\n' +
				'  color: white;\n' +
				'  font-size: 1rem;\n' +
				'}\n' +
				'.component {\n' +
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
				'.test2 {\n' +
				'  color: white;\n' +
				'  font-size: 1.1rem;\n' +
				'}\n' +
				'.component {\n' +
				'  color: white;\n' +
				'  font-size: 1.1rem;\n' +
				'}\n' +
				'\n'
		}]
	));
});
