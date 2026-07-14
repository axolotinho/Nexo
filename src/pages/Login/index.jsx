import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import api from "../../services/api";

export default function Login() {
  const title = "Nexo";
  const subtitle = "Faça seu Login";

  const navigate = useNavigate();

  const [failed, setFailed] = useState(false);

  const inputGDuq = useRef(null);
  const inputGPassword = useRef(null);

  const inputFDuq = useRef(null);
  const inputFPassword = useRef(null);

  async function handleLogin(cargo) {

    const duq =
      cargo === "G"
        ? inputGDuq.current.value
        : inputFDuq.current.value;

    const senha =
      cargo === "G"
        ? inputGPassword.current.value
        : inputFPassword.current.value;

    try {

      const response = await api.post("/login", {
        duq,
        password: senha,
        cargo,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/home");

    } catch (error) {

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
            <span key={index}>{letter}</span>
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

        <div className="Gestor">

          <div className="top gestor">
            <h2>Gestor</h2>
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

          <button onClick={() => handleLogin("G")}>
            Login
          </button>

        </div>

        <div className="Funcionario">

          <div className="top funcionario">
            <h2>Funcionário</h2>
          </div>

          <label>Email ou CPF</label>
          <input
            placeholder="Digite seu email ou CPF"
            ref={inputFDuq}
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            ref={inputFPassword}
          />

          <button onClick={() => handleLogin("F")}>
            Login
          </button>

        </div>

      </div>

      {failed && (
        <div className="fail">
          <span className="fail-icon">!</span>
          <p>
            Falha na autenticação do Login, cheque a senha e o email ou CPF.
          </p>
        </div>
      )}
    </div>
  );
}