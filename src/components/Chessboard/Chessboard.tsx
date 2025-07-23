import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Referee from "../Referee/Referee";

// use this for rendering the rank and file thing later
const horizontalAxis = "abcdefgh".split("");
const verticalAxis = "12345678".split("");

export interface Piece {
	image:		string,
	x:			number,
	y:			number,
	type:		PieceType,
	team:		TeamType,
	enPassant?:	boolean,
};

export enum TeamType {
	OPPONENT,
	OUR
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

const initialBoardState: Piece[] = [];

// render the pieces on the board
// p < 2 because there are only 2 parties involved... can you guess who?
for (let p = 0; p < 2; p++) {
	// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

	const teamType = (p === 0) ? TeamType.OPPONENT : TeamType.OUR;
	// dark or light
	const type: string = (teamType === TeamType.OPPONENT) ? "d" : "l";
	// y = 7, black (top) else y = 0, white (bottom)
	const y: number = (teamType === TeamType.OPPONENT) ? 7 : 0;

	initialBoardState.push({	// rooks
		image:	`/pieces-svg/Chess_r${type}t45.svg`,
		x:		0,
		y,		// you can do this instead of "y: y,"
		type:	PieceType.ROOK,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/Chess_r${type}t45.svg`,
		x:		7,
		y,
		type:	PieceType.ROOK,
		team:	teamType
	});
	initialBoardState.push({	// knights
		image:	`/pieces-svg/Chess_n${type}t45.svg`,
		x:		1,
		y,
		type:	PieceType.KNIGHT,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/Chess_n${type}t45.svg`,
		x:		6,
		y,
		type:	PieceType.KNIGHT,
		team:	teamType
	});
	initialBoardState.push({	// bishops
		image:	`/pieces-svg/Chess_b${type}t45.svg`,
		x:		2,
		y,
		type:	PieceType.BISHOP,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/Chess_b${type}t45.svg`,
		x:		5,
		y,
		type:	PieceType.BISHOP,
		team:	teamType
	});
	initialBoardState.push({	// king and queen
		image:	`/pieces-svg/Chess_k${type}t45.svg`,
		x:		4,
		y,
		type:	PieceType.KING,
		team:	teamType
	});
	initialBoardState.push({
		image:	`/pieces-svg/Chess_q${type}t45.svg`,
		x:		3,
		y,
		type:	PieceType.QUEEN,
		team:	teamType
	});
}

// pawns
for (let i = 0; i < 8; i++) {
	initialBoardState.push({
		image:	"/pieces-svg/Chess_pdt45.svg",
		x:		i,
		y:		6,
		type:	PieceType.PAWN,
		team:	TeamType.OPPONENT	// BLACK
	});
	initialBoardState.push({
		image:	"/pieces-svg/Chess_plt45.svg",
		x:		i,
		y:		1,
		type:	PieceType.PAWN,
		team:	TeamType.OUR		// WHITE
	});
}

export default function Chessboard() {
	const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
	const [gridX, setGridX] = useState(0);
	const [gridY, setGridY] = useState(0);
	const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
	const chessboardRef = useRef<HTMLDivElement>(null);
	const referee = new Referee();

	function grabPiece(e: React.MouseEvent) {
		const element: HTMLElement  = e.target as HTMLElement;
		// remove the type here if something bad happens
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		if (element.classList.contains("chess-piece") && chessboard) {
			// you need the window.scrollX/Y for this to function properly
			const gridX: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / 100
			);
			const gridY: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop - 800)
						/ 100
				)
			);
			setGridX(gridX);
			setGridY(gridY);
			// subtract 50 so you grab the center of the piece
			// remove that and it looks like you're grabbing air
			const x: number = e.clientX + window.scrollX - 50;
			const y: number = e.clientY + window.scrollY - 50;
			element.style.position = "absolute";
			element.style.left = `${x}px`;
			element.style.top = `${y}px`;

			setActivePiece(element);
		}
	}

	function movePiece(e: React.MouseEvent) {
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		if (activePiece && chessboard) {
			const minX: number = chessboard.offsetLeft - 25;
			const minY: number = chessboard.offsetTop - 25;
			const maxX: number
				= chessboard.offsetLeft + chessboard.clientWidth - 75;
			const maxY: number
				= chessboard.offsetTop + chessboard.clientHeight - 75;
			const x: number = e.clientX + window.scrollX - 50;
			const y: number = e.clientY + window.scrollY - 50;
			activePiece.style.position = "absolute";

			if (x < minX)		// too far left
				activePiece.style.left = `${minX}px`;
			else if (x > maxX)	// too far right
				activePiece.style.left = `${maxX}px`;
			else				// within the constraints
				activePiece.style.left = `${x}px`;

			if (y < minY)		// too far up
				activePiece.style.top = `${minY}px`;
			else if (y > maxY)	// too far down
				activePiece.style.top = `${maxY}px`;
			else				// within the constraints
				activePiece.style.top = `${y}px`;
		}
	}

	function dropPiece (e: React.MouseEvent) {
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		if (activePiece && chessboard) {
			const x: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / 100
			);
			const y: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop - 800)
						/ 100
				)
			);

			const currentPiece = pieces.find(
				p => p.x === gridX && p.y === gridY
			);
			// const attackedPiece = pieces.find(p => p.x === x && p.y === y);

			if (currentPiece) {
				const validMove = referee.isValidMove(
					gridX,
					gridY,
					x,
					y,
					currentPiece.type,
					currentPiece.team,
					pieces
				);

				const isEnPassantMove = referee.isEnPassant(
					gridX,
					gridY,
					x,
					y,
					currentPiece.type,
					currentPiece.team,
					pieces,
				);

				const pawnDirection: number = (currentPiece.team === TeamType.OUR) ? 1 : -1;
				if (isEnPassantMove) {
					// https://en.wikipedia.org/wiki/En_passant
					const updatedPieces = pieces.reduce((results, piece) => {
						if (
							piece.x === gridX &&
							piece.y === gridY
						) {
							piece.x = x;
							piece.y = y;
							piece.enPassant = false;
							results.push(piece);
						} else if (!((piece.x === x) && (piece.y === y - pawnDirection))) {
							if (piece.type === PieceType.PAWN) {
								piece.enPassant = false;
							}
							results.push(piece);
						}
						return results;
					}, [] as Piece[]);

					setPieces(updatedPieces);

				// updates the piece position and if a piece is attacked,
				// removes it
				} else if (validMove) {
					// reduce()
					// results - array of results
					// piece - the current piece we are handling
					const updatedPieces = pieces.reduce((results, piece) => {
						if (
							piece.x === gridX &&
							piece.y === gridY
						) {
							// if the attacked pice has made an en passant move in the previous turn
							if (Math.abs(gridY - y) === 2 && piece.type === PieceType.PAWN) {
								console.log("en passant oui oui baguette");
								piece.enPassant = true;
							} else {
								piece.enPassant = false;
							}
							piece.x = x;
							piece.y = y;
							results.push(piece);

							// create a new object instead with updated
							// x and y values
							// results.push({ ...piece, x, y });	// WHAT THE HELL
						} else if (!((piece.x === x) && (piece.y === y))) {
							if (piece.type === PieceType.PAWN) {
								piece.enPassant = false;
							}
							results.push(piece);
						}
						return results;
					}, [] as Piece[]);
					setPieces(updatedPieces);
				} else {
					// resets the piece position
					activePiece.style.position = "relative";
					activePiece.style.removeProperty("top");
					activePiece.style.removeProperty("left");
				}
				
			}
			setActivePiece(null);
		}
	}

	let board = [];

	// render the board
	// don't use ++i or --j
	for (let j = verticalAxis.length - 1; j >= 0; j--) {
		for (let i = 0; i < horizontalAxis.length; i++) {
			const number: number = j + i + 2;
			let image = undefined;

			pieces.forEach(p => {
				if (p.x === i && p.y === j) image = p.image;
			});

			board.push(
				<Tile key={`${j}, ${i}`} image={image} number={number} coords={`(${i}, ${j})`}/>
			);
		}
	}

	return (
		// utilize this later for this to work on mobile devices
		// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
		<div
			onMouseDown={e => grabPiece(e)}
			onMouseMove={e => movePiece(e)}
			onMouseUp={e => dropPiece(e)}
			id="chessboard"
			ref={chessboardRef}
		>
			{board}
		</div>
	);
}