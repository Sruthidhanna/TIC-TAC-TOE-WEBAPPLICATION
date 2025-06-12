const board = document.getElementById('board');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');

const moveSound = document.getElementById('move-sound');
const winSound = document.getElementById('win-sound');

const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');

let gameState = Array(9).fill("");
let currentPlayer = 'X';
let gameActive = true;

const human = 'X';
const ai = 'O';

const scores = { X: 0, O: 0, draw: 0 };

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function handleCellClick(index) {
  if (!gameActive || gameState[index] !== "" || currentPlayer !== human) return;

  makeMove(index, human);
  moveSound.play();
  if (checkGameOver(human)) return;

  setTimeout(() => {
    const move = chooseMoveByDifficulty();
    makeMove(move, ai);
    moveSound.play();
    checkGameOver(ai);
  }, 300);
}

function makeMove(index, player) {
  gameState[index] = player;
  document.querySelector(`[data-index='${index}']`).textContent = player;
  currentPlayer = player === 'X' ? 'O' : 'X';
  status.textContent = currentPlayer === human ? "Your turn (X)" : "Computer's turn (O)";
}

function highlightWin(cells) {
  cells.forEach(i => {
    const cell = document.querySelector(`[data-index='${i}']`);
    cell.classList.add('win');
  });
}

function checkGameOver(player) {
  for (const condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
      highlightWin([a, b, c]);
      winSound.play();

      gameActive = false;
      status.textContent = player === human ? "You win! 🎉" : "Computer wins! 🤖";
      updateScore(player);
      return true;
    }
  }

  if (!gameState.includes("")) {
    gameActive = false;
    status.textContent = "It's a draw!";
    updateScore("draw");
    return true;
  }

  return false;
}

function updateScore(winner) {
  if (winner === 'X') {
    scores.X++;
    scoreX.textContent = scores.X;
  } else if (winner === 'O') {
    scores.O++;
    scoreO.textContent = scores.O;
  } else {
    scores.draw++;
    scoreDraw.textContent = scores.draw;
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === "") {
      gameState[i] = ai;
      let score = minimax(gameState, 0, false);
      gameState[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

function minimax(state, depth, isMaximizing) {
  if (checkWinner(state, ai)) return 10 - depth;
  if (checkWinner(state, human)) return depth - 10;
  if (!state.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === "") {
        state[i] = ai;
        best = Math.max(best, minimax(state, depth + 1, false));
        state[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === "") {
        state[i] = human;
        best = Math.min(best, minimax(state, depth + 1, true));
        state[i] = "";
      }
    }
    return best;
  }
}

function checkWinner(state, player) {
  return winningConditions.some(([a, b, c]) => 
    state[a] === player && state[b] === player && state[c] === player
  );
}

function chooseMoveByDifficulty() {
  const difficulty = difficultySelect.value;
  const emptyIndices = gameState
    .map((val, idx) => val === "" ? idx : null)
    .filter(val => val !== null);

  if (difficulty === 'easy') {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  } else if (difficulty === 'medium') {
    return Math.random() < 0.5
      ? getBestMove()
      : emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  } else {
    return getBestMove();
  }
}

function createBoard() {
  board.innerHTML = '';
  gameState = Array(9).fill("");
  gameActive = true;
  currentPlayer = human;
  status.textContent = "Your turn (X)";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);
    cell.addEventListener('click', () => handleCellClick(i));
    board.appendChild(cell);
  }
}

restartBtn.addEventListener('click', createBoard);
createBoard();
