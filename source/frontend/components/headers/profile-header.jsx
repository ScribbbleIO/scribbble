import React from 'react';
import Toggle from '../toggle.jsx';
import RssIcon from '../../icons/rss.jsx';
import Scribbble from '../logo/scribbble.jsx';

export default function ProfileHeader(props) {
	let { username } = props;

	return (
		<header className="flex flex-col pt-6">
			<div className="flex items-center justify-between">
				<a href="/" className="text-xl text-gray-700 dark:text-gray-200">
					<Scribbble />
				</a>
				<div className="flex items-center">
					<a
						href={`/${username}/rss.xml`}
						title="rss"
						className="w-6 h-6 mr-4 text-gray-300 dark:text-gray-600 hover:text-blue-500"
					>
						<RssIcon />
					</a>
					<Toggle />
				</div>
			</div>
		</header>
	);
}
