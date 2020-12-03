import Path from 'path';

import assertValidUsername from './assert-valid-username.mjs';

const contentDirectory = Path.resolve('content');

export default function assertAccessibleDirectoryForUsername(directory, username) {
	assertValidUsername(username);

	let userDirectory = Path.join(contentDirectory, username);
	let relativePath = Path.relative(userDirectory, directory);
	if (relativePath.startsWith('..')) {
		throw new Error(`Directory ${directory} is not an accessible directory for username "${username}"`);
	}
}
