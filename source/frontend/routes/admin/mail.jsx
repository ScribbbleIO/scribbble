import React from 'react';
import { useData } from 'react-sprout';
import Mail from '../../pages/admin/mail';
import { get } from '../../utils/rest';

export async function getMailData() {
	return await get('/api/profile');
}

export default function MailRoute() {
	let user = useData();

	return <Mail user={user} />;
}
