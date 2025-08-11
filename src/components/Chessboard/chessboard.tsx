import {
	useRef,
	useState
} from "react";
import Tile from "../Tile/tile";
import "./chessboard.css";
import {
	VERTICAL_AXIS,
	HORIZONTAL_AXIS,
	GRID_SIZE,
} from "../../constants";
import {
	Piece,
	Position
} from "../../models";

interface Props {
	playMove:	(piece: Piece, position: Position) => boolean;
	pieces:		Piece[];
}

export default function Chessboard({ playMove, pieces }: Props) {
	const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
	const [grabPosition, setGrabPosition] =
		useState<Position>(new Position(-1, -1));
	const chessboardRef = useRef<HTMLDivElement>(null);

	function grabPiece(e: React.MouseEvent) {
		const element: HTMLElement = e.target as HTMLElement;
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		if (element.classList.contains("chess-piece") && chessboard) {
			// replace this with hardcoded value 800 if it fails
			const chessboardHeight = chessboard.clientHeight;
			// you need the window.scrollX/Y for this to function properly
			const grabX: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / GRID_SIZE
			);
			const grabY: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop -
					chessboardHeight) / GRID_SIZE)
			);
			setGrabPosition(new Position(grabX, grabY));
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

			// keep the dragged piece visually constrained inside
			// the boundaries of the chessboard
			if (x < minX)		activePiece.style.left = `${minX}px`;
			else if (x > maxX)	activePiece.style.left = `${maxX}px`;
			else				activePiece.style.left = `${x}px`;

			if (y < minY)		activePiece.style.top = `${minY}px`;
			else if (y > maxY)	activePiece.style.top = `${maxY}px`;
			else				activePiece.style.top = `${y}px`;
		}
	}

	function dropPiece (e: React.MouseEvent) {
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		if (activePiece && chessboard) {
			const chessboardHeight = chessboard.clientHeight;
			const x: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / GRID_SIZE
			);
			const y: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop
					- chessboardHeight) / GRID_SIZE)
			);
			const currentPiece = pieces.find((p) =>
				p.samePosition(grabPosition)
			);
			if (currentPiece) {
				let success = playMove(currentPiece.clone(), new Position(x, y));
				if (!success) {
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
			const piece = pieces.find((p) =>
				p.samePosition(new Position(i, j)));
			let image = piece ? piece.image : undefined;

			let currentPiece = activePiece != null ? pieces.find((p) =>
				p.samePosition(grabPosition)) : undefined;
			let highlight = currentPiece?.possibleMoves ?
				currentPiece.possibleMoves.some((p) =>
					p.samePosition(new Position(i, j))) : false;

			board.push(
				<Tile
					key={`(${i}, ${j})`}
					image={image}
					number={number}
					highlight={highlight}
					coords={`(${i}, ${j})`}
				/>
			);
		}
	}

	// utilize this later for this to work on mobile devices
	// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
	return (
		<>
			<div
				onMouseDown={(e) => grabPiece(e)}
				onMouseMove={(e) => movePiece(e)}
				onMouseUp={(e) => dropPiece(e)}
				id="chessboard"
				ref={chessboardRef}
			>
				{board}
			</div>
		</>
	);
}