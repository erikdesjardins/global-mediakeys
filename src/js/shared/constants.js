/**
 * @file Constants used for message types, command types, and storage keys.
 */

export const MSG = {
	REGISTER: 'tab-register',
	UNREGISTER: 'tab-unregister',
	PLAY_STATE: 'tab-playstate',

	INFO: 'tab-info',
	ACTIONS: 'tab-actions',
	DO_ACTION: 'tab-do-action',
	FOCUS_TAB: 'tab-focus',

	PLAY_PAUSE: 'tab-play-pause',
	NEXT: 'tab-next',
	PREV: 'tab-prev',

	ECHO: 'echo'
};

export const CMD = {
	PLAY_PAUSE: 'media-play-pause',
	NEXT: 'media-next',
	PREV: 'media-prev',
	STOP: 'media-stop'
};

export const STORAGE = {
	TABS: 'registered-tabs'
};
