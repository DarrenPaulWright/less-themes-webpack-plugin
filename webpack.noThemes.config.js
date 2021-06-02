const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ThemesPlugin = require('./src/Plugin.js');

module.exports = {
	mode: 'production',
	entry: './test/app/app3.js',
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
		new ThemesPlugin()
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
