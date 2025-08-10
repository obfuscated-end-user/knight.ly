import {
	PieceType,
	TeamType
} from "../types";
import { Piece } from "./piece";
import { Position } from "./position";

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