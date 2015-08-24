/**
 * @file A primitive utility for templating HTML.
 * @module util/templates
 */

/**
 * Populate a template with values from <tt>map</tt>.
 * Template keys may be formatted as follows: <tt>{{key}}</tt>.
 * @param {string} templateId The id of the HTML <tt>&lt;template&gt;</tt> element to be populated.
 * @param {!Object} map Should contain a value for every key in the template.
 * @returns {Element} The populated template.
 */
export function populate(templateId, map) {
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
