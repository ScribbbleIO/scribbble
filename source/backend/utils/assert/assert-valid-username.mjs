export default function assertValidUsername(username) {
	let userRegex = /^[a-z0-9]+$/;
	if (!username.match(userRegex)) {
		throw new Error(`Username "${username}" is not valid`);
	}
}
