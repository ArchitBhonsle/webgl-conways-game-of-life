import './style.css'

const canvas = document.getElementById("main") as HTMLCanvasElement;

const scale = 1;
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

const ctx = canvas.getContext('2d')!;
canvas.height = height;
canvas.width = width;
ctx.imageSmoothingEnabled = false;

function paint() {
    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < height; ++i) {
        for (let j = 0; j < width; ++j) {
            const d = data[((i + 1) * realWidth + (j + 1))] == 1 ? 255 : 0;
            const idx = (i * width + j) * 4;
            imageData.data[idx + 0] = d;
            imageData.data[idx + 1] = d;
            imageData.data[idx + 2] = d;
            imageData.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
const step = getStep();

const delta = 1000 / 30;
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

function getStep() {
    // printData();
    // function printData() {
    //     let str = "";
    //     for (let i = 0; i < realHeight; ++i) {
    //         for (let j = 0; j < realWidth; ++j) {
    //             str += `${data[i * realWidth + j]}\t`;
    //         }
    //         str += '\n';
    //     }
    //     console.log(str);
    // }

    const vs = `
attribute vec4 position;

void main() {
  gl_Position = position;
}
`;

    const fs = `
precision highp float;
 
uniform sampler2D srcTex;
uniform vec2 srcDimensions;
 
void main() {
  vec2 texcoord = gl_FragCoord.xy / srcDimensions;
  vec2 diff = vec2(255, 255) / (srcDimensions * 255.);

  float tl = texture2D(srcTex, texcoord + vec2(-diff.x, -diff.y)).x;
  float tr = texture2D(srcTex, texcoord + vec2(+diff.x, -diff.y)).x;
  float bl = texture2D(srcTex, texcoord + vec2(-diff.x, +diff.y)).x;
  float br = texture2D(srcTex, texcoord + vec2(+diff.x, +diff.y)).x;
  float t  = texture2D(srcTex, texcoord + vec2(0, -diff.y)).x;
  float b  = texture2D(srcTex, texcoord + vec2(0, +diff.y)).x;
  float l  = texture2D(srcTex, texcoord + vec2(-diff.x, 0)).x;
  float r  = texture2D(srcTex, texcoord + vec2(+diff.x, 0)).x;

  float n = tl + tr + bl + br + t + b + l + r;
  float c = texture2D(srcTex, texcoord).x;

  gl_FragColor = vec4(c);
  if (c == 0./255.) {
    if (abs(n - 3./255.) < 1e-5) {
        gl_FragColor = vec4(1./255.);
    }
  } else {
    if (n < 2./255. || n > 3./255.) {
        gl_FragColor = vec4(0./255.);
    }
  }
}
`;

    const canvas = document.createElement('canvas');
    canvas.width = realWidth;
    canvas.height = realHeight;
    const gl = canvas.getContext('webgl2')!;
    const program = createProgram(gl, vs, fs)!;

    const positionLoc = gl.getAttribLocation(program, 'position');
    const srcTexLoc = gl.getUniformLocation(program, 'srcTex');
    const srcDimensionsLoc = gl.getUniformLocation(program, 'srcDimensions');

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
    ]), gl.STATIC_DRAW);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(
        positionLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0,
    );

    function step() {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.LUMINANCE,
            realWidth,
            realHeight,
            0,
            gl.LUMINANCE,
            gl.UNSIGNED_BYTE,
            data
        );
        gl.useProgram(program);
        gl.uniform1i(srcTexLoc, 0);
        gl.uniform2f(srcDimensionsLoc, realWidth, realHeight);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const results = new Uint8Array(realHeight * realWidth * 4);
        gl.readPixels(0, 0, realWidth, realHeight, gl.RGBA, gl.UNSIGNED_BYTE, results);

        for (let i = 1; i <= height; ++i) {
            for (let j = 1; j <= width; ++j) {
                const idx = i * realWidth + j
                data[idx] = results[idx * 4];
            }
        }
    }

    function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
        var shader = gl.createShader(type);
        if (!shader) {
            return;
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    function createProgram(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
        var program = gl.createProgram();
        if (!program) {
            return;
        }
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        if (!vertexShader) {
            return;
        }
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!fragmentShader) {
            return;
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    return step;
}
