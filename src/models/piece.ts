import {
	PieceType,
	TeamType
} from "../types";
import { Position } from "./position";

/**
 * Represents a chess piece on the board with fundamental properties.
 * 
 * This includes its type, which team it belongs to, its position on the board, and whether it has moved. It also stores possible legal moves the piece can make in the current game state.
 */
export class Piece {
	image?:			string;
	position:		Position;
	type:			PieceType;
	team:			TeamType;
	hasMoved:		boolean;
	possibleMoves?:	Position[];

	constructor(
		position:		Position,
		type:			PieceType,
		team:			TeamType,
		hasMoved:		boolean,
		possibleMoves:	Position[] = []
	) {
		this.image = `/pieces-svg/${type}${team}.svg`;
		this.position = position;
		this.type = type;
		this.team = team;
		this.hasMoved = hasMoved;
		this.possibleMoves = possibleMoves;
	}

	/**
	 * @returns True if the piece is a pawn, false otherwise.
	 */
	get isPawn(): boolean {
		return this.type === PieceType.PAWN;
	}

	/**
	 * @returns True if the piece is a rook, false otherwise.
	 */
	get isRook(): boolean {
		return this.type === PieceType.ROOK;
	}

	/**
	 * @returns True if the piece is a knight, false otherwise.
	 */
	get isKnight(): boolean {
		return this.type === PieceType.KNIGHT;
	}

	/**
	 * @returns True if the piece is a bishop, false otherwise.
	 */
	get isBishop(): boolean {
		return this.type === PieceType.BISHOP;
	}

	/**
	 * @returns True if the piece is a queen, false otherwise.
	 */
	get isQueen(): boolean {
		return this.type === PieceType.QUEEN;
	}

	/**
	 * @returns True if the piece is a king, false otherwise.
	 */
	get isKing(): boolean {
		return this.type === PieceType.KING;
	}

	/**
	 * Checks if this piece occupies the same position as another piece.
	 * @param otherPiece The piece to compare position with.
	 * @returns True if both pieces share the same position, false otherwise.
	 */
	samePiecePosition(otherPiece: Piece): boolean {
		return this.position.samePosition(otherPiece.position);
	}

	/**
	 * Checks if this piece occupies the same position as the given position.
	 * @param otherPosition The position to compare with this piece's position.
	 * @returns True if the piece's position is the same as the given position,
	 * false otherwise.
	 */
	samePosition(otherPosition: Position): boolean {
		return this.position.samePosition(otherPosition);
	}

	/**
	 * Creates a deep clone of the Piece instance including its position,
	 * type, team, move status, and possible moves.
	 * @returns A new Piece instance with all the same properties cloned.
	 */
	clone(): Piece {
		return new Piece(
			this.position.clone(),
			this.type,
			this.team,
			this.hasMoved,
			this.possibleMoves?.map((m) => m.clone())
		);
	}
}