const {
	readFileSync,
	writeFileSync
} = require('fs');
const { resolve } = require('path');
const {
	stripLessImports,
	addLessImportsToTheme,
	addJsImport
} = require('./utils.js');

module.exports = function(content) {
	let [modifiedContent, importFilePaths] = stripLessImports(content);

	if (importFilePaths.length !== 0) {
		const { themes, themeNames } = this.query;
		const context = this.context;

		importFilePaths = importFilePaths
			.map((path) => resolve(context, path));

		importFilePaths.forEach((filePath) => {
			this.addDependency(filePath);
		});

		themeNames
			.forEach((themeName) => {
				const theme = themes[themeName];

				writeFileSync(theme.location, addLessImportsToTheme(
					readFileSync(theme.location),
					theme.dir,
					importFilePaths
				));

				if (theme.isImported !== true) {
					theme.isImported = true;
					modifiedContent = addJsImport(modifiedContent, this.context, theme.location, 0);
				}
			});

		return modifiedContent;
	}

	return content;
};
