{
	let darkMode = window.localStorage.getItem('dark-mode');
	if (darkMode == undefined) {
		darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	} else {
		darkMode = JSON.parse(darkMode);
	}

	if (darkMode) {
		document.documentElement.classList.add('mode-dark');
	} else {
		document.documentElement.classList.remove('mode-dark');
	}
}
