import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

const BOARD_SIZE: number = 8;

/**
 * Get all possible moves for the rook.
 * Rook moves horizontally and vertically until blocked.
 * @param rook The rook piece.
 * @param boardState Current pieces on the board.
 * @returns Array of valid Position objects the rook can move to.
 */
export const getPossibleRookMoves = (
	rook:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	const dirs = [
		{ dx: 0, dy: 1 },	// up
		{ dx: 0, dy: -1 },	// down
		{ dx: -1, dy: 0 },	// left
		{ dx: 1, dy: 0 },	// right
	];

	// for each direction, move until blocked or off-board
	for (const { dx, dy } of dirs) {
		for (let i = 1; i < BOARD_SIZE; i++) {
			const x: number = rook.position.x + dx * i;
			const y: number = rook.position.y + dy * i;

			// bounds checking
			if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) break;

			const dest = new Position(x, y);

			// if tile empty, rook can move here
			if (!isTileOccupied(dest, boardState))
				possibleMoves.push(dest);
			// if tile occupied by opponent, rook can capture and stop
			else if (isTileOccupiedByOpponent(dest, boardState, rook.team)) {
				possibleMoves.push(dest);
				// cannot jump over opponent
				break;
			// tile occupied by own piece, stop exploring in this direction
			} else break;
		}
	}

	return possibleMoves;
}