const { assert } = require('chai');
const Plugin = require('../src/Plugin.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

describe('Plugin', () => {
	it('should strip css file links from html (HtmlWebpackPlugin v3)', () => {
		const plugin = new Plugin({
			filename: 'styles/[name].min.css',
			themesPath: './test/styles',
			themes: {
				main: {
					path: 'main',
					include: 'light',
					light: {
						mobile: [],
						desktop: 'desktop'
					},
					dark: {
						include: 'dark',
						mobile: [],
						desktop: 'desktop'
					}
				},
				two: {
					path: 'two',
					include: 'red',
					red: {
						mobile: [],
						desktop: 'desktop'
					},
					blue: {
						include: 'blue',
						mobile: [],
						desktop: 'desktop'
					}
				}
			}
		});

		let compilationCallback;

		plugin.apply({
			hooks: {
				environment: {
					tap() {
					}
				},
				compilation: {
					tap(name, callback) {
						compilationCallback = callback;
					}
				}
			},
			options: {
				plugins: [
					new HtmlWebpackPlugin()
				]
			}
		});

		compilationCallback({
			hooks: {
				htmlWebpackPluginAfterHtmlProcessing: {
					tapAsync(name, callback) {
						callback({
							html: `
<head>
	<meta charset="utf-8"><title>Something</title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<link href="/styles/main.light.desktop.min.css" rel="stylesheet">
	<link href="/styles/main.light.mobile.min.css" rel="stylesheet">
	<link href="/styles/main.dark.desktop.min.css" rel="stylesheet">
	<link href="/styles/main.dark.mobile.min.css" rel="stylesheet">
	<link href="/styles/two.red.desktop.min.css" rel="stylesheet">
	<link href="/styles/two.red.mobile.min.css" rel="stylesheet">
	<link href="/styles/two.blue.desktop.min.css" rel="stylesheet">
	<link href="/styles/two.blue.mobile.min.css" rel="stylesheet">
</head>
`
						}, (first, data) => {
							assert.strictEqual(data.html, `
<head>
	<meta charset="utf-8"><title>Something</title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	
	<link href="/styles/main.light.mobile.min.css" rel="stylesheet">
	
	
	
	
	
	
</head>
`);
						});
					}
				}
			}
		});
	});
});
