import NyanProgressPlugin from 'nyan-progress-webpack-plugin';
import autoprefixer from 'autoprefixer';
import { join } from 'path';

export default {
	entry: 'file?name=[name].[ext]!extricate!interpolate!./src/manifest.json',
	output: {
		path: join(__dirname, 'dist'),
		filename: 'unused.js'
	},
	resolve: {
		extensions: ['', '.js']
	},
	module: {
		loaders: [
			{ test: /\.entry\.js$/, loaders: ['spawn?name=[name].js', 'babel'] },
			{ test: /\.js$/, loader: 'babel' },
			{ test: /\.scss$/, loaders: ['file?name=[name].css', 'extricate?resolve=\\.js$', 'css', 'postcss', 'sass'] },
			{ test: /\.woff2$/, loader: 'file?name=[name].[ext]' },
			{ test: /\.html$/, loaders: ['file?name=[name].[ext]', 'extricate', 'html?attrs=link:href script:src'] },
			{ test: /\.png$/, loader: 'file?name=[name].[ext]' }
		]
	},
	plugins: [
		new NyanProgressPlugin()
	],
	postcss() {
		return [autoprefixer];
	}
};
