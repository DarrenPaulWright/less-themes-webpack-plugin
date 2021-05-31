const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ThemesPlugin = require('./src/Plugin.js');

module.exports = {
	mode: 'production',
	entry: [
		'./test/app/app.js',
		'./test/app/app2.js'
	],
	stats: 'errors-only',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'src/[name].js'
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: 'test',
			minify: { collapseWhitespace: false }
		}),
		new ThemesPlugin({
			filename: 'styles/[name].min.css',
			themesPath: './test/app/styles',
			sourceMap: true,
			themes: {
				main: {
					path: 'main',
					include: 'light',
					dark: {
						include: 'dark',
						mobile: [],
						desktop: 'desktop.less'
					},
					light: {
						mobile: [],
						desktop: 'desktop.less'
					}
				}
			}
		})
	],
	module: {
		rules: [{
			test: /\.js$/u,
			use: {
				loader: 'babel-loader'
			}
		}]
	}
};
