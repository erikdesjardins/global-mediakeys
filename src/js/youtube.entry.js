import { registerDomain } from './shared/domain';
import { descendant, onMutation } from './util/dom';

registerDomain({
	async getButtons() {
		const player = await descendant(document, '.html5-video-player');

		return {
			play: player.querySelector('.ytp-play-button'),
			next: player.querySelector('.ytp-next-button'),
			prev: player.querySelector('.ytp-prev-button'),
		};
	},

	setupPlayState(callback, playButton) {
		onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['aria-label'] },
			() => callback(playButton.getAttribute('aria-label').toLowerCase().includes('pause')),
			{ initialCallback: true },
		);
	},

	async setupInfo(callback) {
		const main = await descendant(document, '#primary');
		const imageElem = await descendant(main, '#meta #img');
		const titleElem = await descendant(main, 'h1.title');
		const subtitleElem = await descendant(main, '#upload-info #channel-name');

		function sendUpdate() {
			callback({
				image: `url(${imageElem.src.replace(/s\d+-/, 's500-')})`,
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent,
			});
		}

		onMutation(imageElem, { attributes: true, attributeFilter: ['src'] }, sendUpdate);
		onMutation(titleElem, { characterData: true }, sendUpdate);
		onMutation(subtitleElem, { characterData: true }, sendUpdate);

		sendUpdate();
	},

	getActions() {
		return [async callback => {
			const button = await descendant(document, '.ytp-watch-later-button');

			function sendUpdate() {
				callback({
					icon: '\uf017',
					state: button.innerHTML.includes('#ytp-svg-53'),
				});
			}

			onMutation(
				button,
				{ childList: true },
				sendUpdate,
				{ initialCallback: true },
			);

			return () => button.click();
		}];
	},
});
