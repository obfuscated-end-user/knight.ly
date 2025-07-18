import "./App.css";
import "./components/Chessboard/Chessboard";
import Chessboard from "./components/Chessboard/Chessboard";
import Header from "./components/Common/Header";
import Footer from "./components/Common/Footer";

export default function App() {
	return (
		<div id="app">
			<Header/>
			<Chessboard/>
			<Footer/>
		</div>
	);
}