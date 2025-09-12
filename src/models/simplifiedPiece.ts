import {
	PieceType,
	TeamType
} from "../types";
import { Piece } from "./piece";
import { Position } from "./position";

/**
 * Represents a simplified version of a chess piece used for lightweight game
 * state management or serialization.
 * 
 * Includes only position, type, team, and optional possible moves. Clones data
 * from a full Piece instance without extra properties like images or move
 * status.
 */
export class SimplifiedPiece {
	position:		Position;
	type:			PieceType;
	team:			TeamType;
	possibleMoves?:	Position[];

	constructor(piece: Piece) {
		this.position = piece.position.clone();
		this.type = piece.type;
		this.team = piece.team;
		this.possibleMoves = piece.possibleMoves?.map((pm) => pm.clone());
	}
}