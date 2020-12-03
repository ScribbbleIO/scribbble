import React from 'react';
import { Link, useNavigate } from 'react-sprout';

import Scribbble from '../logo/scribbble';
import ProfileMenu from '../profile-menu';

let development = (import.meta.env?.MODE ?? process?.env?.NODE_ENV ?? 'development') === 'development';

export default function Header(props) {
	let { user } = props;
	let navigate = useNavigate();

	async function handleLogoutClick() {
		// Remove session token in database
		let response = await fetch('/api/tokens', { method: 'DELETE' });
		if (response.ok) {
			// Remove cookie
			document.cookie = 'id=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			localStorage.removeItem('article');
			navigate('/');
		}
	}

	return (
		<header className="flex items-center justify-between">
			<Link to="/" className="text-xl text-gray-700">
				<Scribbble />
			</Link>

			<ProfileMenu user={user}>
				<a
					href={development ? 'http://localhost:8080/dashboard' : 'https://scribbble.io/dashboard'}
					className="block w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
					role="menuitem"
				>
					User dashboard
				</a>
				<button
					onClick={handleLogoutClick}
					className="w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
					role="menuitem"
				>
					Log out
				</button>
			</ProfileMenu>
		</header>
	);
}
