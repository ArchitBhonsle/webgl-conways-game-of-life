import './style.css';
import getStep from './compute.ts';
import getPaint from './paint.ts';

const canvas = document.getElementById("main") as HTMLCanvasElement;

const FPS = 10;
const SCALE = 10;

const height = Math.floor(canvas.clientHeight / SCALE);
const width = Math.floor(canvas.clientWidth / SCALE);
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

const delta = 1000 / FPS;
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
