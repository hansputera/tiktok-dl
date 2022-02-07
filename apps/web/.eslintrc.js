const eslintConfigs = require('tiktok-dl-config/eslint');

module.exports = {
	...eslintConfigs,
	extends: eslintConfigs.extends.concat([
		'plugin:@next/next/recommended',
	])
};
