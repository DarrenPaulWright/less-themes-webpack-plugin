const { isAbsolute, relative, resolve, extname, dirname } = require('path');

const HAS_LESS_IMPORT_IN_JS = /import ['"][^'"]+.less['"];/g;
const IMPORT_FILE = /['"]([^'"]+.less)['"];/;

const utils = {
	normalize(dir, filePath) {
		let path = relative(dir, filePath)
			.replace(/\\/g, '/');

		if (path.charAt(0) !== '.' && !isAbsolute(path)) {
			path = './' + path;
		}

		return path;
	},

	addLessExtension(path) {
		const extension = extname(path);

		if (extension === '') {
			return path + '.less';
		}
		if (extension === '.') {
			return path + 'less';
		}

		return path;
	},

	buildLessImport(dir, path, isReference = false) {
		const reference = isReference ? ', reference' : '';

		return `@import (less${reference}) "${utils.normalize(dir, path)}";\n`;
	},

	stripLessImports(content) {
		let match;
		const paths = [];

		while ((match = HAS_LESS_IMPORT_IN_JS.exec(content)) !== null) {
			paths.push(utils.normalize('', match[0].match(IMPORT_FILE)[1]));
			content = utils.removeLine(content, match.index);
		}

		return [content, paths];
	},

	addLessImportsToTheme(content, dir, paths) {
		let add;

		paths.forEach((path) => {
			add = utils.buildLessImport(dir, path);

			if (!content.includes(add)) {
				content += add;
			}
		});

		return content;
	},

	removeLine(content, index) {
		return content.slice(0, index) +
			content.slice(content.indexOf('\n', index) + 1);
	},

	addLine(content, line, index) {
		return content.slice(0, index) + line + content.slice(index);
	},

	addJsImport(content, dir, path, index) {
		return utils.addLine(
			content,
			`import '${utils.normalize(dir, path)}';\n`,
			index
		);
	},

	buildTempFiles(dir, themes) {
		return Object.keys(themes)
			.map((themeName) => {
				const theme = themes[themeName];

				theme.location = resolve(dir, `${themeName}.less`);
				theme.dir = dirname(theme.location);

				return {
					...theme,
					content: theme.files
						.map((file) => utils.buildLessImport(dir, file.path, file.isReference))
						.join('')
				};
			});
	}
};

module.exports = utils;
