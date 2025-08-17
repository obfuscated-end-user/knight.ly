import { TeamType } from "../../types";
import {
	isTileOccupied,
	isTileOccupiedByOpponent
} from "./generalRules";
import {
	Piece,
	Position
} from "../../models";
import { Pawn } from "../../models/pawn";

// used for rendering the possible move circles on the screen
export const getPossiblePawnMoves = (
	pawn:		Piece,
	boardState:	Piece[]
): Position[] =>  {
	const possibleMoves: Position[] = [];
	const specialRow: number = (pawn.team === TeamType.OUR) ? 1 : 6;
	const pawnDirection: number = (pawn.team === TeamType.OUR) ? 1 : -1;

	const normalMove = new Position(
		pawn.position.x,
		pawn.position.y + pawnDirection
	);

	const specialMove = new Position(
		pawn.position.x,
		pawn.position.y + pawnDirection * 2
	);

	const upperLeftAttack = new Position(
		pawn.position.x - 1,
		pawn.position.y + pawnDirection
	);

	const upperRightAttack = new Position(
		pawn.position.x + 1,
		pawn.position.y + pawnDirection
	);

	const leftPosition = new Position(
		pawn.position.x - 1,
		pawn.position.y
	);

	const rightPosition = new Position(
		pawn.position.x + 1,
		pawn.position.y
	);

	// if tile in front of pawn is not occupied
	if (!isTileOccupied(normalMove, boardState)) {
		// then that is a possible move
		possibleMoves.push(normalMove);
		// but if pawn hasn't moved yet and the two files ahead is not occupied
		if (
			(pawn.position.y === specialRow) &&
			!isTileOccupied(specialMove, boardState)
		)
			// then that is also a possible move
			possibleMoves.push(specialMove);
	}

	if (isTileOccupiedByOpponent(upperLeftAttack, boardState, pawn.team))
		possibleMoves.push(upperLeftAttack);
	else if (!isTileOccupied(upperLeftAttack, boardState)) {
		const leftPiece = boardState.find((p) =>
			p.samePosition(leftPosition));
		if ((leftPiece != null) && (leftPiece as Pawn).enPassant)
			possibleMoves.push(upperLeftAttack);
	}

	if (isTileOccupiedByOpponent(upperRightAttack, boardState, pawn.team))
		possibleMoves.push(upperRightAttack);
	else if (!isTileOccupied(upperRightAttack, boardState)) {
		const rightPiece = boardState.find((p) =>
			p.samePosition(rightPosition));
		if ((rightPiece != null) && (rightPiece as Pawn).enPassant)
			possibleMoves.push(upperRightAttack);
	}
	return possibleMoves;
}