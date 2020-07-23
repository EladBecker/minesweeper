'use strict';

window.oncontextmenu = (e) => {
    e.preventDefault();
}

const EMPTY = '';
const MINE = '💣';
const FLAG = '🚩';
const SMILEY = '🙂';
const DEAD_SMILEY = '🤬';
const SUNGLASSES = '😎';
const HINT = '❓';
const HINT_USED = '❔';

var gLevels = [
    { size: 4, mines: 2 },
    { size: 8, mines: 12 },
    { size: 12, mines: 30 },
];
var gLevelIdx;

var gGame;
var gBoard;
var gTimeInterval;
var gUndos;

var gElSmiley = document.querySelector('.smiley-container');
var gElTimer = document.querySelector('.timer');
var gElHint = document.querySelector('.hint');

function init(levelIdx) {
    gLevelIdx = levelIdx;
    gGame = {
        level: gLevels[levelIdx],
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        hintMode: false,
        hintCount: 3,
        lives: 3,
        safeClicks: 3
    }
    gBoard = buildBoard(gGame.level);
    renderBoard(gBoard);
    updateMinesDisplayEl();
    updateBestTimeEl();
    gUndos = [];
    gElSmiley.innerText = SMILEY;
    gElTimer.innerText = '000';
    gElHint.innerText = HINT + 'x ' + gGame.hintCount;
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
    for (var i = 0; i < gGame.level.mines; i++) {
        var rndLoc = getRndLoc(gGame.level.size);
        while (gBoard[rndLoc.i][rndLoc.j].isMine ||
            rndLoc.i === rowIdx && rndLoc.j === colIdx) {
            rndLoc = getRndLoc(gGame.level.size);
        }
        gBoard[rndLoc.i][rndLoc.j].isMine = true;
    }
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

function startTimer() {
    gTimeInterval = setInterval(function () {
        gGame.secsPassed++;
        var secsStr = '';
        if (gGame.secsPassed < 10) secsStr += '00';
        else if (gGame.secsPassed < 100) secsStr += '0';
        secsStr += gGame.secsPassed;
        gElTimer.innerText = secsStr;
    }, 1000);
}

function checkGameOver() {
    return gGame.shownCount + gGame.level.mines === gGame.level.size ** 2;
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
