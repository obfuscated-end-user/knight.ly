/**
 * Represents a position on the chessboard with x (file) and y (rank)
 * coordinates.
 */
export class Position {
	x:	number;
	y:	number;

	constructor(
		x:	number,
		y:	number
	) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Checks if this position is the same as another position.
	 * @param otherPosition The position to compare against.
	 * @returns True if both positions have the same x and y coordinates,
	 * false otherwise.
	 */
	samePosition(otherPosition: Position): boolean {
		return (this.x === otherPosition.x) && (this.y === otherPosition.y);
	}

	/**
	 * Creates a new Position instance with the same x and y coordinates.
	 * @returns A new Position object cloned from the current one.
	 */
	clone(): Position {
		return new Position(this.x, this.y);
	}
}