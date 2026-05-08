// =====================
// cpu3.js
// Fast + Stable Reversi AI
// 安全高速化版
// =====================

function cpuMove3(board){

  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;

  const INF = 99999999;

  const dirs = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1],[1,0],[1,1]
  ];

  const PST = [

    [120,-20, 20,  5,  5, 20,-20,120],
    [-20,-40, -5, -5, -5, -5,-40,-20],
    [ 20, -5, 15,  3,  3, 15, -5, 20],
    [  5, -5,  3,  3,  3,  3, -5,  5],
    [  5, -5,  3,  3,  3,  3, -5,  5],
    [ 20, -5, 15,  3,  3, 15, -5, 20],
    [-20,-40, -5, -5, -5, -5,-40,-20],
    [120,-20, 20,  5,  5, 20,-20,120]

  ];

  // =====================
  // utility
  // =====================

  function inRange(x,y){

    return (
      x >= 0 &&
      x < 8 &&
      y >= 0 &&
      y < 8
    );
  }

  function opp(p){

    return p === BLACK
      ? WHITE
      : BLACK;
  }

  // =====================
  // flips
  // =====================

  function getFlips(state,x,y,player){

    if(state[y][x] !== EMPTY){
      return null;
    }

    const enemy = opp(player);

    let flips = [];

    for(let i=0;i<8;i++){

      const dx = dirs[i][0];
      const dy = dirs[i][1];

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
        line.length &&
        inRange(nx,ny) &&
        state[ny][nx] === player
      ){

        flips = flips.concat(line);
      }
    }

    return flips.length
      ? flips
      : null;
  }

  // =====================
  // moves
  // =====================

  function generateMoves(state,player){

    let moves = [];

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        // 安全高速化
        if(state[y][x] !== EMPTY){
          continue;
        }

        const flips =
          getFlips(state,x,y,player);

        if(flips){

          moves.push({
            x,
            y,
            flips
          });
        }
      }
    }

    return moves;
  }

  // =====================
  // move
  // =====================

  function doMove(state,move,player){

    state[move.y][move.x] = player;

    const flips = move.flips;

    for(let i=0;i<flips.length;i++){

      const f = flips[i];

      state[f[1]][f[0]] = player;
    }
  }

  function undoMove(state,move,player){

    state[move.y][move.x] = EMPTY;

    const enemy = opp(player);

    const flips = move.flips;

    for(let i=0;i<flips.length;i++){

      const f = flips[i];

      state[f[1]][f[0]] = enemy;
    }
  }

  // =====================
  // empties
  // =====================

  function emptyCount(state){

    let n = 0;

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        if(state[y][x] === EMPTY){
          n++;
        }
      }
    }

    return n;
  }

  // =====================
  // frontier
  // =====================

  function frontier(state){

    let w = 0;
    let b = 0;

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        const p = state[y][x];

        if(p === EMPTY){
          continue;
        }

        let front = false;

        for(let i=0;i<8;i++){

          const nx = x + dirs[i][0];
          const ny = y + dirs[i][1];

          if(
            inRange(nx,ny) &&
            state[ny][nx] === EMPTY
          ){
            front = true;
            break;
          }
        }

        if(front){

          if(p === WHITE) w++;
          else b++;
        }
      }
    }

    return b - w;
  }

  // =====================
  // corner
  // =====================

  function cornerScore(state){

    let s = 0;

    if(state[0][0] === WHITE) s += 1000;
    if(state[0][0] === BLACK) s -= 1000;

    if(state[0][7] === WHITE) s += 1000;
    if(state[0][7] === BLACK) s -= 1000;

    if(state[7][0] === WHITE) s += 1000;
    if(state[7][0] === BLACK) s -= 1000;

    if(state[7][7] === WHITE) s += 1000;
    if(state[7][7] === BLACK) s -= 1000;

    return s;
  }

  // =====================
  // danger
  // =====================

  function dangerScore(state){

    let s = 0;

    if(state[0][0] === EMPTY){

      if(state[1][1] === WHITE){
        s -= 300;
      }

      if(state[1][1] === BLACK){
        s += 300;
      }
    }

    if(state[0][7] === EMPTY){

      if(state[1][6] === WHITE){
        s -= 300;
      }

      if(state[1][6] === BLACK){
        s += 300;
      }
    }

    if(state[7][0] === EMPTY){

      if(state[6][1] === WHITE){
        s -= 300;
      }

      if(state[6][1] === BLACK){
        s += 300;
      }
    }

    if(state[7][7] === EMPTY){

      if(state[6][6] === WHITE){
        s -= 300;
      }

      if(state[6][6] === BLACK){
        s += 300;
      }
    }

    return s;
  }

  // =====================
  // pst
  // =====================

  function pstScore(state){

    let s = 0;

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        const p = state[y][x];

        if(p === WHITE){

          s += PST[y][x];
        }

        else if(p === BLACK){

          s -= PST[y][x];
        }
      }
    }

    return s;
  }

  // =====================
  // disc
  // =====================

  function discScore(state){

    let w = 0;
    let b = 0;

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        if(state[y][x] === WHITE){
          w++;
        }

        else if(state[y][x] === BLACK){
          b++;
        }
      }
    }

    return w - b;
  }

  // =====================
  // evaluate
  // =====================

  function evaluate(
    state,
    empties,
    whiteMoves,
    blackMoves
  ){

    // 終局

    if(
      whiteMoves.length === 0 &&
      blackMoves.length === 0
    ){

      const d = discScore(state);

      if(d > 0) return INF;
      if(d < 0) return -INF;

      return 0;
    }

    const mobility =
      whiteMoves.length -
      blackMoves.length;

    // 序盤

    if(empties > 40){

      return (
        mobility * 80 +

        // 安全高速化:
        // frontierは序盤のみ
        frontier(state) * 40 +

        cornerScore(state) * 10 +
        pstScore(state) * 2 +
        dangerScore(state)
      );
    }

    // 中盤

    if(empties > 14){

      return (
        mobility * 60 +

        // frontier削減
        // 中盤は省略

        cornerScore(state) * 10 +
        pstScore(state) * 4 +
        discScore(state) * 2 +
        dangerScore(state)
      );
    }

    // 終盤

    return (
      mobility * 30 +
      cornerScore(state) * 15 +
      pstScore(state) * 2 +
      discScore(state) * 100 +
      dangerScore(state)
    );
  }

  // =====================
  // ordering
  // =====================

  function moveScore(move){

    let s = 0;

    s += PST[move.y][move.x];

    s += move.flips.length * 3;

    // corner

    if(
      (move.x===0&&move.y===0)||
      (move.x===0&&move.y===7)||
      (move.x===7&&move.y===0)||
      (move.x===7&&move.y===7)
    ){
      s += 9999;
    }

    return s;
  }

  function sortMoves(moves){

    moves.sort((a,b)=>{

      return moveScore(b) - moveScore(a);
    });
  }

  // =====================
  // negamax
  // =====================

  function negamax(
    state,
    depth,
    alpha,
    beta,
    player,
    empties
  ){

    const moves =
      generateMoves(state,player);

    const enemyMoves =
      generateMoves(state,opp(player));

    // terminal

    if(
      depth <= 0 ||
      (
        moves.length === 0 &&
        enemyMoves.length === 0
      )
    ){

      return (
        player === WHITE
        ? evaluate(
            state,
            empties,
            moves,
            enemyMoves
          )
        : -evaluate(
            state,
            empties,
            enemyMoves,
            moves
          )
      );
    }

    // pass

    if(moves.length === 0){

      return -negamax(
        state,
        depth - 1,
        -beta,
        -alpha,
        opp(player),
        empties
      );
    }

    sortMoves(moves);

    let first = true;

    for(let i=0;i<moves.length;i++){

      const move = moves[i];

      doMove(state,move,player);

      let score;

      // PVS

      if(first){

        score = -negamax(
          state,
          depth - 1,
          -beta,
          -alpha,
          opp(player),
          empties - 1
        );

        first = false;

      }else{

        score = -negamax(
          state,
          depth - 1,
          -alpha - 1,
          -alpha,
          opp(player),
          empties - 1
        );

        if(
          alpha < score &&
          score < beta
        ){

          score = -negamax(
            state,
            depth - 1,
            -beta,
            -alpha,
            opp(player),
            empties - 1
          );
        }
      }

      undoMove(state,move,player);

      if(score > alpha){

        alpha = score;
      }

      // cut

      if(alpha >= beta){

        break;
      }
    }

    return alpha;
  }

  // =====================
  // root
  // =====================

  const empties =
    emptyCount(board);

  let maxDepth = 8;

  // 安全高速化

  if(empties <= 20){
    maxDepth = 9;
  }

  // 終盤強化

  if(empties <= 14){
    maxDepth = 11;
  }

  // 暴走防止

  if(empties <= 10){
    maxDepth = 12;
  }

  let bestMove = null;

  let rootMoves =
    generateMoves(board,WHITE);

  if(rootMoves.length === 0){
    return null;
  }

  sortMoves(rootMoves);

  // iterative deepening

  for(
    let depth = 2;
    depth <= maxDepth;
    depth++
  ){

    let bestScore = -INF;

    // 安全高速化:
    // 毎回full sortせず
    // bestMoveだけ先頭

    if(bestMove){

      rootMoves.sort((a,b)=>{

        if(
          a.x === bestMove.x &&
          a.y === bestMove.y
        ){
          return -1;
        }

        if(
          b.x === bestMove.x &&
          b.y === bestMove.y
        ){
          return 1;
        }

        return 0;
      });
    }

    for(let i=0;i<rootMoves.length;i++){

      const move = rootMoves[i];

      doMove(board,move,WHITE);

      const score = -negamax(
        board,
        depth - 1,
        -INF,
        INF,
        BLACK,
        empties - 1
      );

      undoMove(board,move,WHITE);

      if(score > bestScore){

        bestScore = score;

        bestMove = move;
      }
    }
  }

  return [
    bestMove.x,
    bestMove.y
  ];
}
