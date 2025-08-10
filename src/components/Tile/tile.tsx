import "./tile.css"

interface Props {
	image?:		string,
	number:		number,
	highlight:	boolean,
	coords?:	string	// for debugging
};

export default function Tile({number, image, highlight, coords}: Props) {
	coords = "";	// comment this line if you want to use this

	const className: string = [
		"tile",
		number % 2 === 0 && "black-tile",
		number % 2 !== 0 && "white-tile",
		highlight && "tile-highlight",
		image && "chess-piece-tile"
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