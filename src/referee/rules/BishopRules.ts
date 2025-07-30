import {
	Piece,
	Position,
	samePosition,
	TeamType
} from "../../Constants";
import {
	isTileEmptyOrOccupiedByOpponent,
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./GeneralRules";

export const bishopMove = (
	initialPosition:	Position,	// previous (x, y) location
	desiredPosition:	Position,	// destined (x, y) location
	team:				TeamType,	// whose side this piece is on
	boardState:			Piece[]		// contains properties about board
): boolean => {
	// because 7 tiles is the furthest a piece can go
	for (let i = 1; i < 8; i++) {
		// -1: left, 1: right
		let multiplierX: number =
			(desiredPosition.x < initialPosition.x) ? -1 : 1;
		// -1: down, 1: up
		let multiplierY: number =
			(desiredPosition.y < initialPosition.y) ? -1 : 1;

		let passedPosition: Position = {
			x:	initialPosition.x + (i * multiplierX),
			y:	initialPosition.y + (i * multiplierY)
		};

		if (samePosition(passedPosition, desiredPosition)) {
			if (isTileEmptyOrOccupiedByOpponent(passedPosition,
				boardState, team))
				return true;
		} else {
			if (isTileOccupied(passedPosition, boardState)) break;
		}
	}
	return false;
}

export const getPossibleBishopMoves = (
	bishop: 	Piece,
	boardState:	Piece[]
) => {
	const possibleMoves: Position[] = [];

	// upper right
	for (let i = 1; i < 8; i++) {
		const destination: Position = {
			x:	bishop.position.x + i,
			y:	bishop.position.y + i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team
		)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom right
	for (let i = 1; i < 8; i++) {
		const destination: Position = {
			x:	bishop.position.x + i,
			y:	bishop.position.y - i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team
		)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom left
	for (let i = 1; i < 8; i++) {
		const destination: Position = {
			x:	bishop.position.x - i,
			y:	bishop.position.y - i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team
		)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// top left
	for (let i = 1; i < 8; i++) {
		const destination: Position = {
			x:	bishop.position.x - i,
			y:	bishop.position.y + i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team
		)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}
	return possibleMoves;
}