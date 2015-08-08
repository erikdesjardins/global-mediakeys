import * as Const from '../constants';
import * as Util from '../util';
import * as Messages from './messages';

export default class Domain {
	constructor() {
		this.actionData = [];
	}

	getButtons() {
		throw new Error('getButtons() is not defined.');
	}

	setupPlayState(callback, playButton) {
		throw new Error('setupPlayState(callback, playButton) is not defined.');
	}

	setupInfo(callback) {
		throw new Error('setupInfo(callback) is not defined.');
	}

	getActions() {
		return [];
	}

	async go(waitFor) {
		await waitFor;

		const buttons = this.getButtons();

		if (!buttons.play) {
			throw new Error('No play button found.');
		}

		Messages.addListener(Const.msg.PLAY_PAUSE, () => Util.click(buttons.play));
		Messages.addListener(Const.msg.NEXT, () => Util.click(buttons.next));
		Messages.addListener(Const.msg.PREV, () => Util.click(buttons.prev));

		await Messages.send(Const.msg.REGISTER);

		window.addEventListener('unload', () => Messages.send(Const.msg.UNREGISTER));

		this.setupPlayState(Util.debounce(state => Messages.send(Const.msg.PLAY_STATE, state), 50), buttons.play);
		this.setupInfo(Util.debounce(info => Messages.send(Const.msg.INFO, info), 50));

		const actions = this.getActions();
		const sendActionUpdate = Util.debounce(() => Messages.send(Const.msg.ACTIONS, this.actionData), 50);

		await Util.asyncMap(actions, (setup, i) =>
				setup(data => {
					this.actionData[i] = data;
					sendActionUpdate();
				})
		);

		Messages.addListener(Const.msg.DO_ACTION, i => actions[i]());
	}
}
