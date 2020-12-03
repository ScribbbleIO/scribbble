export function sortArticles(article1, article2) {
	if (article1.published && article2.published) {
		// Both published
		// Check if one of the articles is pinned
		if (!article1.pinnedAt && !article2.pinnedAt) {
			// Both not pinned
			// Return by publishedAt
			let diff = article2.publishedAt - article1.publishedAt;
			if (diff === 0) {
				return byTitle(article1, article2);
			} else {
				return diff;
			}
		} else if (article1.pinnedAt && !article2.pinnedAt) {
			// Only article 1 pinned
			return -1;
		} else if (!article1.pinnedAt && article2.pinnedAt) {
			// Only article 2 pinned
			return 1;
		}

		// Both pinned
		// Return by pinnedAt

		let diff = article2.pinnedAt - article1.pinnedAt;
		if (diff === 0) {
			return byTitle(article1, article2);
		} else {
			return diff;
		}
	} else if (article1.published) {
		return 1;
	} else if (article2.published) {
		return -1;
	}

	// Both draft
	return byPinned(article1, article2);
}

function byPinned(article1, article2) {
	if (article1.pinnedAt && !article2.pinnedAt) {
		// Only article 1 pinned
		return -1;
	} else if (!article1.pinnedAt && article2.pinnedAt) {
		// Only article 2 pinned
		return 1;
	}
	// Both pinned or both not pinned
	return byTitle(article1, article2);
}

function byTitle(article1, article2) {
	let title1 = article1.title;
	let title2 = article2.title;

	if (title1 < title2) {
		return -1;
	} else if (title1 > title2) {
		return 1;
	} else {
		return 0;
	}
}
