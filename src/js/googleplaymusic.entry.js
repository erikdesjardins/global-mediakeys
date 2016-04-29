import Domain from './shared/Domain';
import { click, descendant, onMutation } from './util/dom';

class GooglePlayMusic extends Domain {
	async getButtons() {
		const player = document.getElementById('player');

		return {
			play: await descendant(player, '[data-id="play-pause"]'),
			next: await descendant(player, '[data-id="forward"]'),
			prev: await descendant(player, '[data-id="rewind"]')
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
		function sendUpdate(parent) {
			const imageElem = parent.querySelector('#playerBarArt');
			const titleElem = parent.querySelector('#currently-playing-title');
			const subtitleElem = parent.querySelector('.currently-playing-details');

			callback({
				image: `url(${imageElem.src.replace('=s90', '=s250')})`,
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent
			});
		}

		onMutation(
			document.getElementById('playerSongInfo'),
			{ childList: true },
			sendUpdate
		);
	}

	getActions() {
		return [async callback => {
			const thumbUpButton = await descendant(document.getElementById('playerSongInfo'), '[data-rating="5"]');

			function sendUpdate() {
				callback({
					icon: '\uf164',
					state: thumbUpButton.title.toLowerCase().includes('undo')
				});
			}

			onMutation(
				thumbUpButton,
				{ attributes: true, attributeFilter: ['title'] },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => click(thumbUpButton);
		}, async callback => {
			const thumbDownButton = await descendant(document.getElementById('playerSongInfo'), '[data-rating="1"]');

			function sendUpdate() {
				callback({
					icon: '\uf165',
					state: thumbDownButton.title.toLowerCase().includes('undo')
				});
			}

			onMutation(
				thumbDownButton,
				{ attributes: true, attributeFilter: ['title'] },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => click(thumbDownButton);
		}];
	}
}

new GooglePlayMusic().go();
