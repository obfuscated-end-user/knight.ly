import {
	samePosition,
	TeamType
} from "../../Constants";
import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./GeneralRules";
import {
	Piece,
	Position
} from "../../models";

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
			!isTileOccupied(desiredPosition, boardState) &&
			!isTileOccupied(new Position(
				desiredPosition.x, desiredPosition.y - pawnDirection
			), boardState)
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

	const normalMove = new Position(
		pawn.position.x,
		pawn.position.y + pawnDirection
	);

	const specialMove = new Position(
		pawn.position.x,
		pawn.position.y + pawnDirection * 2
	);

	const upperLeftAttack = new Position(
		pawn.position.x - 1,
		pawn.position.y + pawnDirection
	);

	const upperRightAttack = new Position(
		pawn.position.x + 1,
		pawn.position.y + pawnDirection
	);

	const leftPosition = new Position(
		pawn.position.x - 1,
		pawn.position.y
	);

	const rightPosition = new Position(
		pawn.position.x + 1,
		pawn.position.y
	);

	// if tile in front of pawn is not occupied
	if (!isTileOccupied(normalMove, boardState)) {
		// then that is a possible move
		possibleMoves.push(normalMove);
		// but if pawn hasn't moved yet and the two files ahead is not occupied
		if (
			(pawn.position.y === specialRow) &&
			!isTileOccupied(specialMove, boardState)
		)
			// then that is also a possible move
			possibleMoves.push(specialMove);
	}

	if (isTileOccupiedByOpponent(upperLeftAttack, boardState, pawn.team))
		possibleMoves.push(upperLeftAttack);
	else if (!isTileOccupied(upperLeftAttack, boardState)) {
		const leftPiece = boardState.find((p) =>
			samePosition(p.position, leftPosition));
		if ((leftPiece != null) && leftPiece.enPassant)
			possibleMoves.push(upperLeftAttack);
	}

	if (isTileOccupiedByOpponent(upperRightAttack, boardState, pawn.team))
		possibleMoves.push(upperRightAttack);
	else if (!isTileOccupied(upperRightAttack, boardState)) {
		const rightPiece = boardState.find((p) =>
			samePosition(p.position, rightPosition));
		if ((rightPiece != null) && rightPiece.enPassant)
			possibleMoves.push(upperRightAttack);
	}
	return possibleMoves;
}