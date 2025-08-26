import { isTileEmptyOrOccupiedByOpponent } from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

/**
 * Get all possible moves for the knight.
 * @param knight The knight piece.
 * @param boardState Current pieces on the board.
 * @returns Array of valid Position objects the knight can move to.
 */
export const getPossibleKnightMoves = (
	knight:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// all 8 possible L-shape moves for a knight (x,y) offsets
	const dirs = [
		{ dx: 1, dy: 2 },
		{ dx: 2, dy: 1 },
		{ dx: 2, dy: -1 },
		{ dx: 1, dy: -2 },
		{ dx: -1, dy: -2 },
		{ dx: -2, dy: -1 },
		{ dx: -2, dy: 1 },
		{ dx: -1, dy: 2 }
	];

	for (const { dx, dy } of dirs) {
		const dest = new Position(
			knight.position.x + dx,
			knight.position.y + dy
		);

		// add move if tile is on board and either empty or occupied by opponent
		if (isTileEmptyOrOccupiedByOpponent(dest, boardState, knight.team))
			possibleMoves.push(dest);
	}

	return possibleMoves;
}