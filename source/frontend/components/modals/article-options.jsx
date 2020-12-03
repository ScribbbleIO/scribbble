import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-sprout';
import { useScreenSizeIndex } from '../../hooks/use-screen-size';
import BadgeCheckIcon from '../../icons/badge-check';
import Button from '../button';
import ExclamationIcon from '../../icons/exclamation';
import trapFocus from '../../utils/events/trap-focus';

import useLoadingState from '../../hooks/use-loading-state';

import visit from 'unist-util-visit';
import markdownToMdast from 'mdast-util-from-markdown';
import base64toBlob from '../../utils/base64/base64-to-blob';
import Spinner from '../spinner';

function formatTypingSlug(slug) {
	let regex = /[^a-zA-Z0-9]+/g;

	slug = slug.trimLeft();
	slug = slug.replace(regex, '-');
	slug = slug.replace(/^-/, '');

	return slug.toLowerCase();
}

function formatFinalSlug(slug) {
	let regex = /[^a-zA-Z0-9]+/g;

	slug = slug.trim();
	slug = slug.replace(regex, '-');
	slug = slug.replace(/^-/, '');
	slug = slug.replace(/-$/, '');

	return slug.toLowerCase();
}

export default function ArticleOptionsModal(props) {
	let { id, title, content, description = '', slug } = props;
	let { published = false, pinnedAt, isEditingArticleDetails } = props;
	let { onSubmit, onCancel } = props;

	let navigate = useNavigate();
	let modalRef = useRef();
	let slugRef = useRef();
	let [article, setArticle] = useState({
		title,
		slug: slug || formatFinalSlug(title),
		description: description,
		content,
		published: published,
		pinned: pinnedAt != undefined,
	});
	let [username, setUsername] = useState(props.username || '');
	let [usernameAvailable, setUsernameAvailable] = useState(false);
	let [slugAvailable, setSlugAvailable] = useState(false);
	let [caretPosition, setCaretPosition] = useState();

	let [fetchUser, fetchingUser, pendingUser] = useLoadingState(fetch);
	let [fetchArticle, fetchingArticle, pendingArticle] = useLoadingState(fetch);
	let [fetchArticleDetails, fetchingArticleDetails, pendingArticleDetails] = useLoadingState(fetch);

	let textAreaRef = useRef();
	let [textAreaScroll, setTextAreaScroll] = useState(false);

	useLayoutEffect(() => {
		if (textAreaRef.current.scrollHeight > textAreaRef.current.clientHeight) {
			setTextAreaScroll(true);
		} else {
			setTextAreaScroll(false);
		}
	}, [article.description]);

	useEffect(() => {
		modalRef.current.focus();
	}, []);

	useEffect(() => {
		function handleEscapeEvent(event) {
			if (event.key === 'Escape') {
				onCancel();
			}
		}

		document.addEventListener('keydown', handleEscapeEvent);

		return () => {
			document.removeEventListener('keydown', handleEscapeEvent);
		};
	}, []);

	useEffect(() => {
		if (username === '') {
			setUsernameAvailable(false);
		} else {
			let current = true;
			async function handleUsernameCheck() {
				let response = await fetchUser('/api/users/' + username);
				if (current) {
					if (!response.ok) {
						setUsernameAvailable(true);
					} else {
						setUsernameAvailable(false);
					}
				}
			}

			handleUsernameCheck();

			return () => {
				current = false;
			};
		}
	}, [username]);

	useEffect(() => {
		if (username === '' || article.slug === '') {
			setSlugAvailable(false);
		} else if (article.slug === slug) {
			setSlugAvailable(true);
		} else {
			let current = true;
			async function handleSlugCheck() {
				let response = await fetchArticle('/api/users/' + username + '/articles/' + article.slug);
				if (current) {
					if (!response.ok) {
						setSlugAvailable(true);
					} else {
						setSlugAvailable(false);
					}
				}
			}

			handleSlugCheck();

			return () => {
				current = false;
			};
		}
	}, [username, article.slug]);

	useEffect(() => {
		slugRef.current.selectionStart = caretPosition;
		slugRef.current.selectionEnd = caretPosition;
	}, [caretPosition]);

	function handleUsernameChange(event) {
		let regex = /[^a-zA-Z0-9]/g;
		let newUsername = event.target.value;
		newUsername = newUsername.replace(regex, '').toLowerCase();
		setUsername(newUsername);
	}

	function handleSlugChange(event) {
		let slug = event.target.value;
		slug = formatTypingSlug(slug);
		setArticle({ ...article, slug });
		setCaretPosition(event.target.selectionStart);
	}

	function handleSlugBlur(event) {
		let slug = event.target.value;
		slug = formatFinalSlug(slug);
		setArticle({ ...article, slug });
	}

	function handleTitleChange(event) {
		setArticle({ ...article, title: event.target.value });
	}

	function handleDescriptionChange(event) {
		setArticle({ ...article, description: event.target.value });
	}

	function handlePublishedChange(event) {
		setArticle({ ...article, published: event.target.checked });
	}

	function handlePinnedChange(event) {
		setArticle({ ...article, pinned: event.target.checked });
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (fetchingUser || fetchingArticle || fetchingArticleDetails) return;

		if (isEditingArticleDetails) {
			let response = await fetchArticleDetails(`/api/articles/details/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: article.title,
					description: article.description,
					slug: article.slug,
					published: article.published,
					pinned: article.pinned,
				}),
			});

			if (response.ok) {
				let { article } = await response.json();
				onSubmit(article);
			}
		} else {
			let postImageUrls = [];
			let storageImageUrls = [];

			let mdast = markdownToMdast(content);
			visit(mdast, function (node) {
				if (node.type === 'image') {
					postImageUrls.push(node.url);
				}
			});

			let formData = new FormData();
			formData.append('article', JSON.stringify(article));
			formData.append('username', JSON.stringify(username));
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

			let response = await fetchArticleDetails(`/api/articles`, {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				window.localStorage.removeItem('article');
				for (let imageUrl of storageImageUrls) {
					window.localStorage.removeItem(imageUrl);
				}
				navigate('/dashboard');
			}
		}
	}

	let usernameCheck = usernameAvailable || props.username != undefined;

	let renderUsernameIcon;
	let renderSlugIcon;

	if (pendingUser) {
		renderUsernameIcon = (
			<span className="absolute right-3.5">
				<Spinner size={4} color="text-blue-500" strokeWidth={2} />
			</span>
		);
		renderSlugIcon = (
			<span className="absolute right-3.5">
				<Spinner size={4} color="text-blue-500" strokeWidth={2} />
			</span>
		);
	} else if (usernameCheck) {
		renderUsernameIcon = <BadgeCheckIcon className="absolute w-5 h-5 text-green-600 right-3" />;
		if (pendingArticle) {
			renderSlugIcon = (
				<span className="absolute right-3.5">
					<Spinner size={4} color="text-blue-500" strokeWidth={2} />
				</span>
			);
		} else if (slugAvailable) {
			renderSlugIcon = <BadgeCheckIcon className="absolute w-5 h-5 text-green-600 right-3" />;
		} else {
			renderSlugIcon = <ExclamationIcon className="absolute w-5 h-5 text-red-600 right-3" />;
		}
	} else {
		renderUsernameIcon = <ExclamationIcon className="absolute w-5 h-5 text-red-600 right-3" />;
		renderSlugIcon = <ExclamationIcon className="absolute w-5 h-5 text-red-600 right-3" />;
	}

	let renderUsernameInput;
	if (props.username == undefined) {
		renderUsernameInput = (
			<div>
				<label htmlFor="username" className="block text-sm font-medium leading-5 text-gray-700">
					Username
				</label>
				<div className="relative flex items-center mt-1 rounded-md">
					<input
						id="username"
						type="text"
						maxLength={30}
						spellCheck="false"
						autoCorrect="off"
						autoComplete="off"
						autoCapitalize="off"
						className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm sm:leading-5"
						value={username}
						pattern="[a-zA-Z0-9]+"
						onChange={handleUsernameChange}
					></input>
					{renderUsernameIcon}
				</div>
			</div>
		);
	}

	let renderTitleInput;
	if (isEditingArticleDetails) {
		renderTitleInput = (
			<div>
				<label htmlFor="title" className="block text-sm font-medium leading-5 text-gray-700">
					Title
				</label>
				<div className="flex items-center mt-1 rounded-md">
					<input
						id="title"
						type="text"
						className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm sm:leading-5"
						placeholder="Your title..."
						value={article.title}
						onChange={handleTitleChange}
					></input>
				</div>
			</div>
		);
	}

	let screenSizeIndex = useScreenSizeIndex();
	let renderSlugInput;
	if (screenSizeIndex < 0) {
		renderSlugInput = (
			<div>
				<label htmlFor="slug" className="block text-sm font-medium leading-5 text-gray-700">
					Link
				</label>
				<div className="relative flex items-center mt-1 rounded-md">
					<input
						ref={slugRef}
						id="slug"
						type="text"
						className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm sm:leading-5"
						placeholder="post-on-scribbble"
						value={article.slug}
						onChange={handleSlugChange}
						onBlur={handleSlugBlur}
					></input>
					{renderSlugIcon}
				</div>
			</div>
		);
	} else {
		renderSlugInput = (
			<div>
				<label htmlFor="slug" className="block text-sm font-medium leading-5 text-gray-700">
					Link
				</label>
				<div className="relative flex items-center mt-1 rounded-md ">
					<span className="inline-flex items-center self-stretch px-3 text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 sm:text-sm">
						scribbble.io/{username}/
					</span>
					<input
						ref={slugRef}
						id="slug"
						type="text"
						className="block w-full px-3 py-2 pl-2 pr-10 border border-gray-300 rounded-none focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 rounded-r-md sm:text-sm sm:leading-5"
						placeholder="post-on-scribbble"
						value={article.slug}
						onChange={handleSlugChange}
						onBlur={handleSlugBlur}
					></input>
					{renderSlugIcon}
				</div>
			</div>
		);
	}

	let saveButtonDisabled = pendingUser || pendingArticle || pendingArticleDetails || !usernameCheck || !slugAvailable;

	let tabIndexSubmitButton;
	let tabIndexCancelButton;
	if (screenSizeIndex === -1) {
		tabIndexSubmitButton = 1;
		tabIndexCancelButton = 2;
	} else {
		tabIndexSubmitButton = 2;
		tabIndexCancelButton = 1;
	}

	let renderSubmitButtonChildren = 'Save';
	if (pendingArticleDetails) {
		renderSubmitButtonChildren = (
			<span className="flex justify-center">
				<Spinner size={4} color="text-white" />
			</span>
		);
	}

	return (
		<div
			ref={modalRef}
			className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center focus:outline-none"
			onKeyDown={trapFocus}
			tabIndex={-1}
		>
			<div className="fixed inset-0 transition-opacity" onClick={onCancel}>
				<div className="absolute inset-0 bg-black opacity-50"></div>
			</div>

			<form
				className="px-4 pt-5 pb-4 overflow-hidden transition-all transform bg-white rounded-lg shadow-xl sm:max-w-2xl sm:w-full sm:p-6"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-headline"
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col mt-0 space-y-3">
					{renderUsernameInput}
					{renderTitleInput}
					{renderSlugInput}
					<div>
						<label htmlFor="description" className="block text-sm font-medium leading-5 text-gray-700">
							Description
						</label>
						<div className="relative">
							<textarea
								ref={textAreaRef}
								id="description"
								rows="3"
								className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md resize-none focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 focus:ring sm:text-sm sm:leading-5"
								value={article.description}
								onChange={handleDescriptionChange}
								maxLength={200}
							></textarea>
							<div
								className={
									'absolute text-xs font-light text-gray-500 bottom-1 ' +
									(textAreaScroll ? 'right-6' : 'right-2')
								}
							>
								{200 - article.description.length}
							</div>
						</div>
					</div>
					<div>
						<div className="flex items-start">
							<div className="flex items-center h-5">
								<input
									id="published"
									type="checkbox"
									className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 focus:ring focus:ring-offset-0"
									value={article.published}
									checked={article.published}
									onChange={handlePublishedChange}
								></input>
							</div>
							<div className="ml-3 text-sm leading-5">
								<label htmlFor="published" className="font-medium text-gray-700">
									Publish
								</label>
								<p className="text-gray-400">This post will be available for everyone</p>
							</div>
						</div>
					</div>
					<div>
						<div className="flex items-start">
							<div className="flex items-center h-5">
								<input
									id="pinned"
									type="checkbox"
									className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 focus:ring focus:ring-offset-0"
									value={article.pinned}
									checked={article.pinned}
									onChange={handlePinnedChange}
								></input>
							</div>
							<div className="ml-3 text-sm leading-5">
								<label htmlFor="pinned" className="font-medium text-gray-700">
									Star
								</label>
								<p className="text-gray-400">Show this post at the top of your profile page</p>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-4 sm:flex-row-reverse sm:flex">
					<span className="flex w-full rounded-md shadow-sm sm:w-auto sm:ml-3">
						<Button type="submit" disabled={saveButtonDisabled} tabIndex={tabIndexSubmitButton}>
							{renderSubmitButtonChildren}
						</Button>
					</span>
					<span className="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
						<button
							onClick={onCancel}
							type="button"
							tabIndex={tabIndexCancelButton}
							className="inline-flex justify-center w-full px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
						>
							Cancel
						</button>
					</span>
				</div>
			</form>
		</div>
	);
}
