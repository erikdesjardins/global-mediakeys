/* eslint-disable */

'use strict';

const fs = require('fs');
const path = require('path');
const deploy = require('chrome-extension-deploy');

deploy({
	clientId: process.env.CHROME_CLIENT_ID,
	clientSecret: process.env.CHROME_CLIENT_SECRET,
	refreshToken: process.env.CHROME_REFRESH_TOKEN,
	id: 'hhingnpbfhkjnmfkghlihmghgnddojeb',
	zip: fs.readFileSync(path.join(__dirname, 'dist/GMK.zip'))
}).then(function() {
	console.log('Deploy complete!');
}, function(err) {
	console.error(err);
	process.exit(1);
});
