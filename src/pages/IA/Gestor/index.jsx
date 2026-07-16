import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../../services/api"; 
import './style.css'

export default function Ia() {
  const title = "IA"
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  // Controle de mensagens e requisições
  const [inputMessage, setInputMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'ia', text: 'Olá! Sou o seu assistente de bem-estar. Como está se sentindo no trabalho hoje? Lembre-se de beber água!' }
  ])
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }; 
  // Contador de requisições enviadas pelo usuário atual (limite de 20)
  const [requestCount, setRequestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Função auxiliar para recuperar o Token limpo de forma segura
  const obterTokenValido = () => {
    const rawToken = localStorage.getItem("token");
    if (!rawToken) return null;
    return rawToken.replace(/^"|"$/g, ''); // Remove aspas do stringify
  };

  // 1. Segurança de Rota e decodificação do Token JWT
  useEffect(() => {
    const token = obterTokenValido();
    if (!token) {
      navigate("/");
      return;
    }
    
    try {
      const decoded = jwtDecode(token);
      const nomeCompleto = decoded.nome ? String(decoded.nome).trim() : "";
      const partesNome = nomeCompleto.split(/\s+/); 
      const nomeExibicao = partesNome.slice(0, 2).join(" "); 

      const cargoCru = decoded.cargo ? String(decoded.cargo).trim().toUpperCase() : "";
      let cargoExibicao = "";

      if (cargoCru === "F") {
        cargoExibicao = "Funcionário";
      } else if (cargoCru === "G") {
        cargoExibicao = "Gestor";
      } else {
        cargoExibicao = decoded.cargo || "";
      }

      setUsuario({
        id: decoded.sub,
        nome: nomeExibicao,
        cargo: cargoExibicao,
        foto: decoded.foto
      });
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }
  }, [navigate]);

  // 2. Carrega o histórico salvo do banco de dados quando o usuário é identificado
  useEffect(() => {
    const carregarHistorico = async () => {
      const token = obterTokenValido();
      if (!token) return;

      try {
        const response = await api.get("/chat/historico", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const dados = response.data;
        
        if (dados && dados.length > 0) {
          setChatHistory(dados);
          const enviosIniciais = dados.filter(msg => msg.sender === "user").length;
          setRequestCount(enviosIniciais);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico do chat:", error);
      }
    };

    if (usuario) {
      carregarHistorico();
    }
  }, [usuario]);

  // 3. Envia a mensagem real para o backend (que agora se comunica com a Groq)
  const handleSendToIa = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsgText = inputMessage;
    const userMsg = { id: Date.now(), sender: 'user', text: userMsgText };
    
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = obterTokenValido();
      if (!token) {
        throw new Error("Token não disponível.");
      }

      const response = await api.post("/chat", 
        { message: userMsgText },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = response.data;
      
      setChatHistory(prev => [
        ...prev, 
        { id: Date.now() + 1, sender: 'ia', text: data.reply }
      ]);
      setRequestCount(prev => prev + 1);

    } catch (error) {
      console.error("Erro na comunicação com a API de chat:", error);
      
      if (error.response?.status === 401) {
        setChatHistory(prev => [
          ...prev,
          { id: Date.now() + 1, sender: 'ia', text: "Sua sessão expirou ou o token é inválido. Por favor, faça login novamente." }
        ]);
      } else {
        setChatHistory(prev => [
          ...prev,
          { id: Date.now() + 1, sender: 'ia', text: "Ops! Ocorreu um erro ao conectar ao servidor." }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="topo">
        <div className="barra">
          {/* ÁREA DA CONTA */}
          <div className="account">
            {/* Botão de Sair adicionado à esquerda da foto */}
            <button className="btn-logout" onClick={handleLogout} title="Sair da Conta">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>

            <img 
              src={usuario?.foto || "/default-avatar.png"} 
              alt="Foto do usuário"
            />
            <div className="user-details">
              <h3>
                {usuario?.nome?.split("").map((letter, index) => (
                  <span key={index}>
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </h3>
              <p>
                {usuario?.cargo?.split("").map((letter, index) => (
                  <span key={index}>
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <div className="header-home">
            <h2>
              {title.split("").map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
            </h2>
          </div>

          <div className="links">
            <button onClick={() => navigate(usuario?.cargo === "Gestor" ? "/home/gestor" : "/home/funcionario")}>
              <i className="fa-solid fa-house"></i>
            </button>

            <button onClick={() => navigate(usuario?.cargo === "Gestor" ? "/calendar/gestor" : "/calendar/funcionario")}>
              <i className="fa-solid fa-calendar"></i>
            </button>

            {usuario?.cargo === "Gestor" && (
              <button onClick={() => navigate("/monitoring")}>
                <i className="fa-solid fa-eye"></i>
              </button>
            )}

            <button onClick={() => navigate(usuario?.cargo === "Gestor" ? "/chat/gestor" : "/chat/funcionario")}>
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            {usuario?.cargo === "Gestor" && (
              <button onClick={() => navigate("/create")}>
                <i className="fa-solid fa-plus"></i>
              </button>
            )}

            <button className='active'>
              <i className="fa-solid fa-dove"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal do Chat */}
      <div className="layout-ia2">
        <div className="ia-chat-box">
          <div className="ia-chat-header">
            <i className="fa-solid fa-dove"></i> <span>Dovely - Assistente Ativo</span>
          </div>
          
          <div className="ia-chat-history">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`ia-msg-container ${msg.sender}`}>
                <div className="ia-msg-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ia-msg-container ia">
                <div className="ia-msg-bubble" style={{ opacity: 0.6 }}>
                  Digitando...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendToIa} className="ia-chat-keyboard">
            <input 
              type="text" 
              placeholder={requestCount >= 20 ? "Limite diário de interações atingido." : "Fale com a IA sobre seu bem-estar ou rotina..."} 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={requestCount >= 20 || isLoading}
            />
            <button type="submit" disabled={requestCount >= 20 || isLoading}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}