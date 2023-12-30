import './style.css';
import getStep from './compute.ts';
import getPaint from './paint.ts';

const canvas = document.getElementById("main") as HTMLCanvasElement;

const scale = 10;
const height = Math.floor(canvas.clientHeight / scale);
const width = Math.floor(canvas.clientWidth / scale);
const realHeight = height + 2;
const realWidth = width + 2;
const data = new Uint8Array(realHeight * realWidth);
for (let i = 1; i <= height; ++i) {
    for (let j = 1; j <= width; ++j) {
        data[i * (realWidth) + j] = Math.random() < 0.5 ? 1 : 0;
    }
}

const paint = getPaint(canvas, data, height, width);
const step = getStep(data, height, width);

const fps = 10;
const delta = 1000 / fps;
let lastPaint = 0;
function animate(now: number) {
    if (now - lastPaint > delta) {
        lastPaint = now;
        paint();
        step();
    }
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate)
