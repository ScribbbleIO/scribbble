import toBlob from '../canvas/canvas-to-blob';

export function resizeProfilePicture(file) {
	return new Promise(function (resolve) {
		let image = new Image();
		let canvas = document.createElement('canvas');

		canvas.width = 128;
		canvas.height = 128;

		image.src = URL.createObjectURL(file);
		image.addEventListener('load', async function () {
			let context = canvas.getContext('2d');
			let widthRatio = canvas.width / image.width;
			let heightRatio = canvas.height / image.height;
			let ratio = Math.max(widthRatio, heightRatio);

			let imageWidth = image.width * ratio;
			let imageHeight = image.height * ratio;

			let offsetX = Math.abs(canvas.width - imageWidth);
			let offsetY = Math.abs(canvas.height - imageHeight);

			context.drawImage(image, -offsetX / 2, -offsetY / 2, imageWidth, imageHeight);

			let blob = await toBlob(canvas, 'image/jpeg', 0.98);
			resolve(blob);
		});
	});
}

export function resizeArticlePicture(file) {
	return new Promise(function (resolve) {
		let image = new Image();
		let canvas = document.createElement('canvas');

		image.src = URL.createObjectURL(file);
		image.addEventListener('load', async function () {
			let context = canvas.getContext('2d');
			let canvasWidth = Math.min(image.width, 512);
			let canvasHeight = (image.height * canvasWidth) / image.width;

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			context.drawImage(image, 0, 0, canvasWidth, canvasHeight);

			let blob = await toBlob(canvas, 'image/jpeg', 0.98);
			resolve(blob);
		});
	});
}
