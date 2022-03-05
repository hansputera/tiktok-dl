const eslintConfigs = require('tiktok-dl-config/eslint.typescript');

module.exports = {
	...eslintConfigs,
	extends: eslintConfigs.extends.concat([
		'plugin:@next/next/recommended',
	])
};
