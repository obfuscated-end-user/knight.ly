import {
	useRef,
	useState
} from "react";
import { initialBoard } from "../../Constants";
import Chessboard from "../Chessboard/Chessboard";
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
import "./referee.css";

export default function Referee() {
	// clone() ensures that we're not modifying the original board
	const [board, setBoard] = useState<Board>(initialBoard.clone());
	const [promotionPawn, setPromotionPawn] = useState<Piece>();
	const [modalMessage, setModalMessage] = useState("");
	const modalRef = useRef<HTMLDivElement>(null);
	const endgameModalRef = useRef<HTMLDivElement>(null);

	function playMove(playedPiece: Piece, destination: Position): boolean {
		// remember that everything is ignored below a return statement once it
		// gets there successfully

		// if the played piece does not have any legal moves
		if (playedPiece.possibleMoves === undefined) return false;

		// odd = white, even = black
		// prevents a team from making a move if it's not their turn
		if (
			(playedPiece.team === TeamType.OUR) &&
			(board.totalTurns % 2 !== 1)
		) return false;
		if (
			(playedPiece.team === TeamType.OPPONENT) &&
			(board.totalTurns % 2 !== 0)
		) return false;
		let playedMoveIsValid = false;
		const validMove = playedPiece.possibleMoves?.some(
			(m) => m.samePosition(destination)
		);
		// prevent pawn promotion by simply dragging a pawn to the promotion rows
		if (!validMove) return false;
		const enPassantMove = isEnPassant(
			playedPiece.position,
			destination,
			playedPiece.type,
			playedPiece.team
		);
		// you added this because of a random unseen bug
		const originalPosition = new Position(
			playedPiece.position.x, playedPiece.position.y
		);
		// playMove() modifies the board, thus, we need to call setBoard
		setBoard(() => {
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
			checkForEndGame(clonedBoard);
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

	function promotePawn(pieceType: PieceType) {
		if (promotionPawn === undefined)
			return;

		setBoard(() => {
			const clonedBoard = board.clone();
			clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
				if (piece.samePiecePosition(promotionPawn))
					results.push(
						new Piece(
							piece.position.clone(),
							pieceType,
							piece.team,
							true
						)
					);
				else
					results.push(piece);
				return results;
			}, [] as Piece[]);
			clonedBoard.calculateAllMoves();
			checkForEndGame(clonedBoard);
			return clonedBoard;
		});
		modalRef.current?.classList.add("hidden");
	}

	// used to show the correct team while promoting pawns
	function promotionTeamType() {
		return (promotionPawn?.team === TeamType.OUR) ? "l" : "d";
	}

	function restartGame() {
		endgameModalRef.current?.classList.add("hidden");
		setBoard(initialBoard.clone());
	}

	function checkForEndGame(board: Board) {
		// show a modal if endgame stuff happens
		if (board.draw) {
			setModalMessage("Draw. Nobody won.");
			endgameModalRef.current?.classList.remove("hidden");
		} else if (board.stalemate) {
			setModalMessage("Stalemate. You both suck.");
			endgameModalRef.current?.classList.remove("hidden");
		} else if (board.winningTeam !== undefined) {
			setModalMessage(
				`${board.winningTeam === TeamType.OUR ?
					"White" : "Black"} won.`);
			endgameModalRef.current?.classList.remove("hidden");
		}
	}

	return (
		<>
			<div className="modal hidden" ref={modalRef}>
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
			<div className="modal hidden" ref={endgameModalRef}>
				<div className="modal-body">
					<div className="checkmate-body">
						<span>{modalMessage}</span>
						<button onClick={restartGame}>Play again</button>
					</div>
				</div>
			</div>
			<main>
				<Chessboard
					playMove={playMove}
					pieces={board.pieces}
				/>
				<div className="information">
					<p>
						Total turns: <b>{board.totalTurns}</b>
					</p>
					<p>
						<b>{(board.currentTeam === TeamType.OPPONENT) ?
						"Black" : "White"}</b> to move.
					</p>
					<div className="moves">
						{board.moves.map(
							(m, i) => <p key={i}>{m.toMessage()}</p>
						)}
					</div>
				</div>
			</main>
		</>
	);
}