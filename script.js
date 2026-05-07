// =====================
// script.js
// =====================

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const restartBtn =
  document.getElementById("restartBtn");

const info =
  document.getElementById("info");

const putSound =
  document.getElementById("putSound");

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const SIZE = 8;

let boardSize;
let cellSize;
let offset;

let currentPlayer = BLACK;

const board = [];

// =====================
// 初期化
// =====================

for(let y=0;y<SIZE;y++){

  board[y] = [];

  for(let x=0;x<SIZE;x++){

    board[y][x] = EMPTY;
  }
}

board[3][3] = WHITE;
board[4][4] = WHITE;
board[3][4] = BLACK;
board[4][3] = BLACK;

// =====================
// リサイズ
// =====================

function resizeCanvas(){

  const rect =
    canvas.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  boardSize = canvas.width;

  // 8交点 = 7区間
  cellSize = boardSize / 7;

  // 外周余白
  offset = cellSize / 2;

  draw();
}

window.addEventListener(
  "resize",
  resizeCanvas
);

// =====================
// 範囲判定
// =====================

function inRange(x,y){

  return (
    x >= 0 &&
    x < SIZE &&
    y >= 0 &&
    y < SIZE
  );
}

// =====================
// 相手
// =====================

function opponent(player){

  return player === BLACK
    ? WHITE
    : BLACK;
}

// =====================
// 反転取得
// =====================

function getFlips(x,y,player){

  if(board[y][x] !== EMPTY){
    return [];
  }

  const enemy =
    opponent(player);

  const dirs = [

    [-1,-1],
    [-1, 0],
    [-1, 1],

    [ 0,-1],
    [ 0, 1],

    [ 1,-1],
    [ 1, 0],
    [ 1, 1]
  ];

  let flips = [];

  for(const [dx,dy] of dirs){

    let nx = x + dx;
    let ny = y + dy;

    let line = [];

    while(

      inRange(nx,ny) &&
      board[ny][nx] === enemy

    ){

      line.push([nx,ny]);

      nx += dx;
      ny += dy;
    }

    if(

      line.length > 0 &&
      inRange(nx,ny) &&
      board[ny][nx] === player

    ){

      flips.push(...line);
    }
  }

  return flips;
}

// =====================
// 合法手存在
// =====================

function hasMove(player){

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(
        getFlips(x,y,player).length > 0
      ){
        return true;
      }
    }
  }

  return false;
}

// =====================
// 描画
// =====================

function draw(){

  ctx.clearRect(
    0,
    0,
    boardSize,
    boardSize
  );

  // 背景

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(
    0,
    0,
    boardSize,
    boardSize
  );

  // 線

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;

  for(let i=0;i<SIZE;i++){

    const pos =
      offset + i * cellSize;

    // 横線

    ctx.beginPath();

    ctx.moveTo(
      offset,
      pos
    );

    ctx.lineTo(
      boardSize - offset,
      pos
    );

    ctx.stroke();

    // 縦線

    ctx.beginPath();

    ctx.moveTo(
      pos,
      offset
    );

    ctx.lineTo(
      pos,
      boardSize - offset
    );

    ctx.stroke();
  }

  // =====================
  // 星（交点）
  // =====================

  const stars = [

    [2,2],
    [2,6],

    [6,2],
    [6,6]
  ];

  for(const [sx,sy] of stars){

    const px =
      offset + sx * cellSize;

    const py =
      offset + sy * cellSize;

    ctx.beginPath();

    ctx.arc(
      px,
      py,
      4,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#000000";

    ctx.fill();
  }

  // =====================
  // 石
  // =====================

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const p = board[y][x];

      if(p === EMPTY){
        continue;
      }

      const cx =
        offset + x * cellSize;

      const cy =
        offset + y * cellSize;

      const r =
        cellSize * 0.36;

      const grad =
        ctx.createRadialGradient(

          cx - r * 0.3,
          cy - r * 0.3,
          r * 0.1,

          cx,
          cy,
          r
        );

      if(p === BLACK){

        grad.addColorStop(
          0,
          "#666666"
        );

        grad.addColorStop(
          1,
          "#000000"
        );

      }else{

        grad.addColorStop(
          0,
          "#ffffff"
        );

        grad.addColorStop(
          1,
          "#cccccc"
        );
      }

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = grad;

      ctx.fill();
    }
  }
}

// =====================
// 石配置
// =====================

function placeStone(x,y){

  const flips =
    getFlips(
      x,
      y,
      currentPlayer
    );

  if(flips.length === 0){
    return;
  }

  board[y][x] =
    currentPlayer;

  for(const [fx,fy] of flips){

    board[fy][fx] =
      currentPlayer;
  }

  // 音

  putSound.currentTime = 0;
  putSound.play();

  // 手番交代

  currentPlayer =
    opponent(currentPlayer);

  // パス処理

  if(!hasMove(currentPlayer)){

    currentPlayer =
      opponent(currentPlayer);

    // 両者置けない

    if(!hasMove(currentPlayer)){

      finishGame();
      return;
    }
  }

  updateInfo();

  draw();
}

// =====================
// 終局
// =====================

function finishGame(){

  let black = 0;
  let white = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] === BLACK){
        black++;
      }

      if(board[y][x] === WHITE){
        white++;
      }
    }
  }

  if(black > white){

    info.textContent =
      `黒の勝ち ${black}-${white}`;

  }else if(white > black){

    info.textContent =
      `白の勝ち ${white}-${black}`;

  }else{

    info.textContent =
      `引き分け ${black}-${white}`;
  }
}

// =====================
// 表示更新
// =====================

function updateInfo(){

  info.textContent =

    currentPlayer === BLACK

    ? "黒の番"

    : "白の番";
}

// =====================
// 入力
// =====================

canvas.addEventListener(
  "pointerdown",
  handleInput
);

function handleInput(e){

  e.preventDefault();

  const rect =
    canvas.getBoundingClientRect();

  const clientX =
    e.clientX;

  const clientY =
    e.clientY;

  const x = Math.round(

    (
      clientX
      - rect.left
      - offset
    )

    / cellSize
  );

  const y = Math.round(

    (
      clientY
      - rect.top
      - offset
    )

    / cellSize
  );

  if(!inRange(x,y)){
    return;
  }

  placeStone(x,y);
}

// =====================
// リスタート
// =====================

restartBtn.addEventListener(

  "click",

  ()=>{

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        board[y][x] = EMPTY;
      }
    }

    board[3][3] = WHITE;
    board[4][4] = WHITE;

    board[3][4] = BLACK;
    board[4][3] = BLACK;

    currentPlayer = BLACK;

    updateInfo();

    draw();
  }
);

// =====================
// 開始
// =====================

resizeCanvas();

updateInfo();

draw();
