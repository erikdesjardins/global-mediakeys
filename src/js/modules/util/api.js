/**
 * @file Utility functions related to the Chrome extension API.
 * @module util/api
 */

import { once }	from './function';

export const isDevMode = once(() => !('update_url' in chrome.runtime.getManifest()));
