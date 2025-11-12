const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Ajuste de resolução responsiva
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// =====================
// CONFIGURAÇÕES GERAIS
// =====================
const GRAVITY = 0.8;
const MOVE_SPEED = 4;
const JUMP_FORCE = 16;

let levelWon = false;

// =====================
// PLAYER
// =====================
const player = {
  x: 100,
  y: 300,
  width: 20,
  height: 40,
  dx: 0,
  dy: 0,
  grounded: false
};

// =====================
// OBJETOS DO JOGO
// =====================
let platforms = [
  { x: 50, y: 400, width: 180, height: 25, troll: false },
  { x: 270, y: 360, width: 120, height: 25, troll: true },
  { x: 430, y: 400, width: 100, height: 25, troll: false },
  { x: 580, y: 420, width: 150, height: 25, troll: false },
  { x: 760, y: 400, width: 150, height: 25, troll: false }
];

let spikes = [
  { x: 330, y: 425, width: 40, height: 25 },
  { x: 640, y: 445, width: 40, height: 25 }
];

const door = { x: 900, y: 340, width: 35, height: 65 };

// =====================
// CONTROLES
// =====================
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Controles para celular (toque)
let touch = { left: false, right: false, jump: false };
document.addEventListener("touchstart", handleTouch);
document.addEventListener("touchend", handleTouchEnd);

function handleTouch(e) {
  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (x < w / 3) touch.left = true;
  else if (x > (w / 3) * 2) touch.right = true;
  else if (y < h / 2) touch.jump = true;
}
function handleTouchEnd() {
  touch = { left: false, right: false, jump: false };
}

// =====================
// LÓGICA DE JOGO
// =====================
function update() {
  if (levelWon) return;

  // Movimento lateral
  if (keys["a"] || keys["ArrowLeft"] || touch.left) player.dx = -MOVE_SPEED;
  else if (keys["d"] || keys["ArrowRight"] || touch.right) player.dx = MOVE_SPEED;
  else player.dx = 0;

  // Pular
  if ((keys[" "] || keys["w"] || keys["ArrowUp"] || touch.jump) && player.grounded) {
    player.dy = -JUMP_FORCE;
    player.grounded = false;
  }

  // Gravidade
  player.dy += GRAVITY;
  player.x += player.dx;
  player.y += player.dy;

  // Colisão com plataformas
  player.grounded = false;
  for (let p of platforms) {
    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y + player.height <= p.y + 10 &&
      player.y + player.height >= p.y &&
      player.dy >= 0
    ) {
      if (p.troll) {
        setTimeout(() => { p.y += 2000; }, 300);
      } else {
        player.y = p.y - player.height;
        player.dy = 0;
        player.grounded = true;
      }
    }
  }

  // Espinhos
  for (let s of spikes) {
    if (
      player.x < s.x + s.width &&
      player.x + player.width > s.x &&
      player.y + player.height > s.y
    ) {
      lose("💀 Caiu no espinho!");
    }
  }

  // Porta
  if (
    player.x < door.x + door.width &&
    player.x + player.width > door.x &&
    player.y < door.y + door.height &&
    player.y + player.height > door.y
  ) {
    win();
  }

  // Caiu fora da tela
  if (player.y > canvas.height) {
    lose("😈 Trollou! Caiu no abismo.");
  }
}

function lose(msg) {
  alert(msg);
  resetGame();
}

function win() {
  alert("🎉 Você venceu! O Level Devil aprova sua dor!");
  resetGame();
}

// =====================
// RESET
// =====================
function resetGame() {
  player.x = 100;
  player.y = 300;
  player.dy = 0;
  for (let p of platforms) {
    if (p.troll) p.y = 360;
  }
}

// =====================
// RENDERIZAÇÃO
// =====================
function draw() {
  ctx.fillStyle = "#d47d58";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Plataformas
  for (let p of platforms) {
    ctx.fillStyle = "#3c312b";
    ctx.fillRect(p.x, p.y, p.width, p.height);
    if (p.troll) {
      ctx.strokeStyle = "#f7b26c";
      ctx.strokeRect(p.x, p.y, p.width, p.height);
    }
  }

  // Espinhos
  for (let s of spikes) {
    ctx.fillStyle = "#3c312b";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y + s.height);
    ctx.lineTo(s.x + s.width / 2, s.y);
    ctx.lineTo(s.x + s.width, s.y + s.height);
    ctx.closePath();
    ctx.fill();
  }

  // Porta
  ctx.fillStyle = "#3c312b";
  ctx.fillRect(door.x, door.y, door.width, door.height);
  ctx.fillStyle = "#d4d4d4";
  ctx.fillRect(door.x + 5, door.y + 5, door.width - 10, door.height - 10);

  // Player
  ctx.fillStyle = "#000";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// =====================
// LOOP PRINCIPAL
// =====================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
