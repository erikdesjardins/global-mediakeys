import { join } from 'path';
import autoprefixer from 'autoprefixer';
import NyanProgressPlugin from 'nyan-progress-webpack-plugin';

module.exports = {
	entry: 'file?name=[name].[ext]!extract!interpolate!./src/manifest.json',
	output: {
		path: join(__dirname, 'dist'),
		filename: 'unused.js'
	},
	resolve: {
		extensions: ['', '.js']
	},
	module: {
		loaders: [
			{ test: /\.entry\.js$/, loaders: ['entry?name=[name].[hash:6].js', 'babel'] },
			{ test: /\.js$/, loader: 'babel' },
			{ test: /\.scss$/, loaders: ['file?name=[name].css', 'extract', 'css', 'postcss', 'sass'] },
			{ test: /\.woff2$/, loader: 'file?name=[name].[ext]' },
			{ test: /\.html$/, loaders: ['file?name=[name].[ext]', 'extract', 'html?attrs=link:href script:src'] },
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
