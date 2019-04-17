# Less Themes Webpack Plugin

> A webpack plugin for generating multiple themed css files from less.
>
> [![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![size][size]][size-url]
[![vulnerabilities][vulnerabilities]][vulnerabilities-url]
[![license][license]][license-url]


<br><a name="Installation"></a>

### Installation
> With npm:> ```> npm install less-themes-webpack-plugin --save-dev> ```


<br><a name="Compatibility"></a>

### Compatibility
> Requires:> - webpack >=4> - node >= 8.5.0> > Since this library uses [postcss-loader](https://github.com/postcss/postcss-loader) you must have a postcss.config.js in the root of your project for this plugin to work.


<br><a name="Usage"></a>

### Usage
> This plugin automatically adds its own loader and [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin), [less-loader](https://github.com/webpack-contrib/less-loader), [css-loader](https://github.com/webpack-contrib/css-loader), and [postcss-loader](https://github.com/postcss/postcss-loader).> > In your js files import less like this:> ```javascript> import './stylesForThisFile.less';> ```


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  |  |
| [options.filename] | <code>string</code> | <code>&quot;&#x27;[name].min.css&#x27;&quot;</code> | The output file name. Replaces [name] with a generated name based on the themes option. In this example you would get four .css files: <br>&nbsp; • main.light.mobile.min.css <br>&nbsp;• main.light.desktop.min.css <br>&nbsp;• main.dark.mobile.min.css <br>&nbsp;• main.dark.desktop.min.css |
| [options.themesPath] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The path to the theme files in `options.themes`. |
| [options.sourceMap] | <code>boolean</code> | <code>false</code> | This is passed directly into MiniCssExtractPlugin. |
| options.themes | <code>object</code> |  | Defines which files to import for each different theme. Can handle any amount of nesting. The file extension is not necessary in the file name if the actual file has an extension of `.less`. |

**Example**  
```javascript// webpack.config.jsconst ThemesPlugin = require('less-themes-webpack-plugin');module.exports = {   // ...   plugins: [		new ThemesPlugin({			filename: '[name].min.css',			themesPath: './themes',			sourceMap: true,			themes: {				main: {					light: {						mobile: [							'light.less'						],						desktop: [							'light.less',							'desktop.less'						]					},					dark: {						mobile: [							'light.less',							'dark.less'						],						desktop: [							'light.less',							'dark.less',							'desktop.less'						]					}				}			}		})   ]};```

[npm]: https://img.shields.io/npm/v/less-themes-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/less-themes-webpack-plugin
[deps]: https://david-dm.org/darrenpaulwright/less-themes-webpack-plugin.svg
[deps-url]: https://david-dm.org/darrenpaulwright/less-themes-webpack-plugin
[size]: https://packagephobia.now.sh/badge?p&#x3D;less-themes-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p&#x3D;less-themes-webpack-plugin
[vulnerabilities]: https://snyk.io/test/github/DarrenPaulWright/less-themes-webpack-plugin/badge.svg?targetFile&#x3D;package.json
[vulnerabilities-url]: https://snyk.io/test/github/DarrenPaulWright/less-themes-webpack-plugin?targetFile&#x3D;package.json
[license]: https://img.shields.io/github/license/DarrenPaulWright/less-themes-webpack-plugin.svg
[license-url]: https://npmjs.com/package/less-themes-webpack-plugin/LICENSE.md
