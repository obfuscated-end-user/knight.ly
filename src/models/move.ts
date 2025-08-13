import {
	PieceType,
	TeamType
} from "../types";
import { Position } from "./position";

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

	// modfiy this to use algebraic notation instead
	// https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
	toMessage(): string {
		let piece: string = "";
		switch (this.piece) {
			case PieceType.PAWN:
				piece = "♟";
				break;
			case PieceType.ROOK:
				piece = "♜";
				break;
			case PieceType.KNIGHT:
				piece = "♞";
				break;
			case PieceType.BISHOP:
				piece = "♝";
				break;
			case PieceType.QUEEN:
				piece = "♛";
				break;
			case PieceType.KING:
				piece = "♚";
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