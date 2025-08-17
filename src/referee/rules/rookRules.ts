import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

export const getPossibleRookMoves = (
	rook:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	// top movement
	for (let i = 1; i < 8; i++) {
		// if destination is outside of the board, don't look any further
		if (rook.position.y + i > 7) break;

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
		if (rook.position.y - i < 0) break;

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
		if (rook.position.x - i < 0) break;

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
		if (rook.position.x + i > 7) break;

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