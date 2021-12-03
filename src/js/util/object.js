// Compare two objects structurally.
// Recursively compares own properties using strict equality.
// Does not check prototypes (notably, this means Date objects are treated like empty plain objects).
// Does not handle cyclic references.
export function structuralEq(a, b) {
	// 1. Strict equality
	if (a === b) {
		return true;
	}
	// 2. Exclude nulls
	if (a === null || b === null) {
		return false;
	}
	// 3. Exclude non-objects
	if (typeof a !== 'object' || typeof b !== 'object') {
		return false;
	}
	// 4. Compare objects
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	// 4.1. Exclude different key counts
	if (aKeys.length !== bKeys.length) {
		return false;
	}
	aKeys.sort();
	bKeys.sort();
	// eslint-disable-next-line no-restricted-syntax
	for (let i = 0; i < aKeys.length; ++i) {
		const aKey = aKeys[i];
		const bKey = bKeys[i];
		// 4.2. Exclude different key names
		if (aKey !== bKey) {
			return false;
		}
		// 4.3. Recurse into values
		if (!structuralEq(a[aKey], b[aKey])) {
			return false;
		}
	}
	return true;
}
