import { registerDomain } from './shared/domain';
import { onDescendantMutation, onMutation, waitForChild } from './util/dom';

registerDomain({
	async getButtons() {
		await waitForChild(document.getElementById('app'), '.playControls');

		return {
			play: document.querySelector('.playControls .playControl'),
			next: document.querySelector('.playControls .skipControl__next'),
			prev: document.querySelector('.playControls .skipControl__previous'),
		};
	},

	setupPlayState(callback, playButton) {
		onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['class'] },
			() => callback(playButton.classList.contains('playing')),
			{ initialCallback: true },
		);
	},

	async setupInfo(callback) {
		const watchElem = document.querySelector('.playbackSoundBadge');

		function sendUpdate() {
			const imageElem = watchElem.querySelector('.image .sc-artwork');
			const titleElem = watchElem.querySelector('.playbackSoundBadge__title span:last-of-type');
			const subtitleElem = watchElem.querySelector('.playbackSoundBadge__lightLink');

			callback({
				image: getComputedStyle(imageElem).backgroundImage.replace(/t\d+x\d+\./, 't500x500.'),
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent,
			});
		}

		onMutation(
			watchElem,
			{ childList: true },
			sendUpdate,
		);

		await waitForChild(watchElem, '*');

		sendUpdate();
	},

	getActions() {
		return [async callback => {
			function sendUpdate(likeButton) {
				callback({
					icon: '\uf004',
					state: likeButton.classList.contains('sc-button-selected'),
				});
			}

			const { descendant } = await onDescendantMutation(
				document.querySelector('.playbackSoundBadge'),
				'.playbackSoundBadge__like',
				{ attributes: true, attributeFilter: ['class'] },
				sendUpdate,
				{ initialCallback: true },
			);

			return () => descendant().click();
		}];
	},
});
