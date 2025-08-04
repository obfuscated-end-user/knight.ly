import {
	useEffect,
	useRef,
	useState
} from "react";
import { initialBoard } from "../../Constants";
import Chessboard from "../Chessboard/Chessboard";
import {
	bishopMove,
	kingMove,
	knightMove,
	pawnMove,
	queenMove,
	rookMove,
} from "../../referee/rules";
import {
	Piece,
	Position
} from "../../models";
import {
	PieceType,
	TeamType
} from "../../types";
import { Pawn } from "../../models/pawn";
import { Board } from "../../models/board";

export default function Referee() {
	const [board, setBoard] = useState<Board>(initialBoard);
	const [promotionPawn, setPromotionPawn] = useState<Piece>();
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => board.calculateAllMoves(), []);

	function playMove(playedPiece: Piece, destination: Position): boolean {
		// remember that everything is ignored below a return statement once it
		// gets there successfullt ahh i don't fucking know.

		// if the played piece does not have any legal moves
		if (playedPiece.possibleMoves === undefined) return false;

		// odd = white, even = black
		// prevents a team from making a move if it's not their turn
		if ((playedPiece.team === TeamType.OUR) && (board.totalTurns % 2 !== 1))
			return false;
		if ((playedPiece.team === TeamType.OPPONENT) && (board.totalTurns % 2 !== 0)) return false;
		let playedMoveIsValid = false;
		const validMove = playedPiece.possibleMoves?.some((m) => m.samePosition(destination));
		// prevent pawn promotion by simply dragging a pawn to the promotion rows
		if (!validMove) return false;
		const enPassantMove = isEnPassant(
			playedPiece.position,
			destination,
			playedPiece.type,
			playedPiece.team
		);
		// you added this because of a random unseen bug
		const originalPosition = new Position(playedPiece.position.x, playedPiece.position.y);

		// playMove() modifies the board, thus, we need to call setBoard
		setBoard(() => {
			// remove this later, i know it looks stupid
			// ypreviousBoard = new Board([], 0);

			const clonedBoard = board.clone();
			clonedBoard.totalTurns += 1;
			// playing the move
			playedMoveIsValid = clonedBoard.playMove(
				enPassantMove,
				validMove,
				playedPiece,
				destination,
				originalPosition
			);

			return clonedBoard;
		})
		// this is for promoting the pawn
		let promotionRow: number =
			(playedPiece.team === TeamType.OUR) ? 7 : 0;

		if (
			(destination.y === promotionRow) &&
			(playedPiece.isPawn)
		) {
			modalRef.current?.classList.remove("hidden");
			setPromotionPawn(() => {
				// previousPromotionPawn = undefined;
				const clonedPlayedPiece = playedPiece.clone();
				clonedPlayedPiece.position = destination.clone();
				return clonedPlayedPiece;
			});
		}

		
		return playedMoveIsValid;
	}

	function isEnPassant (
		initialPosition:	Position,
		desiredPosition:	Position,
		type:				PieceType,
		team:				TeamType
	) {
		const pawnDirection: number = (team === TeamType.OUR) ? 1 : -1;

		if (type === PieceType.PAWN) {
			// upper left/right || bottom left/right
			if (
				((desiredPosition.x - initialPosition.x === -1) ||
				(desiredPosition.x - initialPosition.x === 1))  &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				// if a piece is under/above the attacked tile
				const piece = board.pieces.find((p) => 
					(p.position.x === desiredPosition.x) &&
					(p.position.y === desiredPosition.y - pawnDirection) &&
					p.isPawn &&
					(p as Pawn).enPassant
				);
				if (piece)
					return true;
			}
		}
		return false;
	}

	function isValidMove(
		initialPosition:	Position,	// previous (x, y) location
		desiredPosition:	Position,	// destined (x, y) location
		type:				PieceType,	// what piece this is (pawn, rook, etc.)
		team:				TeamType,	// whose side this piece is on
	): boolean {
		// remember that coordinates start from (0, 0) at the bottom left
		// corner of the board
		let validMove: boolean = false;
		switch(type) {
			case PieceType.PAWN:
				validMove = pawnMove(
					initialPosition,
					desiredPosition,
					team,
					board.pieces
				);
				break;
			case PieceType.KNIGHT:
				validMove = knightMove(
					initialPosition,
					desiredPosition,
					team,
					board.pieces
				);
				break;
			case PieceType.BISHOP:
				validMove = bishopMove(
					initialPosition,
					desiredPosition,
					team,
					board.pieces
				);
				break;
			case PieceType.ROOK:
				validMove = rookMove(
					initialPosition,
					desiredPosition,
					team,
					board.pieces
				);
				break;
			case PieceType.QUEEN:
				validMove = queenMove(
					initialPosition,
					desiredPosition,
					team,
					board.pieces
				);
				break;
			case PieceType.KING:
				validMove = kingMove(
					initialPosition,
					desiredPosition,
					team,
					board.pieces
				);
				break;
			case PieceType.UNKNOWN:
				console.log("UNKNOWN");
				break;
		}
		return validMove;
	}

	function promotePawn(pieceType: PieceType) {
		if (promotionPawn === undefined)
			return;

		setBoard(() => {
			// previousBoard = new Board([], 0);
			const clonedBoard = board.clone();
			clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
			if (piece.samePiecePosition(promotionPawn)) {
				results.push(new Piece(piece.position.clone(), pieceType, piece.team));
			} else {
				results.push(piece);
			}
			return results;
		}, [] as Piece[]);
			clonedBoard.calculateAllMoves();
			return clonedBoard;
		});

		// board.pieces = 
		// updatePossibleMoves();
		modalRef.current?.classList.add("hidden");
	}

	// used to show the correct team while promoting pawns
	function promotionTeamType() {
		return (promotionPawn?.team === TeamType.OUR) ? "l" : "d";
	}

	return (
		<>
			<p style={{color: "white", fontSize: "24px"}}>{board.totalTurns}</p>
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
			<Chessboard
				playMove={playMove}
				pieces={board.pieces}
			/>
		</>
	);
}