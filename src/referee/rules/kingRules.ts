import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

const BOARD_SIZE: number  = 8;

/**
 * Get all possible moves for the king (excluding castling).
 * @param king The king piece.
 * @param boardState Current pieces on the board.
 * @returns Array of valid Position objects the king can move to.
 */
export const getPossibleKingMoves = (
	king:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// directions for the king: one step in any of the 8 surrounding squares
	const dirs = [
		{ dx: 0, dy: 1 },	// up
		{ dx: 0, dy: -1 },	// down
		{ dx: -1, dy: 0 },	// left
		{ dx: 1, dy: 0 },	// right
		{ dx: 1, dy: 1 },	// up-right
		{ dx: 1, dy: -1 },	// down-right
		{ dx: -1, dy: -1 },	// down-left
		{ dx: -1, dy: 1 },	// up-left
	];

	// check each adjacent square
	for (const { dx, dy } of dirs) {
		// calculate target position
		const x: number = king.position.x + dx;
		const y: number = king.position.y + dy;

		// bounds checking
		if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) continue;

		const dest = new Position(x, y);

		// if tile is empty, it's a valid move
		if (!isTileOccupied(dest, boardState))
			possibleMoves.push(dest);
		// if tile is occupied by opponent king can capture the piece
		else if (isTileOccupiedByOpponent(dest, boardState, king.team))
			possibleMoves.push(dest);
	}

	return possibleMoves;
}

/**
 * Get possible castling moves for the king. Castling requires that the king and
 * rook haven't moved, no pieces between them, and that the king doesn't castle
 * through check.
 * @param king The king piece.
 * @param boardState Current pieces on the board.
 * @returns Array of Position objects representing castling moves (rook positions).
 */
export const getCastlingMoves = (
	king:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// castling not allowed if king has already moved
	if (king.hasMoved) return possibleMoves;

	// find rooks on the same team that have not moved
	const rooks = boardState.filter(
		(p) => p.isRook && p.team === king.team && !p.hasMoved);

	for (const rook of rooks) {
		// direction from king to rook: right (1) or left (-1)
		const dir = rook.position.x > king.position.x ? 1 : -1;

		// position immediately next to king in direction of rook
		const adjacentPosition = king.position.clone();
		adjacentPosition.x += dir;

		// ensure rook's possible moves include adjacent position
		// (meaning path is open)
		if (!rook.possibleMoves?.some((m) => m.samePosition(adjacentPosition)))
			continue;

		const concerningTiles = rook.possibleMoves.filter(
			(m) => m.y === king.position.y);

		// all enemy pieces for check evaluation
		const enemyPieces = boardState.filter((p) => p.team !== king.team);
		let valid = true;

		// verify none of the enemy pieces attack any tile between king and rook
		for (const enemy of enemyPieces) {
			if (!enemy.possibleMoves) continue;

			for (const move of enemy.possibleMoves) {
				if (concerningTiles.some((t) => t.samePosition(move))) {
					valid = false;
					// path under attack, castling not allowed
					break;
				}
			}
			if (!valid) break;
		}
		if (!valid) continue;

		// all checks passed, add ROOK's position as a castling move
		possibleMoves.push(rook.position.clone());
	}

	return possibleMoves;
}