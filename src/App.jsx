import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomeF from "./pages/Home/Funcionario";
import HomeG from "./pages/Home/Gestor";
import Welcome from "./pages/Welcome";
import ChatF from "./pages/Chat/Funcionario";
import ChatG from "./pages/Chat/Gestor";
import CalendarF from "./pages/Calendar/Funcionario";
import CalendarG from "./pages/Calendar/Gestor";
import IaF from "./pages/IA/Funcionario";
import IaG from "./pages/IA/Gestor";
import LoginF from "./pages/Login/Funcionario";
import CadastroF from "./pages/Login/Funcionario/Cadastro";
import LoginG from "./pages/Login/Gestor";
import CadastroG from "./pages/Login/Gestor/Cadastro";
import Task from "./pages/Task";
import Monitoring from "./pages/Monitoring";
import Create from "./pages/Create";
import TaskDetail from './pages/TaskDetail';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home/funcionario" element={<HomeF />} />
        <Route path="/home/gestor" element={<HomeG />} />
        <Route path="/chat/funcionario" element={<ChatF />} />
        <Route path="/chat/gestor" element={<ChatG />} />
        <Route path="/calendar/funcionario" element={<CalendarF />} />
        <Route path="/calendar/gestor" element={<CalendarG />} />
        <Route path="/login/funcionario" element={<LoginF />} />
        <Route path="/login/funcionario/cadastro" element={<CadastroF />} />
        <Route path="/login/gestor" element={<LoginG />} />
        <Route path="/login/gestor/cadastro" element={<CadastroG />} />
        <Route path="/ia/funcionario" element={<IaF />} />
        <Route path="/ia/gestor" element={<IaG />} />
        <Route path="/task" element={<Task />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/create" element={<Create />} />
        <Route path="/task/:id" element={<TaskDetail />} />
      </Routes>
    </Router>
  );
}

export default App