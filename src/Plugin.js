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
