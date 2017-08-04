/**
 * @file A basic logging class, similar to Android's `Log`.
 * @module util/Logger
 */

/* eslint-disable no-console */

export default class Logger {
	constructor(tag) {
		this._tag = `[${tag}]`;
	}

	e(...info) {
		console.error(this._tag, ...info);
	}

	w(...info) {
		console.warn(this._tag, ...info);
	}

	i(...info) {
		console.info(this._tag, ...info);
	}

	d(...info) {
		console.log(this._tag, ...info);
	}

	v(...info) {
		console.debug(this._tag, ...info);
	}
}
