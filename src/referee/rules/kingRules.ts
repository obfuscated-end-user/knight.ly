import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

export const getPossibleKingMoves = (
	king:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];
	
	// top
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x,
			king.position.y + i
		);

		// if the move is outside of the board, don't add it
		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x,
			king.position.y - i
		);

		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// left
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x - i,
			king.position.y
		);

		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// right
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x + i,
			king.position.y
		);

		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// upper right
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x + i,
			king.position.y + i
		);

		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom right
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x + i,
			king.position.y - i
		);

		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// bottom left
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x - i,
			king.position.y - i
		);

		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}

	// top left
	for (let i = 1; i < 2; i++) {
		const destination = new Position(
			king.position.x - i,
			king.position.y + i
		);

		if (
			(destination.x < 0) || (destination.x > 7) ||
			(destination.y < 0) || (destination.y > 7)
		)
			break;

		if (!isTileOccupied(destination, boardState))
			possibleMoves.push(destination);
		else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
			possibleMoves.push(destination);
			break;
		} else break;
	}
	return possibleMoves;
}

// when using this method, the enemy moves have already been calculated
export const getCastlingMoves = (
	king:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	if (king.hasMoved) return possibleMoves;

	// get the rooks from the king's team that haven't moved yet
	const rooks = boardState.filter(
		(p) => p.isRook && p.team === king.team && !p.hasMoved
	);
	for (const rook of rooks) {
		// determine if we need to go to the right or left side
		// (from the rook's perspective)
		const direction = (rook.position.x - king.position.x > 0) ? 1 : -1;

		// direction is determined from the rook to the king
		const adjacentPosition = king.position.clone();
		adjacentPosition.x += direction;

		if (!rook.possibleMoves?.some((m) => m.samePosition(adjacentPosition)))
			continue;

		// we know that the rook can move to the adjacent side of the king
		const concerningTiles = rook.possibleMoves.filter(
			(m) => m.y === king.position.y
		);

		// checking if any of the enemy pieces can attack the spaces between
		// the rook and the king
		const enemyPieces = boardState.filter((p) => p.team !== king.team);
		let valid = true;

		for (const enemy of enemyPieces) {
			if (enemy.possibleMoves === undefined) continue;
			for (const move of enemy.possibleMoves) {
				if (concerningTiles.some((t) => t.samePosition(move)))
					valid = false;
				if (!valid) break;
			}
			if (!valid) break;
		}
		if (!valid) continue;
		possibleMoves.push(rook.position.clone());
	}
	return possibleMoves;
}