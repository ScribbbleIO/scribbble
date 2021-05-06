import React from 'react';
import { useData } from 'react-sprout';
import { get } from '../../utils/rest';

import Users from '../../pages/admin/users.jsx';

export async function getUsersData() {
	return await get('/api/admin/users?page=1');
}

export default function AdminRoute() {
	let { user, users, totalUsers, hasMore } = useData();

	return <Users user={user} users={users} totalUsers={totalUsers} hasMore={hasMore} />;
}
