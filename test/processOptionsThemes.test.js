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

const simpleStructureWithReference = {
	main: {
		isReference: false,
		light: {
			isReference: true,
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
		files: [{
			path: basePath + 'main\\light.less',
			isReference: true
		}, {
			path: basePath + 'main\\dark.less',
			isReference: true
		}, {
			path: basePath + 'main\\desktop.less',
			isReference: true
		}]
	},
	'main.dark.mobile': {
		files: [{
			path: basePath + 'main\\light.less',
			isReference: true
		}, {
			path: basePath + 'main\\dark.less',
			isReference: true
		}]
	},
	'main.light.desktop': {
		files: [{
			path: basePath + 'main\\light.less',
			isReference: true
		}, {
			path: basePath + 'main\\desktop.less',
			isReference: true
		}]
	},
	'main.light.mobile': {
		files: [{
			path: basePath + 'main\\light.less',
			isReference: true
		}]
	}
};

const simpleStructureWithReferenceOut = {
	'main.dark.desktop': {
		files: [{
			path: basePath + 'main\\light.less',
			isReference: false
		}, {
			path: basePath + 'main\\dark.less',
			isReference: false
		}, {
			path: basePath + 'main\\desktop.less',
			isReference: false
		}]
	},
	'main.dark.mobile': {
		files: [{
			path: basePath + 'main\\light.less',
			isReference: false
		}, {
			path: basePath + 'main\\dark.less',
			isReference: false
		}]
	},
	'main.light.desktop': {
		files: [{
			path: basePath + 'main\\light.less',
			isReference: true
		}, {
			path: basePath + 'main\\desktop.less',
			isReference: true
		}]
	},
	'main.light.mobile': {
		files: [{
			path: basePath + 'main\\light.less',
			isReference: true
		}]
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
		files: [{
			path: basePath + 'shared\\main\\light.less',
			isReference: true
		}, {
			path: basePath + 'shared\\main\\dark.less',
			isReference: true
		}, {
			path: basePath + 'shared\\main\\desktop.less',
			isReference: true
		}]
	},
	'shared.main.dark.mobile': {
		files: [{
			path: basePath + 'shared\\main\\light.less',
			isReference: true
		}, {
			path: basePath + 'shared\\main\\dark.less',
			isReference: true
		}]
	},
	'shared.main.light.desktop': {
		files: [{
			path: basePath + 'shared\\main\\light.less',
			isReference: true
		}, {
			path: basePath + 'shared\\main\\desktop.less',
			isReference: true
		}]
	},
	'shared.main.light.mobile': {
		files: [{
			path: basePath + 'shared\\main\\light.less',
			isReference: true
		}]
	},
	'shared.two.dark.desktop': {
		files: [{
			path: basePath + 'shared\\differentPath\\light.less',
			isReference: true
		}, {
			path: basePath + 'shared\\differentPath\\dark.less',
			isReference: true
		}, {
			path: basePath + 'shared\\differentPath\\desktop.less',
			isReference: true
		}]
	},
	'shared.two.dark.mobile': {
		files: [{
			path: basePath + 'shared\\differentPath\\light.less',
			isReference: true
		}, {
			path: basePath + 'shared\\differentPath\\dark.less',
			isReference: true
		}]
	},
	'shared.two.light.desktop': {
		files: [{
			path: basePath + 'shared\\differentPath\\light.less',
			isReference: true
		}, {
			path: basePath + 'shared\\differentPath\\desktop.less',
			isReference: true
		}]
	},
	'shared.two.light.mobile': {
		files: [{
			path: basePath + 'shared\\differentPath\\light.less',
			isReference: true
		}]
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

	it('should return a processed object with appropriate references', () => {
		assert.deepEqual(
			processOptionsThemes(simpleStructureWithReference, basePath, true),
			[simpleStructureWithReferenceOut, simpleFilesOut]
		);
	});

	it('should return a processed object for multiple themes', () => {
		assert.deepEqual(
			processOptionsThemes(multipleThemes, basePath, true),
			[multipleThemesOut, multipleThemesFilesOut]
		);
	});
});
