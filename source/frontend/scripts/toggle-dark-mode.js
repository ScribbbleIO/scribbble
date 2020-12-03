{
	let html = document.documentElement;
	let darkMode = html.classList.contains('mode-dark');
	let toggle = document.querySelector('#toggle');
	if (toggle != undefined) {
		toggle.removeAttribute('hidden');
		toggle.addEventListener('click', function () {
			darkMode = !darkMode;

			if (darkMode) {
				html.classList.add('mode-dark');
			} else {
				html.classList.remove('mode-dark');
			}

			toggle.setAttribute('aria-checked', darkMode);

			// Update localstorage theme
			window.localStorage.setItem('dark-mode', darkMode);
		});
	}
}
