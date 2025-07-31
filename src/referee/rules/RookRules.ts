import {
	samePosition,
	TeamType
} from "../../Constants";
import {
	isTileEmptyOrOccupiedByOpponent,
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./GeneralRules";
import {
	Piece,
	Position
} from "../../models";

export const rookMove = (
	initialPosition:	Position,	// previous (x, y) location
	desiredPosition:	Position,	// destined (x, y) location
	team:				TeamType,	// whose side this piece is on
	boardState:			Piece[]		// contains properties about board
): boolean => {
	// MOVING VERTICALLY
	if (initialPosition.x === desiredPosition.x) {
		for (let i = 1; i < 8; i++) {
			// -1 down, 1 up
			let multiplier = (desiredPosition.y < initialPosition.y) ? -1 : 1;
			let passedPosition = new Position(
				initialPosition.x,
				initialPosition.y + (i * multiplier)
			);
			if (samePosition(passedPosition, desiredPosition)) {
				if (isTileEmptyOrOccupiedByOpponent(passedPosition,
					boardState, team))
					return true;
			} else {
				if (isTileOccupied(passedPosition, boardState)) break;
			}
		}
	// MOVING HORIZONTALLY
	} else if (initialPosition.y === desiredPosition.y) {
		for (let i = 1; i < 8; i++) {
			// -1 left, 1 right
			let multiplier = (desiredPosition.x < initialPosition.x) ? -1 : 1;
			let passedPosition = new Position(
				initialPosition.x + (i * multiplier),
				initialPosition.y
			);
			if (samePosition(passedPosition, desiredPosition)) {
				if (isTileEmptyOrOccupiedByOpponent(passedPosition,
					boardState, team))
					return true;
			} else {
				if (isTileOccupied(passedPosition, boardState)) break;
			}
		}
	}
	return false;
}

export const getPossibleRookMoves = (
	rook:		Piece,
	boardState:	Piece[]
) => {
	const possibleMoves: Position[] = [];

	// top movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			rook.position.x,
			rook.position.y + i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			rook.position.x,
			rook.position.y - i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// left movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			rook.position.x - i,
			rook.position.y
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// right movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			rook.position.x + i,
			rook.position.y
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}
	return possibleMoves;
}