import React, { useState, useEffect } from 'react';

import UserIcon from '../icons/user';

export default function ProfileMenu(props) {
	let { user, children } = props;
	let [isProfileMenuActive, setIsProfileMenuActive] = useState(false);

	useEffect(() => {
		document.addEventListener('keyup', closeProfileEventListener);

		return () => {
			document.removeEventListener('keyup', closeProfileEventListener);
		};
	}, []);

	function closeProfileEventListener(event) {
		if (event.key === 'Escape') {
			setIsProfileMenuActive(false);
		}
	}

	function handleProfileMenuClick() {
		setIsProfileMenuActive(!isProfileMenuActive);
	}

	let renderImage;
	if (user.username && user.avatarUrl) {
		renderImage = (
			<img
				className="object-cover w-full h-full select-none"
				src={`https://scribbble.io/${user.username}/${user.avatarUrl}`}
			/>
		);
	} else {
		renderImage = (
			<div className="grid h-full items-x-center items-y-center">
				<UserIcon className="-mb-2 text-gray-300" style={{ width: '120%', heigth: '120%' }} />
			</div>
		);
	}

	let renderProfileInfo;
	if (user.username) {
		let renderProfilePageLink;
		if (user.hasPublishedArticle) {
			renderProfilePageLink = (
				<a
					href={`/${user.username}/`}
					target="_blank"
					rel="noreferrer"
					className="font-medium truncate hover:underline"
				>
					{user.name ?? user.username}
				</a>
			);
		} else {
			renderProfilePageLink = <span className="font-medium truncate">{user.name ?? user.username}</span>;
		}

		let renderNameInfo;
		if (user.name) {
			renderNameInfo = (
				<div className="flex flex-col truncate" style={{ lineHeight: 1.175 }}>
					{renderProfilePageLink}
					<span className="text-xs font-light text-gray-300">{user.username}</span>
				</div>
			);
		} else {
			renderNameInfo = renderProfilePageLink;
		}

		renderProfileInfo = (
			<div className="flex items-center px-4 py-3 space-x-2 border-b border-gray-100">{renderNameInfo}</div>
		);
	}

	return (
		<div>
			<div
				className={(isProfileMenuActive ? 'fixed' : 'hidden') + ' inset-0 w-full h-full'}
				onClick={handleProfileMenuClick}
			></div>
			<button
				onClick={handleProfileMenuClick}
				className="relative flex items-center justify-center overflow-hidden text-gray-400 rounded-full w-9 h-9 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 focus:bg-gray-100 hover:text-gray-600 focus:text-gray-600"
			>
				{renderImage}
				<div className="absolute inset-0 rounded-full shadow-avatar"></div>
			</button>
			<div hidden={!isProfileMenuActive} className="relative z-10 ml-3">
				<div
					className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg"
					role="menu"
					aria-orientation="vertical"
					aria-labelledby="user-menu"
				>
					{renderProfileInfo}
					<div className="py-1">{children}</div>
				</div>
			</div>
		</div>
	);
}
