const { basename, dirname, isAbsolute, relative, resolve } = require('path');

const NEW_LINE = '\n';
const LESS_EXT = '.less';
const DOT = '.';
const JS_EXT = '.js';
const HAS_IMPORT = /import '.\/[^.]+.less';/g;
const IMPORT_FILE = /'.\/([^']+)';/;

const normalize = (string) => {
	string = string.replace(/\\/g, '\/');

	if (string.charAt(0) !== '.' && !isAbsolute(string)) {
		string = './' + string;
	}

	return string;
};

const buildLessImport = (path, notReference) => {
	const reference = notReference ? '' : ', reference';
	return '@import (less' + reference + ') "' + normalize(path) + '";' + NEW_LINE;
};

const buildLessImports = (directory, filePaths, notReference = false) => {
	return filePaths
		.map((filePath) => {
			return buildLessImport(relative(directory, filePath), notReference);
		})
		.join('');
};

module.exports = class JsFile {
	constructor(path, content) {
		this._baseFileName = basename(path, JS_EXT);
		this._dirPath = dirname(path);
		this._importFilePaths = [];
		this.content = content;

		let match;

		while ((match = HAS_IMPORT.exec(content)) !== null) {
			this._importFilePaths.push(resolve(this._dirPath, match[0].match(IMPORT_FILE)[1]));
			this._importFileIndex = match.index;

			this.content = this._removeLine(this.content, match.index);
		}
	}

	_removeLine(content) {
		const nextNewline = content.indexOf(NEW_LINE, this._importFileIndex) + 1;

		return content.slice(0, this._importFileIndex) +
			content.slice(nextNewline);
	}

	_addLine(line) {
		this.content = this.content.slice(0, this._importFileIndex) +
			line +
			this.content.slice(this._importFileIndex);
	}

	_addJsImport(path) {
		this._addLine('import "' + normalize(relative(this._dirPath, path)) + '";' + NEW_LINE);
	}

	_buildTempFileContent(files) {
		return buildLessImports(this.tempFileDir, this._importFilePaths, true) +
			buildLessImports(this.tempFileDir, files, this._isEntryPoint);
	}

	get hasLess() {
		return this._importFileIndex !== undefined;
	}

	get originalLessFilePaths() {
		return this._importFilePaths;
	}

	context(tempDir, context, isEntryPoint) {
		this.tempFileDir = resolve(tempDir, relative(context, this._dirPath));
		this._isEntryPoint = isEntryPoint;
	}

	addTheme(name, files) {
		const filePath = resolve(this.tempFileDir, this._baseFileName + DOT + name + LESS_EXT);

		this._addJsImport(filePath);

		return {
			dir: this.tempFileDir,
			path: filePath,
			content: this._buildTempFileContent(files)
		};
	}
};
