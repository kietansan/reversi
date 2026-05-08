// =====================
// cpu3.js
// Fast + Stable Reversi AI
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

        // 高速化:
        // EMPTY以外は即skip

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
  // mobility
  // =====================

  function mobility(state){

    return (
      generateMoves(state,WHITE).length -
      generateMoves(state,BLACK).length
    );
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

  function evaluate(state,empties){

    const whiteMoves =
      generateMoves(state,WHITE);

    const blackMoves =
      generateMoves(state,BLACK);

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

    // mobility
    const mob =
      whiteMoves.length -
      blackMoves.length;

    // 序盤

    if(empties > 40){

      return (
        mob * 80 +
        frontier(state) * 40 +
        cornerScore(state) * 10 +
        pstScore(state) * 2 +
        dangerScore(state)
      );
    }

    // 中盤

    if(empties > 14){

      return (
        mob * 60 +
        frontier(state) * 25 +
        cornerScore(state) * 10 +
        pstScore(state) * 4 +
        discScore(state) * 2 +
        dangerScore(state)
      );
    }

    // 終盤

    return (
      mob * 30 +
      cornerScore(state) * 15 +
      pstScore(state) * 2 +
      discScore(state) * 100 +
      dangerScore(state)
    );
  }

  // =====================
  // ordering
  // =====================

  function sortMoves(moves){

    moves.sort((a,b)=>{

      let sa = 0;
      let sb = 0;

      sa += PST[a.y][a.x];
      sb += PST[b.y][b.x];

      sa += a.flips.length * 3;
      sb += b.flips.length * 3;

      // corner bonus

      if(
        (a.x===0&&a.y===0)||
        (a.x===0&&a.y===7)||
        (a.x===7&&a.y===0)||
        (a.x===7&&a.y===7)
      ){
        sa += 9999;
      }

      if(
        (b.x===0&&b.y===0)||
        (b.x===0&&b.y===7)||
        (b.x===7&&b.y===0)||
        (b.x===7&&b.y===7)
      ){
        sb += 9999;
      }

      return sb - sa;
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

    if(depth <= 0){

      return (
        player === WHITE
        ? evaluate(state,empties)
        : -evaluate(state,empties)
      );
    }

    let moves =
      generateMoves(state,player);

    // pass

    if(moves.length === 0){

      const enemyMoves =
        generateMoves(state,opp(player));

      // game over

      if(enemyMoves.length === 0){

        return (
          player === WHITE
          ? evaluate(state,empties)
          : -evaluate(state,empties)
        );
      }

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

      // alpha beta cut

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

  // 安定高速化

  if(empties <= 20){
    maxDepth = 9;
  }

  // 終盤少し強化

  if(empties <= 14){
    maxDepth = 11;
  }

  // 完全読み暴走防止

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

    // PV ordering
    // strongest move first next iteration

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
  }

  return [
    bestMove.x,
    bestMove.y
  ];
}
