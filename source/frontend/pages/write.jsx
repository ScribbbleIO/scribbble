import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-sprout';

import Button from '../components/button';
import Article from '../pages/article';
import PhotographIcon from '../icons/photograph';
import ArticleOptionsModal from '../components/modals/article-options';

import useLocalStorage from '../hooks/use-local-storage';
import useLoadingState from '../hooks/use-loading-state';
import useImmerAndUpdateLocalStorageState from '../hooks/use-immer-and-update-local-storage-state';

import visit from 'unist-util-visit';
import mdastToHast from 'mdast-util-to-hast';
import hastToReact from '../utils/hast/hast-to-react.mjs';
import blobToBase64 from '../utils/blob/blob-to-base64';
import base64toBlob from '../utils/base64/base64-to-blob';
import reloadImages from '../utils/markdown/reload-images';
import rehypeHighlight from 'rehype-highlight';
import markdownToMdast from 'mdast-util-from-markdown';
import mdastToMarkdown from 'mdast-util-to-markdown';
import transformRelativeImages from '../utils/mdast/transform-relative-images';

import { useScreenSizeIndex } from '../hooks/use-screen-size';
import { resizeArticlePicture } from '../utils/image/resize';
import Heading1Icon from '../icons/shortcuts/heading-1';
import Heading2Icon from '../icons/shortcuts/heading-2';
import Heading3Icon from '../icons/shortcuts/heading-3';
import BoldIcon from '../icons/shortcuts/bold';
import ItalicIcon from '../icons/shortcuts/italic';
import LinkIcon from '../icons/shortcuts/link';
import UnorderedListIcon from '../icons/shortcuts/unordered-list';
import OrderedListIcon from '../icons/shortcuts/ordered-list';
import DividerIcon from '../icons/shortcuts/divider';
import BlockQuoteIcon from '../icons/shortcuts/blockquote';
import CodeIcon from '../icons/shortcuts/code';
import CodeBlockIcon from '../icons/shortcuts/codeblock';
import PreviewIcon from '../icons/preview';
import WriteIcon from '../icons/write';
import WriteAndPreviewIcon from '../icons/write-preview';
import ArrowLeftIcon from '../icons/arrow-left';
import Spinner from '../components/spinner';
import AnimatedSuccessIcon from '../icons/animated/success';

let hastHighlight = rehypeHighlight();

const development = (import.meta.env?.MODE ?? process?.env?.NODE_ENV ?? 'development') === 'development';
const baseUrl = development ? 'http://localhost:8080' : 'https://scribbble.io';

export default function Write(props) {
	let { user } = props;

	let textAreaRef = useRef();

	// Workers in firefox and safari do not understand the import syntax
	// So only on chrome we use the worker to do the parsing
	// If the worker generates an error, we set the usePreviewWorker to false
	let previewWorkerRef = useRef();
	let usePreviewWorkerRef = useRef(true);
	let screenSizeIndex = useScreenSizeIndex();
	let canWriteAndPreview = screenSizeIndex >= 1;

	let [preview, setPreview] = useState();
	let [writing, setWriting] = useLocalStorage('writing', true);
	let [successFulPatch, setSuccessFulPatch] = useState(false);
	let [previewing, setPreviewing] = useLocalStorage('previewing', false);
	let [saveModalOpen, setSaveModalOpen] = useState(false);
	let [caretPosition, setCaretPosition] = useState();
	let [executeFetch, fetching, pending] = useLoadingState(fetch);

	let [article, setArticle] = useImmerAndUpdateLocalStorageState('article', function () {
		let articleJson = window.localStorage.getItem('article');
		if (articleJson) {
			let article = JSON.parse(articleJson);
			if (article.id == props.article?.id) {
				article.content = reloadImages(article.content);
				window.localStorage.setItem('article', JSON.stringify(article));
				return article;
			}
		}
		return props.article;
	});

	let articleBaseUrl = `${baseUrl}/${user.username}/${article.slug}/`;

	// Set up the worker for transforming the markdown
	useEffect(() => {
		previewWorkerRef.current = new Worker('../workers/preview.js', { type: 'module' });
		previewWorkerRef.current.addEventListener('error', function () {
			usePreviewWorkerRef.current = false;
		});
		previewWorkerRef.current.addEventListener('message', async function (message) {
			// We need to do the transform to react elements here, because react elements can not be transfered between workers.
			// So we transfer the hast, and create the react elements here.

			let hast = message.data;
			let children = hastToReact(hast);
			setPreview(children);
		});

		return function () {
			previewWorkerRef.current.terminate();
		};
	}, []);

	// Generate the preview on mount
	// We can not trust the worker to do it the first time,
	// as the worker errors in safari/firefox because of the import statements
	useEffect(() => {
		async function run() {
			let mdast = markdownToMdast(article.content);
			transformRelativeImages(mdast, articleBaseUrl);
			let hast = mdastToHast(mdast);
			hastHighlight(hast);
			let children = hastToReact(hast);
			setPreview(children);
		}

		run();
	}, []);

	// Update markdown after content has changed
	useEffect(() => {
		let timeout = setTimeout(async function () {
			if (usePreviewWorkerRef.current) {
				previewWorkerRef.current.postMessage({ markdown: article.content, url: articleBaseUrl });
			} else {
				let mdast = markdownToMdast(article.content);
				transformRelativeImages(mdast, articleBaseUrl);
				let hast = mdastToHast(mdast);
				hastHighlight(hast);
				let children = hastToReact(hast);
				setPreview(children);
			}
		}, 400);

		return function () {
			clearTimeout(timeout);
		};
	}, [article.content]);

	// Switches off the preview of the article when the screen gets too small
	useEffect(() => {
		if (!canWriteAndPreview && writing && previewing) {
			setPreviewing(false);
		}
	}, [canWriteAndPreview]);

	// We set the caretPosition in a useEffect as it could not be set in the handler itself,
	// because it depends on the content which is only set through state and not changed directly
	// in the handler itself
	useEffect(() => {
		if (caretPosition == undefined) return;

		textAreaRef.current.selectionStart = caretPosition[0];
		textAreaRef.current.selectionEnd = caretPosition[1];
	}, [caretPosition]);

	// We update the document title to the title of the post
	useEffect(() => {
		if (article.title !== '') {
			document.title = `${article.title} - Scribbble`;
		} else {
			document.title = 'Scribbble';
		}

		return () => {
			document.title = 'Scribbble';
		};
	}, [article.title]);

	async function handleImageUpload(file) {
		let image = await resizeArticlePicture(file);
		let base64 = await blobToBase64(image);
		let element = textAreaRef.current;
		let imageUrl = URL.createObjectURL(image);

		let preContent = article.content.slice(0, element.selectionStart);
		let postContent = article.content.slice(element.selectionEnd);

		let preNewlineContent = `\n\n`;
		let postNewlineContent = `\n\n`;
		let preNewlines = preContent.match(/((\r?\n)*)$/);
		let postNewlines = postContent.match(/^((\r?\n)*)/);
		let preNewlinesCount = preNewlines?.[0].length ?? 0;
		let postNewlinesCount = postNewlines?.[0].length ?? 0;

		let preLines = preContent.length - preNewlinesCount ? Math.max(2 - preNewlines?.[0].length ?? 0, 0) : 0;
		let postLines = postContent.length - postNewlinesCount ? Math.max(2 - postNewlines?.[0].length ?? 0, 0) : 0;

		preNewlineContent = preNewlineContent.slice(0, preLines);
		postNewlineContent = postNewlineContent.slice(0, postLines);

		let imageMarkdown = preNewlineContent + `![${file.name}](${imageUrl})` + postNewlineContent;
		let updatedContent = preContent + imageMarkdown + postContent;
		localStorage.setItem(imageUrl, base64);

		setArticle((article) => {
			article.content = updatedContent;
		});
	}

	function handleTitleChange(event) {
		let articleTitle = event.target.value;
		setArticle((article) => {
			article.title = articleTitle;
		});
	}

	function handleImageInputChange(event) {
		let file = event.target.files[0];
		if (file != undefined) {
			handleImageUpload(file);
		}
	}

	function handleImageInputClick(event) {
		event.target.value = null;
	}

	function handleImageLabelKeyDown(event) {
		if (event.key === ' ') {
			event.currentTarget.click();
		}
	}

	async function handleDrop(event) {
		let file = event.dataTransfer.files[0];
		if (file) {
			if (file.type === 'image/jpeg' || file.type === 'image/png') {
				event.preventDefault();
				handleImageUpload(file);
			}
		} else {
			let element = event.currentTarget;
			let url = event.dataTransfer.getData('URL');
			if (url) {
				event.preventDefault();
				let linkMarkdown = `[](${url})`;
				let preContent = article.content.slice(0, element.selectionStart);
				let postContent = article.content.slice(element.selectionEnd);
				let updatedContent = preContent + linkMarkdown + postContent;

				setArticle((article) => {
					article.content = updatedContent;
				});
			}
		}
	}

	function handleContentChange(event) {
		let articleContent = event.target.value;
		setArticle((article) => {
			article.content = articleContent;
		});
	}

	function handleKeyDown(event) {
		if (event.key === 'Tab') {
			event.preventDefault();

			let element = event.currentTarget;
			let caretPosition = element.selectionStart + 1;
			let updatedContent =
				article.content.slice(0, element.selectionStart) + '\t' + article.content.slice(element.selectionEnd);

			setArticle((article) => {
				article.content = updatedContent;
			});
			setCaretPosition([caretPosition, caretPosition]);
		} else if ((window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			if (article.title.trim() !== '') {
				handleSaveClick();
			}
		}
	}

	function handleWriteClick() {
		setWriting(true);
		setPreviewing(false);
	}

	function handleWriteAndPreviewClick() {
		setWriting(true);
		setPreviewing(true);
	}

	function handlePreviewClick() {
		setWriting(false);
		setPreviewing(true);
	}

	async function handleSaveClick() {
		if (fetching) return;

		if (article.id == undefined) {
			setSaveModalOpen(true);
		} else {
			let postImageUrls = [];
			let storageImageUrls = [];
			let mdast = markdownToMdast(article.content);
			visit(mdast, function (node) {
				if (node.type === 'image') {
					postImageUrls.push(node.url);
				}
			});

			let formData = new FormData();
			formData.append('article', JSON.stringify({ title: article.title, content: article.content }));
			for (let url in window.localStorage) {
				if (url.startsWith('blob:')) {
					storageImageUrls.push(url);

					if (postImageUrls.includes(url)) {
						let base64 = window.localStorage.getItem(url);
						let data = base64.split(',')[1];
						let blob = base64toBlob(data, 'image/jpeg');
						let segments = url.split('/');

						formData.append(url, blob, `${segments[segments.length - 1]}.jpg`);
					}
				}
			}

			let response = await executeFetch(`/api/articles/${article.id}`, {
				method: 'PATCH',
				body: formData,
			});

			if (response.ok) {
				setSuccessFulPatch(true);
				for (let imageUrl in storageImageUrls) {
					window.localStorage.removeItem(imageUrl);
				}

				setArticle((article) => {
					let mdast = markdownToMdast(article.content);

					visit(mdast, function (node) {
						if (node.type === 'image') {
							let url = node.url;
							if (url.startsWith('blob:')) {
								let segments = url.split('/');
								let fileName = segments[segments.length - 1] + '.jpg';

								node.url = fileName;
							}
						}
					});

					article.content = mdastToMarkdown(mdast);
				});
			}
		}
	}

	function handleCloseModalClick() {
		setSaveModalOpen(false);
	}

	function insertBlockContent(replacer) {
		insertContent(replacer, false);
	}

	// This function is used to implement all the command buttons
	function insertContent(replacer, inline = true) {
		let textArea = textAreaRef.current;
		let selection = article.content.slice(textArea.selectionStart, textArea.selectionEnd);
		let preContent = article.content.slice(0, textArea.selectionStart);
		let postContent = article.content.slice(textArea.selectionEnd);

		let preInsert = '';
		let postInsert = '';

		// Calculate markdown block content
		if (inline === false) {
			preInsert = `\n\n`;
			postInsert = `\n\n`;

			let preContentNewLines = preContent.match(/((\r?\n)*)$/);
			let preContentNewLineCount = preContentNewLines?.[0].length ?? 0;
			let preContentNoNewlinesLength = preContent.length - preContentNewLineCount;
			let preContentNewLineLength = preContentNoNewlinesLength ? Math.max(2 - preContentNewLineCount, 0) : 0;
			preInsert = preInsert.slice(0, preContentNewLineLength);

			let postContentNewLines = postContent.match(/^((\r?\n)*)/);
			let postContentNewLineCount = postContentNewLines?.[0].length ?? 0;
			let postContentNoNewlinesLength = postContent.length - postContentNewLineCount;
			let postContentNewLineLength = postContentNoNewlinesLength ? Math.max(2 - preContentNewLineCount, 0) : 0;
			postInsert = postInsert.slice(0, postContentNewLineLength);
		}

		if (selection.length === 0) {
			selection = undefined;
		}

		// Get selection info from replacer
		let [preSelection = '', newSelection = '', postSelection = ''] = replacer(selection);

		let pre = preContent + preInsert + preSelection;
		let post = postSelection + postInsert + postContent;
		let updatedContent = pre + newSelection + post;

		setCaretPosition([pre.length, pre.length + newSelection.length]);
		setArticle((article) => {
			article.content = updatedContent;
		});

		textArea.focus();
	}

	function handleHeading1ShortCutClick() {
		insertBlockContent((selection) => ['# ', selection ?? 'Heading']);
	}

	function handleHeading2ShortCutClick() {
		insertBlockContent((selection) => ['## ', selection ?? 'Heading']);
	}

	function handleHeading3ShortCutClick() {
		insertBlockContent((selection) => ['### ', selection ?? 'Heading']);
	}

	function handleBoldShortCutClick() {
		insertContent((selection) => ['**', selection ?? 'bold', '**']);
	}

	function handleItalicShortCutClick() {
		insertContent((selection) => ['*', selection ?? 'italic', '*']);
	}

	function handleLinkShortCutClick() {
		insertContent((selection) => ['[', selection ?? 'description', '](https://scribbble.io)']);
	}

	function handleQuoteShortCutClick() {
		insertBlockContent((selection) => ['> ', selection ?? 'quote']);
	}

	function handleUnorderedListShortCutClick() {
		insertBlockContent((selection = '') => {
			let listitems = selection.split(/\r?\n/).filter((l) => l.length);
			if (listitems.length === 0) {
				listitems = ['item 1', 'item 2', 'item 3'];
			}

			let result = listitems[0];
			for (let listitem of listitems.slice(1)) {
				result = result + '\n- ' + listitem;
			}

			return ['- ', result];
		});
	}

	function handleOrderedListShortCutClick() {
		insertBlockContent((selection = '') => {
			let listitems = selection.split(/\r?\n/).filter((l) => l.length);
			if (listitems.length === 0) {
				listitems = ['item 1', 'item 2', 'item 3'];
			}

			let count = 1;
			let result = listitems[0];
			for (let listitem of listitems.slice(1)) {
				result = result + '\n' + ++count + '. ' + listitem;
			}

			return ['1. ', result];
		});
	}

	function handleDividerShortCutClick() {
		insertBlockContent(() => ['---']);
	}

	function handleCodeShortCutClick() {
		insertContent((selection) => ['`', selection ?? 'code', '`']);
	}

	function handleCodeBlockShortCutClick() {
		insertBlockContent((selection) => {
			if (selection == undefined) {
				return [
					'```javascript\n',
					"function awesome() {\n\treturn true;\n}\n\nif (awesome()) {\n\tconsole.log('Scribbble.io is awesome!')\n}",
					'\n```',
				];
			} else {
				return ['```\n', selection, '\n```'];
			}
		});
	}

	let renderPreview = (
		<div className={(previewing ? 'block' : 'hidden') + ' overflow-y-auto dark:bg-dark'}>
			<Article
				title={article.title || 'Your title...'}
				publishedAt={article.publishedAt || Date.now()}
				author={user}
			>
				{preview}
			</Article>
		</div>
	);

	let renderShortCutButtons;
	if (writing) {
		renderShortCutButtons = (
			<>
				<ShortCutButton
					className="flex-shrink-0"
					title="Insert heading 1"
					onClick={handleHeading1ShortCutClick}
				>
					<Heading1Icon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-2"
					title="Insert heading 2"
					onClick={handleHeading2ShortCutClick}
				>
					<Heading2Icon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-2"
					title="Insert heading 3"
					onClick={handleHeading3ShortCutClick}
				>
					<Heading3Icon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-2"
					title="Insert bold text"
					onClick={handleBoldShortCutClick}
				>
					<BoldIcon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-1"
					title="Insert italic text"
					onClick={handleItalicShortCutClick}
				>
					<ItalicIcon />
				</ShortCutButton>

				<div className="flex-shrink-0 inline-block w-5 h-5 ml-2">
					<label
						tabIndex={0}
						htmlFor="image_upload"
						onKeyDown={handleImageLabelKeyDown}
						title="Upload image"
						className="cursor-pointer hover:text-gray-600 focus:outline-none focus:text-gray-600"
					>
						<PhotographIcon />
					</label>
					<input
						id="image_upload"
						className="hidden"
						type="file"
						accept="image/jpeg, image/png"
						onChange={handleImageInputChange}
						onClick={handleImageInputClick}
					></input>
				</div>

				<ShortCutButton className="flex-shrink-0 ml-2" title="Insert link" onClick={handleLinkShortCutClick}>
					<LinkIcon className="w-4 h-4 hover:text-gray-600 focus:outline-none focus:text-gray-600" />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-1"
					title="Insert unordered list"
					onClick={handleUnorderedListShortCutClick}
				>
					<UnorderedListIcon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-2"
					title="Insert ordered list"
					onClick={handleOrderedListShortCutClick}
				>
					<OrderedListIcon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-2"
					title="Insert divider"
					onClick={handleDividerShortCutClick}
				>
					<DividerIcon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-2"
					title="Insert blockquote"
					onClick={handleQuoteShortCutClick}
				>
					<BlockQuoteIcon />
				</ShortCutButton>

				<ShortCutButton className="flex-shrink-0 ml-2" title="Insert code" onClick={handleCodeShortCutClick}>
					<CodeIcon />
				</ShortCutButton>

				<ShortCutButton
					className="flex-shrink-0 ml-2"
					title="Insert codeblock"
					onClick={handleCodeBlockShortCutClick}
				>
					<CodeBlockIcon />
				</ShortCutButton>
			</>
		);
	}

	let renderWrite = (
		<div
			className={
				`${writing ? 'grid' : 'hidden'} grid-cols-1 col-1-full grid-rows-3 row-1-auto row-3-auto ` +
				(writing && previewing ? 'border-r border-gray-200' : '')
			}
		>
			<input
				type="text"
				value={article.title}
				onChange={handleTitleChange}
				placeholder="Your title..."
				className="col-start-1 col-end-2 row-start-1 px-6 py-4 text-2xl text-gray-700 border-t-0 border-b border-l-0 border-r-0 border-gray-100 focus:border-gray-100 focus:ring-0 focus:outline-none"
			/>

			<textarea
				ref={textAreaRef}
				value={article.content}
				onDrop={handleDrop}
				onChange={handleContentChange}
				onKeyDown={handleKeyDown}
				className="col-start-1 col-end-2 row-start-2 row-end-3 px-6 pt-4 pb-4 text-gray-700 border-none resize-none focus:outline-none focus:ring-0 md:row-end-4 md:pb-24"
				placeholder="Your story..."
			/>

			<div className="z-10 grid grid-cols-1 col-start-1 col-end-2 row-start-3 overflow-x-auto text-gray-400 bg-white border-t border-gray-200 md:border-none col-1-fr md:my-6 md:mx-12 md:shadow items-x-center items-y-center md:self-x-center self-y-end md:w-auto md:rounded">
				<div className="flex items-center px-4 py-3">{renderShortCutButtons}</div>
			</div>
		</div>
	);

	let containerClassName = 'grid font-serif bg-white';
	if (previewing && writing) {
		containerClassName += ' grid-cols-2';
	} else {
		containerClassName += ' grid-cols-1';
	}

	let optionButtonClassName = 'px-3 py-2 rounded-md focus:outline-none focus:bg-blue-100';

	let writeButtonClassName = optionButtonClassName;
	if (writing && !previewing) {
		writeButtonClassName += ' bg-blue-100';
	}

	let writeAndPreviewClassName = optionButtonClassName + ' text-blue-500';
	if (writing && previewing) {
		writeAndPreviewClassName += ' bg-blue-100';
	}

	let previewButtonClassName = optionButtonClassName;
	if (!writing && previewing) {
		previewButtonClassName += ' bg-blue-100';
	}

	let renderWriteAndPreviewButton;
	if (canWriteAndPreview) {
		renderWriteAndPreviewButton = (
			<button
				type="button"
				title="Write and preview"
				className={writeAndPreviewClassName}
				onClick={handleWriteAndPreviewClick}
			>
				<WriteAndPreviewIcon />
			</button>
		);
	}

	let renderArticleOptions;
	if (saveModalOpen) {
		renderArticleOptions = (
			<ArticleOptionsModal
				username={user.username}
				title={article.title}
				content={article.content}
				onCancel={handleCloseModalClick}
			/>
		);
	}

	let renderSubmitButtonChildren = 'Save';
	if (pending) {
		renderSubmitButtonChildren = (
			<span className="flex justify-center">
				<Spinner size={4} color="text-white" />
			</span>
		);
	} else if (successFulPatch) {
		let handleAnimationEnd = function () {
			setTimeout(function () {
				setSuccessFulPatch(false);
			}, 500);
		};

		renderSubmitButtonChildren = (
			<span className="flex justify-center">
				<AnimatedSuccessIcon onAnimationEnd={handleAnimationEnd} />
			</span>
		);
	}

	return (
		<>
			{renderArticleOptions}
			<div className="grid w-full h-full" style={{ gridTemplateRows: 'minmax(0, 1fr) max-content' }}>
				<section className={containerClassName}>
					{renderWrite}
					{renderPreview}
				</section>
				<section className="flex flex-col w-full px-6 py-4 text-gray-700 border-t border-gray-200 bg-gray-50">
					<div className="grid grid-flow-row grid-cols-3 items-y-center">
						<Link
							to="/dashboard"
							className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm self-x-start focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 focus:border-blue-300"
						>
							<ArrowLeftIcon className="w-5 h-5 text-gray-500" />
						</Link>

						<span className="inline-flex items-center space-x-2 self-x-center">
							<button
								title="Write"
								type="button"
								className={writeButtonClassName}
								onClick={handleWriteClick}
							>
								<WriteIcon />
							</button>

							{renderWriteAndPreviewButton}

							<button
								title="Preview"
								type="button"
								className={previewButtonClassName}
								onClick={handlePreviewClick}
							>
								<PreviewIcon />
							</button>
						</span>

						<span className="self-x-end">
							<Button onClick={handleSaveClick} disabled={pending || article.title.trim() === ''}>
								{renderSubmitButtonChildren}
							</Button>
						</span>
					</div>
				</section>
			</div>
		</>
	);
}

function ShortCutButton(props) {
	let { onClick, children, className = '', ...other } = props;

	className = 'w-5 h-5 hover:text-gray-600 focus:outline-none focus:text-gray-600 ' + className;

	return (
		<button onClick={onClick} className={className} {...other}>
			{children}
		</button>
	);
}
