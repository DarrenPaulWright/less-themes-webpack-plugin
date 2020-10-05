# Less Themes Webpack Plugin

> A webpack plugin for generating multiple themed css files from less.
>
> [![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![size][size]][size-url]
[![vulnerabilities][vulnerabilities]][vulnerabilities-url]
[![license][license]][license-url]


<br><a name="Installation"></a>

## Installation
```
npm install less-themes-webpack-plugin --save-dev
```

<br><a name="Compatibility"></a>

## Compatibility
Requires:
- webpack 4+
- node 8.5.0+

Since this library uses [postcss-loader](https://github.com/postcss/postcss-loader) you must have a postcss.config.js in the root of your project for this plugin to work.

You also need to install [Less](https://github.com/less/less.js).
This way you can control exactly which version you need.

This plugin automatically adds its own loader and:
- [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
- [less-loader](https://github.com/webpack-contrib/less-loader)
- [css-loader](https://github.com/webpack-contrib/css-loader)
- [postcss-loader](https://github.com/postcss/postcss-loader)

You shouldn't need to install them or reference them in any way in your webpack config.

If you are using [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin), then this plugin will add a reference to the first compiled css theme file in the generated html (in the following example that would be main.light.mobile.min.css).

<br><a name="Usage"></a>

## Usage
In your js files import less like this:
```javascript
import './stylesForThisFile.less';
```

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  |  |
| [options.filename] | <code>string</code> | <code>&quot;[name].min.css&quot;</code> | The output file name. Replaces [name] with a generated name based on the themes option. In the following example you would get four .css files: <br>• main.light.mobile.min.css <br>• main.light.desktop.min.css <br>• main.dark.mobile.min.css <br>• main.dark.desktop.min.css |
| [options.themesPath] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The base path to the theme files in `options.themes`. |
| [options.sourceMap] | <code>boolean</code> | <code>false</code> | This is passed directly into MiniCssExtractPlugin. |
| options.themes | <code>object</code> |  | Defines which files to import for each different theme. Can handle any amount of nesting. The file extension is not necessary in the file name if the actual file has an extension of `.less`. File definitions can be a string or an array of strings. |
| [options.themes.path] | <code>string</code> |  | Appends a directory to the current path. Can be specified at any level. |
| [options.themes.include] | <code>string</code>, <code>array</code> |  | Appends another directory to the current path. Can be specified at any level. |

**Example**  
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
							'main/light.less'
						],
						desktop: [
							'main/light.less',
							'main/desktop.less'
						]
					},
					dark: {
						mobile: [
							'main/light.less',
							'main/dark.less'
						],
						desktop: [
							'main/light.less',
							'main/dark.less',
							'main/desktop.less'
						]
					}
				}
			}
		})
   ]
};

// The following will produce the same output:
module.exports = {
   // ...
   plugins: [
		new ThemesPlugin({
			filename: '[name].min.css',
			themesPath: './themes',
			sourceMap: true,
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
				}
			}
		})
   ]
};
```

[npm]: https://img.shields.io/npm/v/less-themes-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/less-themes-webpack-plugin
[deps]: https://david-dm.org/DarrenPaulWright/less-themes-webpack-plugin.svg
[deps-url]: https://david-dm.org/DarrenPaulWright/less-themes-webpack-plugin
[size]: https://packagephobia.now.sh/badge?p&#x3D;less-themes-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p&#x3D;less-themes-webpack-plugin
[vulnerabilities]: https://snyk.io/test/github/DarrenPaulWright/less-themes-webpack-plugin/badge.svg?targetFile&#x3D;package.json
[vulnerabilities-url]: https://snyk.io/test/github/DarrenPaulWright/less-themes-webpack-plugin?targetFile&#x3D;package.json
[license]: https://img.shields.io/github/license/DarrenPaulWright/less-themes-webpack-plugin.svg
[license-url]: https://npmjs.com/package/less-themes-webpack-plugin/LICENSE.md
