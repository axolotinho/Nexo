import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import api from "../../../services/api";

export default function Login() {
  const title = "Gestor";
  const subtitle = "Faça seu Login";
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  const inputGDuq = useRef(null);
  const inputGPassword = useRef(null);

  const [cadastro, setCadastro] = useState({
    nome: "",
    cpf: "",
    email: "",
    password: "",
    idade: "",
    cargo: "G",
    hora_entrada: "",
    hora_saida: "",
    foto: null
  });

  function handleCadastroChange(e) {
    const { name, value, files } = e.target;
    setCadastro({
      ...cadastro,
      [name]: files ? files[0] : value
    });
  }

  async function handleLogin() {
    const duq = inputGDuq.current.value;
    const senha = inputGPassword.current.value;

    try {
      const response = await api.post("/login", {
        duq,
        password: senha,
        cargo: "G",
      });

      localStorage.setItem(
        "token",
        response.data.token
      );

      navigate("/home/gestor");

    } catch(error) {
      console.log(error);
      setFailed(true);
      setTimeout(() => {
        setFailed(false);
      }, 3000);
    }
  }

  return (
    <div>
      <div className="header">
        <h2>
          {title.split("").map((letter, index) => (
            <span key={index}>
              {letter}
            </span>
          ))}
        </h2>

        <h3>
          {subtitle.split("").map((letter, index) => (
            <span key={index}>
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </h3>
      </div>

      <div className="login-container">
        {/* LOGIN GESTOR */}
        <div className="Gestor">
          <div className="top gestor">
            <h2>Login</h2>
          </div>

          <label>Email ou CPF</label>
          <input
            placeholder="Digite seu email ou CPF"
            ref={inputGDuq}
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            ref={inputGPassword}
          />

          <button onClick={handleLogin}>
            Login
          </button>

          {/* Adicionada a classe class-link para estilização */}
          <nav className="class-link">
            <Link to="/login/gestor/cadastro">Não tem login? Cadastre-se</Link>
          </nav>
        </div>
      </div>

      {failed && (
        <div className="fail">
          <span className="fail-icon">!</span>
          <p>Falha na autenticação ou cadastro.</p>
        </div>
      )}
    </div>
  );
}