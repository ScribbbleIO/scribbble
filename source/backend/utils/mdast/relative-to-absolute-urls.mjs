import visit from 'unist-util-visit';

import { URL } from 'url';

export default function relativeToAbsoluteUrls(mdast, baseUrl) {
	visit(mdast, function (node) {
		if (node.type === 'image' || node.type === 'link') {
			node.url = `${new URL(node.url, baseUrl)}`;
		}
	});
}
