import {
	PieceType,
	TeamType
} from "../types";
import { Position } from "./Position";

export class Move {
	team:			TeamType;
	piece:			PieceType;
	fromPosition:	Position;
	toPosition:		Position;

	constructor(
		team:			TeamType,
		piece:			PieceType,
		fromPosition:	Position,
		toPosition:		Position
	) {
		this.team = team;
		this.piece = piece;
		this.fromPosition = fromPosition;
		this.toPosition = toPosition;
	}

	toMessage(): string {
		let piece: string = "";
		switch (this.piece) {
			case PieceType.PAWN:
				piece = "pawn";
				break;
			case PieceType.ROOK:
				piece = "rook";
				break;
			case PieceType.KNIGHT:
				piece = "knight";
				break;
			case PieceType.BISHOP:
				piece = "bishop";
				break;
			case PieceType.QUEEN:
				piece = "queen";
				break;
			case PieceType.KING:
				piece = "king";
				break;
		}

		return `${this.team === TeamType.OPPONENT ? "Black" : "White"} moved 
			${piece} from position (${this.fromPosition.x}, 
			${this.fromPosition.y}) to position (${this.toPosition.x}, 
			${this.toPosition.y}).`;
	}

	clone(): Move {
		return new Move(
			this.team,
			this.piece,
			this.fromPosition.clone(),
			this.toPosition.clone()
		);
	}
}