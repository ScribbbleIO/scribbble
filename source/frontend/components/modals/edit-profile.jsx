import React, { useState, useEffect, useRef } from 'react';
import PencilIcon from '../../icons/pencil';
import Button from '../button';
import UserIcon from '../../icons/user';
import { resizeProfilePicture } from '../../utils/image/resize';
import trapFocus from '../../utils/events/trap-focus';
import { useScreenSizeIndex } from '../../hooks/use-screen-size';
import XIcon from '../../icons/x';
import Spinner from '../spinner';
import useLoadingState from '../../hooks/use-loading-state';

export default function EditProfileModal(props) {
	let { username, initialName, initialDescription, initialAvatarUrl, onSubmit, onCancel } = props;

	let modalRef = useRef();
	let screenSizeIndex = useScreenSizeIndex();
	let [name, setName] = useState(initialName || '');
	let [description, setDescription] = useState(initialDescription || '');
	let [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
	let [avatarFile, setAvatarFile] = useState();
	let [deleteAvatar, setDeleteAvatar] = useState(false);

	let [fetchProfile, fetchingProfile, pendingProfile] = useLoadingState(fetch);

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

	function handleNameChange(event) {
		setName(event.target.value);
	}

	function handleDescriptionChange(event) {
		setDescription(event.target.value);
	}

	function handleAvatarClick(event) {
		event.target.value = null;
	}

	function handleAvatarLabelKeyDown(event) {
		if (event.key === ' ') {
			event.currentTarget.click();
		}
	}

	function handleAvatarDeleteKeyDown(event) {
		if (event.key === ' ') {
			event.currentTarget.click();
		}
	}

	function handleAvatarDrop(event) {
		let file = event.dataTransfer.files[0];
		if (file.type === 'image/jpeg' || file.type === 'image/png') {
			event.preventDefault();
			handleAvatarUpload(file);
		}
	}

	async function handleAvatarChange(event) {
		let file = event.currentTarget.files[0];
		handleAvatarUpload(file);
	}

	async function handleAvatarUpload(file) {
		let resizedFile = await resizeProfilePicture(file);

		let url = URL.createObjectURL(resizedFile);

		setAvatarFile(resizedFile);
		setAvatarUrl(url);
		setDeleteAvatar(false);
	}

	function handleAvatarDeleteClick() {
		setDeleteAvatar(true);
		setAvatarUrl();
		setAvatarFile();
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (fetchingProfile) return;

		let formData = new FormData();
		formData.append('profile', JSON.stringify({ name, description }));
		if (avatarFile) {
			formData.append('avatar', avatarFile, `${avatarFile.name}.jpg`);
		}
		if (deleteAvatar) {
			formData.append('deleteAvatar', deleteAvatar);
		}

		let fetchResult = await fetchProfile('/api/profile', {
			method: 'PATCH',
			body: formData,
		});

		if (fetchResult.ok) {
			let { user } = await fetchResult.json();
			onSubmit(user);
		}
	}

	let renderImage;
	if (avatarUrl) {
		let source = initialAvatarUrl == avatarUrl ? `/${username}/${avatarUrl}` : `${avatarUrl}`;
		renderImage = <img className="object-cover w-full h-full select-none" src={source} />;
	} else {
		renderImage = (
			<div className="grid h-full items-x-center items-y-center">
				<UserIcon className="-mb-6 text-gray-300" style={{ width: '120%', heigth: '120%' }} />
			</div>
		);
	}

	let renderDeleteAvatarButton;
	if (avatarUrl) {
		renderDeleteAvatarButton = (
			<button
				type="button"
				onClick={handleAvatarDeleteClick}
				onKeyDown={handleAvatarDeleteKeyDown}
				className="absolute z-10 flex items-center justify-center w-6 h-6 text-gray-400 bg-white border border-gray-100 rounded-full shadow focus:border-blue-300 hover:text-gray-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 top-1 right-1"
			>
				<XIcon className="w-4 h-4" />
			</button>
		);
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

	let renderSubmitButtonChildren = 'Save';
	if (pendingProfile) {
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
				<div className="flex flex-col sm:flex-row sm:items-center">
					<div className="relative w-24 h-24 mx-auto sm:mx-0 sm:w-32 sm:h-32">
						{renderDeleteAvatarButton}
						<div
							className="relative w-full h-full overflow-hidden rounded-full"
							onDrop={handleAvatarDrop}
							onDragOver={(e) => e.preventDefault()}
						>
							{renderImage}
							<div className="absolute inset-0 rounded-full shadow-avatar"></div>
							<label
								tabIndex={0}
								htmlFor="avatar"
								onKeyDown={handleAvatarLabelKeyDown}
								className="absolute inset-x-0 bottom-0 bg-black opacity-25 focus:opacity-50 hover:opacity-50"
							>
								<PencilIcon className="w-4 h-4 mx-auto my-1 text-white" />
							</label>
							<input
								hidden
								id="avatar"
								type="file"
								accept="image/jpeg, image/png"
								onChange={handleAvatarChange}
								onClick={handleAvatarClick}
							></input>
						</div>
					</div>

					<div className="flex flex-col flex-grow mt-3 space-y-3 sm:ml-8 sm:mt-0">
						<div>
							<label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
								Name
							</label>
							<input
								id="name"
								type="text"
								className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm sm:leading-5"
								value={name}
								onChange={handleNameChange}
								placeholder="James Smith"
							></input>
						</div>

						<div>
							<label htmlFor="description" className="block text-sm font-medium leading-5 text-gray-700">
								Description
							</label>
							<div className="relative mt-1">
								<input
									id="description"
									type="text"
									className="block w-full px-3 py-2 pr-6 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm sm:leading-5"
									value={description}
									maxLength={80}
									onChange={handleDescriptionChange}
									placeholder="I'm a passionate web developer"
								></input>
								<div className="absolute text-xs font-light text-gray-500 bottom-1 right-2">
									{80 - description.length}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-4 sm:flex-row-reverse sm:flex">
					<span className="flex w-full rounded-md shadow-sm sm:w-auto sm:ml-3">
						<Button type="submit" disabled={pendingProfile} tabIndex={tabIndexSubmitButton}>
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
