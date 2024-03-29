/* eslint-disable import/no-commonjs */

const BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
const InertEntryPlugin = require('inert-entry-webpack-plugin');
const NyanProgressPlugin = require('nyan-progress-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const sass = require('sass');
const { join } = require('path');

module.exports = (env, { mode }) => ({
	entry: 'extricate-loader!interpolate-loader!./src/manifest.json',
	output: {
		path: join(__dirname, 'dist'),
		filename: 'manifest.json',
	},
	devtool: false,
	module: {
		rules: [{
			test: /\.entry\.js$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].js', esModule: false } },
				{ loader: 'webpack-rollup-loader' },
			],
		}, {
			test: /\.js$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						comments: mode === 'development',
						babelrc: false,
					},
				},
			],
		}, {
			test: /\.scss$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].css', esModule: false } },
				{ loader: 'extricate-loader', options: { resolve: '\\.js$' } },
				{ loader: 'css-loader', options: { esModule: false } },
				{ loader: 'sass-loader', options: { implementation: sass } },
			],
		}, {
			test: /\.html$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].[ext]', esModule: false } },
				{ loader: 'extricate-loader', options: { resolve: '/html-loader/.+\\.js$' } },
				{ loader: 'html-loader' },
			],
		}, {
			test: /\.(png|woff2)$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].[ext]', esModule: false } },
			],
		}],
	},
	plugins: [
		new InertEntryPlugin(),
		new BellOnBundlerErrorPlugin(),
		new NyanProgressPlugin(),
		new ZipPlugin({ filename: 'GMK.zip' }),
	].filter(x => x),
});
