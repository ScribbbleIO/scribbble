import React, { useState, useEffect } from 'react';
import { useData } from 'react-sprout';
import { get } from '../../utils/rest';

import Home from '../../pages/admin/home';

export async function getHomeData() {
	return await get('/api/admin');
}

export default function AdminRoute() {
	let initialData = useData();
	let [data, setData] = useState(initialData);

	useEffect(() => {
		let interval = setInterval(async function () {
			let newData = await getHomeData();
			setData(newData);
		}, 1000 * 60 * 1); // Refetch admin data every 1 minutes

		return () => clearInterval(interval);
	}, []);

	return <Home {...data} />;
}
