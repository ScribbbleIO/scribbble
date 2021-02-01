import React from 'react';
import { Link } from 'react-sprout';

import FooterSmall from '../components/footer/footer-small.jsx';
import ArticleHeader from '../components/headers/article-header.jsx';

import parseDate from '../utils/date/parse.js';

export default function Article(props) {
	let { title, author, slug, publishedAt, children } = props;

	return (
		<div className="flex flex-col min-h-full px-6 dark:bg-dark">
			<div className="flex-grow w-full max-w-xl mx-auto font-serif text-gray-700 dark:text-gray-200">
				<ArticleHeader username={author.username} slug={slug} />

				<article className="pt-8">
					<div className="space-y-4">
						<h1 className="text-3xl font-semibold leading-loose break-words line-clamp-3 sm:text-4xl dark:text-gray-50">
							{title}
						</h1>
						<Info {...author} publishedAt={publishedAt} />
					</div>

					<div className="pt-12 pb-20">
						<div className="flex flex-col space-y-6 leading-relaxed article">{children}</div>
					</div>
				</article>
			</div>
			<FooterSmall />
		</div>
	);
}

function Info(props) {
	let { username, name, avatarUrl, publishedAt, hasPublishedArticle } = props;
	let renderAvatar;

	let renderProfileLink;
	if (username != undefined && hasPublishedArticle > 0) {
		renderProfileLink = (
			<Link to={`/${username}/`} className="text-lg text-blue-500 sm:text-base hover:underline">
				{name ?? username}
			</Link>
		);
	}

	if (avatarUrl) {
		renderAvatar = (
			<div className="relative flex-none w-12 h-12 overflow-hidden rounded-full">
				<img
					alt="avatar"
					src={`/${username}/${avatarUrl}`}
					className="object-cover w-full h-full select-none"
				/>
				<div className="absolute inset-0 rounded-full shadow-avatar dark:shadow-avatar-dark"></div>
			</div>
		);
	}

	return (
		<div className="flex items-center space-x-4">
			{renderAvatar}
			<div className="flex flex-col items-start">
				{renderProfileLink}
				<time dateTime="2020-07-14" className="text-gray-400 dark:text-gray-600">
					{parseDate(publishedAt)}
				</time>
			</div>
		</div>
	);
}
