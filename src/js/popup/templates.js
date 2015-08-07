const Templates = (() => {
	function populate(templateId, map) {
		const template = document.getElementById(templateId);

		if (!template || !template.content) {
			throw new Error(`#${templateId} is not a valid template.`);
		}

		const wrapper = document.createElement('p');

		wrapper.appendChild(document.importNode(template.content, true));
		wrapper.innerHTML = wrapper.innerHTML.replace(/\{\{(\w+)\}\}/g, (m, key) => {
			if (!(key in map)) {
				throw new Error(`Cannot populate template: ${templateId}, missing property: ${key}.`);
			}
			return map[key];
		});

		return wrapper.firstElementChild;
	}

	return {
		populate
	};
})();
