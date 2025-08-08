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
import { Move } from "./move";
import { Pawn } from "./pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Board {
	pieces:			Piece[];
	totalTurns:		number;
	winningTeam?:	TeamType;
	stalemate:		boolean;
	draw:			boolean;
	moves:			Move[];

	constructor(pieces: Piece[], totalTurns: number, moves: Move[]) {
		this.pieces = pieces;
		this.totalTurns = totalTurns;
		this.stalemate = false;
		this.draw = false;
		this.moves = moves;
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

		// all the moves from the enemy team
		const enemyMoves = this.pieces.filter(
			(p) => p.team !== this.currentTeam).map(
				(p) => p.possibleMoves).flat();

		// remove the possible moves for the team that is not playing
		for (const piece of this.pieces.filter(
			(p) => p.team !== this.currentTeam)
		)
			piece.possibleMoves = [];

		if (this.pieces.filter(
			(p) => p.team === this.currentTeam).some((p) =>
				p.possibleMoves !== undefined && p.possibleMoves.length > 0)
		) return;

		// if any of the opponent's team pieces can attack the king, then he is
		// in check and the other team has won

		// the king position of the current team
		const kingPosition = this.pieces.find(
			(p) => p.isKing && p.team === this.currentTeam)!.position;

		if (enemyMoves.some((m) => m?.samePosition(kingPosition)))
			this.winningTeam = (this.currentTeam === TeamType.OUR) ?
				TeamType.OPPONENT : TeamType.OUR;
		else
			this.stalemate = true;
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
		
		const destinationPiece = this.pieces.find(
			(p) => p.samePosition(destination));

		if (
			playedPiece.isKing &&
			destinationPiece?.isRook &&
			(destinationPiece.team === playedPiece.team)
		) {
			const direction = (destinationPiece.position.x -
				playedPiece.position.x > 0) ? 1 : -1;
			const newKingXPosition = playedPiece.position.x + direction * 2;

			this.pieces = this.pieces.map((p) => {
				// change the positions of the following pieces
				if (p.samePiecePosition(playedPiece))
					p.position.x = newKingXPosition;				// KING
				else if (p.samePiecePosition(destinationPiece))
					p.position.x = newKingXPosition - direction;	// ROOK
				return p;
			});
			// this.calculateAllMoves();

			// for move history
			// this.moves.push(destination.clone());
			// return true;
		} else if (enPassantMove) {
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
			// this.calculateAllMoves();
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
			// this.calculateAllMoves();
		} else
			return false;
		this.moves.push(new Move(
			playedPiece.team,
			playedPiece.type,
			playedPiece.position.clone(),
			destination.clone()
		));

		this.calculateAllMoves();
		this.checkForDraw();
		return true;
	}

	checkForDraw(): void {
		// check for draw scenarios
		// https://www.chess.com/terms/draw-chess

		// true if our team only has a king or has a king + knight/bishop
		const ourTeamEligibleForDraw = this.pieces.filter(
			(p) => p.team === TeamType.OUR).length === 1 ||
			this.pieces.filter(
				(p) => p.team === TeamType.OUR &&
				(p.isKing || p.isKnight || p.isBishop)).length === 2;
		// true if opponent's team only has a king or has a king + knight/bishop
		const opponentTeamEligibleForDraw = this.pieces.filter(
			(p) => p.team === TeamType.OPPONENT).length === 1 ||
			this.pieces.filter(
				(p) => p.team === TeamType.OPPONENT &&
				(p.isKing || p.isKnight || p.isBishop)).length === 2;
		
		if (ourTeamEligibleForDraw && opponentTeamEligibleForDraw) {
			this.draw = true;
		} else if (
			this.pieces.filter((p) => p.team === TeamType.OUR).length === 3 &&
			this.pieces.filter(
				(p) => p.team === TeamType.OUR && p.isKnight).length === 2  &&
			this.pieces.filter((p) => p.team === TeamType.OPPONENT).length === 1
		) {
			// one lone king with 2 knights (our team)
			this.draw = true;
		} else if (
			this.pieces.filter(
				(p) => p.team === TeamType.OPPONENT).length === 3 &&
			this.pieces.filter((p) =>
				p.team === TeamType.OPPONENT && p.isKnight).length === 2 &&
			this.pieces.filter((p) => p.team === TeamType.OUR).length === 1
		) {
			// one lone king with 2 knights (opponent's team)
			this.draw = true;
		}
		// console.log(this.pieces.filter((p) => p.team === TeamType.OUR).length, this.pieces.filter((p) => p.team === TeamType.OPPONENT).length);
	}

	clone(): Board {
		return new Board(
			this.pieces.map((p) => p.clone()),
			this.totalTurns,
			this.moves.map((m) => m.clone())
		);
	}
}