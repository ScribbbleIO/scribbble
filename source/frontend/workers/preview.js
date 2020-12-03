import markdownToMdast from 'mdast-util-from-markdown';
import mdastToHast from 'mdast-util-to-hast';
import rehypeHighlight from 'rehype-highlight';
import transformRelativeImages from '../utils/mdast/transform-relative-images';

let hastHighlight = rehypeHighlight();

self.addEventListener('message', async function (message) {
	let { markdown, url } = message.data;

	let mdast = markdownToMdast(markdown);
	transformRelativeImages(mdast, url);
	let hast = mdastToHast(mdast);
	hastHighlight(hast);

	self.postMessage(hast);
});
