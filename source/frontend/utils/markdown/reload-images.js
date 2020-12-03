import visit from 'unist-util-visit';
import mdastToMarkdown from 'mdast-util-to-markdown';
import markdownToMdast from 'mdast-util-from-markdown';

import base64toBlob from '../base64/base64-to-blob';

export default function reloadImages(markdown) {
	let mdast = markdownToMdast(markdown);

	visit(mdast, function (node) {
		if (node.type === 'image') {
			let base64data = localStorage.getItem(node.url);
			if (base64data) {
				let base64 = base64data.split(',')[1];
				let blob = base64toBlob(base64, 'image/jpeg');
				let url = URL.createObjectURL(blob);

				localStorage.setItem(url, base64data);
				localStorage.removeItem(node.url);

				node.url = url;
			}
		}
	});

	return mdastToMarkdown(mdast);
}
