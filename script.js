let numSquares = 1;
let maxBoardScore = BigInt(2 ** (numSquares * numSquares) - 1) * 100n;
let boardScore = 0n;
let boardScoreIncrPerSecond = 1n;

let squaresTotal = 0n;
let squaresUnclaimed = 0n;

setInterval(function() {
    increment();
    draw();
    updateScores();
}, 10);

function increment() {
    boardScore += boardScoreIncrPerSecond;

    if(boardScore > maxBoardScore)
    {
        boardScore = maxBoardScore;
    }

    squaresUnclaimed += boardScore / 100n;
    
    if(squaresTotal >= dimensionsPrice() && boardScore == maxBoardScore) {
        document.getElementById("upgrade-dimensions").disabled = false;
    }
}

function draw() {
    let canvas = document.getElementById("canvas");
    if(canvas.getContext) {
        let ctx = canvas.getContext("2d");

        let dxWindow = canvas.width = document.getElementById("board").offsetWidth;
        let dyWindow = canvas.height = document.getElementById("board").offsetHeight;

        let dxBoard = dyBoard = Math.min(dxWindow, dyWindow) * 0.8;
        
        let xBoard = dxWindow/2 - dxBoard/2;
        let yBoard = dyWindow/2 - dyBoard/2;

        ctx.fillStyle = "rgb(64, 64, 64)";
        ctx.fillRect(xBoard, yBoard, dxBoard, dyBoard);


        let dxSquare = dySquare = dxBoard * 0.8 / numSquares;

        for(let i = 0; i < numSquares; ++i) {
            let ySquare = yBoard + i * dySquare + dySquare * 0.1 + dyBoard * 0.1;

            for(let j = 0; j < numSquares; ++j) {
                let xSquare = xBoard + j * dxSquare + dxSquare * 0.1 + dxBoard * 0.1;
                let squareIndex = BigInt(numSquares * numSquares - (i * numSquares + j) - 1);

                if(((boardScore/100n) >> squareIndex) & 1n) {
                    ctx.fillStyle = "rgb(224, 227, 36)";
                }
                else {
                    ctx.fillStyle = "rgb(84, 84, 84)";
                }

                ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
            }
        }
    }
}

function updateScores() {
    document.getElementById("squares-total").innerHTML = bigIntToExp(squaresTotal);
    document.getElementById("squares-unclaimed").innerHTML = bigIntToExp(squaresUnclaimed / 100n);
    document.getElementById("squares-delta").innerHTML = bigIntToExp(boardScore / 100n) + " square" + (boardScore / 100n == 1 ? " " : "s ");
}

function bigIntToExp(b) {
    if(b < 10000) {
        return b.toString();
    }
    let len = b.toString().length;
    return b.toString().charAt(0) + "." + b.toString().substring(1, 3) + "e" + len;
}

function claimSquares() {
    squaresTotal += squaresUnclaimed / 100n;
    squaresUnclaimed = 0n;
    boardScore = 0n;

    if(squaresTotal >= dimensionsPrice() && boardScore == maxBoardScore) {
        document.getElementById("upgrade-dimensions").disabled = false;
    }

    if(squaresTotal >= speedPrice()) {
        document.getElementById("upgrade-speed").disabled = false;
    }
}

function dimensionsPrice() {
    return numSquares*10;
}

function upgradeDimensions() {
    squaresTotal -= BigInt(dimensionsPrice());
    ++numSquares;
    maxBoardScore = BigInt(2 ** (numSquares * numSquares) - 1) * 100n;
    boardScore = 0n;
    document.getElementById("upgrade-dimensions").disabled = true;
    document.getElementById("price-dimensions").innerHTML = bigIntToExp(dimensionsPrice());
    document.getElementById("level-dimensions").innerHTML = bigIntToExp(numSquares) + " -> " + bigIntToExp(numSquares + 1);

    if(numSquares > 1) {
        document.getElementById("speed").hidden = false;
    }
}

function speedPrice() {
    return boardScoreIncrPerSecond * 100n;
}

function upgradeSpeed() {
    squaresTotal -= BigInt(speedPrice());
    boardScoreIncrPerSecond *= 2n;

    if(squaresTotal < speedPrice()) {
        document.getElementById("upgrade-speed").disabled = true;
    }

    document.getElementById("price-speed").innerHTML = bigIntToExp(speedPrice());
    document.getElementById("level-speed").innerHTML = bigIntToExp(boardScoreIncrPerSecond) + "/s -> " + bigIntToExp(boardScoreIncrPerSecond*2n) + "/s";
}