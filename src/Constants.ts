// use this for rendering the rank and file thing later
export const VERTICAL_AXIS = "12345678".split("");
export const HORIZONTAL_AXIS = "abcdefgh".split("");
export const GRID_SIZE = 100;

export function samePosition(p1: Position, p2: Position) {
	return (p1.x === p2.x) && (p1.y === p2.y);
}

export interface Position {
	x:	number,
	y:	number
};

export enum PieceType {
	PAWN,
	BISHOP,
	KNIGHT,
	ROOK,
	QUEEN,
	KING,
	UNKNOWN
};

export enum TeamType {
	OPPONENT,
	OUR
};

export interface Piece {
	image:			string,
	position:		Position,
	type:			PieceType,
	team:			TeamType,
	enPassant?:		boolean,
	possibleMoves?:	Position[]
};

export const initialBoardState: Piece[] = [];

// render the pieces on the board
// p < 2 because there are only 2 parties involved... can you guess who?
for (let p = 0; p < 2; p++) {
	const teamType = (p === 0) ? TeamType.OPPONENT : TeamType.OUR;
	// dark or light
	const type: string = (teamType === TeamType.OPPONENT) ? "d" : "l";
	// y = 7, black (top) else y = 0, white (bottom)
	const y: number = (teamType === TeamType.OPPONENT) ? 7 : 0;

	// https://commons.wikimedia.org/wiki/Category:SVG_pieces
	initialBoardState.push({	// ROOKS
		image:	`/pieces-svg/r${type}.svg`,
		position: {
			x:	0,
			y	// you can do this instead of "y: y,"
		},
		type:	PieceType.ROOK,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/r${type}.svg`,
		position: {
			x:	7,
			y
		},
		type:	PieceType.ROOK,
		team:	teamType
	});
	initialBoardState.push({	// KNIGHTS
		image:	`/pieces-svg/n${type}.svg`,
		position: {
			x:	1,
			y
		},
		type:	PieceType.KNIGHT,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/n${type}.svg`,
		position: {
			x:	6,
			y
		},
		type:	PieceType.KNIGHT,
		team:	teamType
	});
	initialBoardState.push({	// BISHOPS
		image:	`/pieces-svg/b${type}.svg`,
		position: {
			x:	2,
			y
		},
		type:	PieceType.BISHOP,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/b${type}.svg`,
		position: {
			x:	5,
			y
		},
		type:	PieceType.BISHOP,
		team:	teamType
	});
	initialBoardState.push({	// KING AND QUEEN
		image:	`/pieces-svg/k${type}.svg`,
		position: {
			x:	4,
			y
		},
		type:	PieceType.KING,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/q${type}.svg`,
		position: {
			x:	3,
			y
		},
		type:	PieceType.QUEEN,
		team:	teamType
	});
}

// pawns
for (let i = 0; i < 8; i++) {
	initialBoardState.push({
		image:	"/pieces-svg/pd.svg",
		position: {
			x:	i,
			y:	6
		},
		type:	PieceType.PAWN,
		team:	TeamType.OPPONENT	// BLACK
	});
	initialBoardState.push({
		image:	"/pieces-svg/pl.svg",
		position: {
			x:	i,
			y:	1
		},
		type:	PieceType.PAWN,
		team:	TeamType.OUR		// WHITE
	});
}