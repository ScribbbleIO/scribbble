const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export default function parseDate(date, short = false) {
	date = new Date(date);

	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();

	if (short) {
		return `${day}/${month}/${year}`;
	}

	return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
}

export function parseDatetime(datetime) {
	datetime = new Date(datetime);

	let hours = datetime.getHours();
	let minutes = datetime.getMinutes();
	let day = datetime.getDate();
	let month = datetime.getMonth() + 1;
	let year = datetime.getFullYear();

	return `${format(day)}/${format(month)}/${year} ${format(hours)}:${format(minutes)}`;
}

function format(number) {
	return number.toString().padStart(2, '0');
}
