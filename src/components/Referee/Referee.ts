import { PieceType, TeamType, Piece, Position } from "../../Constants";

export default class Referee {
	isTileOccupied(x: number, y: number, boardState: Piece[]): boolean {
		return boardState.find(
			(p) => p.position.x === x && p.position.y === y
		) ? true : false;
	}

	isTileOccupiedByOpponent(
		x:			number,
		y:			number,
		boardState: Piece[],
		team:		TeamType
	): boolean {
		// !== because we want to check if something is an opposing piece
		return boardState.find(
			(p) => p.position.x === x && p.position.y === y && p.team !== team
		) ? true : false;
	}

	isEnPassant (
		initialPosition:	Position,
		desiredPosition:	Position,
		type:				PieceType,
		team:				TeamType,
		boardState: 		Piece[]
	) {
		const pawnDirection: number = (team === TeamType.OUR) ? 1 : -1;

		// if the attacking piece is a pawn
		if (type === PieceType.PAWN) {
			// upper left/right || bottom left/right
			if (
				((desiredPosition.x - initialPosition.x === -1) ||
				(desiredPosition.x - initialPosition.x === 1)) &&
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
		desiredPosition:	Position,	// current (x, y) location
		type:				PieceType,	// what piece this is (pawn, rook, etc.)
		team:				TeamType,	// whose side this piece is on
		boardState:			Piece[]		// contains properties about board
	): boolean {
		// remember that coordinates start from (0, 0) at the bottom left
		// corner of the board
		if (type === PieceType.PAWN) {
			// intitial pawn positions, y = 1 is white, y = 6 is black
			const specialRow: number = (team === TeamType.OUR) ? 1 : 6;
			// positive to go upwards (white), otherwise go downwards (black)
			const pawnDirection: number = (team === TeamType.OUR) ? 1 : -1;

			// movement logic
			// if pawn is on the first row (hasn't moved yet) AND y is on either
			// 1 or 6 AND if y diff between current and previous position is 2
			// (you have the option to move the pawn two tiles ahead as your
			// first move)
			if (
				(initialPosition.x === desiredPosition.x) &&
				(initialPosition.y === specialRow) &&
				(desiredPosition.y - initialPosition.y === 2 * pawnDirection)
			) {
				// if the tiles are not occupied, then this is a valid move
				if (!this.isTileOccupied(
						desiredPosition.x,
						desiredPosition.y,
						boardState
					) && !this.isTileOccupied(
						desiredPosition.x,
						desiredPosition.y - pawnDirection,
						boardState
					)
				)
					return true;
			// after moving (whether capture or just because)
			// else if x value is the same AND if y diff between current AND
			// previous position is 1 or -1
			} else if (
				(initialPosition.x === desiredPosition.x) &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				if (!this.isTileOccupied(
					desiredPosition.x, desiredPosition.y, boardState)
				)
					return true;
			// attack logic (you know, moving one tile forward, diagonally)
			} else if (
				(desiredPosition.x - initialPosition.x === -1) &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				// x decreases as you move left and the contrary
				// shows when you move right
				// attack in the upper or bottom left corner
				if (this.isTileOccupiedByOpponent(
					desiredPosition.x, desiredPosition.y, boardState, team)
				)
					return true;
			} else if (
				(desiredPosition.x - initialPosition.x === 1) &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				// attack in the upper or bottom right corner
				if (this.isTileOccupiedByOpponent(
					desiredPosition.x, desiredPosition.y, boardState, team)
				)
					return true;
			}
		}
		return false;	// invalid move
	}
}