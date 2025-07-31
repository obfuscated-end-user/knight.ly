import {
	useEffect,
	useRef,
	useState
} from "react";
import {
	initialBoardState,
	PieceType,
	samePosition,
	TeamType 
} from "../../Constants";
import Chessboard from "../Chessboard/Chessboard";
import {
	bishopMove,
	kingMove,
	knightMove,
	pawnMove,
	queenMove,
	rookMove,
	getPossibleBishopMoves,
	getPossibleKingMoves,
	getPossibleKnightMoves,
	getPossiblePawnMoves,
	getPossibleQueenMoves,
	getPossibleRookMoves
} from "../../referee/rules";
import {
	Piece,
	Position
} from "../../models";

export default function Referee() {
	const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
	const [promotionPawn, setPromotionPawn] = useState<Piece>();
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => updatePossibleMoves(), []);

	function updatePossibleMoves() {
		setPieces((currentPieces) => {
			return currentPieces.map((p) => {
				p.possibleMoves = getValidMoves(p, currentPieces);
				return p;
			});
		});
	}

	function playMove(playedPiece: Piece, destination: Position): boolean {
		const validMove = isValidMove(
			playedPiece.position,
			destination,
			playedPiece.type,
			playedPiece.team
		);
		const enPassantMove = isEnPassant(
			playedPiece.position,
			destination,
			playedPiece.type,
			playedPiece.team
		);
		const pawnDirection: number =		//	  w    b
			(playedPiece.team === TeamType.OUR) ? 1 : -1;
		// you added this because of a random unseen bug
		const originalPosition = {
			x:	playedPiece.position.x,
			y:	playedPiece.position.y
		};
		if (enPassantMove) {
			// https://en.wikipedia.org/wiki/En_passant
			const updatedPieces = pieces.reduce((results, piece) => {
				if (samePosition(piece.position,
					new Position(originalPosition.x, originalPosition.y))
				) {
					piece.position.x = destination.x;
					piece.position.y = destination.y;
					piece.enPassant = false;
					results.push(piece);
				} else if (!samePosition(piece.position,
					new Position(destination.x, destination.y - pawnDirection))
				) {
					if (piece.type === PieceType.PAWN) piece.enPassant = false;
					results.push(piece);
				}
				return results;
			}, [] as Piece[]);
			updatePossibleMoves();
			setPieces(updatedPieces);
		// updates the piece position and if a piece is attacked,
		// removes it
		} else if (validMove) {
			const updatedPieces = pieces.reduce((results, piece) => {
				if (samePosition(piece.position,
					new Position(originalPosition.x, originalPosition.y))
				) {
					// if the attacked piece has made an en passant move
					// in the previous turn
					piece.enPassant = (Math.abs(originalPosition.y -
						destination.y) === 2) &&
						(piece.type === PieceType.PAWN);
					piece.position.x = destination.x;
					piece.position.y = destination.y;

					let promotionRow: number =
						(piece.team === TeamType.OUR) ? 7 : 0;

					if (
						(destination.y === promotionRow) &&
						(piece.type === PieceType.PAWN)
					) {
						modalRef.current?.classList.remove("hidden");
						setPromotionPawn(piece);
					}
					results.push(piece);
				} else if (!samePosition(piece.position, destination)) {
					if (piece.type === PieceType.PAWN)
						piece.enPassant = false;
					results.push(piece);
				}
				return results;
			}, [] as Piece[]);
			updatePossibleMoves();
			setPieces(updatedPieces);
		} else
			return false;
		return true;
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
				const piece = pieces.find((p) => 
					(p.position.x === desiredPosition.x) &&
					(p.position.y === desiredPosition.y - pawnDirection) &&
					p.enPassant
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
					pieces
				);
				break;
			case PieceType.KNIGHT:
				validMove = knightMove(
					initialPosition,
					desiredPosition,
					team,
					pieces
				);
				break;
			case PieceType.BISHOP:
				validMove = bishopMove(
					initialPosition,
					desiredPosition,
					team,
					pieces
				);
				break;
			case PieceType.ROOK:
				validMove = rookMove(
					initialPosition,
					desiredPosition,
					team,
					pieces
				);
				break;
			case PieceType.QUEEN:
				validMove = queenMove(
					initialPosition,
					desiredPosition,
					team,
					pieces
				);
				break;
			case PieceType.KING:
				validMove = kingMove(
					initialPosition,
					desiredPosition,
					team,
					pieces
				);
				break;
			case PieceType.UNKNOWN:
				console.log("UNKNOWN");
				break;
		}
		return validMove;
	}

	function getValidMoves(piece: Piece, boardState: Piece[]): Position[] {
		switch(piece.type) {
			case PieceType.PAWN:
				return getPossiblePawnMoves(piece, boardState);
			case PieceType.KNIGHT:
				return getPossibleKnightMoves(piece, boardState);
			case PieceType.BISHOP:
				return getPossibleBishopMoves(piece, boardState);
			case PieceType.ROOK:
				return getPossibleRookMoves(piece, boardState);
			case PieceType.QUEEN:
				return getPossibleQueenMoves(piece, boardState);
			case PieceType.KING:
				return getPossibleKingMoves(piece, boardState);
			default:
				return [];
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
		updatePossibleMoves();
		setPieces(updatedPieces);
		modalRef.current?.classList.add("hidden");
	}

	function promotionTeamType() {
		return (promotionPawn?.team === TeamType.OUR) ? "l" : "d";
	}

	return (
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
			<Chessboard
				playMove={playMove}
				pieces={pieces}
			/>
		</>
	);
}