function cellMarked(elCell, i, j) {
    if (!gGame.isOn) {
        if (gGame.shownCount !== 0) return;
        startTimer();
    }
    gUndos.push(JSON.parse(JSON.stringify(gBoard)));
    console.log(gUndos);
    var currCell = gBoard[i][j];
    currCell.isMarked = !currCell.isMarked;
    if (currCell.isMarked) {
        elCell.innerText = FLAG;
        gGame.markedCount++;
        if (gGame.markedCount === gGame.level.mines && checkGameOver()) {
            gGame.isOn = false;
            clearInterval(gTimeInterval);
            gElSmiley.innerText = SUNGLASSES;
        }
    } else {
        elCell.innerText = '';
        gGame.markedCount--;
    }
    updateMinesDisplayEl();
    elCell.classList.toggle('flagged');
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        if (gGame.shownCount !== 0) return;
        gGame.isOn = true;
        layMines(i, j);
        setMinesNegsCount(gBoard);
        startTimer();
    }
    var currCell = gBoard[i][j];
    if (currCell.isShown || currCell.isMarked) return;
    if (gGame.hintMode) {
        gGame.hintCount--;
        var hintsStr = HINT + 'x ';
        if (gGame.hintCount === 0) {
            gElHint.classList.remove('unused');
            hintsStr = HINT_USED + 'x ';
        }
        hintsStr += gGame.hintCount;
        var hints = [];
        for (var hintI = i - 1; hintI <= i + 1; hintI++) {
            for (var hintJ = j - 1; hintJ <= j + 1; hintJ++) {
                if (hintI < 0 || hintI > gBoard.length - 1 ||
                    hintJ < 0 || hintJ > gBoard[hintI].length - 1 ||
                    gBoard[hintI][hintJ].isShown ||
                    gBoard[hintI][hintJ].isMarked) continue;
                hints.push({ i: hintI, j: hintJ });
            }
        }
        gElHint.innerText = hintsStr;
        toggleHint(hints, true);
        setTimeout(function () {
            gGame.hintMode = false;
            toggleHint(hints, false);
        }, 1000);
        return;
    }
    gUndos.push(JSON.parse(JSON.stringify(gBoard)));
    currCell.isShown = true;
    if (currCell.minesAroundCount) {
        elCell.classList.add(`clicked-${currCell.minesAroundCount}`)
    }
    if (currCell.isMine) {
        if (gGame.lives > 0) {
            currCell.isShown = false;
            gGame.lives--;
            var elPopUpLife = document.querySelector('.popup-life');
            var elLives = document.querySelector('.lives-display');
            elLives.innerText = gGame.lives;
            elPopUpLife.hidden = false;
            setTimeout(function () {
                elPopUpLife.hidden = true;
            }, 1000);
            return;
        }
        // game over - you lost
        gGame.isOn = false;
        showAllMines(gBoard);
        clearInterval(gTimeInterval);
        gElSmiley.innerText = DEAD_SMILEY;
        return;
    }
    expandShown(gBoard, elCell, i, j);
    if (checkGameOver()) {
        // game over - you win
        gGame.isOn = false;
        clearInterval(gTimeInterval);
        gElSmiley.innerText = SUNGLASSES;
        setBestTime();
    }
}

function expandShown(board, elCell, iIdx, jIdx) {
    var currCell = board[iIdx][jIdx];
    if (currCell.minesAroundCount) {
        elCell.classList.add(`clicked-${currCell.minesAroundCount}`)
    }
    currCell.isShown = true;
    gGame.shownCount++;
    elCell.innerText = (currCell.minesAroundCount) ? currCell.minesAroundCount : EMPTY;
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

function safeClick() {
    if (!gGame.isOn) return;
    if (!gGame.safeClicks) return;
    gGame.safeClicks--;
    var rndLoc = getRndLoc(gGame.level.size);
    while (
        gBoard[rndLoc.i][rndLoc.j].isMine ||
        gBoard[rndLoc.i][rndLoc.j].isShown) {
        rndLoc = getRndLoc(gGame.level.size);
    }
    var elCell = document.querySelector('#btn-' + rndLoc.i + '-' + rndLoc.j);
    elCell.classList.add('flash');
    setTimeout(function () {
        elCell.classList.remove('flash');
    }, 2000);
}

function hintClicked() {
    if (gGame.hintCount > 0) gGame.hintMode = !gGame.hintMode;
}

function restart() {
    clearInterval(gTimeInterval);
    init(gLevelIdx);
}

function undo() {
    if (!gGame.isOn || !gUndos.length) return;
    gBoard = gUndos.pop();
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            gGame.shownCount = gBoard[i][j].isShown ? gGame.shownCount + 1 : gGame.shownCount;
            gGame.markedCount = gBoard[i][j].isMarked ? gGame.markedCount + 1 : gGame.markedCount;
        }
    }
    renderBoard(gBoard);
}

function toggleHint(hints, toShow) {
    for (var i = 0; i < hints.length; i++) {
        var currCell = gBoard[hints[i].i][hints[i].j];
        currCell.isShown = toShow;
        var currElCell = document.querySelector('#btn-' + hints[i].i + '-' + hints[i].j);
        var classNum = 'clicked-' + currCell.minesAroundCount;
        if (toShow) {
            var btnStr = currCell.isMine ? MINE : currCell.minesAroundCount;
            btnStr = btnStr ? btnStr : '';
            currElCell.innerText = btnStr;
            currElCell.classList.add('clicked', classNum);
        } else {
            currElCell.innerText = '';
            currElCell.classList.remove('clicked', classNum);
        }
    }
}