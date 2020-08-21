const fs = require('fs');
const temp = require('temp');
const JsFile = require('./JsFile');
const mkdirp = require('mkdirp');

temp.track();

const files = {};
const tempDir = temp.mkdirSync();

const findEntryPoint = (module) => {
	const reason = module.reasons[0];
	if (reason && reason.module && reason.module.resource) {
		return findEntryPoint(reason.module);
	}
	return module.resource;
};

const isEntryPoint = (path, module) => {
	if (!(path in files)) {
		files[path] = path === findEntryPoint(module);
	}

	return files[path];
};

module.exports = function(content) {
	const jsFile = new JsFile(this.resourcePath, content);

	if (jsFile.hasLess) {
		const options = this.query;

		this.addDependency(jsFile.originalLessFilePath);

		jsFile.context(tempDir, this.rootContext, isEntryPoint(this.resourcePath, this._module));

		for (let themeName in options.themes) {
			const file = jsFile.addTheme(themeName, options.themes[themeName]);

			mkdirp.sync(file.dir);
			fs.writeFileSync(file.path, file.content);
		}
	}

	return jsFile.content;
};
