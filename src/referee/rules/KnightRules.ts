import { TeamType } from "../../types";
import { isTileEmptyOrOccupiedByOpponent } from "./GeneralRules";
import {
	Piece,
	Position
} from "../../models";

export const knightMove = (
	initialPosition:	Position,	// previous (x, y) location
	desiredPosition:	Position,	// destined (x, y) location
	team:				TeamType,	// whose side this piece is on
	boardState:			Piece[]		// contains properties about board
): boolean => {
	// remember that you don't have to check if there's anything
	// blocking a knight's way because it can jump between pieces
	// only do that for pieces of the same team
	// MOVEMENT AND ATTACK LOGIC
	for (let i = -1; i < 2; i += 2) {
		for (let j = -1; j < 2; j += 2) {
			// top/bottom side movement
			// move 2 tiles forwards/backwards
			if (desiredPosition.y - initialPosition.y === 2 * i) {
				// move 1 tile left/right
				if (desiredPosition.x - initialPosition.x === j) {
					if (isTileEmptyOrOccupiedByOpponent(
						desiredPosition, boardState, team)
					)
						return true;
				}
			}
			// left/right side movement
			// move 2 tiles left/right
			if (desiredPosition.x - initialPosition.x === 2 * i) {
				// move 1 tile forward/backward
				if (desiredPosition.y - initialPosition.y === j) {
					if (isTileEmptyOrOccupiedByOpponent(
						desiredPosition, boardState, team)
					)
						return true;
				}
			}
		}
	}
	return false;
}

export const getPossibleKnightMoves = (
	knight:		Piece,
	boardState:	Piece[]
): Position[] => {
	const possibleMoves: Position[] = [];

	for (let i = -1; i < 2; i += 2) {
		for (let j = -1; j < 2; j += 2) {
			const verticalMove = new Position(
				knight.position.x + j,
				knight.position.y + i * 2
			);
			const horizontalMove = new Position(
				knight.position.x + i * 2,
				knight.position.y + j
			);

			if (isTileEmptyOrOccupiedByOpponent(
				verticalMove, boardState, knight.team)
			)
				possibleMoves.push(verticalMove);
			if (isTileEmptyOrOccupiedByOpponent(
				horizontalMove, boardState, knight.team)
			)
				possibleMoves.push(horizontalMove);
		}
	}
	return possibleMoves;
}