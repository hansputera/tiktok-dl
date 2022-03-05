const webpack = require('webpack');
const withTM = require('next-transpile-modules')(['tiktok-dl-core']);

const { parsed: cusEnv } = require('dotenv').config({
	path: require('path').resolve(__dirname, '..', '..', '.env'),
});

module.exports = withTM({
	reactStrictMode: true,
	webpack(config) {
		config.plugins.push(
			new webpack.EnvironmentPlugin(cusEnv)
		);
		return config;
	}
});
