import React, { useEffect } from 'react';
import Router from 'react-sprout';
import ScreenSize from './components/screen-size';

import NotFound from './pages/not-found';
import ErrorBoundary from './components/error-boundary';

import Home, { getHomeData } from './routes/admin/admin';
import Users, { getUsersData } from './routes/admin/users';
import Article, { getArticleData } from './routes/article';
import Mail, { getMailData } from './routes/admin/mail';
import Profile, { getProfileData } from './routes/profile';

const AdminRouter = Router(
	<ErrorBoundary>
		<Home path="." data={getHomeData} />
		<Mail path="mail" data={getMailData} />
		<Users path="users" data={getUsersData} />

		<Profile path=":username/" data={getProfileData} />
		<Article path="/:username/:slug/" data={getArticleData} />

		<NotFound path="*" />
	</ErrorBoundary>,
);

export default function Admin() {
	useEffect(() => {
		document.title = 'Admin - Scribbble';

		return () => {
			document.title = 'Scribbble';
		};
	}, []);

	return (
		<ScreenSize>
			<AdminRouter />
		</ScreenSize>
	);
}
