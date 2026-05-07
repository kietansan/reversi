const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const SIZE = 8;
const GRID = SIZE + 1; // 9×9交点
const CELL = canvas.width / SIZE;

// 0:空 1:黒 2:白
let board = Array.from({ length: GRID }, () =>
  Array(GRID).fill(0)
);

// 初期配置（交点ベースの中央4点）
board[3][3] = 2;
board[3][4] = 1;
board[4][3] = 1;
board[4][4] = 2;

let current = 1;

const dirs = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1],[1,0],[1,1]
];

function inRange(x, y){
  return x >= 0 && x < GRID && y >= 0 && y < GRID;
}

function getFlips(x, y, player){
  if(board[y][x] !== 0) return [];

  const opponent = player === 1 ? 2 : 1;
  let flips = [];

  for(const [dx, dy] of dirs){
    let nx = x + dx;
    let ny = y + dy;
    let line = [];

    while(inRange(nx, ny) && board[ny][nx] === opponent){
      line.push([nx, ny]);
      nx += dx;
      ny += dy;
    }

    if(inRange(nx, ny) && board[ny][nx] === player && line.length > 0){
      flips = flips.concat(line);
    }
  }

  return flips;
}

function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // =========================
  // グリッド（交点基準）
  // =========================
  ctx.strokeStyle = "black";

  for(let i = 0; i <= SIZE; i++){
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(canvas.width, i * CELL);
    ctx.stroke();
  }

  // =========================
  // 星（交点4点）
  // =========================
  const stars = [
    [2,2],[2,5],
    [5,2],[5,5]
  ];

  ctx.fillStyle = "black";

  for(const [x,y] of stars){
    ctx.beginPath();
    ctx.arc(
      x * CELL,
      y * CELL,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // =========================
  // 駒（交点中心）
  // =========================
  for(let y = 0; y < GRID; y++){
    for(let x = 0; x < GRID; x++){
      if(board[y][x] === 0) continue;

      ctx.beginPath();
      ctx.arc(
        x * CELL,
        y * CELL,
        CELL * 0.35,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = board[y][x] === 1 ? "black" : "white";
      ctx.fill();

      ctx.stroke();
    }
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = Math.round((e.clientX - rect.left) / CELL);
  const y = Math.round((e.clientY - rect.top) / CELL);

  const flips = getFlips(x, y, current);

  if(flips.length === 0) return;

  board[y][x] = current;

  for(const [fx, fy] of flips){
    board[fy][fx] = current;
  }

  current = current === 1 ? 2 : 1;

  draw();
});

draw();
