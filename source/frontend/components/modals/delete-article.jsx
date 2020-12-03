import React, { useState, useRef, useEffect } from 'react';
import Button from '../button';
import trapFocus from '../../utils/events/trap-focus';
import { useScreenSizeIndex } from '../../hooks/use-screen-size';
import Spinner from '../spinner';
import useLoadingState from '../../hooks/use-loading-state';

export default function DeleteArticleModal({ article, onSubmit, onCancel }) {
	let modalRef = useRef();
	let screenSizeIndex = useScreenSizeIndex();

	let [fetchArticle, fetchingArticle, pendingArticle] = useLoadingState(fetch);

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

	async function handleSubmit(event) {
		event.preventDefault();

		if (fetchingArticle) return;

		let fetchResult = await fetchArticle('/api/articles/' + article.id, {
			method: 'DELETE',
		});

		if (fetchResult.ok) {
			onSubmit(article);
		}
	}

	let tabIndexSubmitButton;
	let tabIndexCancelButton;
	if (screenSizeIndex === -1) {
		tabIndexSubmitButton = 1;
		tabIndexCancelButton = 2;
	} else {
		tabIndexSubmitButton = 2;
		tabIndexCancelButton = 1;
	}

	let renderSubmitButtonChildren = 'Delete';
	if (pendingArticle) {
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
				<div className="sm:flex sm:items-start">
					<div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
						<svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-headline">
							{`Delete post "${article.title}"`}
						</h3>
						<div className="mt-2">
							<p className="text-sm leading-5 text-gray-500">
								Are you sure you want to remove this post? This action cannot be undone.
							</p>
						</div>
					</div>
				</div>

				<div className="mt-4 sm:flex-row-reverse sm:flex">
					<span className="flex w-full rounded-md shadow-sm sm:w-auto sm:ml-3">
						<Button
							type="submit"
							disabled={fetchingArticle}
							color={Button.colors.red}
							tabIndex={tabIndexSubmitButton}
						>
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
