import { TeamType } from "../../types";
import {
	isTileEmptyOrOccupiedByOpponent,
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

export const queenMove = (
	initialPosition:	Position,	// previous (x, y) location
	desiredPosition:	Position,	// destined (x, y) location
	team:				TeamType,	// whose side this piece is on
	boardState:			Piece[]		// contains properties about board
): boolean => {
	for (let i = 1; i < 8; i++) {
		// if (statement1) else if (statement2) else (statement3)
		// -1: left, 1: right, 0: moving vertically (no change in x)
		let multiplierX: number = (desiredPosition.x < initialPosition.x) ? -1 :
			(desiredPosition.x > initialPosition.x) ? 1 : 0;
		// -1: down, 1: up, 0: moving horizontally (no change in y)
		let multiplierY: number = (desiredPosition.y < initialPosition.y) ? -1 :
			(desiredPosition.y > initialPosition.y) ? 1 : 0;

		let passedPosition = new Position(
			initialPosition.x + (i * multiplierX),
			initialPosition.y + (i * multiplierY)
		);

		if (passedPosition.samePosition(desiredPosition)) {
			if (isTileEmptyOrOccupiedByOpponent(passedPosition,
				boardState, team))
				return true;
		} else
			if (isTileOccupied(passedPosition, boardState)) break;
	}
	return false;
}

export const getPossibleQueenMoves = (
	queen:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// top movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x,
			queen.position.y + i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x,
			queen.position.y - i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// left movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x - i,
			queen.position.y
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// right movement
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x + i,
			queen.position.y
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// upper right
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x + i,
			queen.position.y + i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom right
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x + i,
			queen.position.y - i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom left
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x - i,
			queen.position.y - i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// top left
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			queen.position.x - i,
			queen.position.y + i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, queen.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}
	return possibleMoves;
}