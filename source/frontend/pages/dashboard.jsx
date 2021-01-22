import React, { useState, useEffect } from 'react';
import { useData, Link, useNavigate } from 'react-sprout';

import CogIcon from '../icons/cog';
import StarIcon from '../icons/star';
import PencilIcon from '../icons/pencil';

import parseDate from '../utils/date/parse';
import { useScreenSizeIndex } from '../hooks/use-screen-size';
import Scribbble from '../components/logo/scribbble';
import { get } from '../utils/rest';
import ArticleOptionsModal from '../components/modals/article-options';
import EditProfileModal from '../components/modals/edit-profile';
import TrashIcon from '../icons/trash';
import DeleteArticleModal from '../components/modals/delete-article';
import { sortArticles } from '../utils/sort';
import LinkIcon from '../icons/link';
import useRendered from '../hooks/use-rendered';
import ProfileMenu from '../components/profile-menu';

const baseUrl = window.location.protocol + '//' + window.location.host;

export async function getDashboardData() {
	let promises = [await get('/api/profile'), await get('/api/articles')];
	let [user, articles] = await Promise.all(promises);

	return { user, articles };
}

export default function Dashboard() {
	let navigate = useNavigate();
	let { user: initialUser, articles: initialArticles } = useData();
	let [user, setUser] = useState(initialUser);
	let [articles, setArticles] = useState(initialArticles);
	let [profileMenu, setProfileMenu] = useState(false);
	let [profileModal, setProfileModal] = useState(false);
	let [editModal, setEditModal] = useState(false);
	let [articleIdToEdit, setArticleIdToEdit] = useState();
	let [deleteModal, setDeleteModal] = useState(false);
	let [articleIdToDelete, setArticleIdToDelete] = useState();

	useEffect(() => {
		document.title = 'Dashboard - Scribbble';
		document.body.classList.add('bg-gray-50');
		document.addEventListener('keyup', closeProfileEventListener);

		return () => {
			document.title = 'Scribbble';
			document.body.classList.remove('bg-gray-50');
			document.removeEventListener('keyup', closeProfileEventListener);
		};
	}, []);

	function handleProfileClick() {
		setProfileMenu(!profileMenu);
	}

	function closeProfileEventListener(event) {
		if (event.key === 'Escape') {
			setProfileMenu(false);
		}
	}

	function handleEditProfileClick() {
		setProfileModal(true);
		setProfileMenu(false);
	}

	function handleEditArticleDetailsClick(articleId) {
		setEditModal(true);
		setArticleIdToEdit(articleId);
	}

	function handleDeleteArticleClick(articleId) {
		setDeleteModal(true);
		setArticleIdToDelete(articleId);
	}

	function handleSubmitEditArticle(article) {
		let newArticles = articles.filter((a) => a.id !== article.id);
		newArticles.push(article);
		setArticles(newArticles);
		setEditModal(false);
		setArticleIdToEdit();
	}

	function handleCancelEditArticle() {
		setEditModal(false);
		setArticleIdToEdit();
	}

	function handleSubmitDeleteArticle(article) {
		setDeleteModal(false);
		setArticleIdToDelete();
		let newArticles = articles.filter((a) => a.id !== article.id);
		setArticles(newArticles);
	}

	function handleCancelDeleteArticle() {
		setDeleteModal(false);
		setArticleIdToDelete();
	}

	function handleSubmitEditProfile(user) {
		setUser(user);
		setProfileModal(false);
	}

	async function handleLogoutClick() {
		// Remove session token in database
		let response = await fetch('/api/tokens', { method: 'DELETE' });
		if (response.ok) {
			// Remove cookie
			document.cookie = 'id=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			localStorage.removeItem('article');
			navigate('/');
		}
	}

	let renderArticlesList = [];
	articles = articles.sort(sortArticles);
	for (let article of articles) {
		renderArticlesList.push(
			<ArticleListItem
				key={article.id}
				username={user.username}
				{...article}
				onSettingsClick={() => handleEditArticleDetailsClick(article.id)}
				onDeleteClick={() => handleDeleteArticleClick(article.id)}
			/>,
		);
	}

	let addArticleButtonHidden = false;
	if (!renderArticlesList.length) {
		addArticleButtonHidden = true;
		renderArticlesList = (
			<div className="flex flex-col items-center col-span-5 py-6 space-y-6 sm:py-12">
				<div className="flex items-center justify-center p-4 bg-gray-100 rounded-full">
					<PencilIcon className="w-8 h-8 text-gray-300" />
				</div>
				<div className="flex flex-col items-center space-y-3">
					<p className="text-sm leading-5 text-gray-300">No posts yet. Start writing!</p>
					<Link
						to="/new"
						className="px-4 py-3 text-sm font-medium leading-5 text-white bg-blue-500 rounded-md focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
					>
						Write
					</Link>
				</div>
			</div>
		);
	}

	let screenSizeIndex = useScreenSizeIndex();
	let articlesListStyle = {};
	if (screenSizeIndex > 2) {
		articlesListStyle = {
			gridTemplateColumns: 'max-content minmax(0, 1fr) max-content max-content',
		};
	}

	let renderArticleDetailsModal;
	if (editModal) {
		let article = articles.find((a) => a.id === articleIdToEdit);
		renderArticleDetailsModal = (
			<ArticleOptionsModal
				username={user.username}
				{...article}
				onSubmit={handleSubmitEditArticle}
				onCancel={handleCancelEditArticle}
				isEditingArticleDetails={true}
			/>
		);
	}

	let renderDeleteArticleModal;
	if (deleteModal) {
		let article = articles.find((a) => a.id === articleIdToDelete);
		renderDeleteArticleModal = (
			<DeleteArticleModal
				article={article}
				onSubmit={handleSubmitDeleteArticle}
				onCancel={handleCancelDeleteArticle}
			/>
		);
	}

	let renderEditProfileModal;
	if (profileModal) {
		renderEditProfileModal = (
			<EditProfileModal
				username={user.username}
				initialName={user.name}
				initialDescription={user.description}
				initialAvatarUrl={user.avatarUrl}
				onSubmit={handleSubmitEditProfile}
				onCancel={() => setProfileModal(false)}
			/>
		);
	}

	let renderEditProfileMenuButton;
	if (user.username) {
		renderEditProfileMenuButton = (
			<button
				onClick={handleEditProfileClick}
				className="w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
				role="menuitem"
			>
				Edit profile
			</button>
		);
	}

	let renderExportArticleMenuLink;
	if (articles.length) {
		renderExportArticleMenuLink = (
			<a
				href="/export"
				className="block w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
				role="menuitem"
			>
				Export data
			</a>
		);
	}

	let renderAdminMenuLink;
	if (user.admin) {
		renderAdminMenuLink = (
			<a
				href={window.location.protocol + '//admin.' + window.location.host}
				className="block w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
				role="menuitem"
			>
				Admin dashboard
			</a>
		);
	}

	return (
		<>
			{renderDeleteArticleModal}
			{renderEditProfileModal}
			{renderArticleDetailsModal}
			<div className="h-full px-6 overflow-auto font-sans bg-gray-50">
				<div
					className={(profileMenu ? 'fixed' : 'hidden') + ' inset-0 w-full h-full'}
					onClick={handleProfileClick}
				></div>
				<div className="max-w-4xl pt-6 mx-auto text-gray-700">
					<header className="flex items-center justify-between">
						<a href="/" className="text-xl text-gray-700">
							<Scribbble />
						</a>
						<div className="flex items-center space-x-4">
							<Link
								to="/new"
								hidden={addArticleButtonHidden}
								className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 focus:border-blue-300"
							>
								Write
							</Link>

							<ProfileMenu user={user}>
								{renderAdminMenuLink}
								{renderExportArticleMenuLink}
								{renderEditProfileMenuButton}
								<button
									onClick={handleLogoutClick}
									className="w-full px-4 py-2 text-sm leading-5 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
									role="menuitem"
								>
									Log out
								</button>
							</ProfileMenu>
						</div>
					</header>

					<div className="py-6">
						<section className="bg-white rounded shadow">
							<div className="grid p-4 gap-y-6 gap-x-2 sm:p-6 items-y-center" style={articlesListStyle}>
								{renderArticlesList}
							</div>
						</section>
					</div>
				</div>
			</div>
		</>
	);
}

function Copied(props) {
	let { onTransitionEnd } = props;

	let rendered = useRendered();

	let copiedClassName =
		'absolute text-xs font-light text-blue-500 mb-8 transition-all pointer-events-none ease-in transform duration-700';
	if (rendered) {
		copiedClassName += ' -translate-y-3 opacity-0';
	}

	return (
		<p className={copiedClassName} onTransitionEnd={onTransitionEnd}>
			Copied!
		</p>
	);
}

function ArticleListItem(props) {
	let { username, title, slug, published, publishedAt, pinnedAt, onSettingsClick, onDeleteClick } = props;
	let [copiedElements, setCopiedElements] = useState([]);
	let starColor = pinnedAt != undefined ? 'text-blue-500' : 'text-gray-200';

	async function handleLinkIconClick() {
		let key = `${Math.random()}`;
		function handleTransitionEnd() {
			setCopiedElements(function (copiedElements) {
				return copiedElements.filter((e) => e.key !== key);
			});
		}

		let copyElement = <Copied key={key} onTransitionEnd={handleTransitionEnd} />;

		setCopiedElements([...copiedElements, copyElement]);
		let url = `${baseUrl}/${username}/${slug}/`;
		await navigator.clipboard.writeText(url);
	}

	let renderStar = <StarIcon className={starColor + ' -ml-1 w-5 h-5'} />;
	let renderCog = (
		<button
			className="text-blue-500 hover:text-blue-800 focus:outline-none focus:text-blue-800"
			onClick={onSettingsClick}
		>
			<CogIcon className="w-5 h-5" />
		</button>
	);

	let renderPencil = (
		<Link to={'/edit/' + slug} className="text-blue-500 hover:text-blue-800 focus:outline-none focus:text-blue-800">
			<PencilIcon className="w-5 h-5" />
		</Link>
	);

	let renderTrash = (
		<button
			className="text-blue-500 hover:text-red-500 focus:outline-none focus:text-red-500"
			onClick={onDeleteClick}
		>
			<TrashIcon className="w-5 h-5" />
		</button>
	);

	let renderTitle;
	if (published) {
		renderTitle = (
			<div className="flex items-center group">
				<Link
					to={`/${username}/${slug}/`}
					// We need to add a pr-1 for emojis in the title
					className="pr-1 text-sm font-medium leading-5 text-gray-500 truncate self-x-start"
				>
					{title}
				</Link>
				<div className="relative flex items-center justify-center ml-2">
					<button
						onClick={handleLinkIconClick}
						className="invisible w-4 h-4 text-xs font-light text-gray-300 focus:text-gray-500 group-hover:visible hover:text-gray-500 focus:outline-none"
					>
						<LinkIcon />
					</button>
					{copiedElements}
				</div>
			</div>
		);
	} else {
		renderTitle = (
			<Link
				to={`/preview/${slug}`}
				// We need to add a pr-1 for emojis in the title
				className="pr-1 text-sm font-medium leading-5 text-gray-500 truncate self-x-start"
			>
				{title}
			</Link>
		);
	}

	let screenSizeIndex = useScreenSizeIndex();
	if (screenSizeIndex > 2) {
		let renderDateOrDraft;
		if (!published) {
			renderDateOrDraft = (
				<span className="inline-flex px-2 mx-2 text-xs font-semibold leading-5 text-center text-gray-800 bg-gray-100 rounded-full self-x-end">
					draft
				</span>
			);
		} else {
			renderDateOrDraft = (
				<span className="mx-2 text-sm leading-5 text-right text-gray-400">{parseDate(publishedAt)}</span>
			);
		}

		return (
			<>
				{renderStar}
				{renderTitle}
				{renderDateOrDraft}
				<span className="flex items-center space-x-2">
					{renderPencil}
					{renderCog}
					{renderTrash}
				</span>
			</>
		);
	} else {
		let renderDate;
		let renderDraft;
		if (!published) {
			renderDraft = (
				<span className="inline-flex px-2 mx-2 text-xs font-semibold leading-5 text-center text-gray-800 bg-gray-100 rounded-full self-x-end">
					draft
				</span>
			);
		} else {
			renderDate = <span className="text-sm leading-5 text-gray-400">{parseDate(publishedAt)}</span>;
		}

		return (
			<div
				className="grid gap-x-2 items-y-center"
				style={{ gridTemplateColumns: 'max-content minmax(0, 1fr) max-content max-content' }}
			>
				{renderStar}
				<div className="flex flex-col justify-center ">
					{renderTitle}
					{renderDate}
				</div>
				{renderDraft}
				<span className="flex items-center col-start-4 space-x-2">
					{renderPencil}
					{renderCog}
					{renderTrash}
				</span>
			</div>
		);
	}
}
