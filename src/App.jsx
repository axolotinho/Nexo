import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Chat from "./pages/Chat";
import Calendar from "./pages/Calendar";
import Ia from "./pages/IA";
import LoginF from "./pages/Login/Funcionario";
import LoginG from "./pages/Login/Gestor";
import Task from "./pages/Task";
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/login/funcionario" element={<LoginF />} />
        <Route path="/login/gestor" element={<LoginG />} />
        <Route path="/ia" element={<Ia />} />
        <Route path="/task" element={<Task />} />
      </Routes>
    </Router>
  );
}

export default App