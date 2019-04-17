const {resolve} = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const THEME_NAME = 'themes-plugin';
const LESS_EXT = '.less';

const defaultOptions = {
	filename: '[name].min.css',
	themesPath: '',
	themes: {}
};

/**
 * With npm:
 * ```
 * npm install less-themes-webpack-plugin --save-dev
 * ```
 *
 * @name Installation
 */

/**
 * Requires:
 * - webpack >=4
 * - node >= 8.5.0
 *
 * Since this library uses [postcss-loader](https://github.com/postcss/postcss-loader) you must have a postcss.config.js in the root of your project for this plugin to work.
 *
 * @name Compatibility
 */

/**
 * This plugin automatically adds its own loader and [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin), [less-loader](https://github.com/webpack-contrib/less-loader), [css-loader](https://github.com/webpack-contrib/css-loader), and [postcss-loader](https://github.com/postcss/postcss-loader).
 *
 * In your js files import less like this:
 * ```javascript
 * import './stylesForThisFile.less';
 * ```
 *
 * @example
 * ```javascript
 * // webpack.config.js
 * const ThemesPlugin = require('less-themes-webpack-plugin');
 *
 * module.exports = {
 *    // ...
 *    plugins: [
 *		new ThemesPlugin({
 *			filename: '[name].min.css',
 *			themesPath: './themes',
 *			sourceMap: true,
 *			themes: {
 *				main: {
 *					light: {
 *						mobile: [
 *							'light.less'
 *						],
 *						desktop: [
 *							'light.less',
 *							'desktop.less'
 *						]
 *					},
 *					dark: {
 *						mobile: [
 *							'light.less',
 *							'dark.less'
 *						],
 *						desktop: [
 *							'light.less',
 *							'dark.less',
 *							'desktop.less'
 *						]
 *					}
 *				}
 *			}
 *		})
 *    ]
 * };
 * ```
 *
 * @arg {object} options
 * @arg {string} [options.filename='[name].min.css'] - The output file name. Replaces [name] with a generated name based on the themes option. In this example you would get four .css files: <br>&nbsp; • main.light.mobile.min.css <br>&nbsp;• main.light.desktop.min.css <br>&nbsp;• main.dark.mobile.min.css <br>&nbsp;• main.dark.desktop.min.css
 * @arg {string} [options.themesPath=''] - The path to the theme files in `options.themes`.
 * @arg {boolean} [options.sourceMap=false] - This is passed directly into MiniCssExtractPlugin.
 * @arg {object} options.themes - Defines which files to import for each different theme. Can handle any amount of nesting. The file extension is not necessary in the file name if the actual file has an extension of `.less`.
 *
 * @name Usage
 */

class ThemesPlugin {
	constructor(options) {
		this.options = Object.assign({}, defaultOptions, options);
	}

	apply(compiler) {
		const themesPath = (this.options.themesPath.charAt(0) === '.') ? resolve(process.cwd(), this.options.themesPath) : this.options.themesPath;
		const themes = {};
		const themeNames = [];
		let filePath;

		const addImport = (filename, themeName) => {
			if (!themes[themeName]) {
				themes[themeName] = [];
				themeNames.push(themeName);
			}

			if (filename.indexOf('.') === -1) {
				filename += LESS_EXT;
			}

			filePath = resolve(themesPath, filename);

			if (!fs.existsSync(filePath)) {
				throw new Error('Theme file not found: ' + filePath);
			}

			themes[themeName].push(filePath);
		};

		const processAppend = (data, themeName) => {
			if (typeof data === 'string') {
				addImport(data, themeName);
			}
			else if (Array.isArray(data)) {
				data.forEach((item) => {
					processAppend(item, themeName);
				});
			}
			else if (data && data.constructor === Object) {
				for (let key in data) {
					processAppend(data[key], themeName + '.' + key);
				}
			}
		};

		const addLoaders = () => {
			compiler.options.module.rules.push({
				test: /\.js/,
				loader: resolve(__dirname, 'Loader.js'),
				enforce: 'pre',
				options: {
					themes: themes
				}
			});

			const miniCssExtractPlugin = new MiniCssExtractPlugin({
				filename: this.options.filename
			});
			compiler.options.plugins.push(miniCssExtractPlugin);
			miniCssExtractPlugin.apply(compiler);

			compiler.options.module.rules.push({
				test: /\.less$/,
				use: [
					MiniCssExtractPlugin.loader, {
						loader: 'css-loader', options: {
							sourceMap: this.options.sourceMap || false
						}
					}, {
						loader: 'postcss-loader',
						options: {
							config: {
								path: './'
							}
						}
					}, {
						loader: 'less-loader',
						options: {
							javascriptEnabled: true,
							compress: false,
							sourceMap: this.options.sourceMap || false
						}
					}
				]
			});

			themeNames.forEach((themeName) => {
				compiler.options.optimization.splitChunks.cacheGroups[themeName] = {
					test: new RegExp('\.' + themeName + '\.less$'),
					name: themeName,
					chunks: 'all',
					enforce: true
				};
			});
		};

		const stripLink = (html, fileName) => {
			fileName = this.options.filename.replace('[name]', fileName);
			const search = new RegExp('<link[^>]+' + fileName + '[^>]+>');
			return html.replace(search, '');
		};

		for (let themeName in this.options.themes) {
			processAppend(this.options.themes[themeName], themeName);
		}

		compiler.hooks.environment.tap(THEME_NAME, addLoaders);

		compiler.hooks.compilation.tap(THEME_NAME, function(compilation) {
			compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(THEME_NAME, function(data, callback) {
				themeNames.forEach((themeName, index) => {
					if (index) {
						data.html = stripLink(data.html, themeName);
					}
				})

				callback(null, data);
			});
		});
	}
}

module.exports = ThemesPlugin;
