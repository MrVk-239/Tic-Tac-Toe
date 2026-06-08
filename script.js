  // --- State ---
  const gridEl = document.getElementById('grid');
  const turnTag = document.getElementById('turnTag');
  const roundTag = document.getElementById('roundTag');
  const seriesTag = document.getElementById('seriesTag');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreDEl = document.getElementById('scoreD');
  const progressFill = document.getElementById('progressFill');
  const toast = document.getElementById('toast');

  const seriesSelect = document.getElementById('seriesSelect');
  const customInput = document.getElementById('customInput');
  const newSeriesBtn = document.getElementById('newSeriesBtn');
  const swapStarterBtn = document.getElementById('swapStarterBtn');
  const nextRoundBtn = document.getElementById('nextRoundBtn');
  const resetBoardBtn = document.getElementById('resetBoardBtn');

  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let starterPlayer = 'X';
  let gameActive = true;

  let winsX = 0, winsO = 0, draws = 0, roundsPlayed = 0, seriesLength = 5;

  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];

  // --- UI Helpers ---
  function showToast(msg, ms=1500){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), ms);
  }

  function setTurnTag(p){
    turnTag.textContent = `Turn: ${p}`;
    turnTag.className = `tag ${p.toLowerCase()}`;
  }

  function updateSeriesTags(){
    roundTag.textContent = `Round ${roundsPlayed + 1}`;
    seriesTag.textContent = `Series: ${roundsPlayed} / ${seriesLength}`;
    const pct = seriesLength ? Math.min(100, Math.round((roundsPlayed/seriesLength)*100)) : 0;
    progressFill.style.width = pct + '%';
  }

  function paintBoard(){
    gridEl.innerHTML = '';
    board.forEach((val, i)=>{
      const cell = document.createElement('div');
      cell.className = 'cell' + (val ? ' disabled '+val.toLowerCase() : '');
      cell.dataset.idx = i;
      cell.textContent = val;
      if(gameActive && !val) cell.addEventListener('click', onCell);
      gridEl.appendChild(cell);
    });
  }

  // --- Game Logic ---
  function checkWin(player){
    for(const [a,b,c] of wins){
      if(board[a]===player && board[b]===player && board[c]===player){
        markWinners([a,b,c]);
        return true;
      }
    }
    return false;
  }

  function markWinners(arr){
    const cells = [...gridEl.children];
    arr.forEach(i=>{
      cells[i].classList.add('winner');
    });
  }

  function onCell(e){
    const i = +e.currentTarget.dataset.idx;
    if(board[i] || !gameActive) return;
    board[i] = currentPlayer;
    paintBoard();

    if(checkWin(currentPlayer)){
      gameActive = false;
      if(currentPlayer==='X'){ winsX++; scoreXEl.textContent = winsX; }
      else { winsO++; scoreOEl.textContent = winsO; }
      roundsPlayed++;
      updateSeriesTags();
      nextRoundBtn.disabled = false;
      showToast(`🎉 ${currentPlayer} wins this round!`);
      checkSeriesEnd();
      return;
    }

    if(board.every(v=>v)){
      gameActive = false; draws++; scoreDEl.textContent = draws;
      roundsPlayed++;
      updateSeriesTags();
      nextRoundBtn.disabled = false;
      showToast('🤝 Draw!');
      checkSeriesEnd();
      return;
    }

    currentPlayer = currentPlayer==='X' ? 'O' : 'X';
    setTurnTag(currentPlayer);
  }

  function clearBoard(keepStarter=true){
    board = Array(9).fill('');
    gameActive = true;
    currentPlayer = keepStarter ? starterPlayer : 'X';
    setTurnTag(currentPlayer);
    paintBoard();
  }

  function nextRound(){
    // Alternate starter for fairness
    starterPlayer = starterPlayer==='X' ? 'O' : 'X';
    clearBoard(true);
    nextRoundBtn.disabled = true;
    updateSeriesTags();
  }

  function checkSeriesEnd(){
    if(roundsPlayed >= seriesLength){
      gameActive = false;
      const winner = winsX===winsO ? 'No one — it\'s a tie!' : (winsX>winsO ? 'Player X' : 'Player O');
      showToast(`🏆 Series complete! Winner: ${winner}`, 2200);
      nextRoundBtn.disabled = true;
    }
  }

  // --- Series Controls ---
  seriesSelect.addEventListener('change', ()=>{
    if(seriesSelect.value==='custom'){
      customInput.style.display = 'block';
      customInput.focus();
    }else{
      customInput.style.display = 'none';
    }
  });

  newSeriesBtn.addEventListener('click', ()=>{
    let len = seriesSelect.value==='custom' ? parseInt(customInput.value,10) : parseInt(seriesSelect.value,10);
    if(!len || len<1){ showToast('Enter a valid series length'); return; }
    if(len%2===0){ showToast('Use an odd number (best-of)'); return; }

    seriesLength = len;
    winsX = winsO = draws = roundsPlayed = 0;
    scoreXEl.textContent = '0'; scoreOEl.textContent = '0'; scoreDEl.textContent = '0';
    starterPlayer = 'X'; // reset starter by default
    clearBoard(true);
    nextRoundBtn.disabled = true;
    updateSeriesTags();
    showToast(`New series: Best of ${seriesLength}`);
  });

  swapStarterBtn.addEventListener('click', ()=>{
    starterPlayer = (starterPlayer==='X') ? 'O' : 'X';
    currentPlayer = starterPlayer;
    setTurnTag(currentPlayer);
    showToast(`Starter swapped to ${starterPlayer}`);
  });

  nextRoundBtn.addEventListener('click', ()=>{
    if(roundsPlayed >= seriesLength){ showToast('Series finished. Start a new one!'); return; }
    nextRound();
  });

  resetBoardBtn.addEventListener('click', ()=>{
    clearBoard(); // keep current starter
    nextRoundBtn.disabled = true;
    showToast('Board cleared');
  });

  // --- Init ---
  updateSeriesTags();
  setTurnTag(currentPlayer);
  paintBoard();