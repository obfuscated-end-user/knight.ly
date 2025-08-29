import { TeamType } from "../../types";
import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";
import { Pawn } from "../../models/pawn";

/**
 * Get all possible moves for a pawn. Handles normal moves, initial two-tile
 * advance, captures, and en passant.
 * @param pawn The pawn piece.
 * @param boardState Current board pieces.
 * @returns Array of valid Position objects for the pawn moves.
 */
export const getPossiblePawnMoves = (
	pawn:		Piece,
	boardState:	Piece[]
): Position[] =>  {
	const possibleMoves: Position[] = [];

	// directon pawn moves in y-axis (up or down)
	const dir: number = (pawn.team === TeamType.OUR) ? 1 : -1;
	// starting row for initial double-step move
	const startRow: number = (pawn.team === TeamType.OUR) ? 1 : 6;

	// one step forward position
	const forward = new Position(pawn.position.x, pawn.position.y + dir);
	// two steps forward position (only allowed if first move and path clear)
	const dblForward = new Position(pawn.position.x, pawn.position.y + 2 * dir);

	// diagonal attack positions
	const diagLeft = new Position(pawn.position.x - 1, pawn.position.y + dir);
	const diagRight = new Position(pawn.position.x + 1, pawn.position.y + dir);

	// check one square forward move is valid (empty tile)
	if (!isTileOccupied(forward, boardState)) {
		possibleMoves.push(forward);
		// if pawn is on starting row and two squares ahead is empty,
		// allow two-step ninja move
		if (
			(pawn.position.y === startRow) &&
			!isTileOccupied(dblForward, boardState)
		)
			possibleMoves.push(dblForward);
	}

	// check captures an en passant attacks on diagonal left
	if (isTileOccupiedByOpponent(diagLeft, boardState, pawn.team))
		possibleMoves.push(diagLeft);
	else {
		// look left tile on current row for opponent pawn flagged en passant
		const leftPiece: Piece | undefined = boardState.find((p) =>
			p.samePosition(new Position(pawn.position.x - 1, pawn.position.y)));
		if (
			(leftPiece?.team !== pawn.team) &&
			leftPiece instanceof Pawn &&
			(leftPiece as Pawn).enPassant
		)
			possibleMoves.push(diagLeft);
	}

	// do the same thing but on diagonal right
	if (isTileOccupiedByOpponent(diagRight, boardState, pawn.team))
		possibleMoves.push(diagRight);
	else {
		const rightPiece: Piece | undefined = boardState.find((p) =>
			p.samePosition(new Position(pawn.position.x + 1, pawn.position.y)));
		if (
			(rightPiece?.team !== pawn.team) &&
			rightPiece instanceof Pawn &&
			(rightPiece as Pawn).enPassant
		)
			possibleMoves.push(diagRight);
	}

	return possibleMoves;
}