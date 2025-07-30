import "./App.css";
import "./components/Chessboard/Chessboard";
import Referee from "./components/Referee/Referee";
import Header from "./components/Common/Header";
import Footer from "./components/Common/Footer";

export default function App() {
	return (
		<div id="app">
			<Header/>
			<Referee/>
			<Footer/>
		</div>
	);
}