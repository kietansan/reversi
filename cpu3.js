// =====================
// 強いCPU
//
// 優先順位
// 1. 角
// 2. X打ち回避
// 3. C打ち回避
// 4. 評価盤
// 5. 反転数
//
// 入力:
// board
//
// 出力:
// [x,y]
// =====================

function cpuMove3(board){

  const SIZE = 8;

  const dirs = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1],[1,0],[1,1]
  ];

  // =====================
  // 評価盤
  // =====================

  const evalBoard = [

    [120,-20, 20,  5,  5, 20,-20,120],
    [-20,-40, -5, -5, -5, -5,-40,-20],
    [ 20, -5, 15,  3,  3, 15, -5, 20],
    [  5, -5,  3,  3,  3,  3, -5,  5],
    [  5, -5,  3,  3,  3,  3, -5,  5],
    [ 20, -5, 15,  3,  3, 15, -5, 20],
    [-20,-40, -5, -5, -5, -5,-40,-20],
    [120,-20, 20,  5,  5, 20,-20,120]

  ];

  function inRange(x,y){
    return x>=0 && x<SIZE && y>=0 && y<SIZE;
  }

  // =====================
  // 反転取得
  // =====================

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

  // =====================
  // 合法手収集
  // =====================

  let moves = [];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){

      const flips = getFlips(x,y);

      if(flips.length > 0){

        let score = 0;

        // =====================
        // 評価盤
        // =====================

        score += evalBoard[y][x];

        // =====================
        // 反転数
        // =====================

        score += flips.length;

        moves.push({
          x,
          y,
          score
        });
      }
    }
  }

  if(moves.length === 0){
    return null;
  }

  // =====================
  // 角
  // =====================

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

  // =====================
  // X打ち回避
  // =====================

  moves = moves.filter(move=>{

    const x = move.x;
    const y = move.y;

    // 左上
    if(x===1 && y===1 && board[0][0]===0){
      return false;
    }

    // 右上
    if(x===6 && y===1 && board[0][7]===0){
      return false;
    }

    // 左下
    if(x===1 && y===6 && board[7][0]===0){
      return false;
    }

    // 右下
    if(x===6 && y===6 && board[7][7]===0){
      return false;
    }

    return true;
  });

  // =====================
  // C打ち回避
  // =====================

  moves = moves.filter(move=>{

    const x = move.x;
    const y = move.y;

    // 左上
    if(
      (
        (x===0 && y===1) ||
        (x===1 && y===0)
      ) &&
      board[0][0]===0
    ){
      return false;
    }

    // 右上
    if(
      (
        (x===6 && y===0) ||
        (x===7 && y===1)
      ) &&
      board[0][7]===0
    ){
      return false;
    }

    // 左下
    if(
      (
        (x===0 && y===6) ||
        (x===1 && y===7)
      ) &&
      board[7][0]===0
    ){
      return false;
    }

    // 右下
    if(
      (
        (x===6 && y===7) ||
        (x===7 && y===6)
      ) &&
      board[7][7]===0
    ){
      return false;
    }

    return true;
  });

  // 全部消えた場合復帰
  if(moves.length === 0){

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        const flips = getFlips(x,y);

        if(flips.length > 0){

          moves.push({
            x,
            y,
            score: evalBoard[y][x]
          });
        }
      }
    }
  }

  // =====================
  // 最大評価
  // =====================

  moves.sort((a,b)=>b.score-a.score);

  return [moves[0].x,moves[0].y];
}
