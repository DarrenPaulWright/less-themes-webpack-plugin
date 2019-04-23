const {assert} = require('chai');
const JsFile = require('../src/JsFile');

const context = 'A:\\base';
const testPath = 'A:\\base\\src\\Test.js';
const tempDir = 'A:\\temp';
const tempDirDiffDrive = 'D:\\temp';
const outputFileDir = 'A:\\temp\\src';
const outputFileDirDiffDrive = 'D:\\temp\\src';
const noLessFileContent = `
import something from 'somewhere';

export default class Test {
	tester() {
		return true;
	}
}
`;
const withLessFileContent = `
import something from 'somewhere';
import './Test.less';

export default class Test {
	tester() {
		return true;
	}
}
`;
const withThemesContent = `
import something from 'somewhere';
import "../../temp/src/Test.dark.less";
import "../../temp/src/Test.light.less";

export default class Test {
	tester() {
		return true;
	}
}
`;
const withThemesDiffDriveContent = `
import something from 'somewhere';
import "D:/temp/src/Test.dark.less";
import "D:/temp/src/Test.light.less";

export default class Test {
	tester() {
		return true;
	}
}
`;
const lightThemeContent = `@import (less) "../../base/src/Test.less";
@import (less, reference) "../../base/themes/main.less";
@import (less, reference) "../../base/themes/light.less";
`;
const darkThemeContent = `@import (less) "../../base/src/Test.less";
@import (less, reference) "../../base/themes/main.less";
@import (less, reference) "../../base/themes/dark.less";
`;
const lightThemeEntryPointContent = `@import (less) "../../base/src/Test.less";
@import (less) "../../base/themes/main.less";
@import (less) "../../base/themes/light.less";
`;
const darkThemeEntryPointContent = `@import (less) "../../base/src/Test.less";
@import (less) "../../base/themes/main.less";
@import (less) "../../base/themes/dark.less";
`;
const lightThemeDiffDriveContent = `@import (less) "A:/base/src/Test.less";
@import (less, reference) "A:/base/themes/main.less";
@import (less, reference) "A:/base/themes/light.less";
`;
const darkThemeDiffDriveContent = `@import (less) "A:/base/src/Test.less";
@import (less, reference) "A:/base/themes/main.less";
@import (less, reference) "A:/base/themes/dark.less";
`;

describe('JsFile', () => {
	describe('.hasLess', () => {
		it('should return false if no less file is included', () => {
			const jsFile = new JsFile(testPath, noLessFileContent);

			assert.deepEqual(jsFile.hasLess, false);
			assert.deepEqual(jsFile.content, noLessFileContent);
		});

		it('should return true if a less file is included', () => {
			const jsFile = new JsFile(testPath, withLessFileContent);

			assert.deepEqual(jsFile.hasLess, true);
			assert.deepEqual(jsFile.content, noLessFileContent);
		});
	});

	describe('.originalLessFilePath', () => {
		it('should return the path of the original less file', () => {
			const jsFile = new JsFile(testPath, withLessFileContent);

			assert.deepEqual(jsFile.originalLessFilePath, 'A:\\base\\src\\Test.less');
		});
	});

	describe('.addTheme', () => {
		it('should build theme files and modify the js content', () => {
			const jsFile = new JsFile(testPath, withLessFileContent);

			jsFile.context(tempDir, context, false);
			const firstFile = jsFile.addTheme('light', ['A:\\base\\themes\\main.less', 'A:\\base\\themes\\light.less']);
			const secondFile = jsFile.addTheme('dark', ['A:\\base\\themes\\main.less', 'A:\\base\\themes\\dark.less']);

			assert.deepEqual(firstFile.dir, outputFileDir);
			assert.deepEqual(firstFile.path, outputFileDir + '\\Test.light.less');
			assert.deepEqual(firstFile.content, lightThemeContent);

			assert.deepEqual(secondFile.dir, outputFileDir);
			assert.deepEqual(secondFile.path, outputFileDir + '\\Test.dark.less');
			assert.deepEqual(secondFile.content, darkThemeContent);

			assert.deepEqual(jsFile.content, withThemesContent);
		});

		it('should build theme files and modify the js content when isEntryPoint=true', () => {
			const jsFile = new JsFile(testPath, withLessFileContent);

			jsFile.context(tempDir, context, true);
			const firstFile = jsFile.addTheme('light', ['A:\\base\\themes\\main.less', 'A:\\base\\themes\\light.less']);
			const secondFile = jsFile.addTheme('dark', ['A:\\base\\themes\\main.less', 'A:\\base\\themes\\dark.less']);

			assert.deepEqual(firstFile.dir, outputFileDir);
			assert.deepEqual(firstFile.path, outputFileDir + '\\Test.light.less');
			assert.deepEqual(firstFile.content, lightThemeEntryPointContent);

			assert.deepEqual(secondFile.dir, outputFileDir);
			assert.deepEqual(secondFile.path, outputFileDir + '\\Test.dark.less');
			assert.deepEqual(secondFile.content, darkThemeEntryPointContent);

			assert.deepEqual(jsFile.content, withThemesContent);
		});

		it('should handle a temp dir on a different drive', () => {
			const jsFile = new JsFile(testPath, withLessFileContent);

			jsFile.context(tempDirDiffDrive, context, false);
			const firstFile = jsFile.addTheme('light', ['A:\\base\\themes\\main.less', 'A:\\base\\themes\\light.less']);
			const secondFile = jsFile.addTheme('dark', ['A:\\base\\themes\\main.less', 'A:\\base\\themes\\dark.less']);

			assert.deepEqual(firstFile.dir, outputFileDirDiffDrive);
			assert.deepEqual(firstFile.path, outputFileDirDiffDrive + '\\Test.light.less');
			assert.deepEqual(firstFile.content, lightThemeDiffDriveContent);

			assert.deepEqual(secondFile.dir, outputFileDirDiffDrive);
			assert.deepEqual(secondFile.path, outputFileDirDiffDrive + '\\Test.dark.less');
			assert.deepEqual(secondFile.content, darkThemeDiffDriveContent);

			assert.deepEqual(jsFile.content, withThemesDiffDriveContent);
		});
	});
});
