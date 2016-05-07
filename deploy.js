/* eslint-disable */

'use strict';

const fs = require('fs');
const path = require('path');
const deploy = require('chrome-extension-deploy');

deploy({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	refreshToken: process.env.REFRESH_TOKEN,
	id: 'hhingnpbfhkjnmfkghlihmghgnddojeb',
	zip: fs.readFileSync(path.join(__dirname, 'dist/GMK.zip')),
	to: deploy.TRUSTED_TESTERS
}).then(function() {
	console.log('Deploy complete!');
}, function(err) {
	console.error(err);
	process.exit(1);
});
