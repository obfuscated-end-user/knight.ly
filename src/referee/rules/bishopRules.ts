import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

export const getPossibleBishopMoves = (
	bishop: 	Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// upper right
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			bishop.position.x + i,
			bishop.position.y + i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom right
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			bishop.position.x + i,
			bishop.position.y - i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom left
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			bishop.position.x - i,
			bishop.position.y - i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// top left
	for (let i = 1; i < 8; i++) {
		const destination = new Position(
			bishop.position.x - i,
			bishop.position.y + i
		);

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(
			destination, boardState, bishop.team)
		) {
			possibleMoves.push(destination);
			break;
		} else break;
	}
	return possibleMoves;
}