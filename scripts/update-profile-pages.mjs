import Path from 'path';
import Sqlite3 from 'sqlite3';
import * as Sqlite from 'sqlite';
import updateProfilePage from '../source/backend/utils/generate/update-profile-page.mjs';

const production = process.env.NODE_ENV === 'production';
const databaseFileName = production ? 'production.sqlite' : 'development.sqlite';
const databaseFilePath = Path.resolve('database', databaseFileName);

console.log('⚠️  Did you transpile your frontend?'); // eslint-disable-line no-console
console.log(`🚧 Updating profile pages from database ${databaseFilePath}`); // eslint-disable-line no-console

let db = await Sqlite.open({ filename: databaseFilePath, driver: Sqlite3.Database });

let users = await db.all('SELECT * FROM users WHERE username IS NOT NULL');

for (let user of users) {
	await updateProfilePage(user.username);
}
