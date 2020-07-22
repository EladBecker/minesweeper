'use strict';

window.oncontextmenu = (e) => {
    e.preventDefault();
}

const MINE = '💣';
const FLAG = '🚩';
const SMILEY = '🙂';
const DEAD_SMILEY = '🤬';
const SUNGLASSES = '😎';


var gBoard;
var gLevels = [
    { size: 4, mines: 2 },
    { size: 8, mines: 12 },
    { size: 12, mines: 30 },
];
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

var gLevel;
var gLevelIdx;

var gElMinesDisplay = document.querySelector('.mines-display');
var gElSmiley = document.querySelector('.smileyBtn');
var gElTimer = document.querySelector('.timer');

var gTimeInterval;

function init(levelIdx) {
    gLevelIdx = levelIdx;
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gLevel = gLevels[levelIdx];
    gBoard = buildBoard(gLevel);
    renderBoard(gBoard);
    updateMinesDisplay();
    gElSmiley.innerText = SMILEY;
    gElTimer.innerText = '';
}

function restart() {
    init(gLevelIdx);
}

function updateMinesDisplay() {
    if (gLevel.mines - gGame.markedCount >= 0) gElMinesDisplay.innerText = '💣: ' + (gLevel.mines - gGame.markedCount);
}

function buildBoard(level) {
    var board = createBoard(level);
    layMines(board);
    setMinesNegsCount(board);
    return board;
}

function createBoard(level) {
    var board = [];
    for (var i = 0; i < level.size; i++) {
        var row = [];
        for (var j = 0; j < level.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            row.push(cell);
        }
        board.push(row);
    }
    return board;
}

function layMines(board) {
    var minesLocs = [];
    var minesToAdd = gLevel.mines;
    var rndLoc = getRndLoc(gLevel.size);
    minesLocs.push(rndLoc);
    minesToAdd--;
    while (minesToAdd > 0) {
        rndLoc = getRndLoc(gLevel.size);
        for (var idx = 0; idx < minesLocs.length; idx++) {
            if (minesLocs[idx].i === rndLoc.i &&
                minesLocs[idx].j === rndLoc.j) {
                break;
            }
            else {
                minesLocs.push(rndLoc);
                minesToAdd--;
                break;
            }
        }
    }
    for (var i = 0; i < minesLocs.length; i++) {
        var currMineLoc = minesLocs[i];
        board[currMineLoc.i][currMineLoc.j].isMine = true;
    }
}

function getRndLoc(boardSize) {
    return {
        i: Math.floor(Math.random() * boardSize),
        j: Math.floor(Math.random() * boardSize)
    };
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) board[i][j].minesAroundCount = countNegMines(board, i, j);
        }
    }
}

function countNegMines(board, iIdx, jIdx) {
    var countMines = 0;
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (i < 0 || i >= board.length ||
                j < 0 || j >= board[i].length ||
                i === iIdx && j === jIdx) continue;
            if (board[i][j].isMine) countMines++;
        }
    }
    return countMines;
}

function renderBoard(board) {
    var strHTML = ``;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[i].length; j++) {
            var currCellContent = (board[i][j].isMine) ? MINE : board[i][j].minesAroundCount;
            currCellContent = (board[i][j].isShown) ? currCellContent : '';
            strHTML +=
                `<td class="cell">
                <button id="btn-${i}-${j}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})">
                    ${currCellContent}
                </button>
            </td>`;
        }
        strHTML += `</tr>`;
    }
    document.querySelector('.board').innerHTML = strHTML;
}

function startTimer() {
    if (gGame.secsPassed === 0) {
        gTimeInterval = setInterval(function () {
            // var secsPass = gGame.secsPassed++;
            // var displayTime = '';
            // if (secsPass < 10) displayTime += '00';
            // else if (secsPass < 100) displayTime += '0';
            // displayTime += secsPass;
            // gElTimer.innerText = displayTime;
            gElTimer.innerText = ++gGame.secsPassed;
        }, 1000);
    }
}

function cellClicked(elCell, iIdx, jIdx) {
    startTimer();
    if (gGame.isOn) {
        var currCell = gBoard[iIdx][jIdx];
        if (currCell.isShown || currCell.isMarked) return;
        currCell.isShown = true;
        if (currCell.isMine) {
            if (gGame.secsPassed !== 0) {
                gGame.isOn = false;
                showAllMines(gBoard);
                clearInterval(gTimeInterval);
                gElSmiley.innerText = DEAD_SMILEY;
            }
            else {
                var newMineLoc;
                isNewLocFree = false;
                while (!isNewLocFree) {
                    newMineLoc = getRndLoc(gLevel.size);
                    if (!gBoard[newMineLoc.i][newMineLoc.j].isMine) {
                        gBoard[newMineLoc.i][newMineLoc.j].isMine = true;
                        gBoard[i][j].minesAroundCount = countNegMines(gBoard, i, j);
                        cellClicked(elCell, i, j);
                        isNewLocFree = true;
                    }
                }
            }
        }
        if (!currCell.minesAroundCount) {
            for (var i = iIdx - 1; i <= iIdx + 1; i++) {
                for (var j = jIdx - 1; j <= jIdx + 1; j++) {
                    if (i < 0 || i >= gBoard.length ||
                        j < 0 || j >= gBoard[i].length ||
                        i === iIdx && j === jIdx ||
                        gBoard[i][j].isMine) continue;
                    var elNegCell = document.querySelector('#btn-' + i + '-' + j);
                    cellClicked(elNegCell, i, j);
                }
            }
        }
        gGame.shownCount++;
        renderCell(elCell, iIdx, jIdx);
        if (checkGameOver()) {
            gGame.isOn = false;
            clearInterval(gTimeInterval);
            gElSmiley.innerText = SUNGLASSES;
            // alert('win');
        }
    }
}

function renderCell(elCell, i, j) {
    var cellVal = (gBoard[i][j].isMine) ? MINE : gBoard[i][j].minesAroundCount;
    elCell.innerText = cellVal;
}

function checkGameOver() {
    return gGame.shownCount + gGame.markedCount === gLevel.size ** 2;
}

function showAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isShown = true;
                var elCell = document.querySelector('#btn-' + i + '-' + j)
                elCell.innerText = MINE;
            }
        }
    }
}

function cellMarked(elCell, iIdx, jIdx) {
    startTimer();
    var isFlagged = elCell.classList.toggle('flagged');
    if (isFlagged) {
        gBoard[iIdx][jIdx].isMarked = !gBoard[iIdx][jIdx].isMarked;
        elCell.innerText = FLAG;
        gGame.markedCount++;
        updateMinesDisplay();
    } else {
        gBoard[iIdx][jIdx].isMarked = !gBoard[iIdx][jIdx].isMarked;
        elCell.innerText = '';
        gGame.markedCount--;
        updateMinesDisplay();
    }
}
