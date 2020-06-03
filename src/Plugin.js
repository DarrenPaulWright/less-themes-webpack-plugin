const { resolve } = require('path');
const escapeStringRegexp = require('escape-string-regexp');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const processOptionsThemes = require('./processOptionsThemes');

const THEME_NAME = 'themes-plugin';

const defaultOptions = {
	filename: '[name].min.css',
	themesPath: '',
	themes: {}
};

/**
 * @name Installation
 * @summary
 *
 * ```
 * npm install less-themes-webpack-plugin --save-dev
 * ```
 */

/**
 * @name Compatibility
 * @summary
 * Requires:
 * - webpack 4+
 * - node 8.5.0+
 *
 * Since this library uses [postcss-loader](https://github.com/postcss/postcss-loader) you must have a postcss.config.js in the root of your project for this plugin to work.
 *
 * You also need to install [Less](https://github.com/less/less.js).
 * This way you can control exactly which version you need.
 *
 * This plugin automatically adds its own loader and:
 * - [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
 * - [less-loader](https://github.com/webpack-contrib/less-loader)
 * - [css-loader](https://github.com/webpack-contrib/css-loader)
 * - [postcss-loader](https://github.com/postcss/postcss-loader)
 *
 * You shouldn't need to install them or reference them in any way in your webpack config.
 *
 * If you are using [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin), then this plugin will add a reference to the first compiled css theme file in the generated html (in the following example that would be main.light.mobile.min.css).
 */

/**
 * @arg {object} options
 *
 * @arg {string} [options.filename=[name].min.css] - The output file name. Replaces [name] with a generated name based on the themes option. In the following example you would get four .css files: <br>• main.light.mobile.min.css <br>• main.light.desktop.min.css <br>• main.dark.mobile.min.css <br>• main.dark.desktop.min.css
 *
 * @arg {string} [options.themesPath=''] - The base path to the theme files in `options.themes`.
 *
 * @arg {boolean} [options.sourceMap=false] - This is passed directly into MiniCssExtractPlugin.
 *
 * @arg {object} options.themes - Defines which files to import for each different theme. Can handle any amount of nesting. The file extension is not necessary in the file name if the actual file has an extension of `.less`. File definitions can be a string or an array of strings.
 *
 * @arg {string} [options.themes.path] - Appends a directory to the current path. Can be specified at any level.
 *
 * @arg {string|array} [options.themes.include] - Appends another directory to the current path. Can be specified at any level.
 *
 * @name Usage
 * @summary
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
 *							'main/light.less'
 *						],
 *						desktop: [
 *							'main/light.less',
 *							'main/desktop.less'
 *						]
 *					},
 *					dark: {
 *						mobile: [
 *							'main/light.less',
 *							'main/dark.less'
 *						],
 *						desktop: [
 *							'main/light.less',
 *							'main/dark.less',
 *							'main/desktop.less'
 *						]
 *					}
 *				}
 *			}
 *		})
 *    ]
 * };
 *
 * // The following will produce the same output:
 * module.exports = {
 *    // ...
 *    plugins: [
 *		new ThemesPlugin({
 *			filename: '[name].min.css',
 *			themesPath: './themes',
 *			sourceMap: true,
 *			themes: {
 *				main: {
 *					path: 'main',
 *					include: 'light',
 *					light: {
 *						mobile: [],
 *						desktop: 'desktop'
 *					},
 *					dark: {
 *						include: 'dark',
 *						mobile: [],
 *						desktop: 'desktop'
 *					}
 *				}
 *			}
 *		})
 *    ]
 * };
 * ```
 */

class ThemesPlugin {
	constructor(options) {
		this.options = Object.assign({}, defaultOptions, options);
	}

	apply(compiler) {
		let themesPath = this.options.themesPath;
		themesPath = (themesPath.charAt(0) === '.') ? resolve(process.cwd(), themesPath) : themesPath;
		const [themes, themeNames] = processOptionsThemes(this.options.themes, themesPath);

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
				use: [MiniCssExtractPlugin.loader, {
					loader: 'css-loader',
					options: {
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
				}]
			});

			themeNames.forEach((themeName) => {
				compiler.options.optimization.splitChunks.cacheGroups[themeName] = {
					test: new RegExp('\.' + escapeStringRegexp(themeName) + '\.less$'),
					name: themeName,
					chunks: 'all',
					enforce: true
				};
			});
		};

		const stripLink = (html, fileName) => {
			fileName = this.options.filename.replace('[name]', fileName);
			const search = new RegExp(`<link[^>]+${escapeStringRegexp(fileName)}[^>]+>`);
			return html.replace(search, '');
		};

		compiler.hooks.environment.tap(THEME_NAME, addLoaders);

		compiler.hooks.compilation.tap(THEME_NAME, function(compilation) {
			if (compilation.hooks.htmlWebpackPluginAfterHtmlProcessing) {
				compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(THEME_NAME, function(data, callback) {
					themeNames.forEach((themeName, index) => {
						if (index) {
							data.html = stripLink(data.html, themeName);
						}
					});

					callback(null, data);
				});
			}
		});
	}
}

module.exports = ThemesPlugin;
