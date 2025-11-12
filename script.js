const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// CONFIGURAÇÕES BÁSICAS
// =====================
const GRAVITY = 0.8;
const MOVE_SPEED = 3.2;
const JUMP_FORCE = 14;

let levelWon = false;

// =====================
// PLAYER
// =====================
const player = {
  x: 200,
  y: 400,
  width: 15,
  height: 35,
  dx: 0,
  dy: 0,
  grounded: false
};

// =====================
// ELEMENTOS DO JOGO
// =====================
const platforms = [
  { x: 50, y: 500, width: 160, height: 30, troll: true },
  { x: 260, y: 400, width: 120, height: 30 },
  { x: 420, y: 440, width: 100, height: 30, troll: false },
  { x: 580, y: 480, width: 100, height: 30, troll: false },
  { x: 730, y: 480, width: 150, height: 30, troll: false },
];

const spikes = [
  { x: 360, y: 520, width: 40, height: 20 },
  { x: 620, y: 520, width: 40, height: 20 }
];

const door = { x: 860, y: 465, width: 30, height: 60 };

// =====================
// ENTRADAS
// =====================
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// =====================
// LÓGICA PRINCIPAL
// =====================
function update() {
  if (levelWon) return;

  // Movimento
  if (keys["a"] || keys["ArrowLeft"]) player.dx = -MOVE_SPEED;
  else if (keys["d"] || keys["ArrowRight"]) player.dx = MOVE_SPEED;
  else player.dx = 0;

  // Pulo
  if ((keys["w"] || keys[" "] || keys["ArrowUp"]) && player.grounded) {
    player.dy = -JUMP_FORCE;
    player.grounded = false;
  }

  // Gravidade
  player.dy += GRAVITY;
  player.x += player.dx;
  player.y += player.dy;

  // Colisão plataformas
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
        // chão falso: cai depois de 0.3s
        setTimeout(() => { p.y += 1000; }, 300);
      } else {
        player.y = p.y - player.height;
        player.dy = 0;
        player.grounded = true;
      }
    }
  }

  // Colisão com espinhos
  for (let s of spikes) {
    if (
      player.x < s.x + s.width &&
      player.x + player.width > s.x &&
      player.y + player.height > s.y
    ) {
      lose("💀 Você caiu no espinho!");
    }
  }

  // Chegou na porta
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
  levelWon = true;
  alert("🎉 Você venceu! Mas cuidado, o próximo nível é pior...");
  resetGame();
}

// Resetar tudo
function resetGame() {
  player.x = 200;
  player.y = 400;
  player.dy = 0;
  levelWon = false;
  for (let p of platforms) {
    if (p.troll) p.y = 500;
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

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();