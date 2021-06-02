const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ThemesPlugin = require('./src/Plugin.js');

module.exports = {
	mode: 'production',
	entry: './test/app/app.js',
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
			skipLoaders: true,
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
				},
				two: {
					path: 'two',
					include: 'blue',
					dark: {
						include: 'red',
						mobile: [],
						desktop: 'desktop.less'
					},
					light: {
						mobile: [],
						desktop: 'desktop.less'
					}
				}
			}
		}),
		new MiniCssExtractPlugin({
			filename: 'styles/[name].min.css'
		})
	],
	module: {
		rules: [{
			test: /\.js$/u,
			use: {
				loader: 'babel-loader'
			}
		}, {
			test: /\.less$/,
			use: [MiniCssExtractPlugin.loader, {
				loader: 'css-loader',
				options: { sourceMap: false }
			}, {
				loader: 'postcss-loader',
				options: {
					postcssOptions: { config: './' },
					sourceMap: false
				}
			}, {
				loader: 'less-loader',
				options: { sourceMap: false }
			}]
		}]
	}
};
