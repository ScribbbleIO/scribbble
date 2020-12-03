import Crypto from 'crypto';

import db from '../database.mjs';

export async function generateEmailToken() {
	return await generateToken('email', 48);
}

export async function generateSessionToken() {
	return await generateToken('session', 16);
}

async function generateToken(type, length = 16) {
	while (true) {
		let token = Crypto.randomBytes(length).toString('hex');
		let result = await db.get('SELECT value FROM tokens WHERE value = ? AND type = ?', token, type);
		if (result == undefined) {
			return token;
		}
	}
}
