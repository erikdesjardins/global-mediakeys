import Domain from './shared/Domain';
import { descendant, onMutation } from './util/dom';

class Bandcamp extends Domain {
	async getButtons() {
		const trackInfo = await descendant(document.body, '#trackInfo');

		return {
			play: await descendant(trackInfo, '.playbutton'),
			next: await descendant(trackInfo, '.nextbutton'),
			prev: await descendant(trackInfo, '.prevbutton'),
		};
	}

	setupPlayState(callback, playButton) {
		onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['class'] },
			() => callback(playButton.classList.contains('playing')),
			{ initialCallback: true }
		);
	}

	setupInfo(callback) {
		const image = `url(${document.querySelector('#tralbumArt img').src})`;
		const titleElem = document.querySelector('#trackInfo .title');
		const subtitle = document.querySelector('#name-section').textContent;

		function sendUpdate() {
			callback({
				image,
				title: titleElem.textContent,
				subtitle,
			});
		}

		onMutation(
			titleElem,
			{ childList: true },
			sendUpdate,
			{ initialCallback: true }
		);
	}

	getActions() {
		return [];
	}
}

new Bandcamp().go();
