const {basename, dirname, relative, resolve} = require('path');
const fs = require('fs');
const temp = require('temp');

temp.track();

const JS_EXT = '.js';
const LESS_EXT = '.less';
const DOT = '.';
const NEW_LINE = '\n';
const HAS_IMPORT = /import '.\/[^.]+.less';/;
const IMPORT_FILE = /'.\/([^']+)';/;

const firstFiles = {};
const TMP_PATH = temp.mkdirSync();

function findEntry(mod) {
	if (mod.reasons.length > 0 && mod.reasons[0].module && mod.reasons[0].module.resource) {
		return findEntry(mod.reasons[0].module);
	}
	return mod.resource;
}

module.exports = function(content) {
	const options = this.query;
	const baseFileName = basename(this.resourcePath, JS_EXT);
	const dirPath = dirname(this.resourcePath);
	const entry = findEntry(this._module);
	const contextPath = resolve(TMP_PATH, relative(this.rootContext, dirPath));

	const normalize = (string) => {
		string = string.replace(/\\/g, '\/');
		if (string.charAt(0) !== '.') {
			string = './' + string;
		}
		return string;
	};

	const buildLessImport = (path, notReference = false) => {
		const reference = notReference ? '' : ', reference';
		return '@import (less' + reference + ') "' + normalize(path) + '";' + NEW_LINE;
	};

	const buildJsImport = (path) => {
		return 'import "' + normalize(path) + '";' + NEW_LINE;
	};

	const buildLessImports = (themeFiles, tmpFilePath, importFilePath) => {
		const tmpFileDir = dirname(tmpFilePath);
		let fileContent = buildLessImport(relative(tmpFileDir, importFilePath), true);

		fileContent += themeFiles.map((filePath) => {
			return buildLessImport(relative(tmpFileDir, filePath), firstFiles[entry] === this.resourcePath);
		}).join('');

		return fileContent;
	};

	const removeLineAt = (content, index) => {
		return content.substring(0, index) + content.substring(content.indexOf('\n', index) + 1, content.length);
	};

	const addLineAt = (content, index, add) => {
		return content.substring(0, index) + add + content.substring(index, content.length);
	};

	const ensureDirectoryExists = (filePath) => {
		const dir = dirname(filePath);

		if (!fs.existsSync(dir)) {
			ensureDirectoryExists(dir);
			fs.mkdirSync(dir);
		}
	};

	const addAsset = (themeFiles, themeName, importFilePath) => {
		const themeFileName = baseFileName + DOT + themeName + LESS_EXT;
		const filePath = resolve(contextPath, themeFileName);

		ensureDirectoryExists(filePath);
		fs.writeFileSync(filePath, buildLessImports(themeFiles, filePath, importFilePath));

		content = addLineAt(content, lessImport.index, buildJsImport(relative(dirPath, filePath)));
	};

	const lessImport = content.match(HAS_IMPORT);
	if (lessImport) {
		const importFileName = lessImport[0].match(IMPORT_FILE)[1];
		const importFilePath = resolve(dirPath, importFileName);

		content = removeLineAt(content, lessImport.index);

		this.addDependency(importFilePath);

		if (!firstFiles[entry]) {
			firstFiles[entry] = this.resourcePath;
		}

		for (let themeName in options.themes) {
			addAsset(options.themes[themeName], themeName, importFilePath);
		}
	}

	return content;
};
