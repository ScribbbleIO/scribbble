import React from 'react';
import Router from 'react-sprout';
import ScreenSize from './components/screen-size';

import Home from './pages/home';
import Login from './pages/login';
import Email from './routes/email';
import NotFound from './pages/not-found';

import New, { getNewData } from './pages/new';
import Profile, { getProfileData } from './routes/profile';
import Article, { getArticleData } from './routes/article';
import Preview, { getPreviewData } from './routes/preview';
import Dashboard, { getDashboardData } from './pages/dashboard';
import Edit, { getEditData } from './pages/edit';
import ErrorBoundary from './components/error-boundary';

const ApplicationRouter = Router(
	<ErrorBoundary>
		<Home path="." />
		<Login path="login" />
		<Email path="email" />
		<Profile path=":username/" data={getProfileData} />
		<Article path=":username/:slug/" data={getArticleData} />
		<Dashboard path="dashboard" data={getDashboardData} />
		<New path="new" data={getNewData} />
		<Edit path="edit/:slug" data={getEditData} />
		<Preview path="preview/:slug/" data={getPreviewData} />

		<NotFound path="*" />
	</ErrorBoundary>,
);

function Application() {
	return (
		<ScreenSize>
			<ApplicationRouter />
		</ScreenSize>
	);
}

export default Application;
