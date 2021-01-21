import React from 'react';
import { Link } from 'react-sprout';

import Toggle from '../toggle.jsx';
import Scribbble from '../logo/scribbble.jsx';
import { useIsStatic } from '../../hooks/use-is-static.js';
import PencilIcon from '../../icons/pencil.jsx';

export default function ArticleHeader(props) {
	let { slug } = props;
	let isStatic = useIsStatic();

	let renderHeaderButtons;
	if (!isStatic) {
		renderHeaderButtons = (
			<div className="flex items-center">
				<Link to={`/edit/${slug}`} className="mr-4">
					<PencilIcon className="w-5 h-5 text-blue-500" />
				</Link>
				<Toggle />
			</div>
		);
	} else {
		renderHeaderButtons = <Toggle />;
	}

	return (
		<header className="flex flex-col pt-6">
			<div className="flex items-center justify-between">
				<a href="/" className="text-xl text-gray-700 dark:text-gray-200">
					<Scribbble />
				</a>
				{renderHeaderButtons}
			</div>
		</header>
	);
}
