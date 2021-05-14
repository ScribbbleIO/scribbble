import React from 'react';
import { useSpring, animated } from 'react-spring';
import { Link } from 'react-sprout';
import UserGroupIcon from '../../icons/user-group';
import PencilIcon from '../../icons/pencil';
import GlobeIcon from '../../icons/globe';

import parseDate from '../../utils/date/parse';
import Header from '../../components/admin/header';

export default function Home(props) {
	let { user, usersData, articlesData, recentArticles } = props;

	let totalUsers = useSpring({ value: usersData.total, from: { value: 0 } });
	let todayUsers = useSpring({ value: usersData.today, from: { value: 0 } });

	let totalPublishedArticles = useSpring({ value: articlesData.published, from: { value: 0 } });
	let todayPublishedArticles = useSpring({ value: articlesData.publishedToday, from: { value: 0 } });

	let totalArticles = useSpring({ value: articlesData.total, from: { value: 0 } });
	let todayArticles = useSpring({ value: articlesData.today, from: { value: 0 } });

	let renderRecentArticles = [];
	for (let article of recentArticles) {
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

		renderRecentArticles.push(
			<tr className="bg-white" key={article.id}>
				<td className="w-full px-6 py-4 text-sm text-gray-900 max-w-0 whitespace-nowrap">
					{renderArticleTitle}
				</td>
				<td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{renderUser}</td>
				<td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{renderBadge}</td>
				<td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
					{parseDate(article.updatedAt)}
				</td>
			</tr>,
		);
	}

	return (
		<div className="h-full px-6 overflow-auto font-sans bg-gray-50">
			<div className="max-w-4xl pt-6 mx-auto text-gray-700">
				<Header user={user} />

				<div className="py-6">
					<h1 className="text-lg font-medium">Overview</h1>
					<div className="grid grid-cols-1 gap-4 mt-1 sm:grid-cols-2 md:grid-cols-3">
						<div className="overflow-hidden bg-white rounded-lg shadow">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<UserGroupIcon className="w-5 h-5 text-gray-400" />
									</div>
									<div className="flex-1 w-0 ml-5">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
											<dd>
												<animated.div className="text-lg font-medium text-gray-900">
													{totalUsers.value.interpolate((v) => Math.floor(v))}
												</animated.div>
											</dd>
										</dl>
									</div>
									<div className="font-medium text-blue-500">
										<span>+ </span>
										<animated.span>
											{todayUsers.value.interpolate((v) => Math.floor(v))}
										</animated.span>
									</div>
								</div>
							</div>
							<div className="px-5 py-3 bg-gray-50">
								<div className="text-sm">
									<Link to="users" className="font-medium text-blue-500 hover:text-blue-700">
										View all
									</Link>
								</div>
							</div>
						</div>

						<div className="overflow-hidden bg-white rounded-lg shadow">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<GlobeIcon className="w-5 h-5 text-gray-400" />
									</div>
									<div className="flex-1 w-0 ml-5">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												Published posts
											</dt>
											<dd>
												<div className="text-lg font-medium text-gray-900">
													<animated.div className="text-lg font-medium text-gray-900">
														{totalPublishedArticles.value.interpolate((v) => Math.floor(v))}
													</animated.div>
												</div>
											</dd>
										</dl>
									</div>
									<div className="font-medium text-blue-500">
										<span>+ </span>
										<animated.span>
											{todayPublishedArticles.value.interpolate((v) => Math.floor(v))}
										</animated.span>
									</div>
								</div>
							</div>

							<div className="px-5 py-3 bg-gray-50">
								<div className="text-sm">
									<Link
										to="articles?type=published"
										className="font-medium text-blue-500 hover:text-blue-700"
									>
										View all
									</Link>
								</div>
							</div>
						</div>

						<div className="overflow-hidden bg-white rounded-lg shadow">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<PencilIcon.Outline className="w-5 h-5 text-gray-400" />
									</div>
									<div className="flex-1 w-0 ml-5">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">Posts</dt>
											<dd>
												<animated.div className="text-lg font-medium text-gray-900">
													{totalArticles.value.interpolate((v) => Math.floor(v))}
												</animated.div>
											</dd>
										</dl>
									</div>
									<div className="font-medium text-blue-500">
										<span>+ </span>
										<animated.span>
											{todayArticles.value.interpolate((v) => Math.floor(v))}
										</animated.span>
									</div>
								</div>
							</div>

							<div className="px-5 py-3 bg-gray-50">
								<div className="text-sm">
									<Link
										to="articles?type=all"
										className="font-medium text-blue-500 hover:text-blue-700"
									>
										View all
									</Link>
								</div>
							</div>
						</div>
					</div>

					<div className="py-6">
						<h1 className="text-lg font-medium">Recent posts</h1>
						<div className="mt-1 overflow-hidden overflow-x-auto rounded-lg shadow">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr>
										<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">
											Name
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
								<tbody className="bg-white divide-y divide-gray-200">{renderRecentArticles}</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
