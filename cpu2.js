// =====================
// 少し強いCPU
//
// 1. 角優先
// 2. 最大反転
// =====================

function cpuMove2(board){

  const SIZE = 8;

  const dirs = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1],[1,0],[1,1]
  ];

  function inRange(x,y){
    return x>=0 && x<SIZE && y>=0 && y<SIZE;
  }

  function getFlips(x,y){

    if(board[y][x] !== 0) return [];

    let flips = [];

    for(const [dx,dy] of dirs){

      let nx = x + dx;
      let ny = y + dy;

      let line = [];

      while(
        inRange(nx,ny) &&
        board[ny][nx] === 1
      ){
        line.push([nx,ny]);

        nx += dx;
        ny += dy;
      }

      if(
        inRange(nx,ny) &&
        board[ny][nx] === 2 &&
        line.length > 0
      ){
        flips = flips.concat(line);
      }
    }

    return flips;
  }

  let moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const flips = getFlips(x,y);

      if(flips.length > 0){

        moves.push({
          x,
          y,
          score: flips.length
        });
      }
    }
  }

  if(moves.length === 0){
    return null;
  }

  // 角優先
  const corners = [
    [0,0],
    [0,7],
    [7,0],
    [7,7]
  ];

  for(const move of moves){

    for(const [cx,cy] of corners){

      if(move.x === cx && move.y === cy){
        return [move.x,move.y];
      }
    }
  }

  // 最大反転
  moves.sort((a,b)=>b.score-a.score);

  return [moves[0].x,moves[0].y];
}
