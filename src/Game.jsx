import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function Game() {
	console.log("cunt");
	const [game, setGame] = useState(new Chess());
	const [fen, setFen] = useState("start");
	const [history, setHistory] = useState([]);

	function makeMove(move) {
		const gameCopy = new Chess(game.fen());
		const result = gameCopy.move(move);

		// illegal move
		if (result === null)
			return false;

		setGame(gameCopy);
		setFen(gameCopy.fen());
		setHistory(gameCopy.history({ verbose: true }));

		return true;
	}

	function onDrop(sourceSquare, targetSquare, piece) {
		// for pawn promotion, default to queen here
		const promotion = (
			piece[1] === "p" && (
				targetSquare[1] === "8" || targetSquare[1] === "1")
			) ? "q" : undefined;

		const move = {
			from:	sourceSquare,
			to:		targetSquare,
			promotion,
		};

		return makeMove(move);
	}

	useEffect( () => {
		if (game.isGameOver())
			return;

		if (game.turn() === "b") {
			const moves = game.moves();
			if (moves.length === 0)
				return;

			const randomMove = moves[
				Math.floor(Math.random() * moves.length)
			];
			setTimeout( () => {
				makeMove( {
						from: randomMove.substring(0, 2),
						to: randomMove.substring(2, 4),
						promotion: randomMove.length > 4
							? randomMove[4] : undefined
					}
				);
			}, 500);
		}
	}, [fen, game]);

	const getGameStatus = () => {
		if (game.isCheckmate()) {
			return `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins.`
		}
		if (game.isStalemate()) {
			return "Stalemate! Draw.";
		}
		if (game.inCheck()) {
			return `${game.turn() === "w" ? "White" : "Black"} is in check.`;
		}
		return `${game.turn() === "w" ? "White" : "Black"} to move.`;
	}

	return (
		<div>
			<Chessboard position={fen} onPieceDrop={onDrop}/>
			<div style={{ marginTop: "10px" }}>
				{getGameStatus()}
			</div>
			<h3>Move history</h3>
			<ol>
				{
					history.map((move, idx) => (
						<li key={idx}>
							{move.color === "w" ? (idx / 2 + 1).toFixed(0) + ". " : ""}
							{move.san}
						</li>
					))
				}
			</ol>
		</div>
	);
}