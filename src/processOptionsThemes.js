const fs = require('fs');
const { resolve, extname } = require('path');
const { addLessExtension, normalize } = require('./utils.js');

const isArray = Array.isArray;
const isString = (value) => typeof value === 'string';
const isObject = (value) => value && value.constructor === Object;
const isFile = (value) => isString(value) || isArray(value);

module.exports = function(optionsThemes, themesPath, skipFileCheck) {
	const themes = {};

	const saveFile = (filename, currentPath, themeName) => {
		if (!themes[themeName]) {
			themes[themeName] = { files: [] };
		}

		if (filename) {
			const filePath = resolve(
				currentPath,
				addLessExtension(filename)
			);

			if (!skipFileCheck && !fs.existsSync(filePath)) {
				throw new Error('Theme file not found: ' + filePath);
			}

			themes[themeName].files.push(filePath);
		}
	};

	const processBranch = (data, currentPath, themeName, files) => {
		if (isFile(data)) {
			files.concat(data)
				.forEach((filename) => {
					saveFile(filename, currentPath, themeName);
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

			Object.keys(data)
				.forEach((key) => {
					processBranch(
						data[key],
						currentPath,
						themeName + (themeName ? '.' : '') + key,
						files
					);
				});
		}
	};

	processBranch(optionsThemes, normalize(process.cwd(), themesPath), '', []);

	return [themes, Object.keys(themes)];
};
