import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import api from "../../../services/api";

export default function Login() {
  const title = "Gestor";
  const subtitle = "Faça seu Login";
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false); // 1. Estado de carregamento adicionado

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
    // Evita chamadas duplicadas se o usuário clicar rápido demais
    if (loading) return; 

    const duq = inputGDuq.current.value;
    const senha = inputGPassword.current.value;

    setLoading(true); // 2. Inicia o loading

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
    } finally {
      setLoading(false); // 3. Desativa o loading quando a requisição terminar (sucesso ou erro)
    }
  }

  return (
    <div>
      <div className="header">
        {/* Botão de voltar responsivo adicionado ao lado do cabeçalho */}
        <button className="btn-back-header" onClick={() => navigate(-1)} title="Voltar">
          <i className="fa-solid fa-arrow-left"></i>
        </button>

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
            disabled={loading} // Bloqueia o input durante o loading
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            ref={inputGPassword}
            disabled={loading} // Bloqueia o input durante o loading
          />

          {/* 4. Botão dinâmico: mostra spinner/texto diferente e fica desabilitado */}
          <button onClick={handleLogin} disabled={loading} className={loading ? "btn-loading" : ""}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                Entrando...
              </>
            ) : (
              "Login"
            )}
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