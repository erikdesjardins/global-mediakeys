import Domain from './shared/Domain';
import { click, descendant, onDescendantMutation, onMutation, waitForChild } from './util/dom';

class YouTube extends Domain {
	async getButtons() {
		await waitForChild(document.getElementById('player-api'), '.html5-video-player');

		return {
			play: document.querySelector('.ytp-play-button'),
			next: document.querySelector('.ytp-next-button'),
			prev: document.querySelector('.ytp-prev-button')
		};
	}

	setupPlayState(callback, playButton) {
		onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['aria-label'] },
			() => callback(playButton.getAttribute('aria-label').toLowerCase().includes('pause')),
			{ initialCallback: true }
		);
	}

	setupInfo(callback) {
		async function sendUpdate(parent) {
			const imageElem = await descendant(parent, '.video-thumb img');
			const titleElem = await descendant(parent, '#watch-headline-title');
			const subtitleElem = await descendant(parent, '.yt-user-info');

			const imageUrl = imageElem.getAttribute('data-thumb') || imageElem.src;

			callback({
				image: `url(${imageUrl.replace('/s88', '/s250')})`,
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent
			});
		}

		onDescendantMutation(
			document.getElementById('content'),
			'#watch-header',
			{ childList: true },
			sendUpdate,
			{ initialCallback: true }
		);
	}

	getActions() {
		return [callback => {
			const button = document.querySelector('.ytp-watch-later-button');

			function sendUpdate() {
				callback({
					icon: '\uf017',
					state: button.innerHTML.includes('#ytp-svg-53')
				});
			}

			onMutation(
				button,
				{ childList: true },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => click(button);
		}];
	}
}

new YouTube().go();
