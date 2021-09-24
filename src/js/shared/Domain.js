/**
 * @file The base class for content scripts that handles setup and communication with the background page.
 */

/* eslint no-unused-vars: [2, { "args": "none" }] */

import Logger from '../util/Logger';
import _ from 'lodash-es';
import * as Messages from '../api/messages';
import { MSG } from './constants';

export default class Domain {
	constructor() {
		this._log = new Logger(this.constructor.name);
	}

	/**
	 * Buttons for controlling play/pause, next, and prev track.
	 * Dispatching a click event on these should result in the desired action.
	 * Getter properties may be used.
	 * @typedef {Object} ButtonDefinition
	 * @property {!Element} play
	 * @property {!Element} next
	 * @property {!Element} prev
	 */

	/**
	 * @abstract
	 * @returns {!ButtonDefinition|Promise<ButtonDefinition, *>} The three main buttons.
	 */
	getButtons() {
		throw new Error('getButtons() is not defined.');
	}

	/**
	 * @abstract
	 * @param {function(boolean): void} callback Should be invoked when the play state changes,
	 * and when the initial play state is known.
	 * @param {!Element} playButton The `play` property of the {@link ButtonDefinition} returned by {@link getButtons}.
	 * @returns {void}
	 */
	setupPlayState(callback, playButton) {
		throw new Error('setupPlayState(callback, playButton) is not defined.');
	}

	/**
	 * Information about the currently playing track.
	 * @typedef {Object} InfoDefinition
	 * @property {string} image A valid CSS &lt;image&gt;. Ideally 250px square. Usually the album art.
	 * @property {string} title Usually the track name.
	 * @property {string} subtitle Usually the artist or playlist info.
	 */

	/**
	 * @abstract
	 * @param {function(InfoDefinition): void} callback Should be invoked whenever info changes,
	 * and when initial info is known.
	 * @returns {void}
	 */
	setupInfo(callback) {
		throw new Error('setupInfo(callback) is not defined.');
	}

	/**
	 * A custom action supported by the `Domain`.
	 * @typedef {Object} ActionDefinition
	 * @property {string} icon A CSS-encoded character from Font Awesome.
	 * @property {boolean} state Whether the action icon should appear selected.
	 */

	/**
	 * @callback ActionInit
	 * @param {function(ActionDefinition): void} callback Should be invoked whenever state of the action changes,
	 * and when initial state is known.
	 * @returns {function|Promise<function>} Will be called when the action is invoked.
	 * If a promise is returned, no action invocations will be accepted until the promise is resolved.
	 */

	/**
	 * @returns {ActionInit[]} Functions to set up custom actions.
	 */
	getActions() {
		return [];
	}

	/**
	 * @returns {Promise<void, Error>} Rejects if {@link getButtons} rejects,
	 * rejects if {@link getButtons} does not return a valid play button,
	 * resolves when initialization is complete otherwise.
	 */
	async go() {
		this._log.d('Waiting for buttons...');

		const buttons = await this.getButtons();

		if (!buttons.play) {
			throw new Error('No play button found.');
		}

		Messages.addListener(MSG.ECHO, data => data);

		Messages.addListener(MSG.PLAY_PAUSE, () => buttons.play.click());
		Messages.addListener(MSG.NEXT, () => buttons.next.click());
		Messages.addListener(MSG.PREV, () => buttons.prev.click());

		this._log.d('Waiting for registration...');

		await Messages.send(MSG.REGISTER);

		window.addEventListener('unload', () => Messages.send(MSG.UNREGISTER));

		this.setupPlayState(_.debounce(state => Messages.send(MSG.PLAY_STATE, { data: state }), 50), buttons.play);
		this.setupInfo(_.debounce(info => Messages.send(MSG.INFO, { data: info }), 50));

		const actionData = [];
		const sendActionUpdate = _.debounce(() => Messages.send(MSG.ACTIONS, { data: actionData }), 50);

		this._log.d('Setting up actions...');

		const actions = await Promise.all(this.getActions().map((setup, i) =>
			setup(data => {
				actionData[i] = data;
				sendActionUpdate();
			}),
		));

		Messages.addListener(MSG.DO_ACTION, i => actions[i]());

		this._log.d('Init complete.');
	}
}
