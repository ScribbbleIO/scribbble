import React from 'react';
import { useData } from 'react-sprout';

import { get } from '../utils/rest';
import Profile from '../pages/profile.jsx';

export async function getProfileData({ username }) {
	return await get(`/api/users/${username}/articles`);
}

export default function ProfileRoute() {
	let { user, articles } = useData();

	return <Profile user={user} articles={articles}></Profile>;
}
