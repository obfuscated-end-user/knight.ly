import {
	HORIZONTAL_AXIS,
	VERTICAL_AXIS
} from "../constants";
import {
	PieceType,
	TeamType
} from "../types";
import { Position } from "./position";

/**
 * Represents a single move in a chess game, capturing all relevant details such
 * as which team made the move, the piece type, starting and ending positions,
 * and special conditions like captures, en passant, and checks.
 */
export class Move {
	team:			TeamType;
	piece:			PieceType;
	fromPosition:	Position;
	toPosition:		Position;
	isCapture:		boolean;
	isEnPassant:	boolean;
	isCheck:		boolean;

	constructor(
		team:			TeamType,
		piece:			PieceType,
		fromPosition:	Position,
		toPosition:		Position,
		isCapture:		boolean = false,
		isEnPassant:	boolean = false,
		isCheck:		boolean = false
	) {
		this.team = team;
		this.piece = piece;
		this.fromPosition = fromPosition;
		this.toPosition = toPosition;
		this.isCapture = isCapture;
		this.isEnPassant = isEnPassant;
		this.isCheck = isCheck;
	}

	/**
	 * Converts the move to a human-readable string using standard chess algebraic
	 * notation. The notation describes the piece type, source and destination
	 * squares, captures, castling, en passant, and checks.
	 * @returns A string representing the move in algebraic notation format.
	 */
	toMessage(): string {
		// https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
		// i don't know why it's called that though, as this has nothing to do
		// with algebra or math

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
		const pieceTeam = this.team === TeamType.OUR ? "White" : "Black";

		if (this.piece === PieceType.KING) {
			const diffX = this.toPosition.x - this.fromPosition.x;
			if (diffX === 3)
				return `${pieceTeam} castles kingside (0-0)`;
			else if (diffX === -4)
				return `${pieceTeam} castles queenside (0-0-0)`;
		} else if (this.piece === PieceType.PAWN) {
			let pawnCaptureString =
				`${pieceTeam} moves ${pieceLetter}${fromFile}${fromRank} to 
				${fromFile}x${toFile}${toRank}`;
			if (this.isEnPassant) return pawnCaptureString + " e.p.";
			else if (this.isCapture) return pawnCaptureString;
		}

		let defaultMessage: string;
		if (this.isCapture)
			defaultMessage = `${pieceTeam} moves 
				${pieceLetter}${fromFile}${fromRank} to 
				${pieceLetter}x${toFile}${toRank}`;
		else
			defaultMessage = `${pieceTeam} moves 
				${pieceLetter}${fromFile}${fromRank} to ${toFile}${toRank}`;

		if (this.isCheck) defaultMessage += "+";

		return defaultMessage;
	}

	/**
	 * Creates a deep clone of the move instance, duplicating its properties.
	 * @returns A new Move instance with the same team, piece, positions, and
	 * flags.
	 */
	clone(): Move {
		return new Move(
			this.team,
			this.piece,
			this.fromPosition.clone(),
			this.toPosition.clone(),
			this.isCapture,
			this.isEnPassant,
			this.isCheck
		);
	}
}