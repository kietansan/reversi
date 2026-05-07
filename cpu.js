// =====================
// 最も簡単なCPU
// boardのみ受け取る
// [x,y] を返す
// =====================

function cpuMove(board){

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

  // 最初に見つけた合法手
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      if(getFlips(x,y).length > 0){
        return [x,y];
      }

    }
  }

  return null;
}
