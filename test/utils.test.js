const { assert } = require('chai');
const utils = require('../src/utils.js');
const { resolve } = require('path');

describe('utils', () => {
	describe('normalize', () => {
		it('should replace back slashes with forward slashes', () => {
			assert.strictEqual(utils.normalize('web', 'web/src/file.js'), './src/file.js');
		});

		it('should work with less files', () => {
			assert.strictEqual(utils.normalize('web', 'web/src/style.less'), './src/style.less');
		});
	});

	describe('addLessExtension', () => {
		it('should not replace other extensions', () => {
			assert.strictEqual(utils.addLessExtension('web/src/file.css'), 'web/src/file.css');
		});

		it('should add less', () => {
			assert.strictEqual(utils.addLessExtension('web/src/file.'), 'web/src/file.less');
		});

		it('should add .less', () => {
			assert.strictEqual(utils.addLessExtension('web/src/file'), 'web/src/file.less');
		});
	});

	describe('buildLessImport', () => {
		it('should not add reference', () => {
			const result = utils.buildLessImport('web', 'web/asdf.less');

			assert.strictEqual(result, '@import (less) "./asdf.less";\n');
		});

		it('should add reference', () => {
			const result = utils.buildLessImport('web', 'web/asdf.less', true);

			assert.strictEqual(result, '@import (less, reference) "./asdf.less";\n');
		});
	});

	describe('stripLessImports', () => {
		it('should remove less imports with single quotes', () => {
			const result = utils.stripLessImports(`import asdf from './asdf.js';
import './asdf.less';
import qwerty from '../qwerty.js';
import '../qwerty.less';

const something = "";
`);

			assert.strictEqual(result[0], `import asdf from './asdf.js';
import qwerty from '../qwerty.js';

const something = "";
`);
			assert.deepEqual(result[1], [
				'./asdf.less',
				'../qwerty.less'
			]);
		});

		it('should remove less imports with double quotes', () => {
			const result = utils.stripLessImports(`import asdf from "./asdf.js";
import "./asdf.less";
import qwerty from "../qwerty.js";
import "../../qwerty.less";

const something = "";
`);

			assert.strictEqual(result[0], `import asdf from "./asdf.js";
import qwerty from "../qwerty.js";

const something = "";
`);
			assert.deepEqual(result[1], [
				'./asdf.less',
				'../../qwerty.less'
			]);
		});
	});

	describe('addLessImportsToTheme', () => {
		it('should nothing if no files are provided', () => {
			const result = utils.addLessImportsToTheme('', '', []);

			assert.strictEqual(result, '');
		});

		it('should add files', () => {
			const result = utils.addLessImportsToTheme(
				'@import "theme.less";\n', '',
				['asdf', 'qwerty']
			);

			assert.strictEqual(result, '@import "theme.less";\n@import (less) "./asdf";\n@import (less) "./qwerty";\n');
		});

		it('should not add files that already exist', () => {
			const result = utils.addLessImportsToTheme(
				'@import "theme.less";\n@import (less) "./qwerty";\n', '',
				['asdf', 'qwerty']
			);

			assert.strictEqual(result, '@import "theme.less";\n@import (less) "./qwerty";\n@import (less) "./asdf";\n');
		});
	});

	describe('addJsImport', () => {
		it('should add an import', () => {
			const result = utils.addJsImport(`import asdf from './asdf.js';
import qwerty from '../qwerty.js';

const something = "";
`, 'web', 'web/asdf.less', 30);

			assert.strictEqual(result, `import asdf from './asdf.js';
import './asdf.less';
import qwerty from '../qwerty.js';

const something = "";
`);
		});
	});

	describe('buildTempFiles', () => {
		it('should not add reference', () => {
			const result = utils.buildTempFiles('../dist', {
				'light': {
					files: ['./styles/variables.less', './styles/light.less']
				},
				'dark': {
					files: ['./styles/variables.less', './styles/dark.less']
				}
			});

			assert.deepEqual(result, [{
				location: resolve(process.cwd(), '../dist/light.less'),
				dir: resolve(process.cwd(), '../dist'),
				files: ['./styles/variables.less', './styles/light.less'],
				content: `@import (less, reference) "../less-themes-webpack-plugin/styles/variables.less";
@import (less, reference) "../less-themes-webpack-plugin/styles/light.less";
`
			}, {
				location: resolve(process.cwd(), '../dist/dark.less'),
				dir: resolve(process.cwd(), '../dist'),
				files: ['./styles/variables.less', './styles/dark.less'],
				content: `@import (less, reference) "../less-themes-webpack-plugin/styles/variables.less";
@import (less, reference) "../less-themes-webpack-plugin/styles/dark.less";
`
			}]);
		});
	});
});
