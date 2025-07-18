import "./Tile.css"

interface Props {
	image?:	string
	number:	number
}

export default function Tile({number, image}: Props) {
	const tileColor = number % 2 ? "tile white-tile" : "tile black-tile";

	return (
		<div className={tileColor}>
			{/* if image is not null AND tile contains a piece */}
			{image && <div style={{backgroundImage: `url(${image})`}} className="chess-piece"></div>}
		</div>
	);
}