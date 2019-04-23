const {basename, dirname, isAbsolute, relative, resolve} = require('path');

const NEW_LINE = '\n';
const LESS_EXT = '.less';
const DOT = '.';
const JS_EXT = '.js';
const HAS_IMPORT = /import '.\/[^.]+.less';/;
const IMPORT_FILE = /'.\/([^']+)';/;

const normalize = (string) => {
	string = string.replace(/\\/g, '\/');
	if (string.charAt(0) !== '.' && !isAbsolute(string)) {
		string = './' + string;
	}
	return string;
};

const nextNewline = (content, index) => content.indexOf(NEW_LINE, index) + 1;

const buildLessImport = (path, notReference = false) => {
	const reference = notReference ? '' : ', reference';
	return '@import (less' + reference + ') "' + normalize(path) + '";' + NEW_LINE;
};

const removeLine = Symbol();
const addLine = Symbol();
const addJsImport = Symbol();
const buildTempFileContent = Symbol();

module.exports = class JsFile {
	constructor(path, content) {
		this.baseFileName = basename(path, JS_EXT);
		this.dirPath = dirname(path);
		this.content = content;

		const lessImport = content.match(HAS_IMPORT);

		if (lessImport) {
			this.importFilePath = resolve(this.dirPath, lessImport[0].match(IMPORT_FILE)[1]);
			this.importFileIndex = lessImport.index;

			this.content = this[removeLine](this.content);
		}
	}

	[removeLine](content) {
		return content.substring(0, this.importFileIndex) + content.substring(nextNewline(content,
			this.importFileIndex
		), content.length);
	}

	[addLine](line) {
		this.content = this.content.substring(0,
			this.importFileIndex
		) + line + this.content.substring(this.importFileIndex, this.content.length);
	}

	[addJsImport](path) {
		this[addLine]('import "' + normalize(relative(this.dirPath, path)) + '";' + NEW_LINE);
	}

	[buildTempFileContent](files) {
		let fileContent = buildLessImport(relative(this.tempFileDir, this.importFilePath), true);

		fileContent += files.map((filePath) => {
			return buildLessImport(relative(this.tempFileDir, filePath), this.isEntryPoint);
		}).join('');

		return fileContent;
	}

	get hasLess() {
		return this.importFileIndex !== undefined;
	}

	get originalLessFilePath() {
		return this.importFilePath;
	}

	context(tempDir, context, isEntryPoint) {
		this.tempFileDir = resolve(tempDir, relative(context, this.dirPath));
		this.isEntryPoint = isEntryPoint;
	}

	addTheme(name, files) {
		const filePath = resolve(this.tempFileDir, this.baseFileName + DOT + name + LESS_EXT);

		this[addJsImport](filePath);

		return {
			dir: this.tempFileDir,
			path: filePath,
			content: this[buildTempFileContent](files)
		};
	}
};
