import {
	Piece,
	Position,
	samePosition,
	TeamType
} from "../../../Constants";
import {
	isTileEmptyOrOccupiedByOpponent,
	isTileOccupied
} from "./GeneralRules";

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
			let passedPosition: Position = {
				x:	initialPosition.x,
				y:	initialPosition.y + (i * multiplier)
			}
			if (samePosition(passedPosition, desiredPosition)) {
				if (isTileEmptyOrOccupiedByOpponent(passedPosition,
					boardState, team))
					return true;
			} else {
				if (isTileOccupied(passedPosition, boardState))
					break;
			}
		}
	// MOVING HORIZONTALLY
	} else if (initialPosition.y === desiredPosition.y) {
		for (let i = 1; i < 8; i++) {
			// -1 left, 1 right
			let multiplier = (desiredPosition.x < initialPosition.x) ? -1 : 1;
			let passedPosition: Position = {
				x:	initialPosition.x + (i * multiplier),
				y:	initialPosition.y
			}
			if (samePosition(passedPosition, desiredPosition)) {
				if (isTileEmptyOrOccupiedByOpponent(passedPosition,
					boardState, team))
					return true;
			} else {
				if (isTileOccupied(passedPosition, boardState))
					break;
			}
		}
	}
	return false;
}