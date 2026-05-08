// =====================
// cpu3.js
// Safe Optimized Version
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

  // =====================
  // PST
  // =====================

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

        for(let j=0;j<line.length;j++){
          flips.push(line[j]);
        }
      }
    }

    return flips.length
      ? flips
      : null;
  }

  // =====================
  // generate
  // =====================

  function generateMoves(state,player){

    let moves = [];

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

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
  // hasMove
  // =====================

  function hasMove(state,player){

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        if(state[y][x] !== EMPTY){
          continue;
        }

        if(getFlips(state,x,y,player)){
          return true;
        }
      }
    }

    return false;
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

  // =====================
  // undo
  // =====================

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
  // empty count
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

    const corners = [
      [0,0],
      [0,7],
      [7,0],
      [7,7]
    ];

    let s = 0;

    for(let i=0;i<4;i++){

      const c = corners[i];

      const p = state[c[1]][c[0]];

      if(p === WHITE){
        s += 1000;
      }

      if(p === BLACK){
        s -= 1000;
      }
    }

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

        if(p === BLACK){

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

        if(state[y][x] === BLACK){
          b++;
        }
      }
    }

    return w - b;
  }

  // =====================
  // game over
  // =====================

  function gameOver(state){

    return (
      !hasMove(state,WHITE) &&
      !hasMove(state,BLACK)
    );
  }

  // =====================
  // evaluate
  // =====================

  function evaluate(state){

    if(gameOver(state)){

      const d = discScore(state);

      if(d > 0) return INF;
      if(d < 0) return -INF;

      return 0;
    }

    const empties =
      emptyCount(state);

    // opening

    if(empties > 40){

      return (
        mobility(state) * 80 +
        frontier(state) * 40 +
        cornerScore(state) * 10 +
        pstScore(state) * 2 +
        dangerScore(state)
      );
    }

    // middle

    if(empties > 14){

      return (
        mobility(state) * 60 +
        frontier(state) * 25 +
        cornerScore(state) * 10 +
        pstScore(state) * 4 +
        discScore(state) * 2 +
        dangerScore(state)
      );
    }

    // end

    return (
      mobility(state) * 30 +
      cornerScore(state) * 15 +
      pstScore(state) * 2 +
      discScore(state) * 100 +
      dangerScore(state)
    );
  }

  // =====================
  // ordering
  // =====================

  function sortMoves(state,moves,player,pvMove){

    if(pvMove){

      for(let i=0;i<moves.length;i++){

        const m = moves[i];

        if(
          m.x === pvMove.x &&
          m.y === pvMove.y
        ){

          const tmp = moves[0];
          moves[0] = moves[i];
          moves[i] = tmp;

          break;
        }
      }
    }

    moves.sort((a,b)=>{

      let sa = 0;
      let sb = 0;

      sa += PST[a.y][a.x];
      sb += PST[b.y][b.x];

      sa += a.flips.length * 3;
      sb += b.flips.length * 3;

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
    player
  ){

    if(
      depth <= 0 ||
      gameOver(state)
    ){
      return (
        player === WHITE
        ? evaluate(state)
        : -evaluate(state)
      );
    }

    let moves =
      generateMoves(state,player);

    // pass

    if(moves.length === 0){

      return -negamax(
        state,
        depth,
        -beta,
        -alpha,
        opp(player)
      );
    }

    sortMoves(state,moves,player,null);

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
          opp(player)
        );

        first = false;

      }else{

        score = -negamax(
          state,
          depth - 1,
          -alpha - 1,
          -alpha,
          opp(player)
        );

        if(
          alpha < score &&
          score < beta
        ){

          score = -negamax(
            state,
            depth - 1,
            -beta,
            -score,
            opp(player)
          );
        }
      }

      undoMove(state,move,player);

      if(score > alpha){

        alpha = score;
      }

      if(alpha >= beta){

        break;
      }
    }

    return alpha;
  }

  // =====================
  // iterative deepening
  // =====================

  let bestMove = null;

  let maxDepth = 8;

  const empties =
    emptyCount(board);

  if(empties <= 20){
    maxDepth = 10;
  }

  if(empties <= 14){
    maxDepth = 12;
  }

  let rootMoves =
    generateMoves(board,WHITE);

  if(rootMoves.length === 0){
    return null;
  }

  sortMoves(
    board,
    rootMoves,
    WHITE,
    null
  );

  for(
    let depth = 2;
    depth <= maxDepth;
    depth++
  ){

    let bestScore = -INF;

    sortMoves(
      board,
      rootMoves,
      WHITE,
      bestMove
    );

    for(let i=0;i<rootMoves.length;i++){

      const move = rootMoves[i];

      doMove(board,move,WHITE);

      const score = -negamax(
        board,
        depth - 1,
        -INF,
        INF,
        BLACK
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
