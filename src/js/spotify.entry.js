import { registerDomain } from './shared/domain';
import { descendant, onMutation } from './util/dom';

registerDomain({
	async getButtons() {
		const controls = await descendant(document.body, '.player-controls');

		return {
			play: controls.querySelector('button[data-testid="control-button-playpause"]'),
			next: controls.querySelector('button[data-testid="control-button-skip-forward"]'),
			prev: controls.querySelector('button[aria-label="Previous"]'),
		};
	},

	setupPlayState(callback, playButton) {
		onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['aria-label'] },
			() => callback(playButton.getAttribute('aria-label') === 'Pause'),
			{ initialCallback: true },
		);
	},

	async setupInfo(callback) {
		const nowPlaying = await descendant(document.body, '[data-testid="now-playing-widget"]');

		function sendUpdate() {
			// try to get the high res cover art (if expanded), otherwise fall back
			const imageElem = document.querySelector('[data-testid="cover-art-image"]') || nowPlaying.querySelector('.cover-art img');
			const titleElem = nowPlaying.querySelector('[data-testid="context-item-link"]');
			const subtitleElem = nowPlaying.querySelector('[data-testid="context-item-info-artist"]');

			callback({
				image: `url(${imageElem.src})`,
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent,
			});
		}

		// aria-label contains the current song, so can be used as a proxy for updates
		onMutation(nowPlaying, { attributes: true, attributeFilter: ['aria-label'] }, sendUpdate);

		sendUpdate();
	},

	getActions() {
		return [async callback => {
			const likeButton = await descendant(document.body, '[data-testid="now-playing-widget"] [data-testid="add-button"]');

			function sendUpdate() {
				callback({
					icon: '\uf004',
					state: !likeButton.getAttribute('aria-label').includes('Save'),
				});
			}

			onMutation(
				likeButton,
				{ attributes: true, attributeFilter: ['aria-label'] },
				sendUpdate,
				{ initialCallback: true },
			);

			return () => likeButton.click();
		}];
	},
});
