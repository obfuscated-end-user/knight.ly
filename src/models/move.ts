import { HORIZONTAL_AXIS, VERTICAL_AXIS } from "../constants";
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
	isCapture:		boolean;

	constructor(
		team:			TeamType,
		piece:			PieceType,
		fromPosition:	Position,
		toPosition:		Position,
		isCapture:		boolean = false
	) {
		this.team = team;
		this.piece = piece;
		this.fromPosition = fromPosition;
		this.toPosition = toPosition;
		this.isCapture = isCapture;
	}

	// modfiy this to use algebraic notation instead
	// https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
	// i don't know why it's called that though, as this has nothing to do with
	// algebra or math
	toMessage(): string {
		// you can change these to use unicode chess symbols instead
		const pieceLetters: { [key in PieceType]?: string } = {
			[PieceType.PAWN]:	"",		//  yes, this is blank
			[PieceType.ROOK]:	"R",
			[PieceType.KNIGHT]:	"N",
			[PieceType.BISHOP]:	"B",
			[PieceType.QUEEN]:	"Q",
			[PieceType.KING]:	"K",
		};

		const rankMap = VERTICAL_AXIS;
		const fileMap = HORIZONTAL_AXIS;

		// convert positions to algebraic notation
		const fromRank = rankMap[this.fromPosition.y];
		const fromFile = fileMap[this.fromPosition.x];
		const toRank = rankMap[this.toPosition.y];
		const toFile = fileMap[this.toPosition.x];

		const pieceLetter = pieceLetters[this.piece];

		if (this.piece === PieceType.KING) {
			const diffX = this.toPosition.x - this.fromPosition.x;
			if (diffX > 1)
				return `${this.team === TeamType.OUR ? "White" : "Black"} 
					castles kingside (O-O)`;
			if (diffX < 1)
				return `${this.team === TeamType.OUR ? "White" : "Black"} 
					castles queenside (O-O-O)`;
		}

		// for pawns, when capturing, show the file of fromPosition
		let captureNotation = "";
		if (this.isCapture) {
			if (this.piece === PieceType.PAWN)
				return `${this.team === TeamType.OUR ? "White" : "Black"} 
					moves ${pieceLetter}${fromFile}${fromRank} to 
					${fromFile}x${toFile}${toRank}`;
			else
				return `${this.team === TeamType.OUR ? "White" : "Black"} 
					moves ${pieceLetter}${fromFile}${fromRank} to 
					${pieceLetter}x${toFile}${toRank}`;
		} else
			return `${this.team === TeamType.OUR ? "White" : "Black"} 
					moves ${pieceLetter}${fromFile}${fromRank} 
					to ${toFile}${toRank}`;
	}

	clone(): Move {
		return new Move(
			this.team,
			this.piece,
			this.fromPosition.clone(),
			this.toPosition.clone(),
			this.isCapture
		);
	}
}