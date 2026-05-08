// =====================
// cpu3.js optimized
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
  // TT
  // =====================

  const TT = new Map();

  const killerMoves = Array.from(
    {length:64},
    ()=>null
  );

  const history = Array.from(
    {length:8},
    ()=>Array(8).fill(0)
  );

  function hashBoard(state,player){

    let s = "";

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){
        s += state[y][x];
      }
    }

    return s + player;
  }

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

    let flips = null;

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

        if(!flips){
          flips = [];
        }

        flips.push(...line);
      }
    }

    return flips;
  }

  // =====================
  // generate
  // =====================

  function generateMoves(state,player){

    const moves = [];

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        if(state[y][x] !== EMPTY){
          continue;
        }

        const flips =
          getFlips(state,x,y,player);

        if(flips){

          let score = PST[y][x];

          score += flips.length * 2;

          if(
            (x===0&&y===0)||
            (x===0&&y===7)||
            (x===7&&y===0)||
            (x===7&&y===7)
          ){
            score += 10000;
          }

          moves.push({
            x,
            y,
            flips,
            score,
            orderScore: score
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
  // evaluate helpers
  // =====================

  function mobilityFromMoves(myMoves,enemyMoves){

    return myMoves.length - enemyMoves.length;
  }

  function cornerScore(state){

    let s = 0;

    const corners = [
      [0,0],
      [0,7],
      [7,0],
      [7,7]
    ];

    for(let i=0;i<4;i++){

      const c = corners[i];

      const p = state[c[1]][c[0]];

      if(p === WHITE) s += 1000;
      if(p === BLACK) s -= 1000;
    }

    return s;
  }

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

  function discScore(state){

    let s = 0;

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        if(state[y][x] === WHITE) s++;
        else if(state[y][x] === BLACK) s--;
      }
    }

    return s;
  }

  function dangerScore(state){

    let s = 0;

    if(state[0][0] === EMPTY){
      if(state[1][1] === WHITE) s -= 300;
      if(state[1][1] === BLACK) s += 300;
    }

    if(state[0][7] === EMPTY){
      if(state[1][6] === WHITE) s -= 300;
      if(state[1][6] === BLACK) s += 300;
    }

    if(state[7][0] === EMPTY){
      if(state[6][1] === WHITE) s -= 300;
      if(state[6][1] === BLACK) s += 300;
    }

    if(state[7][7] === EMPTY){
      if(state[6][6] === WHITE) s -= 300;
      if(state[6][6] === BLACK) s += 300;
    }

    return s;
  }

  // =====================
  // frontier
  // =====================

  function frontierScore(state){

    let w = 0;
    let b = 0;

    for(let y=0;y<8;y++){
      for(let x=0;x<8;x++){

        const p = state[y][x];

        if(p === EMPTY){
          continue;
        }

        for(let i=0;i<8;i++){

          const nx = x + dirs[i][0];
          const ny = y + dirs[i][1];

          if(
            inRange(nx,ny) &&
            state[ny][nx] === EMPTY
          ){
            if(p === WHITE) w++;
            else b++;
            break;
          }
        }
      }
    }

    return b - w;
  }

  // =====================
  // evaluate
  // =====================

  function evaluate(state,empties,myMoves,enemyMoves){

    if(myMoves.length === 0 && enemyMoves.length === 0){

      const d = discScore(state);

      if(d > 0) return INF;
      if(d < 0) return -INF;

      return 0;
    }

    const mobility =
      mobilityFromMoves(myMoves,enemyMoves);

    // opening
    if(empties > 40){

      return (
        mobility * 90 +
        frontierScore(state) * 25 +
        cornerScore(state) * 10 +
        pstScore(state) * 2 +
        dangerScore(state)
      );
    }

    // middle
    if(empties > 14){

      return (
        mobility * 70 +
        cornerScore(state) * 12 +
        pstScore(state) * 4 +
        discScore(state) +
        dangerScore(state)
      );
    }

    // endgame
    return (
      mobility * 25 +
      cornerScore(state) * 20 +
      pstScore(state) * 2 +
      discScore(state) * 120 +
      dangerScore(state)
    );
  }

  // =====================
  // sort
  // =====================

  function sortMoves(moves,pvMove,depth){

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

    for(let i=0;i<moves.length;i++){

      const m = moves[i];

      let score = m.score;

      const killer = killerMoves[depth];

      if(
        killer &&
        m.x === killer.x &&
        m.y === killer.y
      ){
        score += 5000;
      }

      score += history[m.y][m.x];

      m.orderScore = score;
    }

    moves.sort(
      (a,b)=>b.orderScore-a.orderScore
    );
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
    empties,
    passed
  ){

    const key =
      hashBoard(state,player) + depth;

    const tt = TT.get(key);

    if(tt !== undefined){
      return tt;
    }

    const moves =
      generateMoves(state,player);

    const enemyMoves =
      generateMoves(state,opp(player));

    if(
      depth <= 0 ||
      (moves.length===0 && enemyMoves.length===0)
    ){

      const val = (
        player === WHITE
          ? evaluate(state,empties,moves,enemyMoves)
          : -evaluate(state,empties,enemyMoves,moves)
      );

      TT.set(key,val);

      return val;
    }

    if(moves.length === 0){

      if(passed){
        return 0;
      }

      return -negamax(
        state,
        depth,
        -beta,
        -alpha,
        opp(player),
        empties,
        true
      );
    }

    sortMoves(moves,null,depth);

    let first = true;

    for(let i=0;i<moves.length;i++){

      const move = moves[i];

      doMove(state,move,player);

      let score;

      // PVS
      if(first){

        score = -negamax(
          state,
          depth-1,
          -beta,
          -alpha,
          opp(player),
          empties-1,
          false
        );

        first = false;

      }else{

        score = -negamax(
          state,
          depth-1,
          -alpha-1,
          -alpha,
          opp(player),
          empties-1,
          false
        );

        if(alpha < score && score < beta){

          score = -negamax(
            state,
            depth-1,
            -beta,
            -score,
            opp(player),
            empties-1,
            false
          );
        }
      }

      undoMove(state,move,player);

      if(score > alpha){
        alpha = score;
      }

      if(alpha >= beta){

        killerMoves[depth] = {
          x: move.x,
          y: move.y
        };

        history[move.y][move.x] +=
          depth * depth;

        break;
      }
    }

    TT.set(key,alpha);

    return alpha;
  }

  // =====================
  // root
  // =====================

  let empties = 0;

  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){

      if(board[y][x] === EMPTY){
        empties++;
      }
    }
  }

  let maxDepth = 8;

  if(empties <= 20){
    maxDepth = 9;
  }

  if(empties <= 14){
    maxDepth = 10;
  }

  // safer full search
  if(empties <= 8){
    maxDepth = empties;
  }

  let bestMove = null;

  let rootMoves =
    generateMoves(board,WHITE);

  if(rootMoves.length === 0){
    return null;
  }

  sortMoves(rootMoves,null,0);

  for(let depth=2;depth<=maxDepth;depth++){

    let bestScore = -INF;

    sortMoves(
      rootMoves,
      bestMove,
      depth
    );

    for(let i=0;i<rootMoves.length;i++){

      const move = rootMoves[i];

      doMove(board,move,WHITE);

      const score = -negamax(
        board,
        depth-1,
        -INF,
        INF,
        BLACK,
        empties-1,
        false
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
