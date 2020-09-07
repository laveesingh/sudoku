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
     * Grid is a 3x3 mini-sudoku within a sudoku, there are 9 grids in a sudoku.
     */
    constructor() {
        this.board = Helper.get2dArray(9, 9, 0);
        this.fixDiagonalGrids = this.fixDiagonalGrids.bind(this);
        this.fillArrayToGrid = this.fillArrayToGrid.bind(this);
        this.fillInBlanks = this.fillInBlanks.bind(this);
        this.fitsInCell = this.fitsInCell.bind(this);
        this.isFixedGrid = this.isFixedGrid.bind(this);
    }

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
        let ret = (0 <= row && row < 3 && 0 <=  col && col < 3 || // first grid
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

}

class UI {

    constructor() {
        this.render = this.render.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.generateTable = this.generateTable.bind(this);

        this.sudoku = new Sudoku();
        this.sudoku.fixDiagonalGrids();
        this.sudoku.fillInBlanks();
    }

    componentDidMount() {

    }

    generateTable() {
        let ret = '<table cellspacing="0" cellpadding="0">';
        for (let i = 0; i < 9; i++) {
            let row = `<tr data-row-id="${i}" id="row-${i}">`;
            for (let j = 0; j < 9; j++) {
                const gridNumber = Helper.getGridNumber(i, j);
                row += `<td id="col-${j}" class="sudoku-cell grid-${gridNumber} grid-${gridNumber % 2 ? 'odd' : 'even'}">${this.sudoku.board[i][j]}</td>`;
            }
            row += `</tr>`;
            ret += row;
        }
        ret += '</table>'
        return ret;
    }

    render() {
        const newTable = this.generateTable();
        // console.log('new table', newTable);
        document.querySelector('#sudoku-container').innerHTML = newTable;
    }
}

new UI().render();
