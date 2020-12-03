import React from 'react';

import UserIcon from '../../icons/user';
import Header from '../../components/admin/header';

import parseDate, { parseDatetime } from '../../utils/date/parse';

export default function Users(props) {
	let { user, users } = props;

	let renderUsers = [];
	for (let user of users) {
		let renderName;
		let renderImage;

		let hasPublishedArticle = user.totalPublishedArticles > 0;

		if (user.username && hasPublishedArticle) {
			renderName = (
				<a
					href={`https://scribbble.io/${user.username}/`}
					className="text-sm font-medium text-gray-900 truncate hover:underline"
				>
					{user.name ?? user.username}
				</a>
			);
		} else {
			renderName = (
				<p className="text-sm font-medium text-gray-900 truncate">{user.name ?? user.username ?? user.email}</p>
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

		renderUsers.push(
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

	return (
		<div className="h-full px-6 overflow-auto font-sans bg-gray-50">
			<div className="max-w-4xl pt-6 mx-auto text-gray-700">
				<Header user={user} />

				<div className="py-6">
					<div className="overflow-hidden overflow-x-auto rounded-lg shadow">
						<table className="min-w-full divide-y divide-gray-200 ">
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
							<tbody className="divide-y divide-gray-200">{renderUsers}</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
