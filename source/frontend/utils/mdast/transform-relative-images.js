import visit from 'unist-util-visit';

export default function transformRelativeImages(mdast, url) {
	visit(mdast, function (node) {
		if (node.type === 'image') {
			node.url = `${new URL(node.url, url)}`;
		}
	});
}
