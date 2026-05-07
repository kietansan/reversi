const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const info = document.getElementById("info");
const putSound = document.getElementById("putSound");
const restartBtn = document.getElementById("restartBtn");
const cpuSelect = document.getElementById("cpuSelect");

const SIZE = 8;
const PADDING = 40;

const BOARD_SIZE = canvas.width - PADDING * 2;
const CELL = BOARD_SIZE / SIZE;

let animating = false;

// =====================
// 最初の着手済み
// =====================

let gameStarted = false;

let board;

initBoard();

let current = 1;

// =====================
// 8方向
// =====================

const dirs = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1],[1,0],[1,1]
];

// =====================
// 初期化
// =====================

function initBoard(){

  board = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(0)
  );

  board[3][3] = 2;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = 2;
}

// =====================
// 範囲
// =====================

function inRange(x,y){
  return x>=0 && x<SIZE && y>=0 && y<SIZE;
}

// =====================
// 反転取得
// =====================

function getFlips(x,y,player){

  if(board[y][x] !== 0) return [];

  const opponent = player === 1 ? 2 : 1;

  let flips = [];

  for(const [dx,dy] of dirs){

    let nx = x + dx;
    let ny = y + dy;

    let line = [];

    while(
      inRange(nx,ny) &&
      board[ny][nx] === opponent
    ){
      line.push([nx,ny]);

      nx += dx;
      ny += dy;
    }

    if(
      inRange(nx,ny) &&
      board[ny][nx] === player &&
      line.length > 0
    ){
      flips = flips.concat(line);
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

      if(getFlips(x,y,player).length > 0){
        return true;
      }

    }
  }

  return false;
}

// =====================
// 駒数
// =====================

function countPieces(){

  let black = 0;
  let white = 0;

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] === 1) black++;
      if(board[y][x] === 2) white++;

    }
  }

  return { black, white };
}

// =====================
// 駒描画
// =====================

function drawPiece(x,y,color,scale=1){

  const cx =
    PADDING +
    x * CELL +
    CELL / 2;

  const cy =
    PADDING +
    y * CELL +
    CELL / 2;

  const r = CELL * 0.38 * scale;

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  const grad = ctx.createRadialGradient(
    cx - r*0.4,
    cy - r*0.4,
    r*0.2,
    cx,
    cy,
    r
  );

  if(color === 1){

    grad.addColorStop(0,"#666");
    grad.addColorStop(1,"#000");

  }else{

    grad.addColorStop(0,"#fff");
    grad.addColorStop(1,"#bbb");

  }

  ctx.fillStyle = grad;

  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.stroke();
}

// =====================
// 描画
// =====================

function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";

  for(let i=0;i<=SIZE;i++){

    const pos = PADDING + i * CELL;

    ctx.beginPath();
    ctx.moveTo(pos,PADDING);
    ctx.lineTo(pos,PADDING + BOARD_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PADDING,pos);
    ctx.lineTo(PADDING + BOARD_SIZE,pos);
    ctx.stroke();
  }

  // 星
  const stars = [
    [2,2],[2,6],
    [6,2],[6,6]
  ];

  ctx.fillStyle = "black";

  for(const [x,y] of stars){

    ctx.beginPath();

    ctx.arc(
      PADDING + x * CELL,
      PADDING + y * CELL,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // 駒
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] === 0) continue;

      drawPiece(x,y,board[y][x]);
    }
  }
}

// =====================
// 反転アニメ
// =====================

function animateFlip(flips,newColor,callback){

  let frame = 0;

  animating = true;

  function loop(){

    frame++;

    const s =
      frame < 6
      ? 1 - frame * 0.12
      : 0.3 + (frame - 6) * 0.12;

    draw();

    for(const [x,y] of flips){
      drawPiece(x,y,newColor,s);
    }

    if(frame < 12){

      requestAnimationFrame(loop);

    }else{

      for(const [x,y] of flips){
        board[y][x] = newColor;
      }

      animating = false;

      draw();

      if(callback) callback();
    }
  }

  loop();
}

// =====================
// 表示更新
// =====================

function updateInfo(){

  const { black, white } = countPieces();

  // 終局
  if(!hasMove(1) && !hasMove(2)){

    let result = "";

    if(black > white){
      result = "黒の勝ち";
    }else if(white > black){
      result = "白の勝ち";
    }else{
      result = "引き分け";
    }

    info.textContent =
      `終了 黒:${black} 白:${white} ${result}`;

    return;
  }

  info.textContent =
    `${current === 1 ? "黒" : "白"}の番 黒:${black} 白:${white}`;
}

// =====================
// 着手
// =====================

function applyMove(x,y,player){

  const flips = getFlips(x,y,player);

  if(flips.length === 0) return;

  board[y][x] = player;

  // =====================
  // 最初の着手で難易度固定
  // =====================

  if(!gameStarted){

    gameStarted = true;

    cpuSelect.disabled = true;
  }

  // 音
  putSound.currentTime = 0;
  putSound.play();

  animateFlip(flips,player,()=>{

    current = current === 1 ? 2 : 1;

    // =====================
    // パス処理
    // =====================

    if(!hasMove(current)){

      // 相手も置けない
      if(!hasMove(current === 1 ? 2 : 1)){

        updateInfo();
        return;
      }

      const passedPlayer = current;

      current = current === 1 ? 2 : 1;

      info.textContent =
        `${passedPlayer === 1 ? "黒" : "白"}はパス`;
    }

    updateInfo();

    // =====================
    // CPUターン
    // =====================

    if(current === 2){

      setTimeout(cpuTurn,200);

    }
  });
}

// =====================
// CPUターン
// =====================

function cpuTurn(){

  if(current !== 2) return;

  let move;

  // 簡単CPU
  if(cpuSelect.value === "easy"){

    move = cpuMove(board);

  // 少し強いCPU
  }else if(cpuSelect.value === "hard"){

    move = cpuMove2(board);

  // 強いCPU
  }else{

    move = cpuMove3(board);
  }

  if(!move){

    current = 1;
    updateInfo();
    return;
  }

  const [x,y] = move;

  setTimeout(()=>{

    applyMove(x,y,2);

  },300);
}

// =====================
// クリック
// =====================

canvas.addEventListener("click",(e)=>{

  if(animating) return;

  // 黒のみ
  if(current !== 1) return;

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left - PADDING;
  const my = e.clientY - rect.top - PADDING;

  const x = Math.floor(mx / CELL);
  const y = Math.floor(my / CELL);

  if(!inRange(x,y)) return;

  const flips = getFlips(x,y,1);

  if(flips.length === 0) return;

  applyMove(x,y,1);
});

// =====================
// リスタート
// =====================

restartBtn.addEventListener("click",()=>{

  initBoard();

  current = 1;

  animating = false;

  // 難易度再選択可能
  gameStarted = false;

  cpuSelect.disabled = false;

  draw();
  updateInfo();
});

// =====================
// 初期描画
// =====================

draw();
updateInfo();
