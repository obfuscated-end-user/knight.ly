import "./App.css";
import "./components/Chessboard/chessboard";
import Referee from "./components/Referee/referee";
import Header from "./components/Common/header";
import Footer from "./components/Common/footer";

export default function App() {
	return (
		<div id="app">
			<Header/>
			<Referee/>
			<Footer/>
		</div>
	);
}