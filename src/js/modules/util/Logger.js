/**
 * @file A basic logging class, similar to Android's `Log`.
 * @module util/Logger
 */

/* eslint-disable no-console */

import { isDevMode } from './api';

const ERROR = 1;
const WARN = 2;
const INFO = 4;
const DEBUG = 8;
const VERBOSE = 16;

export const level = {
	NONE: 0,
	ERROR: ERROR, // eslint-disable-line
	WARN: ERROR | WARN,
	INFO: ERROR | WARN | INFO,
	DEBUG: ERROR | WARN | INFO | DEBUG,
	VERBOSE: ERROR | WARN | INFO | DEBUG | VERBOSE
};

let logLevel = isDevMode() ? level.VERBOSE : level.INFO;

export function setLogLevel(level) {
	logLevel = level;
}

export default class Logger {
	constructor(tag) {
		this._tag = `[${tag}]`;
	}

	e(...info) {
		if (ERROR & logLevel) {
			console.error(this._tag, ...info);
		}
	}

	w(...info) {
		if (WARN & logLevel) {
			console.warn(this._tag, ...info);
		}
	}

	i(...info) {
		if (INFO & logLevel) {
			console.info(this._tag, ...info);
		}
	}

	d(...info) {
		if (DEBUG & logLevel) {
			console.log(this._tag, ...info);
		}
	}

	v(...info) {
		if (VERBOSE & logLevel) {
			console.debug(this._tag, ...info);
		}
	}

	wtf(...info) {
		console.error('[ERROR]', this._tag, ...info);
	}
}
