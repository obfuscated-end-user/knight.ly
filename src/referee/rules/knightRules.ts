import { isTileEmptyOrOccupiedByOpponent } from "./generalRules";
import {
	Piece,
	Position
} from "../../models";

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