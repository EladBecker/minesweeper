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
    secsPassed: 0,
    isFirstClick: true
};

var gLevel;
var gLevelIdx;

var gElMinesDisplay = document.querySelector('.mines-display');
var gElSmiley = document.querySelector('.smiley-container');
var gElTimer = document.querySelector('.timer');

var gTimeInterval;

function init(levelIdx) {
    gLevelIdx = levelIdx;
    gGame.isOn = true;
    gGame.isFirstClick = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gLevel = gLevels[levelIdx];
    gBoard = buildBoard(gLevel);
    renderBoard(gBoard);
    updateMinesDisplay();
    gElSmiley.innerText = SMILEY;
    gElTimer.innerText = '000';
}

function restart() {
    clearInterval(gTimeInterval);
    init(gLevelIdx);
}

function updateMinesDisplay() {
    if (gLevel.mines - gGame.markedCount < 0) return;
    gElMinesDisplay.innerText = '💣: ' + (gLevel.mines - gGame.markedCount);
}

function buildBoard(level) {
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

function layMines(rowIdx, colIdx) {
    for (var i = 0; i < gLevel.mines; i++) {
        var rndLoc = getRndLoc(gLevel.size);
        while (gBoard[rndLoc.i][rndLoc.j].isMine ||
            rndLoc.i === rowIdx && rndLoc.j === colIdx) {
            rndLoc = getRndLoc(gLevel.size);
        }
        gBoard[rndLoc.i][rndLoc.j].isMine = true;
    }
}

function getRndLoc(boardSize) {
    return {
        i: getRandomInt(0, boardSize),
        j: getRandomInt(0, boardSize)
    };
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countNegMines(board, i, j);
            }
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
    gGame.isFirstClick = false;
    gTimeInterval = setInterval(function () {
        gGame.secsPassed++;
        var secsStr = '';
        if (gGame.secsPassed < 10) secsStr += '00';
        else if (gGame.secsPassed < 100) secsStr += '0';
        secsStr += gGame.secsPassed;
        gElTimer.innerText = secsStr;
    }, 1000);
}

function cellClicked(elCell, i, j) {
    if (gGame.isFirstClick) {
        layMines(i, j);
        setMinesNegsCount(gBoard);
        startTimer();
    }
    if (!gGame.isOn) return;
    var currCell = gBoard[i][j];
    if (currCell.isShown || currCell.isMarked) return;
    currCell.isShown = true;
    if (currCell.isMine) {
        // game over - you lost
        gGame.isOn = false;
        gGame.isFirstClick = true;
        showAllMines(gBoard);
        clearInterval(gTimeInterval);
        gElSmiley.innerText = DEAD_SMILEY;
        return;
    }
    expandShown(gBoard, elCell, i, j);
    if (checkGameOver()) {
        // game over - you win
        gGame.isOn = false;
        gGame.isFirstClick = true;
        clearInterval(gTimeInterval);
        gElSmiley.innerText = SUNGLASSES;
    }
}

function expandShown(board, elCell, iIdx, jIdx) {
    var currCell = board[iIdx][jIdx];
    currCell.isShown = true;
    gGame.shownCount++;
    elCell.innerText = (currCell.minesAroundCount) ? currCell.minesAroundCount : '';
    elCell.classList.add('clicked');
    if (currCell.minesAroundCount) return; //if it has mines neighbours go back
    else {
        //if it's an empty cell, run around all the neighbours and check for them
        for (var i = iIdx - 1; i <= iIdx + 1; i++) {
            for (var j = jIdx - 1; j <= jIdx + 1; j++) {
                if (i < 0 || i >= board.length ||
                    j < 0 || j >= board[i].length ||
                    i === iIdx && j === jIdx ||
                    board[i][j].isMine ||
                    board[i][j].isShown) continue;
                var elNegCell = document.querySelector('#btn-' + i + '-' + j);
                expandShown(board, elNegCell, i, j);
            }
        }
        return;
    }
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

function cellMarked(elCell, i, j) {
    if (gGame.isFirstClick) startTimer();
    var currCell = gBoard[i][j];
    currCell.isMarked = !currCell.isMarked;
    if (currCell.isMarked) {
        elCell.innerText = FLAG;
        gGame.markedCount++;
        if (gGame.markedCount === gLevel.mines && checkGameOver()) {
            gGame.isOn = false;
            gGame.isFirstClick = true;
            clearInterval(gTimeInterval);
            gElSmiley.innerText = SUNGLASSES;
        }
    } else {
        elCell.innerText = '';
        gGame.markedCount--;
    }
    updateMinesDisplay();
    elCell.classList.toggle('flagged');
}
