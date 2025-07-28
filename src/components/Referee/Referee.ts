import {
	PieceType,
	TeamType,
	Piece,
	Position
} from "../../Constants";
import {
	pawnMove,
	knightMove,
	bishopMove,
	rookMove,
	queenMove,
	kingMove,
	getPossiblePawnMoves
} from "./rules";

export default class Referee {
	isEnPassant (
		initialPosition:	Position,
		desiredPosition:	Position,
		type:				PieceType,
		team:				TeamType,
		boardState: 		Piece[]
	) {
		const pawnDirection: number = (team === TeamType.OUR) ? 1 : -1;

		if (type === PieceType.PAWN) {
			// upper left/right || bottom left/right
			if (
				((desiredPosition.x - initialPosition.x === -1) ||
				(desiredPosition.x - initialPosition.x === 1))  &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				// if a piece is under/above the attacked tile
				const piece = boardState.find(
					(p) => p.position.x === desiredPosition.x && p.position.y
						=== desiredPosition.y - pawnDirection && p.enPassant
				);
				if (piece)
					return true;
			}
		}
		return false;
	}

	isValidMove(
		initialPosition:	Position,	// previous (x, y) location
		desiredPosition:	Position,	// destined (x, y) location
		type:				PieceType,	// what piece this is (pawn, rook, etc.)
		team:				TeamType,	// whose side this piece is on
		boardState:			Piece[]		// contains properties about board
	): boolean {
		// remember that coordinates start from (0, 0) at the bottom left
		// corner of the board
		let validMove: boolean = false;
		switch(type) {
			case PieceType.PAWN:
				validMove = pawnMove(
					initialPosition,
					desiredPosition,
					team,
					boardState
				);
				break;
			case PieceType.KNIGHT:
				validMove = knightMove(
					initialPosition,
					desiredPosition,
					team,
					boardState
				);
				break;
			case PieceType.BISHOP:
				validMove = bishopMove(
					initialPosition,
					desiredPosition,
					team,
					boardState
				);
				break;
			case PieceType.ROOK:
				validMove = rookMove(
					initialPosition,
					desiredPosition,
					team,
					boardState
				);
				break;
			case PieceType.QUEEN:
				validMove = queenMove(
					initialPosition,
					desiredPosition,
					team,
					boardState
				);
				break;
			case PieceType.KING:
				validMove = kingMove(
					initialPosition,
					desiredPosition,
					team,
					boardState
				);
				break;
			case PieceType.UNKNOWN:
				console.log("UNKNOWN");
				break;
		}
		return validMove;
	}

	getValidMoves(piece: Piece, boardState: Piece[]): Position[] {
		switch(piece.type) {
			case PieceType.PAWN:
				return getPossiblePawnMoves(piece, boardState);
			default:
				return [];
		}
	}
}