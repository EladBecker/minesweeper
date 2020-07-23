function renderBoard(board) {
    var strHTML = ``;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        var numClass;
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            var currCellContent;
            if(!currCell.isShown)currCellContent = EMPTY;
            else{
                if (currCell.isMine && !currCell.isMarked) currCellContent = MINE;
                else if (currCell.isMarked) currCellContent = FLAG;
                else if (currCell.minesAroundCount) {
                    currCellContent = currCell.minesAroundCount;
                    numClass = 'clicked-'+currCell.minesAroundCount;
                }
                else if (!currCell.minesAroundCount) currCellContent = EMPTY;
            }
            strHTML +=
                `<td class="cell">
                <button id="btn-${i}-${j}" 
                    class="${currCell.isShown ? 'clicked' : ''} ${numClass}"
                    onclick="cellClicked(this, ${i}, ${j})" 
                    oncontextmenu="cellMarked(this, ${i}, ${j})">
                    ${currCellContent}
                </button>
            </td>`;
        }
        strHTML += `</tr>`;
    }
    document.querySelector('.board').innerHTML = strHTML;
}

function updateBestTimeEl() {
    var bestTime;
    var strHTML = `<p><u>TOP SCORERS</u><p><table>`;
    var levels = ['Easy', 'Medium', 'Hard'];
    for (var i = 0; i < gLevels.length; i++) {
        bestTime = {
            name: localStorage.getItem('bestName' + i),
            time: localStorage.getItem('bestTime' + i)
        };
        strHTML += `<tr>
            <td>${levels[i]} </td>
            <td>:</td><td> ${bestTime.name || ''} </td>
            <td>|</td><td>${bestTime.time ? bestTime.time + 'secs' : ''}</td>
            </tr>`;
    }
    strHTML += `</table>`;
    var elBestTime = document.querySelector('.best-times');
    elBestTime.innerHTML = strHTML;
}

function setBestTime() {
    var bestTime = {
        name: localStorage.getItem('bestName' + gLevelIdx),
        time: localStorage.getItem('bestTime' + gLevelIdx)
    }
    if (bestTime.time === null || gGame.secsPassed < bestTime.time) {
        localStorage.setItem('bestName' + gLevelIdx,
            prompt('Best Time! Please Enter Your name:'));
        localStorage.setItem('bestTime' + gLevelIdx, gGame.secsPassed);
    }
    updateBestTimeEl();
}

function updateMinesDisplayEl() {
    if (gGame.level.mines - gGame.markedCount < 0) return;
    var elMines = document.querySelector('.mines-display');
    elMines.innerText = (gGame.level.mines - gGame.markedCount);
}