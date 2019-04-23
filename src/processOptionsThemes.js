const fs = require('fs');
const {resolve} = require('path');

const LESS_EXT = '.less';

const isArray = Array.isArray;
const isString = (value) => typeof value === 'string';
const isObject = (value) => value && value.constructor === Object;
const isFile = (value) => isString(value) || isArray(value);

module.exports = function(optionsThemes, themesPath, skipFileCheck) {
	const themes = {};
	const themeNames = [];

	const saveFile = (filename, currentPath, themeName) => {
		if (!themes[themeName]) {
			themes[themeName] = [];
			themeNames.push(themeName);
		}

		if (filename.indexOf('.') === -1) {
			filename += LESS_EXT;
		}

		const filePath = resolve(currentPath, filename);

		if (!skipFileCheck && !fs.existsSync(filePath)) {
			throw new Error('Theme file not found: ' + filePath);
		}

		themes[themeName].push(filePath);
	};

	const processBranch = (data, currentPath, themeName, files) => {
		if (isFile(data)) {
			files.concat(data).forEach((item) => {
				saveFile(item, currentPath, themeName);
			});
		}
		else if (isObject(data)) {
			if (isString(data.path)) {
				currentPath = resolve(currentPath, data.path);
				delete data.path;
			}

			if (isFile(data.include)) {
				files = files.concat(data.include);
				delete data.include;
			}

			for (let key in data) {
				processBranch(data[key], currentPath, themeName + (themeName ? '.' : '') + key, files);
			}
		}
	};

	processBranch(optionsThemes, themesPath, '', []);

	return [themes, themeNames];
};
