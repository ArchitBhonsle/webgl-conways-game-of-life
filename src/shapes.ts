export function createSetter(data: Uint8Array, height: number, width: number) {
    return function(i: number, j: number, val: number) {
        if (i < 0 || i > height || j < 0 || j > width) return;
        data[(i + 1) * (width + 2) + (j + 1)] = val;
    }
}

type SetFn = (i: number, j: number, val: number) => void;

export function drawShape(set: SetFn, i: number, j: number, shape: number[][]) {
    const nrows = shape.length;
    const ncols = shape[0].length;
    for (let x = 0; x < nrows; ++x) {
        for (let y = 0; y < ncols; ++y) {
            set(i + x, j + y, shape[x][y]);
        }
    }
}

export function brGlider(set: SetFn, i: number, j: number) {
    drawShape(set, i, j, [
        [0, 0, 1],
        [1, 0, 1],
        [0, 1, 1]
    ])
}

export function tlGlider(set: SetFn, i: number, j: number) {
    drawShape(set, i, j, [
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 0]
    ])
}
