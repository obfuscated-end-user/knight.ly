import "./footer.css"

export default function Footer() {
	return (
		<footer>
			&copy;{new Date().getFullYear()} 横浜/obfuscated-end-user.<br/>
			<a href="https://github.com/obfuscated-end-user/knight.ly" target="_blank" rel="noopener noreferrer">Source code</a>
		</footer>
	);
}