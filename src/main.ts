import './style.css';
import getStep from './compute.ts';
import getPaint from './paint.ts';
import { createSetter, brGlider, tlGlider } from './shapes.ts';

const canvas = document.getElementById("main") as HTMLCanvasElement;

const FPS = 10;
const SCALE = 10;

const height = Math.floor(canvas.clientHeight / SCALE);
const width = Math.floor(canvas.clientWidth / SCALE);
const realHeight = height + 2;
const realWidth = width + 2;
const data = new Uint8Array(realHeight * realWidth);
const set = createSetter(data, height, width);
for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
        if (Math.random() > 0.996)
            if (Math.random() > 0.5)
                brGlider(set, i, j);
            else
                tlGlider(set, i, j);
    }
}

const paint = getPaint(canvas, data, height, width);
const step = getStep(data, height, width);

// paint();
// window.addEventListener("keydown", e => {
//     if (e.key == ' ') {
//         console.log('press')
//         step();
//         paint();
//     }
// })
const delta = 1000 / FPS;
let lastPaint = 0;
paint();
function animate(now: number) {
    if (now - lastPaint > delta) {
        lastPaint = now;
        paint();
        step();
    }
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate)
