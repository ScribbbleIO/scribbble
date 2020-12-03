export default function toBlob(canvas, ...options) {
	return new Promise(function (resolve) {
		canvas.toBlob(resolve, ...options);
	});
}
