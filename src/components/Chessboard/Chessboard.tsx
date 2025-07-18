import { useRef } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";

const horizontalAxis = "abcdefgh".split("");
const verticalAxis = "12345678".split("");

interface Piece {
	image:	string
	x:		number
	y:		number
}

const pieces: Piece[] = [];

for (let p = 0; p < 2; p++) {
	// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
	// https://commons.wikimedia.org/wiki/Category:PNG_chess_pieces/Standard_transparent
	const type = p === 0 ? "d" : "l";	// dark or light
	const y = p === 0 ? 7 : 0;

	// rooks
	pieces.push({image: `/pieces-svg/Chess_r${type}t45.svg`, x: 0, y});
	pieces.push({image: `/pieces-svg/Chess_r${type}t45.svg`, x: 7, y});
	// knights
	pieces.push({image: `/pieces-svg/Chess_n${type}t45.svg`, x: 1, y});
	pieces.push({image: `/pieces-svg/Chess_n${type}t45.svg`, x: 6, y});
	// bishops
	pieces.push({image: `/pieces-svg/Chess_b${type}t45.svg`, x: 2, y});
	pieces.push({image: `/pieces-svg/Chess_b${type}t45.svg`, x: 5, y});
	// king and queen
	pieces.push({image: `/pieces-svg/Chess_k${type}t45.svg`, x: 4, y});
	pieces.push({image: `/pieces-svg/Chess_q${type}t45.svg`, x: 3, y});
}

// pawns
for (let i = 0; i < 8; i++) {
	pieces.push({image: `/pieces-svg/Chess_pdt45.svg`, x: i, y: 6});	// black
	pieces.push({image: "/pieces-svg/Chess_plt45.svg", x: i, y: 1});	// white
}

export default function Chessboard() {
	const chessboardRef = useRef<HTMLDivElement>(null);

	let activePiece: HTMLElement | null = null;

	function grabPiece(e: React.MouseEvent) {
		const element  = e.target as HTMLElement;
		if (element.classList.contains("chess-piece")) {
			// subtract 50 so you grab the center of the piece
			// remove that and it looks like you're grabbing air
			const x = e.clientX - 50;
			const y = e.clientY - 50;
			element.style.position = "absolute";
			element.style.left = `${x}px`;
			element.style.top = `${y}px`;

			activePiece = element;
		}
	}

	function movePiece(e: React.MouseEvent) {
		const chessboard = chessboardRef.current;
		if (activePiece && chessboard) {
			const minX = chessboard.offsetLeft - 25;
			const minY = chessboard.offsetTop - 25;
			const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
			const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
			const x = e.clientX - 50;
			const y = e.clientY - 50;
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
		e;	// god damn i still need to do this
		if (activePiece) activePiece = null;
	}

	let board = [];

	// don't use ++i or --j
	for (let j = verticalAxis.length - 1; j >= 0; j--) {
		for (let i = 0; i < horizontalAxis.length; i++) {
			const number  = j + i + 2;
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