import React from 'react';
import { useData } from 'react-sprout';
import { get } from '../../utils/rest';

import Users from '../../pages/admin/users.jsx';

export async function getUsersData(params, splats, urlSearch) {
	let searchParams = new URLSearchParams(urlSearch);

	let page = searchParams.get('page') ?? 1;
	let search = searchParams.get('search') ?? '';

	return await get(`/api/admin/users?page=${page}&search=${search}`);
}

export default function AdminRoute() {
	let { users, totalUsers, hasMore } = useData();

	return <Users users={users} totalUsers={totalUsers} hasMore={hasMore} />;
}
