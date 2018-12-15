# less-themes-webpack-plugin

A webpack plugin for generating multiple themed css files from less.

## Installation

With npm
```
npm install less-themes-webpack-plugin --save-dev
```

## Compatibility

Requires webpack >=4 and ES6.

## Usage

```javascript
// webpack.config.js
const ThemesPlugin = require('less-themes-webpack-plugin');

module.exports = {
    // ...
    plugins: [
		new ThemesPlugin({
			filename: '[name].min.css',
			themesPath: './themes',
			sourceMap: true,
			themes: {
				main: {
					light: {
						mobile: [
							'light.less'
						],
						desktop: [
							'light.less',
							'desktop.less'
						]
					},
					dark: {
						mobile: [
							'light.less',
							'dark.less'
						],
						desktop: [
							'light.less',
							'dark.less',
							'desktop.less'
						]
					}
				}
			}
		})
    ]
};
```

This plugin automatically adds its own loader and  [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin), [less-loader](https://github.com/webpack-contrib/less-loader), [css-loader](https://github.com/webpack-contrib/css-loader), and [postcss-loader](https://github.com/postcss/postcss-loader).

In js import your less like this:
```javascript
import './stylesForThisFile.less';
```

## Options

### `options.filename`

`string`, defaults to `'[name].min.css'`.

The output file name. Replaces [name] with a generated name based on the themes option. In this example you would get four .css files:
 - main.light.mobile.min.css
 - main.light.desktop.min.css
 - main.dark.mobile.min.css
 - main.dark.desktop.min.css

### `options.themesPath`

`string`, defaults to `''`.

The path to the theme files in `options.themes`.

### `options.sourceMap`

`boolean`, defaults to `false`.

This is passed directly into MiniCssExtractPlugin.

### `options.themes`

`object`, required.

Defines which files to import for each different theme. Can handle any amount of nesting.

