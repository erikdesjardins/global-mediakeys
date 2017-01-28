import InertEntryPlugin from 'inert-entry-webpack-plugin';
import NyanProgressPlugin from 'nyan-progress-webpack-plugin';
import ZipPlugin from 'zip-webpack-plugin';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default {
	entry: 'extricate!interpolate!./src/manifest.json',
	bail: isProduction,
	output: {
		path: join(__dirname, 'dist'),
		filename: 'manifest.json',
	},
	module: {
		loaders: [
			{ test: /\.entry\.js$/, loaders: ['spawn?name=[name].js', 'babel'] },
			{ test: /\.js$/, loader: 'babel' },
			{ test: /\.scss$/, loaders: ['file?name=[name].css', 'extricate?resolve=\\.js$', 'css', 'postcss', 'sass'] },
			{ test: /\.woff2$/, loader: 'file?name=[name].[ext]' },
			{ test: /\.html$/, loaders: ['file?name=[name].[ext]', 'extricate', 'html?attrs=link:href script:src'] },
			{ test: /\.png$/, loader: 'file?name=[name].[ext]' },
		],
	},
	plugins: [
		new InertEntryPlugin(),
		(isProduction && new ZipPlugin({ filename: 'GMK.zip' })),
		new NyanProgressPlugin(),
	].filter(x => x),
};
