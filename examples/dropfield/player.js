import { Game, SHAPES } from './engine.js';

const $ = id => document.getElementById(id);
const canvas = $('board'), ctx = canvas.getContext('2d');
const preview = $('next'), nextCtx = preview.getContext('2d');
const colors = ['#d2eab5', '#e9ba7d', '#b7a3dd', '#95c9bc', '#dc947f', '#9db6da', '#d5cd92'];
let game = new Game(), state = 'ready', elapsed = 0, lastTime = 0, sound = false, audio;

function cell(context, x, y, size, color, ghost = false) {
  context.fillStyle = color;
  if (ghost) { context.globalAlpha = .4; context.strokeStyle = color; context.lineWidth = 1.5; context.strokeRect(x + 2, y + 2, size - 4, size - 4); context.globalAlpha = 1; return; }
  context.fillRect(x + 1, y + 1, size - 2, size - 2);
  context.fillStyle = '#ffffff35'; context.fillRect(x + 3, y + 3, size - 6, 2);
  context.fillStyle = '#00000020'; context.fillRect(x + 3, y + size - 5, size - 6, 2);
}
function drawPiece(piece, ghost = false) {
  piece.shape.forEach((row, y) => row.forEach((v, x) => { if (v) cell(ctx, (piece.x + x) * 30, (piece.y + y) * 30, 30, colors[piece.type], ghost); }));
}
function render() {
  ctx.fillStyle = '#111611'; ctx.fillRect(0, 0, 300, 600);
  ctx.strokeStyle = '#222b20'; ctx.lineWidth = .5;
  for (let x = 0; x <= 300; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke(); }
  for (let y = 0; y <= 600; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(300, y); ctx.stroke(); }
  game.board.forEach((row, y) => row.forEach((v, x) => { if (v) cell(ctx, x * 30, y * 30, 30, colors[v - 1]); }));
  if (!game.over) { drawPiece(game.ghost(), true); drawPiece(game.piece); }
  nextCtx.clearRect(0, 0, 160, 100);
  const shape = SHAPES[game.next];
  shape.forEach((row, y) => row.forEach((v, x) => { if (v) cell(nextCtx, x * 26 + (160 - shape[0].length * 26) / 2, y * 26 + 18, 26, colors[game.next]); }));
  $('score').textContent = String(game.score).padStart(5, '0');
  $('lines').textContent = String(game.lines).padStart(2, '0');
  $('level').textContent = String(game.level).padStart(2, '0');
}
function setState(value) {
  state = value;
  $('overlay').hidden = value === 'playing';
  $('pause').disabled = value === 'ready' || value === 'over';
  const paused = value === 'paused';
  $('pause').setAttribute('aria-label', paused ? 'Resume' : 'Pause');
  $('pause').title = paused ? 'Resume' : 'Pause';
  $('pause').querySelector('.pause-icon').toggleAttribute('hidden', paused);
  $('pause').querySelector('.play-icon').toggleAttribute('hidden', !paused);
  document.querySelectorAll('[data-action]').forEach(button => { button.disabled = value !== 'playing'; });
  $('status').textContent = { ready: 'YOUR NEXT SMALL OBSESSION', playing: 'MAKE A LITTLE ROOM', paused: 'TAKE YOUR TIME', over: `FINAL SCORE · ${game.score}` }[value];
  if (value === 'paused' || value === 'over') {
    $('eyebrow').textContent = value === 'over' ? 'THAT WAS A GOOD RUN' : 'NO RUSH';
    $('overlay-title').textContent = value === 'over' ? 'Room for another?' : 'A little pause.';
    $('overlay-copy').textContent = value === 'over' ? `${game.score} points · ${game.lines} lines` : 'Your stack will be here.';
    $('start').textContent = value === 'over' ? 'Play again ↗' : 'Keep going ↗';
    $('start').focus({ preventScroll: true });
  }
  elapsed = 0;
}
function tone(cleared) {
  if (!sound || !audio || audio.state !== 'running') return;
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.type = 'sine'; oscillator.frequency.value = cleared ? 523 : 180;
  gain.gain.setValueAtTime(.055, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .13);
  oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .14);
}
function act(action) {
  if (state !== 'playing') return;
  let cleared = 0;
  if (action === 'left') game.move(-1);
  if (action === 'right') game.move(1);
  if (action === 'rotate') game.rotate();
  if (action === 'down') { cleared = game.step(true); elapsed = 0; }
  if (action === 'drop') { cleared = game.drop(); elapsed = 0; tone(cleared); }
  if (cleared && action !== 'drop') tone(cleared);
  if (game.over) setState('over');
  render();
}
$('start').addEventListener('click', () => {
  if (state !== 'paused') game = new Game();
  setState('playing'); render(); canvas.focus({ preventScroll: true });
});
function togglePause() {
  if (state === 'playing') setState('paused');
  else if (state === 'paused') { setState('playing'); canvas.focus({ preventScroll: true }); }
}
$('pause').addEventListener('click', togglePause);
$('sound').addEventListener('click', async () => {
  if (sound) { sound = false; }
  else {
    try { audio ??= new AudioContext(); await audio.resume(); sound = audio.state === 'running'; }
    catch (error) { console.warn('Sound could not start:', error); $('status').textContent = 'SOUND UNAVAILABLE · PLAY SILENTLY'; }
  }
  $('sound').setAttribute('aria-label', sound ? 'Mute sound' : 'Enable sound');
  $('sound').title = sound ? 'Mute sound' : 'Enable sound';
  $('sound').setAttribute('aria-pressed', String(sound));
});
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => act(button.dataset.action)));
document.addEventListener('keydown', event => {
  // Preserve native keyboard activation when a link or button has focus.
  if (event.target.closest('button, a, input, textarea, select')) return;
  if (event.key.toLowerCase() === 'p' || event.key === 'Escape') { event.preventDefault(); togglePause(); return; }
  const action = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rotate', ArrowDown: 'down', ' ': 'drop' }[event.key];
  if (action && state === 'playing') { event.preventDefault(); if (!event.repeat || action === 'left' || action === 'right' || action === 'down') act(action); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') setState('paused'); });
window.addEventListener('blur', () => { if (state === 'playing') setState('paused'); });
function frame(time) {
  const delta = Math.min(time - lastTime, 100); lastTime = time;
  if (state === 'playing') {
    elapsed += delta;
    if (elapsed >= game.interval) { const cleared = game.step(); elapsed = 0; if (cleared) tone(cleared); if (game.over) setState('over'); render(); }
  }
  requestAnimationFrame(frame);
}
render(); requestAnimationFrame(frame);
