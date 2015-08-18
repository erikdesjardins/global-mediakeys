/**
 * @file The base class which coordinates setting up communication with the background page and popup.
 * Not an ideal use case for classes, but sufficient.
 * @module content/Domain
 */

import * as Const from '../constants';
import * as Util from '../util';
import * as Messages from './messages';

export default class Domain {
	constructor() {}

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
	 * @returns {!ButtonDefinition} The three main buttons.
	 */
	getButtons() {
		throw new Error('getButtons() is not defined.');
	}

	/**
	 * @abstract
	 * @param {function(boolean): void} callback Should be invoked when the play state changes,
	 * and when the initial play state is known.
	 * @param {!Element} playButton The <tt>play</tt> property of the {@link ButtonDefinition} returned by {@link getButtons}.
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
	 * A custom action supported by the <tt>Domain</tt>.
	 * @typedef {Object} ActionDefinition
	 * @property {string} icon A CSS-encoded character from Font Awesome.
	 * @property {boolean} state Whether the action icon should appear selected.
	 */

	/**
	 * @callback ActionInit
	 * @param {function(ActionDefinition): void} callback Should be invoked whenever state of the action changes,
	 * and when initial state is known.
	 * @returns {function|Promise<function>} Will be called when the action is invoked.
	 * If a <tt>Promise</tt> is returned, no action invocations will be accepted until the <tt>Promise</tt> is resolved.
	 */

	/**
	 * @returns {ActionInit[]} Functions to set up custom actions.
	 */
	getActions() {
		return [];
	}

	/**
	 * @param {Promise<void, Error>} [waitFor] Initialization will be delayed until this <tt>Promise</tt> resolves.
	 * @returns {Promise<void, Error>} Rejects if <tt>waitFor</tt> rejects,
	 * rejects if {@link getButtons} does not return a valid play button,
	 * resolves when initialization is complete otherwise.
	 */
	async go(waitFor) {
		await waitFor;

		const buttons = this.getButtons();

		if (!buttons.play) {
			throw new Error('No play button found.');
		}

		Messages.addListener(Const.msg.ECHO, data => data);

		Messages.addListener(Const.msg.PLAY_PAUSE, () => Util.click(buttons.play));
		Messages.addListener(Const.msg.NEXT, () => Util.click(buttons.next));
		Messages.addListener(Const.msg.PREV, () => Util.click(buttons.prev));

		await Messages.send(Const.msg.REGISTER);

		window.addEventListener('unload', () => Messages.send(Const.msg.UNREGISTER));

		this.setupPlayState(Util.debounce(state => Messages.send(Const.msg.PLAY_STATE, state), 50), buttons.play);
		this.setupInfo(Util.debounce(info => Messages.send(Const.msg.INFO, info), 50));

		const actionData = [];
		const actions = this.getActions();
		const sendActionUpdate = Util.debounce(() => Messages.send(Const.msg.ACTIONS, actionData), 50);

		await Util.asyncMap(actions, (setup, i) =>
				setup(data => {
					actionData[i] = data;
					sendActionUpdate();
				})
		);

		Messages.addListener(Const.msg.DO_ACTION, i => actions[i]());
	}
}
