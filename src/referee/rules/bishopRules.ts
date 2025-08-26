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
 * Get all possible moves for the bishop.
 * @param bishop The bishop piece.
 * @param boardState Current pieces on the board.
 * @returns Array of valid Position objects the bishop can move to.
 */
export const getPossibleBishopMoves	= (
	bishop:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// d means change in x/y per step in that direction
	const dirs = [
		{ dx: 1, dy: 1 },	// up-right
		{ dx: 1, dy: -1 },	// down-right
		{ dx: -1, dy: -1 },	// down-left
		{ dx: -1, dy: 1 },	// up-left
	];

	for (const { dx, dy } of dirs) {
		// for each step along the diagonal (max 7 steps away)
		for (let i = 1; i < BOARD_SIZE; i++) {
			// calculate the position by moving i steps in a given direction
			const x: number = bishop.position.x + dx * i;
			const y: number = bishop.position.y + dy * i;

			// bounds checking
			if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) break;

			// create Position object for candidate tile
			const dest = new Position(x, y);

			// if the tile is empty, the bishop can move here
			if (!isTileOccupied(dest, boardState))
				possibleMoves.push(dest);
			// if the tile contains an opponent's piece, bishop can capture it
			else if (isTileOccupiedByOpponent(dest, boardState, bishop.team)) {
				possibleMoves.push(dest);
				// can't jump over opponent, stop in this direction
				break;
			// tile occupied by own piece, cannot move or jump over it,
			// stop searching further in this direction
			} else break;
		}
	}

	return possibleMoves;
}
