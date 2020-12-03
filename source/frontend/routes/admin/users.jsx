import React from 'react';
import { useData } from 'react-sprout';
import { get } from '../../utils/rest';

import Users from '../../pages/admin/users';

export async function getUsersData() {
	return await get('/api/admin/users');
}

export default function AdminRoute() {
	let { user, users } = useData();

	return <Users user={user} users={users} />;
}
