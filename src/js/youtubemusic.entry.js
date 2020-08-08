import Domain from './shared/Domain';
import { descendant, onMutation } from './util/dom';

class YouTubeMusic extends Domain {
	async getButtons() {
		const controls = document.querySelector('#left-controls');

		return {
			play: await descendant(controls, '#play-pause-button'),
			next: await descendant(controls, '.next-button'),
			prev: await descendant(controls, '.previous-button'),
		};
	}

	setupPlayState(callback, playButton) {
		onMutation(
			playButton,
			{ attributes: true, attributeFilter: ['title'] },
			() => callback(playButton.getAttribute('title') === 'Pause'),
			{ initialCallback: true }
		);
	}

	async setupInfo(callback) {
		const middle = document.querySelector('.middle-controls');

		const imageElem = await descendant(middle, '.image');
		const titleElem = await descendant(middle, '.title');
		const subtitleElem = await descendant(middle, '.byline');

		function sendUpdate() {
			callback({
				image: `url(${imageElem.src.replace('w60-h60-l90', 'w512-h512-l100')})`,
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent,
			});
		}

		onMutation(imageElem, { attributes: true, attributeFilter: ['src'] }, sendUpdate);
		onMutation(titleElem, { characterData: true }, sendUpdate);
		onMutation(subtitleElem, { characterData: true }, sendUpdate);

		sendUpdate();
	}

	getActions() {
		return [callback => {
			const thumbUpButton = document.querySelector('.middle-controls .like');

			function sendUpdate() {
				callback({
					icon: '\uf164',
					state: thumbUpButton.getAttribute('aria-pressed') === 'true',
				});
			}

			onMutation(
				thumbUpButton,
				{ attributes: true, attributeFilter: ['aria-pressed'] },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => thumbUpButton.click();
		}, callback => {
			const thumbDownButton = document.querySelector('.middle-controls .dislike');

			function sendUpdate() {
				callback({
					icon: '\uf165',
					state: thumbDownButton.getAttribute('aria-pressed') === 'true',
				});
			}

			onMutation(
				thumbDownButton,
				{ attributes: true, attributeFilter: ['aria-pressed'] },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => thumbDownButton.click();
		}];
	}
}

new YouTubeMusic().go();
