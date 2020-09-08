/**
 *  |------|------|------|------|------|------|------|------|------|
 *  |      |      |      |      SEGMENT       |      |      |      |
 *  |------|------|------|------|------|------|------|------|------|
 *  |      |      |      |      |      |      |      |      |      |
 *  |------|------|------|------|------|------|------|------|------|
 *  |      |      |      |      |      |      |      |      |      |
 *  |------|------|------|------|------|------|------|------|------|
 *  |      |      |      |                    |      |      |      |
 *  |------|------|------|                    |------|------|------|
 *  |      |      |      |        GRID        |      |      |      |
 *  |------|------|------|                    |------|------|------|
 *  |      |      |      |                    |      |      |      |
 *  |------|------|------|------|------|------|------|------|------|
 *  |      |      |      |      |      |      |      |      |      |
 *  |------|------|------|------|------|------|------|------|------|
 *  |      |      |      |      |      |      |      |      |      |
 *  |------|------|------|       SEGMENT      |------|------|------|
 *  |      |      |      |      |      |      |      |      |      |
 *  |------|------|------|------|------|------|------|------|------|
 */


class Helper {

    static getRandomNumber(limit = 9) {
        // get random number between 1 and limit
        return Math.ceil(Math.random() * 1000) % limit + 1
    }

    static getRange(number) {
        return [...Array(number).keys()].map(item => item + 1)
    }

    static getEmptyArray(length) {
        return Array(length).fill(0);
    }

    static get2dArray(rows, columns, fill = 0) {
        return [...Array(rows)].map(_ => Helper.getEmptyArray(columns))
    }

    static shuffleArray(array) {
        array.sort((a, b) => Math.random() > 0.5 ? -1 : 1)
        return array;
    }

    static getGridNumber(row, col) {
        return 1 + Math.floor(row / 3) * 3 + Math.floor(col / 3);
    }
}

class Sudoku {
    /**
     * Grid is a 3x3 box within a sudoku, there are 9 grids(boxes) in a sudoku.
     */
    TOTAL_ELEMENTS = 81
    EASY_ELEMENTS = 45
    MEDIUM_ELEMENTS = 35
    HARD_ELEMENTS = 25

    LEVEL = 'EASY'


    constructor() {
        this.board = Helper.get2dArray(9, 9, 0);
        this.fixDiagonalGrids = this.fixDiagonalGrids.bind(this);
        this.fillArrayToGrid = this.fillArrayToGrid.bind(this);
        this.fillInBlanks = this.fillInBlanks.bind(this);
        this.fitsInCell = this.fitsInCell.bind(this);
        this.isFixedGrid = this.isFixedGrid.bind(this);
        this.changeCell = this.changeCell.bind(this);
        this.removePuzzleElements = this.removePuzzleElements.bind(this);
        this.clearBoardCell = this.clearBoardCell.bind(this);
        this.getRemovalCount = this.getRemovalCount.bind(this);

        this.fixDiagonalGrids();
        this.fillInBlanks();

        this.state = {
            board: [...(this.board.map(item => [...item]))]
        }

        this.removePuzzleElements()
    }

    /**
     * Work with the main board
     */

    fixDiagonalGrids() {
        this.fillArrayToGrid(0, 0, Helper.shuffleArray(Helper.getRange(9))); // first grid
        this.fillArrayToGrid(3, 3, Helper.shuffleArray(Helper.getRange(9))); // fifth grid
        this.fillArrayToGrid(6, 6, Helper.shuffleArray(Helper.getRange(9))); // ninth grid
    }

    fillArrayToGrid(gridStartRow, gridStartCol, array) {
        let ind = 0;
        for (let i = gridStartRow; i < gridStartRow + 3; i++) {
            for (let j = gridStartCol; j < gridStartCol + 3; j++) {
                this.board[i][j] = array[ind++];
            }
        }
    }

    isFixedGrid(row, col) {
        // if this grid is fixed (was filled as a diagonal grid)
        let ret = (0 <= row && row < 3 && 0 <= col && col < 3 || // first grid
            3 <= row && row < 6 && 3 <= col && col < 6 || // fifth grid
            6 <= row && row < 9 && 6 <= col && col < 9  // ninth grid
        )
        console.log(row, col, ret)
        return ret
    }

    fillInBlanks(i = 0, j = 0) {
        // console.log('FIB: ', i, j)
        if (i >= 9) return true
        if (j >= 9) return this.fillInBlanks(i + 1, 0);
        if (this.isFixedGrid(i, j) || this.board[i][j] !== 0) {
            // console.log('first drop', i, j, this.board[i][j], this.isFixedGrid(i, j));
            return this.fillInBlanks(i, j + 1);
        }
        for (let member = 1; member <= 9; member++) {
            /**
             * for each member try putting it into the cell, and recursively solving for the rest
             *  - if not able to solve, put it back to 0 and recursive call should backtrack one frame(caller),
             *      which would lead to another member trying out in that backtracked frame.
             */
            // console.log('member', member);
            if (this.fitsInCell(i, j, member)) {
                this.board[i][j] = member;
                console.log(i, j, member);
                if (this.fillInBlanks(i, j + 1)) {
                    return true;
                }
                this.board[i][j] = 0;
            }
        }
        return false;
    }

    fitsInCell(row, col, member) {
        // check conflict with row
        if (this.board[row].indexOf(member) !== -1) { // member exists in the row
            return false;
        }
        // check conflict with the column
        for (let i = 0; i < 9; i++) {
            if (this.board[i][col] === member) {
                return false;
            }
        }
        // check conflict with the grid
        let rowStart = Math.floor(row / 3) * 3;
        let colStart = Math.floor(col / 3) * 3;
        for (let i = rowStart; i < rowStart + 3; i++) {
            for (let j = colStart; j < colStart + 3; j++) {
                if (this.board[i][j] === member) {
                    return false;
                }
            }
        }
        return true;
    }


    /**
     * Work with the board state
     */

    getRemovalCount() {
        let removalCount = 0;
        if (this.LEVEL === 'EASY') {
            removalCount = this.TOTAL_ELEMENTS - this.EASY_ELEMENTS;
        } else if (this.LEVEL === 'MEDIUM') {
            removalCount = this.TOTAL_ELEMENTS - this.MEDIUM_ELEMENTS;
        } else {
            removalCount = this.TOTAL_ELEMENTS - this.HARD_ELEMENTS;
        }
        return removalCount;
    }

    removePuzzleElements() {
        console.log('current board', this.state.board)
        let removalCount = this.getRemovalCount();
        while (removalCount > 0) {
            const row = Helper.getRandomNumber(9) - 1
            const col = Helper.getRandomNumber(9) - 1
            if (this.state.board[row][col] !== 0) {
                removalCount -= 1;
                this.clearBoardCell(row, col);
            }
        }
    }

    clearBoardCell(row, col) {
        this.changeCell(row, col, 0);
    }

    changeCell(row, col, number) {
        // change state board cell by the given number
        this.state.board[row][col] = number;
    }
}

class UI {
    constructor() {
        this.state = {}

        this.setState = this.setState.bind(this);
        this.render = this.render.bind(this);
    }

    setState(object) {
        this.state = {...this.state, ...object};
        this.render();
    }

    render() {

    }
}

class Game extends UI {

    constructor() {
        super();
        this.state = {
            selectedCell: null
        }

        this.cellClickHandler = this.cellClickHandler.bind(this);
        this.generateTable = this.generateTable.bind(this);
        this.toggleSelectCell = this.toggleSelectCell.bind(this);
        this.receiveNumber = this.receiveNumber.bind(this);

        this.sudoku = new Sudoku();
    }

    receiveNumber(number) {
        if (!this.state.selectedCell) {
            return;
        }
        const [row, col] = this.state.selectedCell;
        this.sudoku.changeCell(row, col, number);
        this.render();
        // console.log('received number', number);
    }

    toggleSelectCell(row, col) {
        const {selectedCell} = this.state;
        if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
            this.setState({selectedCell: null})
        } else {
            this.setState({selectedCell: [row, col]})
        }
    }

    cellClickHandler(event) {
        const clickedRow = event.target.getAttribute('data-row-id');
        const clickedCol = event.target.getAttribute('data-col-id');
        this.toggleSelectCell(parseInt(clickedRow), parseInt(clickedCol));
        console.log('click handler', event.target.tagName === 'TD');
    }

    generateTable() {
        let ret = '<table cellspacing="0" cellpadding="0">';
        for (let i = 0; i < 9; i++) {
            let row = `<tr  id="row-${i}">`;
            for (let j = 0; j < 9; j++) {
                const gridNumber = Helper.getGridNumber(i, j);
                const isSelected = this.state.selectedCell && this.state.selectedCell[0] === i && this.state.selectedCell[1] === j;
                const classes = `sudoku-cell grid-${gridNumber} grid-${gridNumber % 2 ? 'odd' : 'even'} ${isSelected ? 'selected' : ''}`
                row += `<td id="col-${j}" data-row-id="${i}" data-col-id="${j}" class="${classes}" onclick="game.cellClickHandler(event);">
                        ${this.sudoku.state.board[i][j] || ''}
                        </td>
                        `;
            }
            row += `</tr>`;
            ret += row;
        }
        ret += '</table>'
        return ret;
    }

    render() {
        console.log(this.state.selectedCell);
        document.querySelector('#sudoku-container').innerHTML = this.generateTable();
    }
}


class NumPad extends UI {
    constructor(game) {
        super();
        this.game = game;

        this.dispatchNumber = this.dispatchNumber.bind(this);
        this.generateNumpad = this.generateNumpad.bind(this);
        this.buttonClickHandler = this.buttonClickHandler.bind(this);
    }

    dispatchNumber(number) {
        this.game.receiveNumber(number);
    }

    buttonClickHandler(event) {
        const number = parseInt(event.target.textContent);
        this.dispatchNumber(number);
    }

    generateNumpad() {
        let ret = '<table>'
        for (let i = 0; i < 3; i++) {
            let row = '<tr>'
            for (let j = 0; j < 3; j++) {
                row += `<td onclick="numpad.buttonClickHandler(event);">${i * 3 + j + 1}</td>`
            }
            row += '</tr>'
            ret += row;
        }
        ret += '</table>'
        return ret;
    }

    render() {
        document.querySelector('#numpad-container').innerHTML = this.generateNumpad();
    }
}


class Hydration {
    constructor(game) {
        this.game = game;
        this.dispatchNumber = this.dispatchNumber.bind(this);
        this.hydrate = this.hydrate.bind(this);

    }

    dispatchNumber(number) {
        this.game.receiveNumber(number);
    }

    hydrate() {
        document.addEventListener('keypress', e => {
            if (49 <= e.keyCode && e.keyCode <= 57) {
                const num = parseInt(e.key);
                this.dispatchNumber(num);
            }
        })
    }
}


const game = new Game()
game.render();

const numpad = new NumPad(game);
numpad.render();

const hydration = new Hydration(game);
hydration.hydrate();
