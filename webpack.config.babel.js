/* eslint-disable import/no-commonjs */

const InertEntryPlugin = require('inert-entry-webpack-plugin');
const NyanProgressPlugin = require('nyan-progress-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const rollupCommonjsPlugin = require('rollup-plugin-commonjs');
const { join } = require('path');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	entry: 'extricate-loader!interpolate-loader!./src/manifest.json',
	bail: isProduction,
	output: {
		path: join(__dirname, 'dist'),
		filename: 'manifest.json',
	},
	module: {
		rules: [{
			test: /\.entry\.js$/,
			use: [{
				loader: 'file-loader',
				options: { name: '[name].js' },
			}, {
				loader: 'webpack-rollup-loader',
				options: { plugins: [rollupCommonjsPlugin()] },
			}, {
				loader: 'babel-loader',
			}],
		}, {
			test: /\.js$/,
			use: [{
				loader: 'babel-loader',
			}],
		}, {
			test: /\.scss$/,
			use: [{
				loader: 'file-loader',
				options: { name: '[name].css' },
			}, {
				loader: 'extricate-loader',
				options: { resolve: '\\.js$' },
			}, {
				loader: 'css-loader',
			}, {
				loader: 'postcss-loader',
			}, {
				loader: 'sass-loader',
			}],
		}, {
			test: /\.html$/,
			use: [{
				loader: 'file-loader',
				options: { name: '[name].[ext]' },
			}, {
				loader: 'extricate-loader',
			}, {
				loader: 'html-loader',
				options: { attrs: ['link:href', 'script:src'] },
			}],
		}, {
			test: /\.(png|woff2)$/,
			use: [{
				loader: 'file-loader',
				options: { name: '[name].[ext]' },
			}],
		}],
	},
	plugins: [
		new InertEntryPlugin(),
		new LodashModuleReplacementPlugin(),
		(isProduction && new ZipPlugin({ filename: 'GMK.zip' })),
		new NyanProgressPlugin(),
	].filter(x => x),
};
