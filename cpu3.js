// =====================
// cpu3.js
// 高度リバーシAI
//
// 機能:
// - Minimax
// - Alpha Beta
// - Mobility
// - Corner
// - Stable風評価
// - X/C回避
// - 終盤探索強化
//
// 入力:
// board
//
// 出力:
// [x,y]
// =====================

function cpuMove3(board){

  const SIZE = 8;
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;

  const dirs = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1],[1,0],[1,1]
  ];

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

  function cloneBoard(src){
    return src.map(row => [...row]);
  }

  function inRange(x,y){
    return x>=0 && x<SIZE && y>=0 && y<SIZE;
  }

  function opponent(player){
    return player === BLACK ? WHITE : BLACK;
  }

  function getFlips(state,x,y,player){

    if(state[y][x] !== EMPTY) return [];

    const enemy = opponent(player);

    let flips = [];

    for(const [dx,dy] of dirs){

      let nx = x + dx;
      let ny = y + dy;

      let line = [];

      while(
        inRange(nx,ny) &&
        state[ny][nx] === enemy
      ){
        line.push([nx,ny]);

        nx += dx;
        ny += dy;
      }

      if(
        inRange(nx,ny) &&
        state[ny][nx] === player &&
        line.length > 0
      ){
        flips = flips.concat(line);
      }
    }

    return flips;
  }

  function getMoves(state,player){

    let moves = [];

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        const flips = getFlips(state,x,y,player);

        if(flips.length > 0){
          moves.push({ x,y,flips });
        }
      }
    }

    return moves;
  }

  function applyMove(state,move,player){

    const newBoard = cloneBoard(state);

    newBoard[move.y][move.x] = player;

    for(const [fx,fy] of move.flips){
      newBoard[fy][fx] = player;
    }

    return newBoard;
  }

  function countPieces(state){

    let black = 0;
    let white = 0;

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        if(state[y][x] === BLACK) black++;
        if(state[y][x] === WHITE) white++;
      }
    }

    return { black, white };
  }

  function cornerScore(state){

    const corners = [
      [0,0],
      [0,7],
      [7,0],
      [7,7]
    ];

    let score = 0;

    for(const [x,y] of corners){

      if(state[y][x] === WHITE) score += 100;
      if(state[y][x] === BLACK) score -= 100;
    }

    return score;
  }

  function mobilityScore(state){

    const myMoves = getMoves(state,WHITE).length;
    const enemyMoves = getMoves(state,BLACK).length;

    return (myMoves - enemyMoves) * 12;
  }

  function boardScore(state){

    let score = 0;

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        if(state[y][x] === WHITE){
          score += evalBoard[y][x];
        }

        if(state[y][x] === BLACK){
          score -= evalBoard[y][x];
        }
      }
    }

    return score;
  }

  function frontierScore(state){

    let whiteFront = 0;
    let blackFront = 0;

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        const p = state[y][x];

        if(p === EMPTY) continue;

        let frontier = false;

        for(const [dx,dy] of dirs){

          const nx = x + dx;
          const ny = y + dy;

          if(
            inRange(nx,ny) &&
            state[ny][nx] === EMPTY
          ){
            frontier = true;
            break;
          }
        }

        if(frontier){

          if(p === WHITE) whiteFront++;
          else blackFront++;
        }
      }
    }

    return (blackFront - whiteFront) * 4;
  }

  function parityScore(state){

    let empty = 0;

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        if(state[y][x] === EMPTY){
          empty++;
        }
      }
    }

    if(empty % 2 === 0){
      return 8;
    }

    return -8;
  }

  function stableEdgeScore(state){

    let score = 0;

    for(let x=0;x<SIZE;x++){

      if(state[0][x] === WHITE) score += 6;
      if(state[0][x] === BLACK) score -= 6;

      if(state[7][x] === WHITE) score += 6;
      if(state[7][x] === BLACK) score -= 6;
    }

    for(let y=0;y<SIZE;y++){

      if(state[y][0] === WHITE) score += 6;
      if(state[y][0] === BLACK) score -= 6;

      if(state[y][7] === WHITE) score += 6;
      if(state[y][7] === BLACK) score -= 6;
    }

    return score;
  }

  function pieceScore(state){

    const { black, white } = countPieces(state);

    return white - black;
  }

  function evaluate(state){

    // =====================
    // 終局評価
    // =====================

    if(isGameOver(state)){

      const { black, white } = countPieces(state);

      if(white > black){
        return 999999;
      }

      if(black > white){
        return -999999;
      }

      return 0;
    }

    return (
      boardScore(state) +
      cornerScore(state) +
      mobilityScore(state) +
      frontierScore(state) +
      stableEdgeScore(state) +
      parityScore(state) +
      pieceScore(state)
    );
  }

  function isGameOver(state){

    return (
      getMoves(state,WHITE).length === 0 &&
      getMoves(state,BLACK).length === 0
    );
  }

  function emptyCount(state){

    let n = 0;

    for(let y=0;y<SIZE;y++){
      for(let x=0;x<SIZE;x++){

        if(state[y][x] === EMPTY){
          n++;
        }
      }
    }

    return n;
  }

  function minimax(state,depth,alpha,beta,player){

    if(depth === 0 || isGameOver(state)){
      return evaluate(state);
    }

    const moves = getMoves(state,player);

    if(moves.length === 0){

      return minimax(
        state,
        depth - 1,
        alpha,
        beta,
        opponent(player)
      );
    }

    // MAX
    if(player === WHITE){

      let best = -Infinity;

      for(const move of moves){

        const next = applyMove(state,move,WHITE);

        const score = minimax(
          next,
          depth - 1,
          alpha,
          beta,
          BLACK
        );

        best = Math.max(best,score);

        alpha = Math.max(alpha,best);

        if(beta <= alpha){
          break;
        }
      }

      return best;

    // MIN
    }else{

      let best = Infinity;

      for(const move of moves){

        const next = applyMove(state,move,BLACK);

        const score = minimax(
          next,
          depth - 1,
          alpha,
          beta,
          WHITE
        );

        best = Math.min(best,score);

        beta = Math.min(beta,best);

        if(beta <= alpha){
          break;
        }
      }

      return best;
    }
  }

  // =====================
  // 探索深さ
  // =====================

  let depth = 7;

  const empties = emptyCount(board);

  // 中盤強化
  if(empties <= 24){
    depth = 8;
  }

  // 終盤強化
  if(empties <= 18){
    depth = 10;
  }

  // 準完全読み
  if(empties <= 12){
    depth = 12;
  }

  // 完全読みに近づける
  if(empties <= 8){
    depth = 14;
  }

  let moves = getMoves(board,WHITE);

  // =====================
  // 手順並べ替え
  // =====================

  moves.sort((a,b)=>{

    const sa =
      evalBoard[a.y][a.x] +
      a.flips.length * 2;

    const sb =
      evalBoard[b.y][b.x] +
      b.flips.length * 2;

    return sb - sa;
  });

  if(moves.length === 0){
    return null;
  }

  let bestMove = null;
  let bestScore = -Infinity;

  for(const move of moves){

    const next = applyMove(board,move,WHITE);

    const score = minimax(
      next,
      depth,
      -Infinity,
      Infinity,
      BLACK
    );

    if(score > bestScore){

      bestScore = score;

      bestMove = move;
    }
  }

  return [bestMove.x,bestMove.y];
}
