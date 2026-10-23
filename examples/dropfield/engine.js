export const WIDTH = 10;
export const HEIGHT = 20;
export const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
];

// Pure game rules: no DOM, persistence, network, or animation clock.
export class Game {
  constructor(random = Math.random) {
    this.random = random;
    this.board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
    this.bag = [];
    this.score = 0;
    this.lines = 0;
    this.over = false;
    this.next = this.draw();
    this.spawn();
  }
  get level() { return 1 + Math.floor(this.lines / 10); }
  get interval() { return Math.max(90, 800 * 0.8 ** (this.level - 1)); }
  draw() {
    if (!this.bag.length) {
      this.bag = SHAPES.map((_, i) => i);
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop();
  }
  spawn() {
    const type = this.next;
    this.next = this.draw();
    const shape = SHAPES[type].map(row => [...row]);
    this.piece = { type, shape, x: Math.floor((WIDTH - shape[0].length) / 2), y: 0 };
    if (!this.fits(this.piece)) this.over = true;
  }
  fits(piece) {
    return piece.shape.every((row, dy) => row.every((cell, dx) => {
      if (!cell) return true;
      const x = piece.x + dx, y = piece.y + dy;
      return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT && this.board[y][x] === 0;
    }));
  }
  move(dx, dy = 0) {
    if (this.over) return false;
    const candidate = { ...this.piece, x: this.piece.x + dx, y: this.piece.y + dy };
    if (!this.fits(candidate)) return false;
    this.piece = candidate;
    return true;
  }
  rotate() {
    if (this.over) return false;
    const old = this.piece.shape;
    const shape = old[0].map((_, x) => old.map(row => row[x]).reverse());
    // Small horizontal wall kicks; rotation never overwrites settled cells.
    for (const dx of [0, -1, 1, -2, 2]) {
      const candidate = { ...this.piece, shape, x: this.piece.x + dx };
      if (this.fits(candidate)) { this.piece = candidate; return true; }
    }
    return false;
  }
  step(soft = false) {
    if (this.over) return 0;
    if (this.move(0, 1)) { if (soft) this.score++; return 0; }
    return this.lock();
  }
  ghost() {
    const ghost = { ...this.piece };
    while (this.fits({ ...ghost, y: ghost.y + 1 })) ghost.y++;
    return ghost;
  }
  drop() {
    if (this.over) return 0;
    const ghost = this.ghost();
    this.score += 2 * (ghost.y - this.piece.y);
    this.piece = ghost;
    return this.lock();
  }
  lock() {
    if (this.over) return 0;
    this.piece.shape.forEach((row, dy) => row.forEach((cell, dx) => {
      if (cell) this.board[this.piece.y + dy][this.piece.x + dx] = this.piece.type + 1;
    }));
    const remaining = this.board.filter(row => !row.every(Boolean));
    const cleared = HEIGHT - remaining.length;
    this.score += [0, 100, 300, 500, 800][cleared] * this.level;
    this.lines += cleared;
    this.board = [...Array.from({ length: cleared }, () => Array(WIDTH).fill(0)), ...remaining];
    this.spawn();
    return cleared;
  }
}
