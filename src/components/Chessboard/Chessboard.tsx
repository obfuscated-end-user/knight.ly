import {
	useRef,
	useState
} from "react";
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
	const [promotionPawn, setPromotionPawn] = useState<Piece>();
	const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
	const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
	const chessboardRef = useRef<HTMLDivElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const referee = new Referee();

	function updateValidMoves() {
		setPieces((currentPieces) => {
			return currentPieces.map((p) => {
				p.possibleMoves = referee.getValidMoves(p, currentPieces);
				return p;
			});
		});
	}

	function grabPiece(e: React.MouseEvent) {
		updateValidMoves();
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
					chessboardHeight) / GRID_SIZE
				)
			);
			setGrabPosition({ x: grabX, y: grabY });
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
			const chessboardHeight = chessboard.clientHeight;
			const x: number = Math.floor(
				(e.clientX + window.scrollX - chessboard.offsetLeft) / GRID_SIZE
			);
			const y: number = Math.abs(
				Math.ceil(
					(e.clientY + window.scrollY - chessboard.offsetTop
					- chessboardHeight) / GRID_SIZE
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

							let promotionRow: number =
								(piece.team === TeamType.OUR) ? 7 : 0;

							if (
								(y === promotionRow) &&
								(piece.type === PieceType.PAWN)
							) {
								modalRef.current?.classList.remove("hidden");
								setPromotionPawn(piece);
							}
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

	function promotePawn(pieceType: PieceType) {
		if (promotionPawn === undefined)
			return;
		const updatedPieces = pieces.reduce((results, piece) => {
			if (samePosition(piece.position, promotionPawn.position)) {
				piece.type = pieceType;
				const teamType: string =
					(piece.team === TeamType.OUR) ? "l" : "d";
				let promotionPiece = "";
				switch(pieceType) {
					case PieceType.ROOK:
						promotionPiece = "r";
						break;
					case PieceType.BISHOP:
						promotionPiece = "b";
						break;
					case PieceType.KNIGHT:
						promotionPiece = "n";
						break;
					case PieceType.QUEEN:
						promotionPiece = "q";
						break;
				}
				piece.image =
					`/pieces-svg/${promotionPiece}${teamType}.svg`;
			}
			results.push(piece);
			return results;
		}, [] as Piece[]);
		setPieces(updatedPieces);
		modalRef.current?.classList.add("hidden");
	}

	function promotionTeamType() {
		return (promotionPawn?.team === TeamType.OUR) ? "l" : "d";
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

			let currentPiece = activePiece != null ? pieces.find(
				(p) => samePosition(p.position, grabPosition)
			) : undefined;
			let highlight =
				currentPiece?.possibleMoves ?
				currentPiece.possibleMoves.some(
					(p) => samePosition(p, { x: i, y: j })
				) : false;
			
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

	return (
		// utilize this later for this to work on mobile devices
		// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
		<>
			<div id="pawn-promotion-modal" className="hidden" ref={modalRef}>
				<div className="modal-body">
					<img
						onClick={() => promotePawn(PieceType.ROOK)}
						src={`/pieces-svg/r${promotionTeamType()}.svg`}
					/>
					<img
						onClick={() => promotePawn(PieceType.BISHOP)}
						src={`/pieces-svg/b${promotionTeamType()}.svg`}
					/>
					<img
						onClick={() => promotePawn(PieceType.KNIGHT)}
						src={`/pieces-svg/n${promotionTeamType()}.svg`}
					/>
					<img
						onClick={() => promotePawn(PieceType.QUEEN)}
						src={`/pieces-svg/q${promotionTeamType()}.svg`}
					/>
				</div>
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
		</>
	);
}