import {
	getCastlingMoves,
	getPossibleBishopMoves,
	getPossibleKingMoves,
	getPossibleKnightMoves,
	getPossiblePawnMoves,
	getPossibleQueenMoves,
	getPossibleRookMoves
} from "../referee/rules";
import {
	PieceType,
	TeamType
} from "../types";
import { Pawn } from "./pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Board {
	pieces:	Piece[];
	totalTurns: number;

	constructor(pieces: Piece[], totalTurns: number) {
		this.pieces = pieces;
		this.totalTurns = totalTurns;
	}

	get currentTeam(): TeamType {
		return this.totalTurns % 2 === 0 ? TeamType.OPPONENT : TeamType.OUR;
	}

	calculateAllMoves() {
		// calculate the moves of all the pieces
		for (const piece of this.pieces) {
			piece.possibleMoves = this.getValidMoves(piece, this.pieces);
		}

		// calculate castling moves
		for (const king of this.pieces.filter((p) => p.isKing)) {
			// king.possibleMoves = getCastlingMoves(king, this.pieces);
			
			// THIS DOESN'T WORK ↓↓↓
			// if (king.possibleMoves === undefined) continue;

			// so i appended the bang (!) instead
			king.possibleMoves = [
				...king.possibleMoves!,
				...getCastlingMoves(king, this.pieces)
			];
		}

		// check if the current team moves are valid, this includes if the
		// current king is on check, etc.
		this.checkCurrentTeamMoves();

		// remove the possible moves for the team that is not playing
		for (const piece of this.pieces.filter(
			(p) => p.team !== this.currentTeam)
		)
			piece.possibleMoves = [];
	}

	checkCurrentTeamMoves() {
		// loop through all the current team's pieces
		for (const piece of this.pieces.filter(
			(p) => p.team === this.currentTeam)
		) {
			if (piece.possibleMoves === undefined) continue;

			// simulate all the moves of a piece
			for (const move of piece.possibleMoves) {
				const simulatedBoard = this.clone();

				// remove the piece at the destined position
				simulatedBoard.pieces = simulatedBoard.pieces.filter(
					(p) => !p.samePosition(move)
				);

				// get the piece of the cloned board
				// guarantee that clonedPiece exists by using a !
				const clonedPiece = simulatedBoard.pieces.find(
					(p) => p.samePiecePosition(piece)
				)!;
				clonedPiece.position = move.clone();

				// get the king of the cloned board
				const clonedKing = simulatedBoard.pieces.find(
					(p) => p.isKing && p.team === simulatedBoard.currentTeam
				)!;

				// loop through enemy pieces, update their possible moves, and
				// check if the current team's king will be in danger
				for (const enemy of simulatedBoard.pieces.filter(
					(p) => p.team !== simulatedBoard.currentTeam)
				) {
					enemy.possibleMoves = simulatedBoard.getValidMoves(
						enemy, simulatedBoard.pieces
					);

					if (enemy.isPawn) {
						if (enemy.possibleMoves.some((m) =>
							(m.x !== enemy.position.x) &&
							m.samePosition(clonedKing.position))
						)
							piece.possibleMoves = piece.possibleMoves?.filter(
								(m) => !m.samePosition(move)
							);
					} else {
						if (enemy.possibleMoves.some(
							(m) => m.samePosition(clonedKing.position))
						) {
							piece.possibleMoves = piece.possibleMoves?.filter(
								(m) => !m.samePosition(move)
							);
						}
					}
				}
			}
		}
	}

	getValidMoves(piece: Piece, boardState: Piece[]): Position[] {
		switch(piece.type) {
			case PieceType.PAWN:
				return getPossiblePawnMoves(piece, boardState);
			case PieceType.KNIGHT:
				return getPossibleKnightMoves(piece, boardState);
			case PieceType.BISHOP:
				return getPossibleBishopMoves(piece, boardState);
			case PieceType.ROOK:
				return getPossibleRookMoves(piece, boardState);
			case PieceType.QUEEN:
				return getPossibleQueenMoves(piece, boardState);
			case PieceType.KING:
				return getPossibleKingMoves(piece, boardState);
			default:
				return [];
		}
	}

	playMove(
		enPassantMove:		boolean,
		validMove:			boolean,
		playedPiece:		Piece,
		destination:		Position,
		originalPosition:	Position
	): boolean {
		const pawnDirection: number =		//	  w    b
			(playedPiece.team === TeamType.OUR) ? 1 : -1;
		if (enPassantMove) {
			// https://en.wikipedia.org/wiki/En_passant
			this.pieces = this.pieces.reduce((results, piece) => {
				if (piece.samePosition(originalPosition)) {
					piece.position.x = destination.x;
					piece.position.y = destination.y;
					piece.hasMoved = true;
					if (piece.isPawn)
						(piece as Pawn).enPassant = false;
					results.push(piece);
				} else if (!(piece.samePosition(
					new Position(destination.x, destination.y - pawnDirection)))
				) {
					if (piece.isPawn)
						(piece as Pawn).enPassant = false;
					results.push(piece);
				}
				return results;
			}, [] as Piece[]);
			this.calculateAllMoves();
		// updates the piece position and if a piece is attacked,
		// removes it
		} else if (validMove) {
			this.pieces = this.pieces.reduce((results, piece) => {
				if (piece.samePosition(originalPosition)) {
					// if the attacked piece has made an en passant move
					// in the previous turn
					if (piece.isPawn)
						(piece as Pawn).enPassant = (
							Math.abs(originalPosition.y - destination.y) === 2)
							&& (piece.type === PieceType.PAWN
					);
					piece.position.x = destination.x;
					piece.position.y = destination.y;
					piece.hasMoved = true;
					
					results.push(piece);
				} else if (!piece.samePosition(destination)) {
					if (piece.isPawn) (piece as Pawn).enPassant = false;
					results.push(piece);
				}
				return results;
			}, [] as Piece[]);
			this.calculateAllMoves();
		} else
			return false;
		return true;
	}

	clone() {
		return new Board(
			this.pieces.map((p) => p.clone()),
			this.totalTurns
		);
	}
}