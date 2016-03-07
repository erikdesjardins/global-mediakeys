/* eslint-disable */

'use strict';

const request = require('superagent');
const fs = require('fs');
const path = require('path');

console.log('Starting deploy...');

let token;

Promise.resolve(request
	.post('https://accounts.google.com/o/oauth2/token')
	.field('client_id', process.env.CLIENT_ID)
	.field('client_secret', process.env.CLIENT_SECRET)
	.field('refresh_token', process.env.REFRESH_TOKEN)
	.field('grant_type', 'refresh_token')
	.field('redirect_uri', 'urn:ietf:wg:oauth:2.0:oob'))
	.catch(err => {
		console.error(err);
		process.exit(1);
	})
	.then(response => {
		console.log('Access token fetched.');
		token = response.body.access_token;
		const req = request
			.put('https://www.googleapis.com/upload/chromewebstore/v1.1/items/hhingnpbfhkjnmfkghlihmghgnddojeb')
			.set('Authorization', `Bearer ${token}`)
			.set('x-goog-api-version', 2)
			.type('application/zip')
			.send(fs.readFileSync(path.join(__dirname, 'dist/GMK.zip')));
		return Promise.resolve(req);
	})
	.catch(() => {
		console.error('Failed to upload package.');
		process.exit(1);
	})
	.then(response => {
		if (response.body.uploadState !== 'SUCCESS') {
			console.error(`Upload state "${response.body.uploadState}" !== "SUCCESS".`);
			process.exit(1);
		}
		console.log('Package uploaded.');
		const req = request
			.post('https://www.googleapis.com/chromewebstore/v1.1/items/hhingnpbfhkjnmfkghlihmghgnddojeb/publish')
			.set('Authorization', `Bearer ${token}`)
			.set('x-goog-api-version', 2)
			.set('Content-Length', 0);
		return Promise.resolve(req);
	})
	.then(response => {
		if (response.body.status[0] !== 'OK') {
			console.error(`Publish status "${response.body.status[0]}" !== "OK".`);
			process.exit(1);
		}
		console.log('Package published.');
	})
	.then(() => {
		console.log('Deploy complete.');
	});
