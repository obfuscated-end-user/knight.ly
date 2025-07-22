import "./Tile.css"

interface Props {
	image?:		string,
	number:		number,
	coords?:	string,	// for debugging
};

export default function Tile({number, image, coords}: Props) {
	const tileColor: string = number % 2 ? "tile white-tile" : "tile black-tile";
	coords = "";	// comment this line if you want to use this
	return (
		<div className={tileColor}>
			{/* {coords} */}
			{/* if image is not null AND tile contains a piece */}
			{image && <div style={{backgroundImage: `url(${image})`}} className="chess-piece"></div>}
		</div>
	);
}