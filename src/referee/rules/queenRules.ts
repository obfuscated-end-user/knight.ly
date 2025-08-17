import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

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