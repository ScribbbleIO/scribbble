import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-sprout';
import SearchIcon from '../../icons/search.jsx';

import UserIcon from '../../icons/user.jsx';

import parseDate, { parseDatetime } from '../../utils/date/parse.js';

export default function Users(props) {
	let { users, totalUsers, hasMore } = props;
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

		navigate(`users?type=${type}${pageParam}${searchParam}`, { replace: true, sticky: true });
	}

	function handleNextClick() {
		let newPage = page + 1;
		let pageParam = newPage !== 1 ? `&page=${newPage}` : '';
		let searchParam = search !== '' ? `&search=${search}` : '';

		navigate(`users?type=${type}${pageParam}${searchParam}`, { replace: true, sticky: true });
	}

	function handleSearchChange(event) {
		let newSearch = event.target.value;

		let searchParam = newSearch !== '' ? `&search=${newSearch}` : '';

		setSearch(newSearch);
		navigate(`users?type=${type}${searchParam}`, { replace: true, sticky: true });
	}

	let renderUsers;
	if (users.length) {
		let renderUsersList = [];
		for (let user of users) {
			let renderName;
			let renderImage;

			let hasPublishedArticle = user.totalPublishedArticles > 0;

			if (user.username && hasPublishedArticle) {
				renderName = (
					<Link
						to={`/${user.username}/`}
						className="text-sm font-medium text-gray-900 truncate hover:underline"
					>
						{user.name ?? user.username}
					</Link>
				);
			} else {
				renderName = (
					<p className="text-sm font-medium text-gray-900 truncate">
						{user.name ?? user.username ?? user.email}
					</p>
				);
			}

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

			renderUsersList.push(
				<tr className="bg-white" key={user.id}>
					<td className="flex items-center px-6 py-3">
						<div className="relative flex-none flex-shrink-0 overflow-hidden rounded-full w-7 h-7">
							{renderImage}
							<div className="absolute inset-0 rounded-full shadow-avatar"></div>
						</div>
						<div className="ml-4 truncate">{renderName}</div>
					</td>
					<td>
						<div className="flex items-center px-6 py-3 text-sm font-medium text-gray-500">
							<div className="flex items-center">
								<svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="ml-1">{user.totalPublishedArticles}</span>
							</div>
							<div className="flex items-center ml-3">
								<svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
									<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
								</svg>
								<span className="ml-1">{user.totalDraftArticles}</span>
							</div>
						</div>
					</td>
					<td className="px-6 py-3 text-sm text-gray-500">{parseDate(user.createdAt)}</td>
					<td className="px-6 py-3 text-sm text-right text-gray-500">
						{user.lastSeenAt ? parseDatetime(user.lastSeenAt) : ''}
					</td>
				</tr>,
			);
		}

		renderUsers = (
			<>
				<table className="min-w-full divide-y divide-gray-200">
					<thead>
						<tr>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
								Name
							</th>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
								Articles
							</th>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
								Joined on
							</th>
							<th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase bg-gray-50">
								Last online
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">{renderUsersList}</tbody>
				</table>
				<nav
					className="flex items-center justify-between w-full px-4 py-3 bg-white border-t border-gray-200 sm:px-6"
					aria-label="Pagination"
				>
					<div className="hidden sm:block">
						<p className="text-sm text-gray-700">
							Showing&nbsp;
							<span className="font-medium">{totalUsers > 0 ? (page - 1) * 10 + 1 : 0}</span>
							&nbsp;to&nbsp;
							<span className="font-medium">{totalUsers > 10 ? page * 10 : totalUsers}</span>
							&nbsp;of&nbsp;
							<span className="font-medium">{totalUsers}</span>
							&nbsp;results
						</p>
					</div>
					<div className="flex justify-between flex-1 flex-grow sm:justify-end">
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
		renderUsers = (
			<div className="flex flex-col items-center col-span-5 py-6 space-y-6 bg-white sm:py-12">
				<div className="flex items-center justify-center p-4 bg-gray-100 rounded-full">
					<SearchIcon className="w-8 h-8 text-gray-300" />
				</div>
				<div className="flex flex-col items-center space-y-3">
					<p className="text-sm leading-5 text-gray-300">No users found</p>
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
			<div className="mt-4 overflow-hidden overflow-x-auto rounded-lg shadow">{renderUsers}</div>
		</>
	);
}
