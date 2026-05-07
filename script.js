const canvas = document.getElementById("board");
// 表示
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

canvas.addEventListener("click",handleInput);
canvas.addEventListener("touchstart",handleInput);

function handleInput(e){

  e.preventDefault();

  const rect = canvas.getBoundingClientRect();

  let clientX;
  let clientY;

  if(e.touches){

    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;

  }else{

    clientX = e.clientX;
    clientY = e.clientY;
  }

  const x = Math.round(
    (clientX - rect.left - offset) / cellSize
  );

  const y = Math.round(
    (clientY - rect.top - offset) / cellSize
  );

  if(!inRange(x,y)){
    return;
  }

  placeStone(x,y);
}

// =====================
// リスタート
// =====================

restartBtn.addEventListener("click",()=>{

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
});

resizeCanvas();
updateInfo();
draw();
