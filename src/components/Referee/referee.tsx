import {
	useRef,
	useState
} from "react";
import { initialBoard } from "../../constants";
import Chessboard from "../Chessboard/chessboard";
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
		/**
		 * Responsible for attempting to make a move on the chessboard. It
		 * verifiers if the move is valid according to game rules, updates the
		 * game state if the move is valid, handles special case like pawn
		 * promotion and en passant. Returns true if a move is successful and
		 * false otherwise.
		 */

		// remember that everything is ignored below a return statement once it
		// gets there successfully

		// if the played piece does not have any legal moves, return immediately
		if (playedPiece.possibleMoves === undefined) return false;

		// the game alternates turns between twwo teams
		// if board.totalTurns is odd, it is white's turn, even means it's
		// black's turn to move
		// if the player tries to move a piece wwhen it's not their turn, this
		// returns false and exits immediately
		if (
			(playedPiece.team === TeamType.OUR) &&
			(board.totalTurns % 2 !== 1)
		) return false;
		if (
			(playedPiece.team === TeamType.OPPONENT) &&
			(board.totalTurns % 2 !== 0)
		) return false;
		// looks through playedPiece.possibleMoves and checks if the requested
		// destination matches any valid move
		const validMove = playedPiece.possibleMoves?.some(
			(m) => m.samePosition(destination)
		);
		// if the destination is not valid, the move is rejected
		if (!validMove) return false;
		// calls isEnPassant() to determine whether the move qualifies as an
		// en passant pawn capture
		const enPassantMove = isEnPassant(
			playedPiece.position,
			destination,
			playedPiece.type,
			playedPiece.team
		);
		// you added this because of a random unseen bug
		// make a copy of piece's original position
		const originalPosition = playedPiece.position.clone();
		let playedMoveIsValid = false;
		// playMove() modifies the board, thus, we need to call setBoard()
		// setBoard() to update the board state immutably by cloning the current
		// board
		setBoard(() => {
			const clonedBoard = board.clone();
			// increment turn count
			clonedBoard.totalTurns += 1;
			// playing the move
			// this playMove() is different from the one implemented above
			playedMoveIsValid = clonedBoard.playMove(
				enPassantMove,
				validMove,
				playedPiece,
				destination,
				originalPosition
			);
			// check for endgame conditions (checkmate, stalemate, draw)
			checkForEndGame(clonedBoard);
			// the updated clonedBoard replaces the previous board state in the
			// React component
			return clonedBoard;
		})
		// define the promotion row (last rank in the opponent's direction),
		// depending on the team
		let promotionRow: number =
			(playedPiece.team === TeamType.OUR) ? 7 : 0;
		// if a pawn reaches that row
		if (
			(destination.y === promotionRow) &&
			(playedPiece.isPawn)
		) {
			// show the promotion modal
			modalRef.current?.classList.remove("hidden");
			// sets the promotionPawn state to the pawn that just moved, for
			// later promotion selection
			setPromotionPawn(() => {
				const clonedPlayedPiece = playedPiece.clone();
				clonedPlayedPiece.position = destination.clone();
				return clonedPlayedPiece;
			});
		}

		// return true if the movement was valid and successfully applied
		return playedMoveIsValid;
	}

	function isEnPassant (
		initialPosition:	Position,
		desiredPosition:	Position,
		type:				PieceType,
		team:				TeamType
	): boolean {
		/**
		 * En passant is a special pawn capture that can occur immediately after
		 * an opponent's pawn moves two squares forward from its starting 
		 * position and lands beside your pawn. Your (or their) pawn can capture
		 * it as if it had only moved one square forward, but only on the very
		 * next move.
		 */

		// if the pawn is white, pawns move upwards with y increasing (+1)
		// if the pawn is black, pawns move downwards with y decreasing (-1)
		const pawnDirection: number = (team === TeamType.OUR) ? 1 : -1;

		// this thing is only relevant for pawns, so make sure that it is a pawn
		if (type === PieceType.PAWN) {
			// check that the pawn is moving exactly one square diagonally
			// forward
			// horizontally: one tile to the left (-1) or right (+1)
			// vertically: one tile forward (pawnDirection, +1 or -1)
			if (
				((desiredPosition.x - initialPosition.x === -1) ||
				(desiredPosition.x - initialPosition.x === 1))  &&
				(desiredPosition.y - initialPosition.y === pawnDirection)
			) {
				// this searches for a pawn adjacent to the destination square
				// but behind it in the direction from which the current pawn
				// is moving
				const piece = board.pieces.find((p) =>
					// look f or a pawn located in the same file (x coordinate)
					(p.position.x === desiredPosition.x) &&
					// but one rank behind the destination square, which is
					// where the opponent's pawn should be if it just moved two
					// squares forward and is eligible for en passant capture
					(p.position.y === desiredPosition.y - pawnDirection) &&
					// this must be a pawn
					p.isPawn &&
					// have the enPassant flag set to true, meaning it can be
					// captured en passant, this flag is set on pawns right
					// after they make a two-square initial move
					(p as Pawn).enPassant
				);
				// if such a pawn exists, then the move is a valid en passant
				// capture, so the function returns true
				if (piece)
					return true;
			}
		}
		// nothing in passing is sacred and return !true
		return false;
	}

	function promotePawn(pieceType: PieceType): void {
		/**
		 * Handles pawn promotion. When a pawn reaches the farthest rank (last
		 * row) on the opponent's side, it can be promoted to a higher-value
		 * piece like a queen, rook, bishop, or knight.
		 */
		// check first if there is a pawn currently marked f or promotioon
		// if no pawn is waiting for promotion, return early and do nothing
		if (promotionPawn === undefined) return;

		setBoard(() => {
			const clonedBoard = board.clone();
			// this loop goes through all the pieces on the cloned board
			clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
				// for each piece, it checks if its position matches exactly the
				// position of the promotion pawn
				if (piece.samePiecePosition(promotionPawn))
					results.push(
						// if it is the promotion pawn, replace that pawn with a
						// new chess piece
						new Piece(
							// the new piece has the same position as the pawn
							piece.position.clone(),
							// the type is the pieceType chosen by the player
							pieceType,
							// the team stays the same as the pawn's team
							piece.team,
							// hasMoved flag is set to true (for things like
							// castling)
							true
						)
					);
				// if it's not the promotion pawn, keep the piece unchanged
				else
					results.push(piece);
				// the result is a new array of pieces with the promotion pawn
				// replaced by the promotion piece
				return results;
			}, [] as Piece[]);
			// after updating the pieces, the board recalculates all possible
			// moves for each piece
			// this is important because the new piece type has a different move
			// set, so the game state must update accordingly
			clonedBoard.calculateAllMoves();
			// check if this promotion caused the game to end (for example, by
			// checkmate)
			checkForEndGame(clonedBoard);
			// return the updated clonedBoard so setBoard can update the React
			// state
			return clonedBoard;
		});
		// hide the promotion modal
		modalRef.current?.classList.add("hidden");
	}

	// used to show the correct team while promoting pawns
	function promotionTeamType(): string {
		/**
		 * Used to determine a string that represents the color of the pawn
		 * currently promoted. This string is used to show the correct images in
		 * the pawn promotion modal.
		 */
		return (promotionPawn?.team === TeamType.OUR) ? "l" : "d";
	}

	function restartGame(): void {
		/**
		 * Resets the game to its initial starting state and hides the endgame
		 * modal that shows the game result.
		 */
		endgameModalRef.current?.classList.add("hidden");
		setBoard(initialBoard.clone());
	}

	function checkForEndGame(board: Board): void {
		/**
		 * Used to detect if the game has reached an end condition such as a
		 * draw, stalemate, or a win, and then show an appropriate modal dialog
		 * to the user.
		 */
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
		{/**
		 * This uses the React ref modalRef to allow the component to show or
		 *  hide this modal dynamically.
		 * This modal appears only when a pawn reaches the promotion rank and
		 * waits for the player to select a piece.
		 */}
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
			{/**
			 * This displays game-ending messaages such as "draw", "checkmate",
			 * "white won", etc.
			 * This modal shows up only when the game ends in any final
			 * condition, and gives the user an option to play again.
			 */}
			<div className="modal hidden" ref={endgameModalRef}>
				<div className="modal-body">
					<div className="checkmate-body">
						<span>{modalMessage}</span>
						<button onClick={restartGame}>Play again</button>
					</div>
				</div>
			</div>
			{/**
			 * This renders the chessboard and its pieces. It receives playMove,
			 * a function used to attempt moves and validate them according to
			 * game rules. pieces is the array of current chess pieces and their
			 * positions to render on the board.
			 */}
			<main>
				<Chessboard
					playMove={playMove}
					pieces={board.pieces}
				/>
				<div className="information">
					<p>Total turns: <b>{board.totalTurns}</b></p>
					<p>
						<b>{(board.currentTeam === TeamType.OPPONENT) ?
						"Black" : "White"}</b> to move.
					</p>
					<div className="moves">
						{/**
						 * A list of all moves so far, rendered by mapping
						 * through board.moves and calling toMessage() to
						 * display move descriptions.
						 */}
						{board.moves.map(
							(m, i) => <p key={i}>{m.toMessage()}</p>
						)}
					</div>
				</div>
			</main>
		</>
	);
}