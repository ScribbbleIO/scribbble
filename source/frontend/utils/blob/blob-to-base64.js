export default function blobToBase64(blob) {
	return new Promise(function (resolve) {
		let reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.addEventListener('loadend', function () {
			resolve(reader.result);
		});
	});
}
