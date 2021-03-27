let squaresTotal = 0n;
let squaresUnclaimed = 0n;
let boardScore = 0n;

class Upgrade {
    constructor(type) {
        this.type = type;
        this.level = 1n;
        this.buttonElement = type + "-button";
        this.upgradeElement = type + "-upgrade";
        this.priceElement = type + "-price";
    }

    getPrice(level) {
        if(typeof level === "undefined") {
            return this.getPrice(this.level);
        }

        switch(this.type) {
            case "dimensions":
                return 3n ** (level ** 3n - 1n) * 10n;
            case "speed":
                return 3n ** (level - 1n) * 100n;
            case "value":
                return 5n ** (level - 1n) * 200n;
            case "minerCount":
                return 10n ** 5n;
            case "minerInterval":
                return 10n ** 5n * 3n ** (level - 1n);
        }
    }

    getValue(level) {
        if(typeof level === "undefined") {
            return this.getValue(this.level);
        }
        
        switch(this.type) {
            case "dimensions":
                return 2n ** (level - 1n);
            case "speed":
                return 2n ** (level - 1n);
            case "value":
                return 3n ** (level - 1n);
            case "minerCount":
                return level;
            case "minerInterval":
                return 12000n / (2n ** (level - 1n));
        }
    }

    canDoUpgrade() {
        switch(this.type) {
            case "dimensions":
                return squaresTotal >= this.getPrice() && boardScore == (getMaxBoardScore() * 100n);
            default:
                return squaresTotal >= this.getPrice();
        }
    }

    upgradeText() {
        switch(this.type) {
            case "dimensions":
                return bigIntToExp(this.getValue()) + " -> " + bigIntToExp(this.getValue(this.level + 1n));
            case "speed":
                return bigIntToExp(this.getValue()) + "/s -> " + bigIntToExp(this.getValue(this.level + 1n)) + "/s";
            case "value":
                return "x" + bigIntToExp(this.getValue()) + " -> x" + bigIntToExp(this.getValue(this.level + 1n));
            case "minerCount":
                return bigIntToExp(this.getValue()) + " -> " + bigIntToExp(this.getValue(this.level + 1n));
            case "minerInterval":
                return bigIntToExp(this.getValue()) + "s -> " + bigIntToExp(this.getValue(this.level + 1n)) + "s";
        }
    }

    isHidden() {
        switch(this.type) {
            case "dimensions":
                return false;
            case "speed":
            case "value":
                return upgrades["dimensions"].level < 2;
            case "minerCount":
            case "minerInterval":
                return upgrades["dimensions"].level < 3;
        }
    }
}

let upgrades = {
    "dimensions": new Upgrade("dimensions"),
    "speed": new Upgrade("speed"),
    "value": new Upgrade("value"),
    "minerCount": new Upgrade("minerCount"),
    "minerInterval": new Upgrade("minerInterval"),
};

class Miner {
    constructor() {
        this.reset();
    }

    reset() {
        this.position = 0;
        this.assign();
    }

    assign() {
        while(((boardScore/100n) >> BigInt(this.position)) & 1n) {
            ++this.position;

            if(this.position + 1 > upgrades["dimensions"].getValue() ** 2n) {
                this.position = 0;
            }

            if(boardScore >= getMaxBoardScore() * 100n) {
                this.position = -1;
                return;
            }
        }


        this.progress = 0;
    }

    increment() {
        if(this.position == -1) {
            return; 
        }

        if(((boardScore/100n) >> BigInt(this.position)) & 1n) {
            this.assign();
            return;
        }

        this.progress += 1 / (parseInt(upgrades["minerInterval"].getValue()));

        if(this.progress > 1) {
            boardScore += (1n << BigInt(this.position)) * 100n;
            this.assign();
            return;
        }
    }
}

let miners = [new Miner()];

function getMaxBoardScore() {
    let dimensions = upgrades["dimensions"].getValue();
    return 2n ** (dimensions * dimensions) - 1n;
}

updateButtons();
updateUpgradeTexts();
setInterval(function() {
    increment();
    draw();
    updateScores();
}, 10);

function increment() {
    let maxBoardScore = getMaxBoardScore() * 100n;
    let incrSpeed = upgrades["speed"].getValue();
    let incrValue = upgrades["value"].getValue();

    boardScore += incrSpeed;

    if(boardScore > maxBoardScore)
    {
        boardScore = maxBoardScore;
        updateButtons();
    }

    squaresUnclaimed += incrValue * boardScore / 100n;

    miners.forEach(miner => {
        miner.increment();
    });
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

        let dimensions = parseInt(upgrades["dimensions"].getValue());
        let dxSquare = dySquare = dxBoard * 0.8 / dimensions;

        for(let i = 0; i < dimensions; ++i) {
            let ySquare = yBoard + i * dySquare + dySquare * 0.1 + dyBoard * 0.1;

            for(let j = 0; j < dimensions; ++j) {
                let xSquare = xBoard + j * dxSquare + dxSquare * 0.1 + dxBoard * 0.1;
                let squareIndex = BigInt(dimensions * dimensions - (i * dimensions + j) - 1);

                if(((boardScore/100n) >> squareIndex) & 1n) {
                    ctx.fillStyle = "rgb(224, 227, 36)";
                }
                else {
                    ctx.fillStyle = "rgb(84, 84, 84)";
                }

                ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
            }
        }

        ctx.fillStyle = "rgb(110, 230, 55)";
        miners.forEach(miner => {
            if(miner.position == -1) {
                return;
            }

            let iPos = dimensions - miner.position % dimensions - 1;
            let jPos = dimensions - Math.floor(miner.position / dimensions) - 1;
            
            let xSquare = xBoard + iPos * dxSquare + dxSquare * 0.1 + dxBoard * 0.1;
            let ySquare = yBoard + jPos * dySquare + dySquare * 0.1 + dyBoard * 0.1 + (dySquare - dySquare * miner.progress) * 0.8;

            ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8 * miner.progress);
        });
    }
}

function updateScores() {
    let incrValue = upgrades["value"].getValue();

    document.getElementById("squares-total").innerHTML = bigIntToExp(squaresTotal);
    document.getElementById("squares-unclaimed").innerHTML = bigIntToExp(squaresUnclaimed / 100n);
    document.getElementById("squares-delta").innerHTML = bigIntToExp(incrValue * boardScore / 100n) + " square" + (boardScore / 100n == 1 ? " " : "s ");
}

function bigIntToExp(b) {
    if(b < 10000) {
        return b.toString();
    }
    let len = b.toString().length;
    return b.toString().charAt(0) + "." + b.toString().substring(1, 3) + "e" + len;
}

function resetMiners() {
    miners.forEach(miner => {
        miner.reset();
    });
}

function claimSquares() {
    squaresTotal += squaresUnclaimed / 100n;
    squaresUnclaimed = 0n;
    boardScore = 0n;

    updateButtons();
    resetMiners();
}

function updateButtons() {
    Object.values(upgrades).forEach(upgrade => {
        document.getElementById(upgrade.buttonElement).disabled = !upgrade.canDoUpgrade();
        document.getElementById(upgrade.type).hidden = upgrade.isHidden();
    });
}

function updateUpgradeTexts() {
    Object.values(upgrades).forEach(upgrade => {
        document.getElementById(upgrade.upgradeElement).innerHTML = upgrade.upgradeText();
        document.getElementById(upgrade.priceElement).innerHTML = bigIntToExp(upgrade.getPrice());
    });
}

function doUpgrade(type) {
    let upgrade = upgrades[type];

    if(!upgrade.canDoUpgrade()) {
        return;
    }

    squaresTotal -= upgrade.getPrice();
    ++upgrade.level;

    if(type == "dimensions") {
        boardScore = 0n;
        resetMiners();
    }

    document.getElementById(upgrade.upgradeElement).innerHTML = upgrade.upgradeText();
    document.getElementById(upgrade.priceElement).innerHTML = bigIntToExp(upgrade.getPrice());

    updateButtons();
}
