import markdownToMdast from 'mdast-util-from-markdown';
import mdastToHast from 'mdast-util-to-hast';
import highlightCode from '@mapbox/rehype-prism';
import transformRelativeImages from '../utils/mdast/transform-relative-images';

let hastHighlight = highlightCode({ ignoreMissing: true });

self.addEventListener('message', async function (message) {
	let { markdown, url } = message.data;

	let mdast = markdownToMdast(markdown);
	transformRelativeImages(mdast, url);
	let hast = mdastToHast(mdast);
	hastHighlight(hast);

	self.postMessage(hast);
});
