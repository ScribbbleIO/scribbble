export default async function visit(tree, visitor) {
	let result = visitor(tree);
	if (result instanceof Promise) {
		result = await result;
	}

	for (let child of tree.children ?? []) {
		let result = visit(child, visitor);
		if (result instanceof Promise) {
			result = await result;
		}
	}
}
