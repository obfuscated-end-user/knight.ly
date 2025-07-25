import {
	PieceType,
	TeamType,
	Piece,
	Position,
	samePosition
} from "../../Constants";

export default class Referee {
	isTileEmptyOrOccupiedByOpponent(
		position:	Position,
		boardState:	Piece[],
		team:		TeamType
	) {
		return (
			!this.isTileOccupied(position, boardState) ||
			this.isTileOccupiedByOpponent(position, boardState, team)
		);
	}

	isTileOccupied(position: Position, boardState: Piece[]): boolean {
		return boardState.find(
			(p) => samePosition(p.position, position)
		) ? true : false;
	}

	isTileOccupiedByOpponent(
		position:	Position,
		boardState: Piece[],
		team:		TeamType
	): boolean {
		return boardState.find(
			(p) => samePosition(p.position, position) && p.team !== team
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

			// MOVEMENT LOGIC
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
				if (
					!this.isTileOccupied(desiredPosition, boardState)
					&& !this.isTileOccupied(
						{
							x: desiredPosition.x,
							y: desiredPosition.y - pawnDirection
						},
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
				if (!this.isTileOccupied(desiredPosition, boardState))
					return true;
			// ATTACK LOGIC (you know, moving one tile forward, diagonally)
			} else if (
				(desiredPosition.x - initialPosition.x === -1) &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				// x decreases as you move left and the contrary
				// shows when you move right
				// attack in the upper or bottom left corner
				if (this.isTileOccupiedByOpponent(
					desiredPosition, boardState, team)
				)
					return true;
			} else if (
				(desiredPosition.x - initialPosition.x === 1) &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				// attack in the upper or bottom right corner
				if (this.isTileOccupiedByOpponent(
					desiredPosition, boardState, team)
				)
					return true;
			}
		} else if (type === PieceType.KNIGHT) {
			// remember that you don't have to check if there's anything
			// blocking a knight's way because it can jump between pieces
			// only do that for pieces of the same team
			// MOVEMENT AND ATTACK LOGIC
			for (let i = -1; i < 2; i += 2) {
				for (let j = -1; j < 2; j += 2) {
					// top/bottom side movement
					// move 2 tiles forwards/backwards
					if (desiredPosition.y - initialPosition.y === 2 * i) {
						// move 1 tile left/right
						if (desiredPosition.x - initialPosition.x === j) {
							if (this.isTileEmptyOrOccupiedByOpponent(
								desiredPosition,
								boardState,
								team
							))
								return true;
						}
					}

					// left/right side movement
					// move 2 tiles left/right
					if (desiredPosition.x - initialPosition.x === 2 * i) {
						// move 1 tile forward/backward
						if (desiredPosition.y - initialPosition.y === j) {
							if (this.isTileEmptyOrOccupiedByOpponent(
								desiredPosition,
								boardState,
								team
							))
								return true;
						}
					}
				}
			}
		} else if (type === PieceType.BISHOP) {
			// because 7 tiles is the furthest a piece can go
			for (let i = 1; i < 8; i++) {
				// top right
				if (
					(desiredPosition.x - initialPosition.x === i) &&
					(desiredPosition.y - initialPosition.y === i)
				) {
					let passedPosition: Position = {
						x: initialPosition.x + i,
						y: initialPosition.y + i
					};
					if (this.isTileOccupied(passedPosition, boardState)) {
						console.log("illegal");
						break;
					}
				}
				if (
					(desiredPosition.x - initialPosition.x === i) &&
					(desiredPosition.y - initialPosition.y === i)
				) {
					return true;
				}

				// bottom right
				if (
					(desiredPosition.x > initialPosition.x) &&
					(desiredPosition.y < initialPosition.y)
				) {
					let passedPosition: Position = {
						x: initialPosition.x + i,
						y: initialPosition.y - i
					};
					if (this.isTileOccupied(passedPosition, boardState)) {
						console.log("illegal");
						break;
					}
				}
				if (
					(desiredPosition.x - initialPosition.x === i) &&
					(desiredPosition.y - initialPosition.y === -i)
				) {
					return true;
				}

				// bottom left
				if (
					(desiredPosition.x < initialPosition.x) &&
					(desiredPosition.y < initialPosition.y)
				) {
					let passedPosition: Position = {
						x: initialPosition.x - i,
						y: initialPosition.y - i
					};
					if (this.isTileOccupied(passedPosition, boardState)) {
						console.log("illegal");
						break;
					}
				}
				if (
					(desiredPosition.x - initialPosition.x === -i) &&
					(desiredPosition.y - initialPosition.y === -i)
				) {
					return true;
				}

				// top left
				if (
					(desiredPosition.x < initialPosition.x) &&
					(desiredPosition.y > initialPosition.y)
				) {
					let passedPosition: Position = {
						x: initialPosition.x - i,
						y: initialPosition.y + i
					};
					if (this.isTileOccupied(passedPosition, boardState)) {
						console.log("illegal");
						break;
					}
				}
				if (
					(desiredPosition.x - initialPosition.x === -i) &&
					(desiredPosition.y - initialPosition.y === i)
				) {
					return true;
				}
			}
		}
		return false;	// invalid move
	}
}