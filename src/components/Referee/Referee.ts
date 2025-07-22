import { PieceType, TeamType, Piece } from "../Chessboard/Chessboard";

export default class Referee {
	tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
		return boardState.find(p => p.x === x && p.y === y) ? true : false;
	}

	isTileOccupiedByOpponent(
		x:			number,
		y:			number,
		boardState: Piece[],
		team:		TeamType
	): boolean {
		// !== because we want to check if something is an opposing piece
		return boardState.find(
			p => p.x === x && p.y === y && p.team !== team
		) ? true : false;
	}

	isValidMove(
		px:			number,		// previous x location
		py:			number,		// previous y location
		x:			number,		// current x location
		y:			number,		// current y location
		type:		PieceType,	// what piece this is (pawn, rook, etc.)
		team:		TeamType,	// whose side this piece is on
		boardState:	Piece[]		// contains properties about board (see def)
	): boolean {
		// remember that coordinates start from (0, 0) at the bottom left corner
		// of the board
		// console.log(`(px, py):\t(${px}, ${py})\n(x, y):\t\t(${x}, ${y})\ntype:\t\t${type}\nteam:\t\t${team}\nboardState:\t${boardState}\ntileocc:\t${boardState.find(p => p.x === x && p.y === y)}\noccopp:\t${boardState.find(p => p.x === x && p.y === y && p.team == team)}`);
		// console.log(boardState);

		if (type === PieceType.PAWN) {
			// intitial pawn positions, y = 1 is white, y = 6 is black
			const specialRow: number = (team === TeamType.OUR) ? 1 : 6;
			// positive to go upwards (white), otherwise go downwards (black)
			const pawnDirection: number = (team === TeamType.OUR) ? 1 : -1;

			// movement logic
			// if pawn is on the first row (hasn't moved yet) AND y is on either
			// 1 or 6 AND if y diff between current and previous position is 2
			// (you have the option to move the pawn two tiles ahead as your
			// first move)
			if ((px === x) && (py === specialRow) && (y - py === 2 * pawnDirection)) {
				// if the tiles are not occupied, then this is a valid move
				if (
					!this.tileIsOccupied(x, y, boardState) &&
					!this.tileIsOccupied(x, y - pawnDirection, boardState)
				)
					return true;
			// after moving (whether capture or just because)
			// else if x value is the same AND if y diff between current and
			// previous position is 1
			} else if ((px === x) && (y - py === pawnDirection)) {
				if (!this.tileIsOccupied(x, y, boardState))
					return true;
			// attack logic (you know, moving one tile diagonally, upwards)
			} else if ((x - px === -1) && (y - py === pawnDirection)) {
				// x decreases as you move left and the contrary shows when you move right
				// attack in the upper or bottom left corner
				if (this.isTileOccupiedByOpponent(x, y, boardState, team)) {
					// console.log("upper/bottom left\n(x, y)", x, y, "\n(px, py)", px, py);
					return true;
				}
			} else if ((x - px === 1) && (y - py === pawnDirection)) {
				// attack in the upper or bottom right corner
				if (this.isTileOccupiedByOpponent(x, y, boardState, team)) {
					// console.log("upper/bottom right\n(x, y)", x, y, "\n(px, py)", px, py);
					return true;
				}
			}
		}
		// invalid move
		return false;
	}
}