import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../../services/api"; 
import './style.css'

export default function Ia() {
  const title = "IA"
  const description = "Seu assistente de bem-estar"
  const cargo = "Funcionário"
  const dia = new Date().getDate();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [aba, setAba] = useState("chat");
  
  // Controle de mensagens e requisições
  const [inputMessage, setInputMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'ia', text: 'Olá! Sou o seu assistente de bem-estar. Como está se sentindo no trabalho hoje? Lembre-se de beber água!' }
  ])
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  // Contador de requisições enviadas pelo usuário atual (máximo 5)
  const [requestCount, setRequestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Pomodoro Simulados
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0)
  const [isPomodoroActive, setIsPomodoroActive] = useState(false)

  // Função auxiliar para recuperar o Token limpo de forma segura
  const obterTokenValido = () => {
    const rawToken = localStorage.getItem("token");
    if (!rawToken) return null;
    return rawToken.replace(/^"|"$/g, ''); // Remove aspas do stringify
  };

  // 1. Decodifica o Token JWT para carregar as informações do usuário logado
  useEffect(() => {
    const token = obterTokenValido();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuario({
          id: decoded.sub,
          nome: decoded.nome || "Usuário",
          cargo: decoded.cargo || "Funcionário",
          foto: decoded.foto || null
        });
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        localStorage.removeItem("token");
        navigate("/login"); 
      }
    } else {
      navigate("/login"); 
    }
  }, [navigate]);

  // 2. Carrega o histórico salvo do banco de dados quando o usuário é identificado
  useEffect(() => {
    const carregarHistorico = async () => {
      const token = obterTokenValido();
      if (!token) return; // Aborta se o token sumir de repente

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

    // Só dispara se o usuário já estiver de fato carregado no estado
    if (usuario) {
      carregarHistorico();
    }
  }, [usuario]);

  // Efeito simulado de contagem regressiva do Pomodoro
  useEffect(() => {
    let interval = null;
    if (isPomodoroActive) {
      interval = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(pomodoroSeconds - 1);
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(pomodoroMinutes - 1);
          setPomodoroSeconds(59);
        } else {
          setIsPomodoroActive(false);
          setPomodoroMinutes(25);
          setPomodoroSeconds(0);
          setChatHistory(prev => [
            ...prev,
            { id: Date.now(), sender: 'ia', text: '🔔 Parabéns! Você concluiu um ciclo de foco. Que tal uma pausa de 5 minutos agora?' }
          ]);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroMinutes, pomodoroSeconds]);

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
                {cargo.split("").map((letter, index) => (
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
            <button onClick={() => navigate("/home/funcionario")}>
              <i className="fa-solid fa-house"></i>
            </button>
            <button onClick={() => navigate("/calendar/funcionario")}>
              <i className="fa-solid fa-calendar"></i>
            </button>
            <button onClick={() => navigate("/chat/funcionario")}>
              <i className="fa-solid fa-comment-dots"></i>
            </button>
            <button onClick={() => navigate("/task")}>
              {dia}
            </button>
            <button className="active">
              <i className="fa-solid fa-dove"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="ia-tabs">
          <button
              className={aba === "chat" ? "active" : ""}
              onClick={() => setAba("chat")}
          >
              <i className="fa-solid fa-dove"></i>
              Assistente
          </button>
          <button
              className={aba === "dashboard" ? "active" : ""}
              onClick={() => setAba("dashboard")}
          >
              <i className="fa-solid fa-chart-line"></i>
              Análises
          </button>
      </div>

      <div className="layout-ia">
        <div className={`ia-chat-box ${aba !== "chat" ? "mobile-hidden" : ""}`}>
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
              placeholder={requestCount >= 20 ? "Limite diário atingido." : "Fale com a IA..."} 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={requestCount >= 20 || isLoading}
            />
            <button type="submit" disabled={requestCount >= 20 || isLoading}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>

        <div className={`ia-dashboard ${aba !== "dashboard" ? "mobile-hidden" : ""}`}>
          <div className="dash-card">
            <h4>Jornada de Hoje</h4>
            <div className="working-hours-gauge">
              <div className="circular-progress">
                <span className="circular-value">6.5h</span>
              </div>
              <p className="gauge-sub">Sua meta de hoje é de 8h</p>
            </div>
            
            <div className="week-mini-chart">
              <div className="bar-column"><div className="bar-fill" style={{ height: '80%' }}></div><span>S</span></div>
              <div className="bar-column"><div className="bar-fill" style={{ height: '95%' }}></div><span>T</span></div>
              <div className="bar-column"><div className="bar-fill" style={{ height: '60%' }}></div><span>Q</span></div>
              <div className="bar-column"><div className="bar-fill" style={{ height: '100%' }}></div><span>Q</span></div>
              <div className="bar-column active-day"><div className="bar-fill" style={{ height: '70%' }}></div><span>S</span></div>
            </div>
          </div>

          <div className="dash-card pomodoro-card">
            <h4>Método Pomodoro</h4>
            <div className="pomodoro-timer">
              {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
            </div>
            <div className="pomodoro-actions">
              <button onClick={() => setIsPomodoroActive(!isPomodoroActive)} className={isPomodoroActive ? 'btn-stop' : 'btn-start'}>
                {isPomodoroActive ? <i className="fa-solid fa-pause"></i> : <i className="fa-solid fa-play"></i>}
              </button>
              <button onClick={() => { setIsPomodoroActive(false); setPomodoroMinutes(25); setPomodoroSeconds(0); }} className="btn-reset">
                <i className="fa-solid fa-rotate-right"></i>
              </button>
            </div>
          </div>

          <div className="dash-card break-card">
            <h4>Alerta de Pausa Ativo</h4>
            <div className="next-break-indicator">
              <i className="fa-solid fa-mug-hot"></i>
              <div>
                <h5>Próximo descanso</h5>
                <p>Em aproximadamente <strong>45 minutos</strong></p>
              </div>
            </div>
            <div className="water-tracker">
              <p>Copos d'água hoje:</p>
              <div className="water-glasses">
                <i className="fa-solid fa-glass-water active"></i>
                <i className="fa-solid fa-glass-water active"></i>
                <i className="fa-solid fa-glass-water active"></i>
                <i className="fa-solid fa-glass-water"></i>
                <i className="fa-solid fa-glass-water"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}