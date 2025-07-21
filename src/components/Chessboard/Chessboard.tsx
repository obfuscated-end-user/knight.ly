import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Referee from "../Referee/Referee";

// use this for rendering the rank and file thing later
const horizontalAxis = "abcdefgh".split("");
const verticalAxis = "12345678".split("");

export interface Piece {
	image:	string
	x:		number
	y:		number
	type:	PieceType
	team:	TeamType
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

for (let p = 0; p < 2; p++) {
	// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
	// https://commons.wikimedia.org/wiki/Category:PNG_chess_pieces/Standard_transparent
	const teamType = p === 0 ? TeamType.OPPONENT : TeamType.OUR;
	const type: string = teamType === TeamType.OPPONENT ? "d" : "l";	// dark or light
	const y: number = teamType === TeamType.OPPONENT ? 7 : 0;

	// rooks
	initialBoardState.push({image: `/pieces-svg/Chess_r${type}t45.svg`, x: 0, y, type: PieceType.ROOK, team: teamType});
	initialBoardState.push({image: `/pieces-svg/Chess_r${type}t45.svg`, x: 7, y, type: PieceType.ROOK, team: teamType});
	// knights
	initialBoardState.push({image: `/pieces-svg/Chess_n${type}t45.svg`, x: 1, y, type: PieceType.KNIGHT, team: teamType});
	initialBoardState.push({image: `/pieces-svg/Chess_n${type}t45.svg`, x: 6, y, type: PieceType.KNIGHT, team: teamType});
	// bishops
	initialBoardState.push({image: `/pieces-svg/Chess_b${type}t45.svg`, x: 2, y, type: PieceType.BISHOP, team: teamType});
	initialBoardState.push({image: `/pieces-svg/Chess_b${type}t45.svg`, x: 5, y, type: PieceType.BISHOP, team: teamType});
	// king and queen
	initialBoardState.push({image: `/pieces-svg/Chess_k${type}t45.svg`, x: 4, y, type: PieceType.KING, team: teamType});
	initialBoardState.push({image: `/pieces-svg/Chess_q${type}t45.svg`, x: 3, y, type: PieceType.QUEEN, team: teamType});
}

// pawns
for (let i = 0; i < 8; i++) {
	// black and white (in that order)
	initialBoardState.push({image: `/pieces-svg/Chess_pdt45.svg`, x: i, y: 6, type: PieceType.PAWN, team: TeamType.OPPONENT});
	initialBoardState.push({image: "/pieces-svg/Chess_plt45.svg", x: i, y: 1, type: PieceType.PAWN, team: TeamType.OUR});
}

export default function Chessboard() {
	// prevents a weird double clicking bug (uncomment the activePiece lines to
	// see it in action)
	const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
	const [gridX, setGridX] = useState(0);
	const [gridY, setGridY] = useState(0);
	const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
	const chessboardRef = useRef<HTMLDivElement>(null);
	const referee: any = new Referee();

	function grabPiece(e: React.MouseEvent) {
		const element: HTMLElement  = e.target as HTMLElement;
		// remove the type here if something bad happens
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		// console.log(element);
		if (element.classList.contains("chess-piece") && chessboard) {
			// you need the window.scrollX/Y for this to function properly
			const gridX: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / 100
			);
			const gridY: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop - 800) / 100
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

			// DEBUG
			// console.log(`MOUSE (${x}, ${y})\nPIECE (${activePiece.style.left}, ${activePiece.style.top})`);
		}
	}

	function dropPiece (e: React.MouseEvent) {
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		if (activePiece && chessboard) {
			const x: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / 100
			);
			const y: number = Math.abs(
				Math.ceil((e.clientY + window.scrollY - chessboard.offsetTop - 800) / 100)
			);

			const currentPiece = pieces.find(p => p.x === gridX && p.y === gridY);
			// const attackedPiece = pieces.find(p => p.x === x && p.y === y);

			if (currentPiece) {
				const validMove = referee.isValidMove(
					gridX, gridY, x, y, currentPiece.type, currentPiece.team, pieces
				);

				// updates the piece position and if a piece is attacked,
				// removes it
				if (validMove) {
					// reduce()
					// results - array of results
					// piece - the current piece we are handlingyy
					const updatedPieces = pieces.reduce((results, piece) => {
						// results.push(piece);
						if (piece.x === currentPiece.x && piece.y === currentPiece.y) {
							piece.x = x;
							piece.y = y;
							results.push(piece);
						} else if (!(piece.x === x && piece.y === y)) {
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
				<Tile key={`${j}, ${i}`} image={image} number={number}/>
			);
		}
	}

	return (
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