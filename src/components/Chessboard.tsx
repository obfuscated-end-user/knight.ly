// import React from "react";
import "./Chessboard.css";

const horizontalAxis = "abcdefgh".split("");
const verticalAxis = "12345678".split("");

// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
// https://commons.wikimedia.org/wiki/Category:PNG_chess_pieces/Standard_transparent

export default function Chessboard() {
	let board = [];
	// don't use ++i or --j
	for (let j = verticalAxis.length - 1; j >= 0; j--) {
		for (let i = 0; i < horizontalAxis.length; i++) {
			const number  = j + i + 2;
			const tileColor = number % 2 ? "tile white-tile" : "tile black-tile";

			board.push(
				<div className={tileColor}>
					[{horizontalAxis[i]}{verticalAxis[j]}]
				</div>
			);
		}
	}

	return (
		<div id="chessboard">
			{board}
		</div>
	);
}