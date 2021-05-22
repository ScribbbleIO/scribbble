import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-sprout';
import SearchIcon from '../../icons/search';

import parseDate from '../../utils/date/parse';

export default function Articles(props) {
	let { articles, totalArticles, hasMore } = props;
	let navigate = useNavigate();
	let location = useLocation();
	let [search, setSearch] = useState(function () {
		let searchParams = new URLSearchParams(location.search);
		return searchParams.get('search') ?? '';
	});

	let searchParams = new URLSearchParams(location.search);
	let type = searchParams.get('type');
	if (type == undefined) {
		type = 'all';
	}

	let page = searchParams.get('page') ?? 1;
	if (page != undefined) {
		page = parseInt(page, 10);
	}

	function handlePreviousClick() {
		let newPage = page - 1;
		let pageParam = page !== 1 ? `&page=${newPage}` : '';
		let searchParam = search !== '' ? `&search=${search}` : '';

		navigate(`articles?type=${type}${pageParam}${searchParam}`, { replace: true, sticky: true });
	}

	function handleNextClick() {
		let newPage = page + 1;
		let pageParam = newPage !== 1 ? `&page=${newPage}` : '';
		let searchParam = search !== '' ? `&search=${search}` : '';

		navigate(`articles?type=${type}${pageParam}${searchParam}`, { replace: true, sticky: true });
	}

	function handleSearchChange(event) {
		let newSearch = event.target.value;

		let searchParam = newSearch !== '' ? `&search=${newSearch}` : '';

		setSearch(newSearch);
		navigate(`articles?type=${type}${searchParam}`, { replace: true, sticky: true });
	}

	let renderArticles;
	if (articles.length) {
		let renderArticlesList = [];
		for (let article of articles) {
			let user = article.user;

			let renderArticleTitle;
			let renderBadge;

			renderArticleTitle = (
				<Link
					to={`/${user.username}/${article.slug}/`}
					className="w-full text-sm truncate max-w-0 whitespace-nowrap"
				>
					<p className="text-gray-500 truncate hover:underline">{article.title}</p>
				</Link>
			);

			if (article.published) {
				renderBadge = (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						published
					</span>
				);
			} else {
				renderBadge = (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						draft
					</span>
				);
			}

			let renderUser;
			if (user.hasPublishedArticle) {
				renderUser = (
					<Link to={`/${user.username}/`} className="text-sm truncate">
						<p className="text-gray-500 truncate hover:underline">{user.name ?? user.username}</p>
					</Link>
				);
			} else {
				renderUser = `${user.name ?? user.username ?? user.email}`;
			}

			renderArticlesList.push(
				<tr className="bg-white" key={article.id}>
					<td className="w-full max-w-sm px-6 py-4 text-sm text-gray-900 truncate whitespace-nowrap">
						{renderArticleTitle}
					</td>
					<td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{renderUser}</td>
					<td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{renderBadge}</td>
					<td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
						{parseDate(article.createdAt)}
					</td>
				</tr>,
			);
		}

		renderArticles = (
			<>
				<table className="min-w-full divide-y divide-gray-200">
					<thead>
						<tr>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
								Title
							</th>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
								User
							</th>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
								Type
							</th>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase bg-gray-50">
								Date
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">{renderArticlesList}</tbody>
				</table>
				<nav
					className="flex items-center justify-between w-full px-4 py-3 bg-white border-t border-gray-200 sm:px-6"
					aria-label="Pagination"
				>
					<div className="hidden sm:block">
						<p className="text-sm text-gray-700">
							Showing&nbsp;
							<span className="font-medium">{totalArticles > 0 ? (page - 1) * 10 + 1 : 0}</span>
							&nbsp;to&nbsp;
							<span className="font-medium">{totalArticles > 10 ? page * 10 : totalArticles}</span>
							&nbsp;of&nbsp;
							<span className="font-medium">{totalArticles}</span>
							&nbsp;results
						</p>
					</div>
					<div className="flex justify-between flex-1 flex-grow w-full sm:justify-end">
						<button
							disabled={page <= 1}
							onClick={handlePreviousClick}
							className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm disabled:cursor-not-allowed focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 focus:border-blue-300"
						>
							Previous
						</button>
						<button
							disabled={!hasMore}
							onClick={handleNextClick}
							className="px-3 py-2 ml-3 text-sm bg-white border border-gray-300 rounded-md shadow-sm disabled:cursor-not-allowed focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 focus:border-blue-300"
						>
							Next
						</button>
					</div>
				</nav>
			</>
		);
	} else {
		renderArticles = (
			<div className="flex flex-col items-center col-span-5 py-6 space-y-6 bg-white sm:py-12">
				<div className="flex items-center justify-center p-4 bg-gray-100 rounded-full">
					<SearchIcon className="w-8 h-8 text-gray-300" />
				</div>
				<div className="flex flex-col items-center space-y-3">
					<p className="text-sm leading-5 text-gray-300">No articles found</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div>
				<label htmlFor="search" className="block text-sm font-medium leading-5 text-gray-700 sr-only">
					Search
				</label>
				<div className="relative flex items-center mt-1 rounded-md">
					<svg className="absolute w-5 h-5 text-gray-400 left-3" viewBox="0 0 20 20" fill="currentColor">
						<path
							fillRule="evenodd"
							d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
							clipRule="evenodd"
						/>
					</svg>
					<input
						id="title"
						type="text"
						className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm sm:leading-5"
						placeholder="Search..."
						value={search}
						onChange={handleSearchChange}
					></input>
				</div>
			</div>

			<div className="mt-4 overflow-hidden overflow-x-auto rounded-lg shadow">{renderArticles}</div>
		</>
	);
}
