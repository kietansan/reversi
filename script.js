const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const info = document.getElementById("info");
const putSound = document.getElementById("putSound");

const SIZE = 8;
const PADDING = 40;

const BOARD_SIZE = canvas.width - PADDING * 2;
const CELL = BOARD_SIZE / SIZE;

let animating = false;

// =====================
// 盤面
// 0 = 空
// 1 = 黒
// 2 = 白
// =====================
let board = Array.from({ length: SIZE }, () =>
  Array(SIZE).fill(0)
);

// 初期配置
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

function inRange(x,y){
  return x>=0 && x<SIZE && y>=0 && y<SIZE;
}

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

function draw(scaleX=null,scaleY=null,scale=1,newColor=1){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // =====================
  // グリッド
  // =====================

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

  // =====================
  // 星
  // =====================

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

  // =====================
  // 駒
  // =====================

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(board[y][x] === 0) continue;

      if(x === scaleX && y === scaleY){

        drawPiece(x,y,newColor,scale);

      }else{

        drawPiece(x,y,board[y][x]);

      }
    }
  }
}

function animateFlip(flips,newColor){

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
    }
  }

  loop();
}

function updateInfo(){

  const { black, white } = countPieces();

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
      `終了　黒:${black} 白:${white}　${result}`;

    return;
  }

  info.textContent =
    `${current === 1 ? "黒" : "白"}の番　黒:${black} 白:${white}`;
}

canvas.addEventListener("click",(e)=>{

  if(animating) return;

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left - PADDING;
  const my = e.clientY - rect.top - PADDING;

  const x = Math.floor(mx / CELL);
  const y = Math.floor(my / CELL);

  if(!inRange(x,y)) return;

  const flips = getFlips(x,y,current);

  if(flips.length === 0) return;

  board[y][x] = current;

  putSound.currentTime = 0;
  putSound.play();

  animateFlip(flips,current);

  current = current === 1 ? 2 : 1;

  updateInfo();

  setTimeout(()=>{

    if(!hasMove(current)){

      current = current === 1 ? 2 : 1;

      updateInfo();
    }

  },250);

});

draw();
updateInfo();
