const { dirname, resolve, relative } = require('path');
const { writeFileSync } = require('fs');
const escapeStringRegexp = require('escape-string-regexp');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const processOptionsThemes = require('./processOptionsThemes');
const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin');
const temp = require('temp');
const mkdirp = require('mkdirp');
const { buildTempFiles } = require('./utils.js');

temp.track();

const tempDir = temp.mkdirSync();
const THEME_NAME = 'themes-plugin';
const defaultOptions = {
	filename: '[name].min.css',
	themesPath: '',
	themes: { main: '' },
	skipLoaders: false
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
 * - webpack 5+
 * - node 10+
 *
 * For webpack 4 use less-themes-webpack-plugin@1.5.1
 *
 * Since this library uses [postcss-loader](https://github.com/postcss/postcss-loader) you must have a postcss config in the root of your project for this plugin to work.
 *
 * This library has a peer dependency of [Less](https://github.com/less/less.js).
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
 * @arg {boolean} [options.sourceMap=false] - This is passed directly into MiniCssExtractPlugin and loaders.
 *
 * @arg {boolean} [options.skipLoaders=false] - If true then MiniCssExtractPlugin and loaders won't be added. You must provide them in your webpack config.
 *
 * @arg {object} [options.themes] - Defines which files to import for each different theme. Can handle any amount of nesting. The file extension is not necessary in the file name if the actual file has an extension of `.less`. File definitions can be a string or an array of strings. If no themes are defined then a single css file will be produced named 'main.min.css'
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
		this.options = { ...defaultOptions, ...options };

		const [themes, themeNames] = processOptionsThemes(
			this.options.themes,
			this.options.themesPath
		);

		this._themes = themes;
		this._themeNames = themeNames;
	}

	_buildThemeFiles(compiler) {
		buildTempFiles(tempDir, this._themes)
			.forEach((file) => {
				mkdirp.sync(file.dir);
				writeFileSync(file.location, file.content);
			});
	}

	_hasHtmlWebpackPlugin(compiler) {
		return compiler.options.plugins
			.some((plugin) => plugin instanceof HtmlWebpackPlugin);
	}

	_addMiniCssExtractPlugin(compiler, filename) {
		const miniCssExtractPlugin = new MiniCssExtractPlugin({ filename });

		compiler.options.plugins.push(miniCssExtractPlugin);
		miniCssExtractPlugin.apply(compiler);
	}

	_addChunks(compiler) {
		this._themeNames.forEach((themeName) => {
			compiler.options.optimization.splitChunks.cacheGroups[themeName] = {
				test: new RegExp('\.' + escapeStringRegexp(themeName) + '\.less$'),
				name: themeName,
				chunks: 'all',
				enforce: true,
				reuseExistingChunk: true
			};
		});
	}

	_cleanAssetTagsStyles(tag, data) {
		if (tag.attributes.href.includes(this._themeNames[0])) {
			data.assetTags.styles = [tag];
			return true;
		}
	}

	_alterAssetTags(data, callback) {
		data.assetTags.styles
			.some((tag) => this._cleanAssetTagsStyles(tag, data));

		callback(null, data);
	}

	_onCompile(compilation) {
		HtmlWebpackPlugin
			.getHooks(compilation)
			.alterAssetTags
			.tapAsync(THEME_NAME, this._alterAssetTags.bind(this));
	}

	apply(compiler) {
		this._buildThemeFiles(compiler);

		compiler.hooks
			.environment
			.tap(THEME_NAME, () => {
				const sourceMap = this.options.sourceMap || false;

				compiler.options.module.rules.push({
					test: /\.js$/,
					loader: resolve(__dirname, 'Loader.js'),
					enforce: 'pre',
					options: {
						themes: this._themes,
						themeNames: this._themeNames
					}
				});

				if (this.options.skipLoaders !== true) {
					this._addMiniCssExtractPlugin(compiler, this.options.filename);
					compiler.options.module.rules.push({
						test: /\.less$/,
						use: [MiniCssExtractPlugin.loader, {
							loader: 'css-loader',
							options: { sourceMap }
						}, {
							loader: 'postcss-loader',
							options: {
								postcssOptions: { config: './' },
								sourceMap
							}
						}, {
							loader: 'less-loader',
							options: { sourceMap }
						}]
					});
				}

				this._addChunks(compiler);
			});

		if (this._hasHtmlWebpackPlugin(compiler)) {
			compiler.hooks.compilation
				.tap(THEME_NAME, this._onCompile.bind(this));
		}
	}
}

module.exports = ThemesPlugin;
