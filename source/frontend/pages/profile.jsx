import React from 'react';
import { Link } from 'react-sprout';
import StarIcon from '../icons/star.jsx';
import FooterSmall from '../components/footer/footer-small.jsx';
import ProfileHeader from '../components/headers/profile-header.jsx';

import parseDate from '../utils/date/parse.js';
import { sortArticles } from '../utils/sort.js';

export default function Profile(props) {
	let { user, articles } = props;

	let renderArticlesPreviews = [];
	articles = articles.sort(sortArticles);
	for (let article of articles) {
		renderArticlesPreviews.push(<ArticlePreview key={article.id} {...article} />);
	}

	return (
		<div className="flex flex-col min-h-full px-6 dark:bg-dark">
			<div className="flex-grow w-full max-w-lg mx-auto font-serif text-gray-700 dark:text-gray-200">
				<ProfileHeader username={user.username} />

				<Info {...user} />

				<section className="py-12 space-y-10 sm:space-y-12 sm:py-16">{renderArticlesPreviews}</section>
			</div>

			<FooterSmall />
		</div>
	);
}

function Info({ name, description, avatarUrl }) {
	let renderName;
	let renderAvatar;
	let renderDescription;
	let infoClassName = 'pt-12 sm:flex';
	let textClassName = 'flex flex-col text-center sm:text-left';
	if (name) {
		renderName = <h1 className="text-4xl font-semibold text-blue-500">{name}</h1>;

		if (description) {
			renderDescription = <p className="text-gray-500 dark:text-gray-400 sm:text-lg">{description}</p>;
		} else {
			infoClassName += ' sm:items-center';
		}

		if (avatarUrl) {
			renderAvatar = (
				<div className="relative flex-none mx-auto overflow-hidden rounded-full w-28 h-28 sm:mx-0">
					<img className="object-cover w-full h-full select-none" src={avatarUrl} alt="avatar" />
					<div className="absolute inset-0 rounded-full shadow-avatar dark:shadow-avatar-dark"></div>
				</div>
			);
			textClassName += ' sm:ml-6 mt-4 sm:mt-0';
		}
	} else {
		return null;
	}

	return (
		<section className={infoClassName}>
			{renderAvatar}
			<div className={textClassName}>
				{renderName}
				{renderDescription}
			</div>
		</section>
	);
}

function ArticlePreview({ title, pinnedAt, publishedAt, description, slug }) {
	let renderDescription;
	if (description != undefined && description !== '') {
		renderDescription = <p className="mt-2 text-justify text-gray-600 dark:text-gray-300">{description}</p>;
	}

	let renderInfo;
	if (pinnedAt != undefined) {
		renderInfo = (
			<p className="flex items-center text-sm text-gray-400 dark:text-gray-600">
				<StarIcon className="w-4 h-4 -ml-1 text-gray-300 dark:text-gray-700" />
				<span className="ml-1">{parseDate(pinnedAt)}</span>
			</p>
		);
	} else {
		renderInfo = <p className="text-sm text-gray-400 dark:text-gray-600">{parseDate(publishedAt)}</p>;
	}

	return (
		<article className="flex flex-col">
			<Link
				to={`${slug}/`}
				className="text-2xl font-semibold leading-snug text-gray-700 truncate sm:text-3xl hover:text-gray-900 dark:text-gray-200 dark-hover:text-white"
			>
				{title}
			</Link>
			{renderInfo}
			{renderDescription}
			<Link to={`${slug}/`} className="inline-block mt-2 text-blue-500 hover:underline">
				Read more
			</Link>
		</article>
	);
}
