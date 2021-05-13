const { writeFileSync } = require('fs');
const temp = require('temp');
const JsFile = require('./JsFile');
const mkdirp = require('mkdirp');

temp.track();

const files = {};
const tempDir = temp.mkdirSync();

const findEntryPoint = (module) => {
	const reason = module && module.reasons && module.reasons[0];

	return (reason && reason.module && reason.module.resource) ?
		findEntryPoint(reason.module) :
		module.resource;
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

		jsFile.context(
			tempDir,
			this.rootContext,
			isEntryPoint(this.resourcePath, this._module)
		);

		for (let themeName in options.themes) {
			const file = jsFile.addTheme(themeName, options.themes[themeName]);

			mkdirp.sync(file.dir);
			writeFileSync(file.path, file.content);
		}
	}

	return jsFile.content;
};
