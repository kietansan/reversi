const SIZE = 8;

// 0:空, 1:黒, 2:白
let board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

// 初期配置
board[3][3] = 2;
board[3][4] = 1;
board[4][3] = 1;
board[4][4] = 2;

let current = 1; // 黒スタート

const boardEl = document.getElementById("board");

// 8方向
const dirs = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1],[1,0],[1,1]
];

function inRange(x, y){
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

// 裏返せる駒リスト取得
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

  for(let y = 0; y < SIZE; y++){
    for(let x = 0; x < SIZE; x++){
      const cell = document.createElement("div");
      cell.className = "cell";

      if(board[y][x] !== 0){
        const disc = document.createElement("div");
        disc.className = "disc " + (board[y][x] === 1 ? "black" : "white");
        cell.appendChild(disc);
      }

      cell.onclick = () => {
        const flips = getFlips(x, y, current);

        if(flips.length === 0) return;

        board[y][x] = current;

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
