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

export const kingMove = (
	initialPosition:	Position,	// previous (x, y) location
	desiredPosition:	Position,	// destined (x, y) location
	team:				TeamType,	// whose side this piece is on
	boardState:			Piece[]		// contains properties about board
): boolean => {
	// prevent the king from moving into tiles where it is in check
	// castling
	// check mechanism
	// game end (checkmate/stalemate)

	// king can only move 1 tile in any direction
	for (let i = 1; i < 2; i++) {
		// if (statement1) else if (statement2) else (statement3)
		// -1: left, 1: right, 0: moving vertically (no change in x)
		let multiplierX: number = (desiredPosition.x < initialPosition.x) ? -1 :
			(desiredPosition.x > initialPosition.x) ? 1 : 0;
		// -1: down, 1: up, 0: moving horizontally (no change in y)
		let multiplierY: number = (desiredPosition.y < initialPosition.y) ? -1 :
			(desiredPosition.y > initialPosition.y) ? 1 : 0;

		let passedPosition: Position = {
			x:	initialPosition.x + (i * multiplierX),
			y:	initialPosition.y + (i * multiplierY)
		};

		if (samePosition(passedPosition, desiredPosition)) {
			if (isTileEmptyOrOccupiedByOpponent(
				passedPosition, boardState, team))
				return true;
		} else {
			if (isTileOccupied(passedPosition, boardState)) break;
		}
	}
	return false;
}

export const getPossibleKingMoves = (
	king:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];
	
	// top
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x,
			y:	king.position.y + i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x,
			y:	king.position.y - i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// left
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x - i,
			y:	king.position.y
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// right
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x + i,
			y:	king.position.y
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// upper right
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x + i,
			y:	king.position.y + i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom right
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x + i,
			y:	king.position.y - i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom left
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x - i,
			y:	king.position.y - i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// top left
	for (let i = 1; i < 2; i++) {
		const destination: Position = {
			x:	king.position.x - i,
			y:	king.position.y + i
		};

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}
	return possibleMoves;
}