/* eslint-disable import/no-commonjs */

const InertEntryPlugin = require('inert-entry-webpack-plugin');
const NyanProgressPlugin = require('nyan-progress-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const sass = require('sass');
const { join } = require('path');

module.exports = ({ zip } = {}, { mode } = {}) => ({
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
				{ loader: 'file-loader', options: { name: '[name].js' } },
				{ loader: 'webpack-rollup-loader' },
			],
		}, {
			test: /\.js$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						plugins: [
							['@babel/plugin-proposal-decorators', { legacy: true }],
							['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
							'babel-plugin-lodash',
						],
						comments: mode === 'development',
						babelrc: false,
					},
				},
			],
		}, {
			test: /\.scss$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].css' } },
				{ loader: 'extricate-loader', options: { resolve: '\\.js$' } },
				{ loader: 'css-loader' },
				{ loader: 'postcss-loader' },
				{ loader: 'sass-loader', options: { implementation: sass } },
			],
		}, {
			test: /\.html$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].[ext]' } },
				{ loader: 'extricate-loader' },
				{ loader: 'html-loader', options: { attrs: ['link:href', 'script:src'] } },
			],
		}, {
			test: /\.(png|woff2)$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].[ext]' } },
			],
		}],
	},
	plugins: [
		new NyanProgressPlugin(),
		new InertEntryPlugin(),
		new LodashModuleReplacementPlugin(),
		zip && new ZipPlugin({ filename: 'GMK.zip' }),
	].filter(x => x),
});
