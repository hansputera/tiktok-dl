module.exports = {
	extends: ['google', 'prettier'],
	settings: {
		next: {
			rootDir: [
				'apps/web/',
				'packages/core/',
				'packages/config/'
			]
		}
	}
}
