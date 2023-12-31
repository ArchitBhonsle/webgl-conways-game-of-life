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

const GLIDER_GUN = `
........................X...........................................................................
......................X.X...........................................................................
............XX......XX............XX................................................................
...........X...X....XX............XX................................................................
XX........X.....X...XX..............................................................................
XX........X...X.XX....X.X...........................................................................
..........X.....X.......X...........................................................................
...........X...X....................................................................................
............XX......................................................................................
`
function arrayFromText(text: string) {
    return text.trim().split('\n').map(line => line.split('').map(cell => cell == 'X' ? 1 : 0));
}
export function gliderGun(set: SetFn, i: number, j: number) {
    drawShape(set, i, j, arrayFromText(GLIDER_GUN));
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
