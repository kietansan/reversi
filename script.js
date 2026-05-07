const SIZE = 8;
const POINTS = SIZE + 1; // 9×9交点

// 交点ベース盤面
// 0:空, 1:黒, 2:白
let board = Array.from({ length: POINTS }, () =>
  Array(POINTS).fill(0)
);

// 初期配置（中央4点）
board[4][4] = 2;
board[4][5] = 1;
board[5][4] = 1;
board[5][5] = 2;

let current = 1;

const boardEl = document.getElementById("board");

// 8方向
const dirs = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1],[1,0],[1,1]
];

function inRange(x, y){
  return x >= 0 && x < POINTS && y >= 0 && y < POINTS;
}

// 反転チェック
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

function render(){
  boardEl.innerHTML = "";

  // マス描画（8×8）
  for(let y = 0; y < SIZE; y++){
    for(let x = 0; x < SIZE; x++){

      const cell = document.createElement("div");
      cell.className = "cell";

      // 交点は (x,y) → (x,y)ではなく (x,y)〜(x+1,y+1)
      const px = x;
      const py = y;

      // 石は右下交点に持たせる
      const val = board[py][px];

      if(val !== 0){
        const disc = document.createElement("div");
        disc.className = "disc " + (val === 1 ? "black" : "white");
        cell.appendChild(disc);
      }

      cell.onclick = () => {
        const flips = getFlips(px, py, current);

        if(flips.length === 0) return;

        board[py][px] = current;

        for(const [fx, fy] of flips){
          board[fy][fx] = current;
        }

        current = (current === 1) ? 2 : 1;

        render();
      };

      boardEl.appendChild(cell);
    }
  }
}

render();
