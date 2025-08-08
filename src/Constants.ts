import {
	Piece,
	Position
} from "./models";
import { Board } from "./models/board";
import { Pawn } from "./models/pawn";
import {
	PieceType,
	TeamType
} from "./types";

// use this for rendering the rank and file thing later
export const VERTICAL_AXIS = "12345678".split("");
export const HORIZONTAL_AXIS = "abcdefgh".split("");
export const GRID_SIZE = 100;

// this is dumb
const initialBoardState: Piece[] = [];

// render the pieces on the board
// p < 2 because there are only 2 parties involved... can you guess who?
for (let p = 0; p < 2; p++) {
	const teamType = (p === 0) ? TeamType.OPPONENT : TeamType.OUR;
	// dark or light
	const type: string = (teamType === TeamType.OPPONENT) ? "d" : "l";
	// y = 7, black (top) else y = 0, white (bottom)
	const y: number = (teamType === TeamType.OPPONENT) ? 7 : 0;

	// https://commons.wikimedia.org/wiki/Category:SVG_pieces
	initialBoardState.push(	// ROOKS
		new Piece(
			new Position(0, y),
			PieceType.ROOK,
			teamType,
			false
		)
	)
	initialBoardState.push(
		new Piece(
			new Position(7, y),
			PieceType.ROOK,
			teamType,
			false
		)
	);
	initialBoardState.push(	// KNIGHTS
		new Piece(
			new Position(1, y),
			PieceType.KNIGHT,
			teamType,
			false
		)
	);
	initialBoardState.push(
		new Piece(
			new Position(6, y),
			PieceType.KNIGHT,
			teamType,
			false
		)
	);
	initialBoardState.push(	// BISHOPS
		new Piece(
			new Position(2, y),
			PieceType.BISHOP,
			teamType,
			false
		)
	);
	initialBoardState.push(
		new Piece(
			new Position(5, y),
			PieceType.BISHOP,
			teamType,
			false
		)
	);
	initialBoardState.push(	// KING AND QUEEN
		new Piece(
			new Position(4, y),
			PieceType.KING,
			teamType,
			false
		)
	);
	initialBoardState.push(
		new Piece(
			new Position(3, y),
			PieceType.QUEEN,
			teamType,
			false
		)
	);

	// for debugging stalemate, comment this out
	/* initialBoardState.push(new Piece(new Position(7, 7), PieceType.KING, TeamType.OPPONENT, false));
	initialBoardState.push(new Piece(new Position(0, 0), PieceType.KING, TeamType.OUR, false));
	initialBoardState.push(new Piece( new Position(6, 4), PieceType.QUEEN, TeamType.OUR, false));
	initialBoardState.push(new Piece(new Position(6, 3), PieceType.QUEEN, TeamType.OUR, false)); */
}

// for debugging draw, comment this out
/* initialBoardState.push(new Piece(new Position(4, 7), PieceType.KING, TeamType.OPPONENT, false));
initialBoardState.push(new Piece(new Position(3, 7), PieceType.BISHOP, TeamType.OPPONENT, false));
initialBoardState.push(new Piece(new Position(4, 0), PieceType.KING, TeamType.OUR, false));
initialBoardState.push(new Piece(new Position(3, 0), PieceType.BISHOP, TeamType.OUR, false));
initialBoardState.push(new Piece(new Position(4, 1), PieceType.KNIGHT, TeamType.OPPONENT, false));
initialBoardState.push(new Piece(new Position(5, 1), PieceType.KNIGHT, TeamType.OUR, false)); */

// PAWNS
for (let i = 0; i < 8; i++) {
	initialBoardState.push(
		new Pawn(
			new Position(i, 6),
			TeamType.OPPONENT,	// BLACK
			false
		)
	);
	initialBoardState.push(
		new Pawn(
			new Position(i, 1),
			TeamType.OUR,		// WHITE
			false
		)
	);
}

export const initialBoard: Board = new Board(initialBoardState, 1, [], {}, 0);

initialBoard.calculateAllMoves();