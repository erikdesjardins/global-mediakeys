import { click, onMutation, waitForEvent, descendant } from './modules/util/dom';
import Domain from './base/Domain';

class GooglePlayMusic extends Domain {
	getButtons() {
		return {
			play: document.querySelector('sj-icon-button[data-id="play-pause"]'),
			next: document.querySelector('sj-icon-button[data-id="forward"]'),
			prev: document.querySelector('sj-icon-button[data-id="rewind"]')
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
			const imageElem = parent.querySelector('#playingAlbumArt');
			const titleElem = parent.querySelector('#player-song-title');
			const subtitleElem = parent.querySelector('.player-artist-album-wrapper');

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
		return [async (callback) => {
			const thumbUpButton = await descendant(document.getElementById('playerSongInfo'), 'sj-icon-button[data-rating="5"]');

			function sendUpdate() {
				callback({
					icon: '\uf164',
					state: thumbUpButton.getAttribute('aria-label').toLowerCase().includes('undo')
				});
			}

			onMutation(
				thumbUpButton,
				{ attributes: true, attributeFilter: ['aria-label'] },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => click(thumbUpButton);
		}, async (callback) => {
			const thumbDownButton = await descendant(document.getElementById('playerSongInfo'), 'sj-icon-button[data-rating="1"]');

			function sendUpdate() {
				callback({
					icon: '\uf165',
					state: thumbDownButton.getAttribute('aria-label').toLowerCase().includes('undo')
				});
			}

			onMutation(
				thumbDownButton,
				{ attributes: true, attributeFilter: ['aria-label'] },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => click(thumbDownButton);
		}];
	}
}

new GooglePlayMusic().go(waitForEvent(window, 'load'));
