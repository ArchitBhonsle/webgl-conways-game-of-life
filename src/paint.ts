export default function(canvas: HTMLCanvasElement, data: Uint8Array, height: number, width: number) {
    const ctx = canvas.getContext('2d')!;
    canvas.height = height;
    canvas.width = width;
    ctx.imageSmoothingEnabled = false;

    return function paint() {
        const imageData = ctx.createImageData(width, height);
        for (let i = 0; i < height; ++i) {
            for (let j = 0; j < width; ++j) {
                const d = data[((i + 1) * (width + 2) + (j + 1))] == 1 ? 255 : 0;
                const idx = (i * width + j) * 4;
                imageData.data[idx + 0] = d;
                imageData.data[idx + 1] = d;
                imageData.data[idx + 2] = d;
                imageData.data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }
}

