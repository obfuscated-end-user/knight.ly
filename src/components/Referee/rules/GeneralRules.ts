import {
	Piece,
	Position,
	samePosition,
	TeamType
} from "../../../Constants";

export const isTileOccupied = (
	position:	Position,
	boardState:	Piece[]
): boolean => {
	return boardState.find(
		(p) => samePosition(p.position, position)
	) ? true : false;
}

export const isTileOccupiedByOpponent = (
	position:	Position,
	boardState: Piece[],
	team:		TeamType
): boolean => {
	return boardState.find(
		(p) => samePosition(p.position, position) && p.team !== team
	) ? true : false;
}

export const isTileEmptyOrOccupiedByOpponent = (
	position:	Position,
	boardState:	Piece[],
	team:		TeamType
): boolean => {
	return (
		!isTileOccupied(position, boardState) ||
		isTileOccupiedByOpponent(position, boardState, team)
	);
}