import * as Util from './modules/util';
import Domain from './modules/content/Domain';

class YouTube extends Domain {
	getButtons() {
		return {
			play: document.querySelector('.ytp-play-button'),
			next: document.querySelector('.ytp-next-button'),
			prev: document.querySelector('.ytp-prev-button')
		};
	}

	setupPlayState(callback, playButton) {
		Util.onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['aria-label'] },
			() => callback(playButton.getAttribute('aria-label').toLowerCase().includes('pause')),
			{ initialCallback: true }
		);
	}

	setupInfo(callback) {
		async function sendUpdate(parent) {
			const imageElem = await Util.descendant(parent, '.video-thumb img');
			const titleElem = await Util.descendant(parent, '#watch-headline-title');
			const subtitleElem = await Util.descendant(parent, '.yt-user-info');

			const imageUrl = imageElem.getAttribute('data-thumb') || imageElem.src;

			callback({
				image: `url(${imageUrl.replace('/s88', '/s250')})`,
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent
			});
		}

		Util.onDescendantMutation(
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
					state: button.innerHTML.includes('#ytp-svg-48')
				});
			}

			Util.onMutation(
				button,
				{ childList: true },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => Util.click(button);
		}];
	}
}

new YouTube().go(Util.waitForChild(document.getElementById('player-api'), '.html5-video-player'));
