import {
	Piece,
	Position,
	TeamType
} from "../../../Constants";
import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./GeneralRules";

export const pawnMove = (
	initialPosition:	Position,	// previous (x, y) location
	desiredPosition:	Position,	// destined (x, y) location
	team:				TeamType,	// whose side this piece is on
	boardState:			Piece[]		// contains properties about board
): boolean => {
	// add pawn promotion later

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
			!isTileOccupied(desiredPosition, boardState)
			&& !isTileOccupied( {
					x:	desiredPosition.x,
					y:	desiredPosition.y - pawnDirection
				}, boardState
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
		if (!isTileOccupied(desiredPosition, boardState))
			return true;
	// ATTACK LOGIC (you know, moving one tile forward, diagonally)
	} else if (
		(desiredPosition.x - initialPosition.x === -1) &&
		(desiredPosition.y - initialPosition.y === pawnDirection)
	) {
		// x decreases as you move left and the contrary shows
		// when you move right

		// attack in the upper or bottom left corner
		if (isTileOccupiedByOpponent(desiredPosition, boardState, team))
			return true;
	} else if (
		(desiredPosition.x - initialPosition.x === 1) &&
		(desiredPosition.y - initialPosition.y === pawnDirection)
	) {
		// attack in the upper or bottom right corner
		if (isTileOccupiedByOpponent( desiredPosition, boardState, team))
			return true;
	}
	return false;
}

// used for rendering the possible move circles on the screen
export const getPossiblePawnMoves = (
	pawn:		Piece,
	boardState:	Piece[]
): Position[] =>  {
	const possibleMoves: Position[] = [];
	const specialRow: number = (pawn.team === TeamType.OUR) ? 1 : 6;
	const pawnDirection: number = (pawn.team === TeamType.OUR) ? 1 : -1;

	// if tile in front of pawn is not occupied
	if (!isTileOccupied({
			x:	pawn.position.x,
			y:	pawn.position.y + pawnDirection
		}, boardState)
	) {
		// then that is a possible move
		possibleMoves.push({
			x:	pawn.position.x,
			y:	pawn.position.y + pawnDirection
		});
		// but if pawn hasn't moved yet and the two files ahead is not occupied
		if ((pawn.position.y === specialRow) &&
			!isTileOccupied({
				x:	pawn.position.x,
				y:	pawn.position.y + pawnDirection * 2
			}, boardState)
		)
			// then that is also a possible move
			possibleMoves.push({
				x:	pawn.position.x,
				y:	pawn.position.y + pawnDirection * 2
			});
	}
	return possibleMoves;
}