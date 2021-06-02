const { assert } = require('chai');
const processOptionsThemes = require('../src/processOptionsThemes');

const basePath = 'A:\\base\\';

const simpleStructure = {
	main: {
		light: {
			mobile: [
				'main/light.less'
			],
			desktop: [
				'main/light.less', 'main/desktop.less'
			]
		},
		dark: {
			mobile: [
				'main/light.less', 'main/dark.less'
			],
			desktop: [
				'main/light.less', 'main/dark.less', 'main/desktop.less'
			]
		}
	}
};

const structureWithPath = {
	main: {
		path: 'main',
		light: {
			mobile: [
				'light.less'
			],
			desktop: [
				'light.less', 'desktop.less'
			]
		},
		dark: {
			mobile: [
				'light.less', 'dark.less'
			],
			desktop: [
				'light.less', 'dark.less', 'desktop.less'
			]
		}
	}
};

const structureWithPathAndNestedArrays = {
	main: {
		path: 'main',
		include: ['light.less'],
		light: {
			mobile: [],
			desktop: [
				'desktop.less'
			]
		},
		dark: {
			include: 'dark.less',
			mobile: [],
			desktop: [
				'desktop.less'
			]
		}
	}
};

const simpleStructureOut = {
	'main.dark.desktop': {
		files: [
			basePath + 'main\\light.less',
			basePath + 'main\\dark.less',
			basePath + 'main\\desktop.less'
		]
	},
	'main.dark.mobile': {
		files: [
			basePath + 'main\\light.less', basePath + 'main\\dark.less'
		]
	},
	'main.light.desktop': {
		files: [
			basePath + 'main\\light.less', basePath + 'main\\desktop.less'
		]
	},
	'main.light.mobile': {
		files: [
			basePath + 'main\\light.less'
		]
	}
};

const simpleFilesOut = [
	'main.light.mobile',
	'main.light.desktop',
	'main.dark.mobile',
	'main.dark.desktop'
];

const multipleThemes = {
	shared: {
		path: 'shared',
		main: {
			path: 'main',
			include: 'light',
			light: {
				mobile: [],
				desktop: 'desktop'
			},
			dark: {
				include: 'dark',
				mobile: [],
				desktop: 'desktop'
			}
		},
		two: {
			path: 'differentPath',
			include: 'light',
			light: {
				mobile: [],
				desktop: 'desktop'
			},
			dark: {
				include: 'dark',
				mobile: [],
				desktop: 'desktop'
			}
		}
	}
};

const multipleThemesOut = {
	'shared.main.dark.desktop': {
		files: [
			basePath + 'shared\\main\\light.less',
			basePath + 'shared\\main\\dark.less',
			basePath + 'shared\\main\\desktop.less'
		]
	},
	'shared.main.dark.mobile': {
		files: [
			basePath + 'shared\\main\\light.less',
			basePath + 'shared\\main\\dark.less'
		]
	},
	'shared.main.light.desktop': {
		files: [
			basePath + 'shared\\main\\light.less',
			basePath + 'shared\\main\\desktop.less'
		]
	},
	'shared.main.light.mobile': {
		files: [
			basePath + 'shared\\main\\light.less'
		]
	},
	'shared.two.dark.desktop': {
		files: [
			basePath + 'shared\\differentPath\\light.less',
			basePath + 'shared\\differentPath\\dark.less',
			basePath + 'shared\\differentPath\\desktop.less'
		]
	},
	'shared.two.dark.mobile': {
		files: [
			basePath + 'shared\\differentPath\\light.less',
			basePath + 'shared\\differentPath\\dark.less'
		]
	},
	'shared.two.light.desktop': {
		files: [
			basePath + 'shared\\differentPath\\light.less',
			basePath + 'shared\\differentPath\\desktop.less'
		]
	},
	'shared.two.light.mobile': {
		files: [
			basePath + 'shared\\differentPath\\light.less'
		]
	}
};

const multipleThemesFilesOut = [
	'shared.main.light.mobile',
	'shared.main.light.desktop',
	'shared.main.dark.mobile',
	'shared.main.dark.desktop',
	'shared.two.light.mobile',
	'shared.two.light.desktop',
	'shared.two.dark.mobile',
	'shared.two.dark.desktop'
];

describe('processOptionsThemes', () => {
	it('should return an empty object if the same is provided', () => {
		assert.deepEqual(processOptionsThemes({}, '', true), [{}, []]);
	});

	it('should throw if a file is not found', () => {
		assert.throws(() => {
			processOptionsThemes({
				test: 'nonExistantFile'
			}, '');
		});
	});

	it('should return a processed object if a simple structure is provided', () => {
		assert.deepEqual(processOptionsThemes(simpleStructure, basePath, true), [simpleStructureOut,
			simpleFilesOut]);
	});

	it('should return a processed object if a structure with path is provided', () => {
		assert.deepEqual(processOptionsThemes(structureWithPath, basePath, true), [simpleStructureOut,
			simpleFilesOut]);
	});

	it('should return a processed object if a structure with path and nested arrays is provided', () => {
		assert.deepEqual(
			processOptionsThemes(structureWithPathAndNestedArrays, basePath, true),
			[simpleStructureOut, simpleFilesOut]
		);
	});

	it('should return a processed object for multiple themes', () => {
		assert.deepEqual(
			processOptionsThemes(multipleThemes, basePath, true),
			[multipleThemesOut, multipleThemesFilesOut]
		);
	});
});
