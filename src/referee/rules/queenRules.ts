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
 * Get all possible moves for the queen.
 * Combines rook-like (straight) and bishop-like (diagonal) moves.
 * @param queen The queen piece.
 * @param boardState Current pieces on the board.
 * @returns Array of valid Position objects the queen can move to.
 */
export const getPossibleQueenMoves = (
	queen:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// directions for the queen: rook + bishop combined
	const directions = [
		{ dx: 0, dy: 1 },	// up
		{ dx: 0, dy: -1 },	// down
		{ dx: -1, dy: 0 },	// left
		{ dx: 1, dy: 0 },	// right
		{ dx: 1, dy: 1 },	// up-right
		{ dx: 1, dy: -1 },	// down-right
		{ dx: -1, dy: -1 },	// down-left
		{ dx: -1, dy: 1 },	// up-left
	];

	// for each direction, keep moving until blocked or off board
	for (const { dx, dy } of directions) {
		for (let i = 1; i < BOARD_SIZE; i++) {
			// calculate target position
			const x: number = queen.position.x + dx * i;
			const y: number = queen.position.y + dy * i;
	
			// bounds checking
			if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) break;
	
			const destination = new Position(x, y);
	
			// if tile is empty, queen can move here
			if (!isTileOccupied(destination, boardState))
				possibleMoves.push(destination);
			// if tile occupied by opponent, queen can capture here but no
			// further moves beyond
			else if (
				isTileOccupiedByOpponent(destination, boardState, queen.team)
			) {
				possibleMoves.push(destination);
				break;
			// tile occupied by own piece, stop moving in this direction
			} else break;
		}
	}

	return possibleMoves;
}