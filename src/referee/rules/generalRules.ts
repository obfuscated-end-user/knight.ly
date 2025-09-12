import { TeamType } from "../../types";
import {
	Piece,
	Position
} from "../../models";

/**
 * Determines if a given board position is occupied by any piece.
 * @param position The position on the board to check for occupancy.
 * @param boardState The current array of pieces on the board.
 * @returns True if a piece occupies the given position, false otherwise.
 */
export const isTileOccupied = (
	position:	Position,
	boardState:	Piece[]
): boolean => {
	return boardState.find((p) => p.samePosition(position)) ? true : false;
}

/**
 * Determines if a given board position is occupied by an opponent's piece.
 * @param position The board position to check.
 * @param boardState The current array of pieces on the board.
 * @param team The team of the current player.
 * @returns True if the position is occupied by an opponent's piece, false
 * otherwise.
 */
export const isTileOccupiedByOpponent = (
	position:	Position,
	boardState: Piece[],
	team:		TeamType
): boolean => {
	return boardState.find((p) =>
		p.samePosition(position) && (p.team !== team)
	) ? true : false;
}

/**
 * Determines if a given board position is either empty or occupied by an
 * opponent's piece.
 * @param position The position on the board to check.
 * @param boardState The current array of pieces on the board.
 * @param team The team of the current player.
 * @returns True if the position is empty or occupied by an opponent, false
 * otherwise.
 */
export const isTileEmptyOrOccupiedByOpponent = (
	position:	Position,
	boardState:	Piece[],
	team:		TeamType
): boolean => {
	return (
		!isTileOccupied(position, boardState) ||
		isTileOccupiedByOpponent(position, boardState, team)
	);
}