import * as Const from './base/constants';
import * as Messages from './modules/api/messages';
import { empty } from './modules/util/dom';
import { randomGradient } from './modules/util/gradient';
import { populate } from './modules/util/templates';

function updateInfo({ title, subtitle, image = randomGradient({ sat: 0.25, val: 0.5 }) } = {}) {
	document.getElementById('title').textContent = title;
	document.getElementById('subtitle').textContent = subtitle;
	document.body.style.backgroundImage = image;
}

function updateActions(actions = []) {
	const container = document.getElementById('actions-container');
	empty(container);
	actions.forEach((action, i) => {
		const ele = populate('action-button', action);
		const button = ele.firstElementChild;
		button.addEventListener('click', () => Messages.send({ type: Const.msg.DO_ACTION, data: i }));
		button.classList.toggle('isInactive', !action.state);
		container.appendChild(ele);
	});
}

function updatePlayState(state = false) {
	document.body.classList.toggle('isPlaying', state);
}

function fetchInfo() {
	Messages.send(Const.msg.INFO)
		.then(updateInfo);
}

function fetchActions() {
	Messages.send(Const.msg.ACTIONS)
		.then(updateActions);
}

function fetchPlayState() {
	Messages.send(Const.msg.PLAY_STATE)
		.then(updatePlayState);
}

document.getElementById('prev')
	.addEventListener('click', () => Messages.send(Const.msg.PREV));

document.getElementById('play-pause')
	.addEventListener('click', () => Messages.send(Const.msg.PLAY_PAUSE));

document.getElementById('next')
	.addEventListener('click', () => Messages.send(Const.msg.NEXT));

document.getElementById('header')
	.addEventListener('click', async () => {
		await Messages.send(Const.msg.FOCUS_TAB);
		window.close();
	});

// Responses handled by the background page
Messages.addListener(Const.msg.INFO, updateInfo, { silent: true });

Messages.addListener(Const.msg.ACTIONS, updateActions, { silent: true });

// Not using the state from this message as it may be a background tab (e.g. if we pressed stop)
Messages.addListener(Const.msg.PLAY_STATE, fetchPlayState, { silent: true });

updateInfo();

fetchInfo();
fetchActions();
fetchPlayState();
