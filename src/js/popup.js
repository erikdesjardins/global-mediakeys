import { MSG } from './base/constants';
import * as Messages from './modules/api/messages';
import { empty } from './modules/util/dom';
import { randomGradient } from './modules/util/gradient';
import { populate } from './modules/util/templates';
import Logger from './modules/util/Logger';

const log = new Logger('Popup');

function updateInfo({ title, subtitle, image = randomGradient({ sat: 0.25, val: 0.5 }) } = {}) {
	document.getElementById('title').textContent = title;
	document.getElementById('subtitle').textContent = subtitle;
	document.body.style.backgroundImage = image;
	log.d('Updated info:\n', title, '\n', subtitle, '\n', image);
}

function updateActions(actions = []) {
	const container = document.getElementById('actions-container');
	empty(container);
	actions.forEach((action, i) => {
		const ele = populate('action-button', action);
		const button = ele.firstElementChild;
		button.addEventListener('click', () => Messages.send({ type: MSG.DO_ACTION, data: i }));
		button.classList.toggle('isInactive', !action.state);
		container.appendChild(ele);
	});
	log.d('Updated actions:', actions);
}

function updatePlayState(state = false) {
	document.body.classList.toggle('isPlaying', state);
	log.d('Updated play state:', state);
}

function fetchInfo() {
	Messages.send(MSG.INFO)
		.then(updateInfo);
}

function fetchActions() {
	Messages.send(MSG.ACTIONS)
		.then(updateActions);
}

function fetchPlayState() {
	Messages.send(MSG.PLAY_STATE)
		.then(updatePlayState);
}

document.getElementById('prev')
	.addEventListener('click', () => Messages.send(MSG.PREV));

document.getElementById('play-pause')
	.addEventListener('click', () => Messages.send(MSG.PLAY_PAUSE));

document.getElementById('next')
	.addEventListener('click', () => Messages.send(MSG.NEXT));

document.getElementById('header')
	.addEventListener('click', async () => {
		await Messages.send(MSG.FOCUS_TAB);
		window.close();
	});

// Responses handled by the background page
Messages.addListener(MSG.INFO, updateInfo, { silent: true });

Messages.addListener(MSG.ACTIONS, updateActions, { silent: true });

// Not using the state from this message as it may be a background tab (e.g. if we pressed stop)
Messages.addListener(MSG.PLAY_STATE, fetchPlayState, { silent: true });

updateInfo();

fetchInfo();
fetchActions();
fetchPlayState();
