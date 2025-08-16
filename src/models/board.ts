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
import { Piece } from "./piece";
import { Position } from "./position";
import { SimplifiedPiece } from "./simplifiedPiece";

/**
 * Board represents the current state of the game, encapsulating the positions
 * of all pieces, the number of turns taken, and flags indicating whether the
 * game has ended due to a win, stalemate, or draw. It maintains an array of
 * pieces on the board, a history of moves played, and counters such as the
 * number of turns without a pawn move or capture, which are important for
 * certain chess rules like the 50-move rule. The class keeps track of
 * previously encountered board states to identify repetition-based draws.
 */
export class Board {
	pieces:			Piece[];	// array of all chess pieces on the board
	totalTurns:		number;		// number of moves made so far
	winningTeam?:	TeamType;	// which team has won
	stalemate:		boolean;	// flags indicating game end states
	draw:			boolean;
	moves:			Move[];		// history of moves played
	boardHistory:	{ [key: string]: number };	// used for repetition detection
	turnsWithNoCaptureOrPawnMove: number;		// counter for the 50-move rule

	constructor(
		pieces:			Piece[],
		totalTurns:		number,
		moves:			Move[],
		boardHistory:	{ [key: string]: number },
		turnsWithNoCaptureOrPawnMove: number
	) {
		this.pieces = pieces;
		this.totalTurns = totalTurns;
		this.stalemate = false;	// reset flag
		this.draw = false;		// reset flag
		this.moves = moves;
		this.boardHistory = boardHistory;
		this.turnsWithNoCaptureOrPawnMove = turnsWithNoCaptureOrPawnMove;
	}

	/**
	 * Returns which team's turn it is. Even turn = opponent (black), odd =
	 * our (white).
	 */
	get currentTeam(): TeamType {
		return this.totalTurns % 2 === 0 ? TeamType.OPPONENT : TeamType.OUR;
	}

	/**
	 * Calculates all legal moves for all pieces in current board state.
	 * Includes special moves like castling and removes illegal moves that would
	 * place a king in check. Also detects if current player has no moves 
	 * (stalemate or checkmate). Checks draw conditions and updates flags
	 * accordingly.
	 */
	calculateAllMoves() {
		// calculate the moves of all the pieces
		for (const piece of this.pieces)
			piece.possibleMoves = this.getValidMoves(piece, this.pieces);

		// add castling moves for kings
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

		// collect enemy moves and then clear their possibleMoves to optimize
		const enemyMoves = this.pieces.filter(
			(p) => p.team !== this.currentTeam).map(
				(p) => p.possibleMoves).flat();

		// remove the possible moves for the team that is not playing
		for (const piece of this.pieces.filter(
			(p) => p.team !== this.currentTeam)
		)
			piece.possibleMoves = [];

		// check for draws by 50-move rule, insufficient material, or repetition
		this.checkForFiftyMoveRule();
		this.checkForDraw();
		this.checkForThreefoldRepetition();

		// if current player has any legal moves, return early
		if (this.pieces.filter(
			(p) => p.team === this.currentTeam).some((p) =>
				p.possibleMoves !== undefined && p.possibleMoves.length > 0)
		) return;

		this.checkForStalemate(enemyMoves);
	}

	/**
	 * Removes moves that would put the current player's king in check. Does
	 * this by simulating moves on a cloned board and verifying king safety.
	 */
	checkCurrentTeamMoves() {
		// loop through all the current team's pieces
		for (const piece of this.pieces.filter(
			(p) => p.team === this.currentTeam)
		) {
			if (piece.possibleMoves === undefined) continue;

			// simulate all the moves of a piece
			for (const move of piece.possibleMoves) {
				const simulatedBoard = this.clone();

				// remove any piece at the target move position (capture)
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

					// if enemy is a pawn, check if it can attack king's
					// position diagonally
					if (enemy.isPawn) {
						if (enemy.possibleMoves.some((m) =>
							(m.x !== enemy.position.x) &&
							m.samePosition(clonedKing.position))
						)
							piece.possibleMoves = piece.possibleMoves?.filter(
								(m) => !m.samePosition(move)
							);
					// for other enemy pieces, check if they can move to king's
					// position
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

	/**
	 * Delegates to piece-specific move calculation functions based on piece
	 * type. Does not check king safety here.
	 */
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

	/**
	 * Executes a move on the board, updating piece positions and handling
	 * special cases:
	 *  - castling (king + rook) move
	 *  - en passant capture
	 *  - pawn double move sets en passant flags
	 * 
	 * Updates move counters and recalculates moves after the move. Returns
	 * false if the move is invalid.
	 */
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

		const piecesBeforeMove: number = this.pieces?.length;

		if (
			playedPiece.isKing &&		// the played piece is a king
			destinationPiece?.isRook &&	// king is dragged into a rook
			(destinationPiece.team === playedPiece.team)	// pieces same team
		) {
			// handle castling: move king two spaces towards rook and rook jumps
			// to other side
			// if the rook is to the right of the king, direction is 1
			// if the rook is to the left, direction is -1
			const direction = (destinationPiece.position.x -
				playedPiece.position.x > 0) ? 1 : -1;
			// the king moves two squares toward the rook
			const newKingXPosition = playedPiece.position.x + direction * 2;

			this.pieces = this.pieces.map((p) => {
				// change the positions of the following pieces
				// king's x position is updated to the new position above
				if (p.samePiecePosition(playedPiece))
					p.position.x = newKingXPosition;
				else if (p.samePiecePosition(destinationPiece))
					// rook's x position is set to one square next to the king's
					// new position, on the opposite side
					p.position.x = newKingXPosition - direction;
				return p;
			});
		} else if (enPassantMove) {
			// https://en.wikipedia.org/wiki/En_passant
			// handle en passant: capture pawn behind target square and move
			// capturing pawn

			// update the pieces on the board by creating a new array through
			// reduce()
			this.pieces = this.pieces.reduce((results, piece) => {
				// for the piece being moved (the capturing pawn at
				// originalPosition)
				if (piece.samePosition(originalPosition)) {
					// update the position to the destination square (the
					// square being the opponent's pawn that just moved two
					// squares)
					piece.position = destination;
					// indicate that this pawn has moved
					piece.hasMoved = true;
					// if the piece is a pawn, set enPassant flag to false
					if (piece.isPawn) (piece as Pawn).enPassant = false;
					results.push(piece);
				// for all other pieces, it excludes the pawn that is captured
				// en passant, the pawn located at the square directly behind
				// the destination, effectively removing it from board
				} else if (!(piece.samePosition(
					new Position(destination.x, destination.y - pawnDirection)))
				) {
					if (piece.isPawn) (piece as Pawn).enPassant = false;
					results.push(piece);
				}
				return results;
			}, [] as Piece[]);
		// updates the piece position and if a piece is attacked,
		// removes it
		} else if (validMove) {
			// handle normal valid move: update piece position, set en passant
			// flags for pawn double moves

			// create a new array of pieces
			this.pieces = this.pieces.reduce((results, piece) => {
				// for the piece currently at the originalPosition (the piece
				// being moved):
				if (piece.samePosition(originalPosition)) {
					// if the piece is a pawn, it checks whether the move is a
					// double-step pawn advance (moving exactly two tiles
					// forward), if so, set the enPassant flag to true for that
					// pawn, indicating it can be captured en passant on the
					// next turn
					if (piece.isPawn)
						(piece as Pawn).enPassant = (
							Math.abs(originalPosition.y - destination.y) === 2)
							&& (piece.type === PieceType.PAWN);
					piece.position = destination;
					piece.hasMoved = true;

					results.push(piece);
				// for all other pieces:
				// pieces located on the destination square are excluded
				// (captured pieces)
				} else if (!piece.samePosition(destination)) {
					// pawns that are not moving get their enPassant flag set
					// to false, since en passant is only valid immediately
					// after a double move
					if (piece.isPawn) (piece as Pawn).enPassant = false;
					results.push(piece);
				}
				return results;
			}, [] as Piece[]);
		} else
			// invalid move
			return false;

		// increment counter; reset if pawn moved or capture occurred
		this.turnsWithNoCaptureOrPawnMove++;
		if (playedPiece.isPawn || this.pieces.length < piecesBeforeMove)
			// reset 50 move rule
			this.turnsWithNoCaptureOrPawnMove = 0;

		// add move to history and recalculate all moves
		this.moves.push(new Move(
			playedPiece.team,
			playedPiece.type,
			playedPiece.position.clone(),
			destination.clone()
		));
		this.calculateAllMoves();

		return true;
	}

	/**
	 * Checks if fifty consecutive moves passed with no pawn moves or captures;
	 * if so, flags a draw.
	 */
	checkForFiftyMoveRule(): void {
		if (this.turnsWithNoCaptureOrPawnMove >= 50) this.draw = true;
	}

	/**
	 * Examines common insufficient material draw scenarios, e.g. only kings
	 * left or kings with a minor piece. Sets draw flag if conditions met.
	 * 
	 * https://www.chess.com/terms/draw-chess
	 */
	checkForDraw(): void {
		// determine if our team is eligible for draw because of insufficient
		// material, this is true if:
		const ourTeamEligibleForDraw = this.pieces.filter(
			// the team has only one piece left (which means just the king) or
			(p) => p.team === TeamType.OUR).length === 1 ||
			// the team has exactly two pieces, and those pieces are either the
			// king plus a minor piece (a knight or bishop)
			this.pieces.filter(
				(p) => p.team === TeamType.OUR &&
				(p.isKing || p.isKnight || p.isBishop)).length === 2;
		// checks if the opponent's team meets the same criteria
		const opponentTeamEligibleForDraw = this.pieces.filter(
			(p) => p.team === TeamType.OPPONENT).length === 1 ||
			this.pieces.filter(
				(p) => p.team === TeamType.OPPONENT &&
				(p.isKing || p.isKnight || p.isBishop)).length === 2;
		
		// if both teams meet these criteria (no side has significant mating(?)
		// material), the game is declared a draw
		if (ourTeamEligibleForDraw && opponentTeamEligibleForDraw)
			this.draw = true;
		else if (
			// if our side has exactly three pieces and
			this.pieces.filter((p) => p.team === TeamType.OUR).length === 3 &&
			// two of those pieces are knights and
			this.pieces.filter(
				(p) => p.team === TeamType.OUR && p.isKnight).length === 2  &&
			// the opponent has just a king
			this.pieces.filter((p) => p.team === TeamType.OPPONENT).length === 1
		)
			// since two knights cannot force checkmate against a lone king with
			// perfect defense, the function declares a draw in this case
			this.draw = true;
		// does the same thing here but the roles are reversed
		else if (
			this.pieces.filter(
				(p) => p.team === TeamType.OPPONENT).length === 3 &&
			this.pieces.filter((p) =>
				p.team === TeamType.OPPONENT && p.isKnight).length === 2 &&
			this.pieces.filter((p) => p.team === TeamType.OUR).length === 1
		)
			this.draw = true;
	}

	/**
	 * Tracks occurrences of the current board state for repetition detection.
	 * Sets draw if the same simplified board configuration occurs three times.
	 * 
	 * https://en.wikipedia.org/wiki/Threefold_repetition
	 */
	checkForThreefoldRepetition(): void {
		// create a simplified representation of the current board state by
		// mapping each piece to a SimplifiedPiece (see definition for yourself)
		const simplifiedPieces = this.pieces.map((p) => new SimplifiedPiece(p));
		// this simplified representation is then serialized into a JSON string
		// to create a unique key representing the position
		const simplifiedPiecesStringified = JSON.stringify(simplifiedPieces);

		// keep track of how many times each unique board state (key) has
		// occurred in the game, stored in boardHistory
		if (this.boardHistory[simplifiedPiecesStringified] === undefined)
			this.boardHistory[simplifiedPiecesStringified] = 1;
		else
			this.boardHistory[simplifiedPiecesStringified] += 1;

		// if the current board position appears for the third time (count
		// reaches 3), set the draw flag to true
		if (this.boardHistory[simplifiedPiecesStringified] === 3)
			this.draw = true;
	}

	/**
	 * Checks stalemate or checkmate conditions when current player has no legal
	 * moves. If king is attacked by any enemy move, it's a checkmate.
	 * Otherwise, it's a stalemate.
	 */
	checkForStalemate(enemyMoves: (Position | undefined)[]): void {
		// find the king's position of the current team (the player who is
		// about to move)
		const kingPosition = this.pieces.find(
			(p) => p.isKing && p.team === this.currentTeam)!.position;

		// if any enemy move can capture or attack the king's square, this means
		// the king is in check
		if (enemyMoves.some((m) => m?.samePosition(kingPosition)))
			this.winningTeam = (this.currentTeam === TeamType.OUR) ?
				TeamType.OPPONENT : TeamType.OUR;
		// if no enemy moves attack the king's position, but the current player
		// still has no legal moves, the game is in a stalemate
		else
			this.stalemate = true;
	}

	/**
	 * Creates a deep clone of the board state, useful for move simulations
	 * without affecting the real game.
	 */
	clone(): Board {
		return new Board(
			this.pieces.map((p) => p.clone()),
			this.totalTurns,
			this.moves.map((m) => m.clone()),
			this.boardHistory,
			this.turnsWithNoCaptureOrPawnMove
		);
	}
}