import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Referee from "../Referee/Referee";
import {
	VERTICAL_AXIS,
	HORIZONTAL_AXIS,
	GRID_SIZE,
	Piece,
	PieceType,
	TeamType,
	initialBoardState,
	Position,
	samePosition
} from "../../Constants";

export default function Chessboard() {
	const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
	const [grabPosition, setGrabPostion] = useState<Position>({ x: -1, y: -1 });
	const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
	const chessboardRef = useRef<HTMLDivElement>(null);
	const referee = new Referee();

	function grabPiece(e: React.MouseEvent) {
		const element: HTMLElement = e.target as HTMLElement;
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		if (element.classList.contains("chess-piece") && chessboard) {
			// you need the window.scrollX/Y for this to function properly
			const grabX: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / GRID_SIZE
			);
			const grabY: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop - 800)
						/ GRID_SIZE
				)
			);
			setGrabPostion({ x: grabX, y: grabY });
			// subtract (GRID_SIZE / 2) so you grab the center of the piece
			// remove that and it looks like you're grabbing air
			const x: number = e.clientX + window.scrollX - (GRID_SIZE / 2);
			const y: number = e.clientY + window.scrollY - (GRID_SIZE / 2);
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
			const x: number = e.clientX + window.scrollX - (GRID_SIZE / 2);
			const y: number = e.clientY + window.scrollY - (GRID_SIZE / 2);
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
				(e.clientX + window.scrollX - chessboard.offsetLeft) / GRID_SIZE
			);
			const y: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop - 800)
						/ GRID_SIZE
				)
			);

			const currentPiece = pieces.find(
				(p) => samePosition(p.position, grabPosition)
			);

			if (currentPiece) {
				const validMove = referee.isValidMove(
					grabPosition,
					{ x, y },
					currentPiece.type,
					currentPiece.team,
					pieces
				);

				const isEnPassantMove = referee.isEnPassant(
					grabPosition,
					{ x, y },
					currentPiece.type,
					currentPiece.team,
					pieces,
				);

				const pawnDirection: number =			// w	b
					(currentPiece.team === TeamType.OUR) ? 1 : -1;
				if (isEnPassantMove) {
					// https://en.wikipedia.org/wiki/En_passant
					const updatedPieces = pieces.reduce((results, piece) => {
						if (samePosition(piece.position, grabPosition)) {
							piece.position.x = x;
							piece.position.y = y;
							piece.enPassant = false;
							results.push(piece);
						} else if (!samePosition(
							piece.position, { x, y: y - pawnDirection }
						)) {
							if (piece.type === PieceType.PAWN)
								piece.enPassant = false;
							results.push(piece);
						}
						return results;
					}, [] as Piece[]);

					setPieces(updatedPieces);

				// updates the piece position and if a piece is attacked,
				// removes it
				} else if (validMove) {
					const updatedPieces = pieces.reduce((results, piece) => {
						if (samePosition(piece.position, grabPosition)) {
							// if the attacked piece has made an en passant move
							// in the previous turn
							piece.enPassant = Math.abs(grabPosition.y - y) === 2
								&& piece.type === PieceType.PAWN;
							piece.position.x = x;
							piece.position.y = y;
							results.push(piece);
						} else if (!samePosition(piece.position, { x, y })) {
							if (piece.type === PieceType.PAWN)
								piece.enPassant = false;
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

	// render the board
	let board = [];

	// don't use ++i or --j
	for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
		for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
			const number: number = j + i + 2;
			const piece = pieces.find(
				(p) => samePosition(p.position, { x: i, y: j })
			);
			let image = piece ? piece.image : undefined;
			
			board.push(
				<Tile
					key={`(${i}, ${j})`}
					image={image}
					number={number}
					coords={`(${i}, ${j})`}
				/>
			);
		}
	}

	return (
		// utilize this later for this to work on mobile devices
		// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
		<div
			onMouseDown={(e) => grabPiece(e)}
			onMouseMove={(e) => movePiece(e)}
			onMouseUp={(e) => dropPiece(e)}
			id="chessboard"
			ref={chessboardRef}
		>
			{board}
		</div>
	);
}