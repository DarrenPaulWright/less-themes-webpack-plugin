const _ = require('lodash');
const {resolve} = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const THEME_NAME = 'themes-plugin';
const LESS_EXT = '.less';

const defaultOptions = {
	filename: '[name].min.css',
	themesPath: '',
	themes: {}
};

class ThemesPlugin {

	constructor(options) {
		this.options = Object.assign({}, defaultOptions, options);
	}

	apply(compiler) {
		const themesPath = (this.options.themesPath.charAt(0) === '.') ? resolve(process.cwd(), this.options.themesPath) : this.options.themesPath;
		const themes = {};
		let filePath;
		const excludeChunks = [];
		let primaryThemeName;

		const addImport = (filename, themeName) => {
			if (!themes[themeName]) {
				themes[themeName] = [];
			}

			if (filename.indexOf(LESS_EXT) === -1) {
				filename += LESS_EXT;
			}

			filePath = resolve(themesPath, filename);

			themes[themeName].push(filePath);
		};

		const processAppend = (data, themeName) => {
			if (_.isString(data)) {
				addImport(data, themeName);
			}
			else if (_.isArray(data)) {
				_.each(data, (item) => {
					processAppend(item, themeName);
				});
			}
			else if (_.isPlainObject(data)) {
				_.forOwn(data, (value, key) => {
					processAppend(value, themeName + '.' + key);
				});
			}
		};

		const addLoaders = () => {
			compiler.options.module.rules.push({
				test: /\.js/,
				loader: resolve(__dirname, 'loader.js'),
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
					},
					'postcss-loader', {
						loader: 'less-loader',
						options: {
							javascriptEnabled: true,
							compress: false,
							sourceMap: this.options.sourceMap || false
						}
					}
				]
			});

			_.forOwn(themes, (files, themeName) => {
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

		_.forOwn(this.options.themes, (theme, themeName) => {
			processAppend(theme, themeName);
		});

		_.forOwn(themes, (files, themeName) => {
			if (!primaryThemeName) {
				primaryThemeName = themeName;
			}
			excludeChunks.push(themeName);
		});
		excludeChunks.shift();

		compiler.hooks.environment.tap(THEME_NAME, addLoaders);

		compiler.hooks.compilation.tap(THEME_NAME, function(compilation) {
			compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(THEME_NAME, function(data, callback) {
				_.forOwn(themes, (files, themeName) => {
					if (themeName !== primaryThemeName) {
						data.html = stripLink(data.html, themeName);
					}
				});

				callback(null, data);
			});
		});
	}
}

module.exports = ThemesPlugin;
