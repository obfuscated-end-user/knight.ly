import {
	PieceType,
	TeamType
} from "../types";
import { Piece } from "./piece";
import { Position } from "./position";

/**
 * Represents a pawn, the most numerous and fundamentally important piece in
 * chess. Extends the basic Piece class to include the special en passant
 * capture flag.
 * 
 * Pawns primarily move forward one square, with the option to move two squares
 * on their first move. They capture diagonally and have unique abilities such
 * as promotion upon reaching the farthest rank and en passant capture
 * conditions.
 */
export class Pawn extends Piece {
	enPassant?:		boolean;
	constructor(
		position:		Position,
		team:			TeamType,
		hasMoved:		boolean,
		enPassant?:		boolean,
		possibleMoves:	Position[] = []
	) {
		super(position, PieceType.PAWN, team, hasMoved, possibleMoves);
		this.enPassant = enPassant;
	}

	/**
	 * Creates a deep clone of the Pawn instance, including its position, team,
	 * movement status, en passant flag, and possible moves.
	 * @returns A new Pawn instance with all the same properties cloned.
	 */
	clone(): Pawn {
		return new Pawn(
			this.position.clone(),
			this.team,
			this.hasMoved,
			this.enPassant,
			this.possibleMoves?.map((m) => m.clone())
		);
	}
}