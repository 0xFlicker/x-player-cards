import { describe, expect, test } from 'bun:test';
import { Game, HEIGHT, WIDTH } from '../examples/dropfield/engine.js';

describe('falling-block rules', () => {
  test('each bag provides all seven shapes', () => {
    const game = new Game(() => .5);
    const types = [game.piece.type, game.next];
    for (let i = 0; i < 5; i++) types.push(game.draw());
    expect(new Set(types).size).toBe(7);
  });
  test('wall and floor collisions cannot overwrite the board', () => {
    const game = new Game();
    for (let i = 0; i < 20; i++) game.move(-1);
    expect(game.move(-1)).toBe(false);
    expect(game.fits(game.piece)).toBe(true);
    const before = JSON.stringify(game.board);
    game.rotate();
    expect(game.fits(game.piece)).toBe(true);
    expect(JSON.stringify(game.board)).toBe(before);
    game.piece = game.ghost();
    expect(game.move(0, 1)).toBe(false);
  });
  test('hard drop locks, awards distance, and creates the next shape', () => {
    const game = new Game();
    const next = game.next;
    const distance = game.ghost().y;
    game.drop();
    expect(game.score).toBe(distance * 2);
    expect(game.board.flat().filter(Boolean)).toHaveLength(4);
    expect(game.piece.type).toBe(next);
  });
  test('two rows clear together and upper cells fall the correct distance', () => {
    const game = new Game();
    game.board[18] = Array(WIDTH).fill(3);
    game.board[19] = Array(WIDTH).fill(3);
    game.board[18][4] = game.board[18][5] = game.board[19][4] = game.board[19][5] = 0;
    game.board[17][0] = 6;
    game.piece = { type: 1, shape: [[1, 1], [1, 1]], x: 4, y: 18 };
    expect(game.lock()).toBe(2);
    expect(game.lines).toBe(2);
    expect(game.score).toBe(300);
    expect(game.board[19][0]).toBe(6);
    expect(game.board).toHaveLength(HEIGHT);
    expect(game.board.flat().filter(Boolean)).toHaveLength(1);
  });
  test('four-line clear scores before level increase', () => {
    const game = new Game();
    game.lines = 9;
    for (let y = 16; y < 20; y++) { game.board[y].fill(2); game.board[y][4] = 0; }
    game.piece = { type: 0, shape: [[1], [1], [1], [1]], x: 4, y: 16 };
    expect(game.lock()).toBe(4);
    expect(game.score).toBe(800);
    expect(game.level).toBe(2);
    expect(game.interval).toBeLessThan(800);
  });
  test('blocked spawn ends the game; controls cannot mutate it afterward', () => {
    const game = new Game();
    game.board[0].fill(2); game.spawn();
    expect(game.over).toBe(true);
    const before = JSON.stringify(game);
    game.move(1); game.rotate(); game.drop(); game.step(); game.lock();
    expect(JSON.stringify(game)).toBe(before);
  });
  test('rotation fails when every rotated position is obstructed', () => {
    const game = new Game();
    game.piece = { type: 0, shape: [[1, 1, 1, 1]], x: 3, y: 5 };
    game.board[6].fill(2);
    const before = JSON.stringify(game.piece);
    expect(game.rotate()).toBe(false);
    expect(JSON.stringify(game.piece)).toBe(before);
  });
});
