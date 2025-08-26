import {
	useRef,
	useState
} from "react";
import Tile from "../Tile/tile";
import "./chessboard.css";
import {
	VERTICAL_AXIS,
	HORIZONTAL_AXIS,
	GRID_SIZE
} from "../../constants";
import {
	Piece,
	Position
} from "../../models";

/**
 * An interface is a way to define the structure of an object. It describes what
 * properties and types an object must have, but doesn't provide implementation.
 * It helps TypeScript check that objects follow a certain format.
 */
interface Props {
	playMove:	(piece: Piece, position: Position) => boolean;
	pieces:		Piece[];
}

export default function Chessboard({ playMove, pieces }: Props) {
	/**
	 * To be fair, I have no idea what these things did until now. So I did a
	 * bit of research and safe to say, I'm a better man.
	 *
	 * Think of a scenario when you're building a website using just plain JS.
	 * You create HTML elements, add event listeners, and update the page
	 * manually whenever something changes. This can get complicated and
	 * repetitive really fast.
	 *
	 * React is a JS library that helps you build interactive user interfaces
	 * more easily. Instead of manually manipulating HTML and keeping track of
	 * the changes yourself, React lets you describe what your UI should look
	 * like at any point based on some data (called "state"). React then takes
	 * care of updating the page efficiently when that data changes.
	 *
	 * React hooks are special "functions" (I don't know) provided by React for
	 * managing this kind of state and other React features inside components,
	 * which are reusable pieces of your UI. If you think about your code that
	 * returns the UI, hooks allow that function to remember information (like
	 * variables that persist across user interactions) and to react to events
	 * like when the component first appears or the data changes.
	 *
	 * In vanilla JS, if you want to track some state (like a counter integer),
	 * you might create a variable and update the DOM manually every time it
	 * changes. In React with hooks, you create a function that declares a
	 * "state variable" with a special hook called useState. React remembers
	 * this variable for you and automatically re-renders the UI when it
	 * changes. You don't need to update the DOM manually.
	 */

	/**
	 * useState is a React hook used to create and manage state variables within
	 * a functional component. When these state values change, React renders the
	 * component again to update the UI.
	 * For example, activePiece changes and triggers a re-render reflecting the
	 * piece position or no active piece.
	 */
	const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
	const [grabPosition, setGrabPosition] =
		useState<Position>(new Position(-1, -1));

	/**
	 * useRef is a React hook used to create a mutable reference to a value
	 * (commonly a DOM element) that persists across renders, but does not
	 * trigger re-renders when changed.
	 * chessboardRef, for example, references the <div> containing the
	 * chessboard grid. This allows the code to access layout properties like
	 * offsetLeft or clientHeight directly from the DOM element w/o causing any
	 * component re-render when these values are used or updated during events.
	 */
	const chessboardRef = useRef<HTMLDivElement>(null);

	/**
	 * Detect if the user clicked on a chess piece and then prepare that piece
	 * for dragging by moving it out of the normal flow, positioning with under
	 * the mouse cursor, and updating component state to indicate which piece is
	 * active (being dragged).
	 */
	function grabPiece(e: React.MouseEvent): void {
		// assert that this is an HTML element
		const element: HTMLElement = e.target as HTMLElement;
		// retrieves a reference to the chessboard container DOM element
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		// checks if the clicked element has the class "chess-piece"
		// (ensuring they clicked on a piece)
		if (element.classList.contains("chess-piece") && chessboard) {
			// store the height of the chessboard container
			// replace this with hardcoded value 800 if it fails
			const chessboardHeight = chessboard.clientHeight;
			// take mouse pointer's horizontal position relative to the page,
			// add horizontal page scroll offset to handle scrolling,
			// subtract chessboard's left position on the page to convert from
			// page to board coords
			// divide by GRID_SIZE (size of one chess tile in px)
			// Math.floor to get int grid coord
			const grabX: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / GRID_SIZE
			);
			// almost the same thing as grabX, but I have to use abs and ceil
			const grabY: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop -
					chessboardHeight) / GRID_SIZE)
			);
			// update React state to remember grid coord where the piece was
			// grabbed, creating a new Position instance
			setGrabPosition(new Position(grabX, grabY));
			// calculate px coords for positioning the piece so the mouse grabs
			// the center of the piece, offsetting by half the grid size
			const x: number = e.clientX + window.scrollX - (GRID_SIZE / 2);
			const y: number = e.clientY + window.scrollY - (GRID_SIZE / 2);
			// change grabbed piece's CSS position property to absolute so it
			// can be moved freely over the chessboard, and x and y to position
			// it centered under the mouse cursor
			element.style.position = "absolute";
			element.style.left = `${x}px`;
			element.style.top = `${y}px`;
			// update React state to remember which HTML element is currently
			// being dragged
			setActivePiece(element);
		}
	}

	/**
	 * Update the position of the currently dragged chess piece on the screen as
	 * the user moves the mouse, ensuring the piece stays visually within the
	 * boundaries of the chessboard.
	 */
	function movePiece(e: React.MouseEvent): void {
		const chessboard: (HTMLDivElement | null) = chessboardRef.current;
		// proceeds only if there is an active piece being dragged
		if (activePiece && chessboard) {
			// calculates the minimum and maximum allowed pixel coordinates for
			// left (x) and top (y) to keep the piece inside the board's visible
			// area

			// offsetLeft and offsetTop are the chessboard's top-left corner
			// coordinates relative to the page
			// the - 25 and - 75 offsets create a padding boundary so that the
			// piece visually doesn't go outside the board or the allowed drag
			// area
			const minX: number = chessboard.offsetLeft - 25;
			const minY: number = chessboard.offsetTop - 25;
			const maxX: number
				= chessboard.offsetLeft + chessboard.clientWidth - 75;
			const maxY: number
				= chessboard.offsetTop + chessboard.clientHeight - 75;
			// calculate px coords for positioning the piece so the mouse grabs
			// the center of the piece, offsetting by half the grid size
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

	/**
	 * Finalize the move of a dragged chess piece by calculating its drop
	 * position on the board, attempting to update the game state via
	 * playMove(), and visually resetting the piece if the move is invalid.
	 */
	function dropPiece (e: React.MouseEvent): void {
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
			// finds the Piece object from the current pieces list that matches
			// the original grid position where the piece was grabbed
			// (grabPosition is where the drag started)
			const currentPiece = pieces.find((p) =>
				p.samePosition(grabPosition)
			);
			// if a piece is found (should be true unless something weird
			// happened)
			if (currentPiece) {
				// call playMove, passing a clone of the current piece (so the
				// original piece data is not mutated directly)
				// the new grid position (where the piece was dropped)
				// playMove tries to update the chess game state by moving the
				// piece and returns true if the move is valid, false otherwise
				let success: boolean = playMove(currentPiece.clone(),
					new Position(x, y));
				// if the move is invalid
				if (!success) {
					// visually snap the piece back to its original place before
					// dragging
					activePiece.style.position = "relative";
					activePiece.style.removeProperty("top");
					activePiece.style.removeProperty("left");
				}
			}
			// change the activePiece state, indicating that no piece is
			// currently being dragged anymore
			setActivePiece(null);
		}
	}

	// initialize an empty array, that will store all the Tile React elements
	// for the chessboard
	let board = [];

	// don't use ++i or --j
	// the outer loop goes through rows (j), counting from top to bottom,
	// because chessboard ranks typically start at the bottom (1) and increase
	// upwards (8), and looping backwards supports this orientation
	for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
		// inner loop goes through columns (i) from left to right
		for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
			// calculate a number value for each square to determine tile color
			// by checking if it is even or odd
			// since j and i start from 0 or (length - 1), adding 2 ensures the
			// sum is consistently aligned for coloring
			const number: number = j + i + 2;
			// look for a chess piece from the pieces array that occupies the
			// current board position (i, j)
			// use samePosition() on pieces which checks if a piece’s position
			// matches (i, j)
			const piece = pieces.find((p) =>
				p.samePosition(new Position(i, j)));
			// if piece is found on this square, get its corresponding image
			let image = piece ? piece.image : undefined;

			// check if a piece is currently being dragged
			// if yes, finds the piece in pieces at the position where the piece
			// was originally grabbed (grabPosition)
			let currentPiece = activePiece != null ? pieces.find((p) =>
				p.samePosition(grabPosition)) : undefined;
			// if there is a currently active piece being dragged and it has a
			// list of possible moves, it checks if this position is among the
			// possible moves
			// use .some() to check if any of the possible move positions are
			// the same as (i, j)
			let highlight = currentPiece?.possibleMoves ?
				currentPiece.possibleMoves.some((p) =>
					p.samePosition(new Position(i, j))) : false;

			// creates a Tile and adds it to the board array
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
			<div className="board-container">
				<div className="file-labels">
					{HORIZONTAL_AXIS.map((file) => (
						<div
							key={file}
							className="file-label"
							style={{transform: "scale(-1, -1)"}}
						>
							{file.toUpperCase()}
						</div>
					))}
				</div>
				<div className="board-with-ranks">
					<div className="rank-labels">
						{VERTICAL_AXIS.slice(0).reverse().map((rank) => (
							<div key={rank} className="rank-label">{rank}</div>
						))}
					</div>
					<div
						onMouseDown={(e) => grabPiece(e)}
						onMouseMove={(e) => movePiece(e)}
						onMouseUp={(e) => dropPiece(e)}
						id="chessboard"
						ref={chessboardRef}
					>
						{board}
					</div>
					<div className="rank-labels">
						{VERTICAL_AXIS.slice(0).reverse().map((rank) => (
							<div
								key={rank}
								className="rank-label"
								style={{writingMode: "sideways-rl"}}
							>
								{rank}
							</div>
						))}
					</div>
				</div>
				<div className="file-labels">
					{HORIZONTAL_AXIS.map((file) => (
						<div
							key={file}
							className="file-label"
						>
							{file.toUpperCase()}
						</div>
					))}
				</div>
			</div>
		</>
	);
}