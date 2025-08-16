import "./tile.css"

interface Props {
	image?:		string,
	number:		number,
	highlight:	boolean,
	coords?:	string	// for debugging
};

/**
 * A Tile component visually renders a single square of a chessboard, including
 * its background color, whether it should be highlighted (to show possible
 * moves), and optionally a chess piece image placed on top of it.
 */
export default function Tile({ number, image, highlight, coords }: Props) {
	coords = "";	// comment this line if you want to use this

	const className: string = [
		// base class
		"tile",
		// if even, include "black-tile", otherwise false (exclude later)
		number % 2 === 0 && "black-tile",
		// if number is odd, include "white-tile", otherwise false (exclude too)
		number % 2 !== 0 && "white-tile",
		// if highlight is true, include "tile-highlight"
		highlight && "tile-highlight",
		// if image is not an empty string, include "chess-piece-tile"
		image && "chess-piece-tile"
	// .filter() removes any entries in the array thatr evaluated to false
	// .join(" ") converts the array of valid class names into a string like:
	// "tile black-tile tile-highlight"
	].filter(Boolean).join(" ");

	return (
		<div className={className}>
			{coords}
			{/* if image is not null AND tile contains a piece */}
			{image &&
				<div
					style={{backgroundImage: `url(${image})`}}
					className="chess-piece"
				/>
			}
		</div>
	);
}