import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import './style.css'

export default function Ia() {
  const title = "IA"
  const description = "Seu assistente de bem-estar"
  const dia = new Date().getDate();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [aba, setAba] = useState("chat");
  // Estados da IA de Mentirinha
  const [inputMessage, setInputMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'ia', text: 'Olá! Sou o seu assistente de bem-estar. Como está se sentindo no trabalho hoje? Lembre-se de beber água!' }
  ])

  // Estados do Pomodoro Simulados
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0)
  const [isPomodoroActive, setIsPomodoroActive] = useState(false)

  // Segurança de rota
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
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
        nome: nomeExibicao,
        cargo: cargoExibicao,
        foto: decoded.foto
      });
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }
  }, []);

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
          // Quando acaba o tempo do pomodoro
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

  // Função para enviar mensagem para a IA
  const handleSendToIa = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage("");

    // Respostas automáticas simuladas baseadas em palavras-chave
    setTimeout(() => {
      let reply = "Estou aqui para ajudar a equilibrar sua rotina de trabalho. O que acha de fazermos um alongamento de 2 minutos?";
      const msgLower = inputMessage.toLowerCase();

      if (msgLower.includes("cansado") || msgLower.includes("exaurido") || msgLower.includes("sono")) {
        reply = "Parece que você está bem cansado. Recomendo fazer uma pausa agora! Vá até a janela, respire fundo 3 vezes e beba um copo de água gelada. 💧";
      } else if (msgLower.includes("foco") || msgLower.includes("concentrar") || msgLower.includes("produtividade")) {
        reply = "Se precisa de foco total, inicie o timer do Método Pomodoro ali ao lado! Vou silenciar notificações imaginárias para você.";
      } else if (msgLower.includes("estressado") || msgLower.includes("ansioso") || msgLower.includes("raiva")) {
        reply = "Se o clima pesou, pare tudo por um instante. Feche os olhos e acompanhe comigo: inspire em 4 segundos, segure por 4 e solte em 4. Você é capaz!";
      }

      setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'ia', text: reply }]);
    }, 1200);
  }

  return (
    <div>
      <div className="topo">
        <div className="barra">
          {/* ÁREA DA CONTA CORRIGIDA */}
          <div className="account">
            <img 
              src={usuario?.foto || "/default-avatar.png"} 
              alt="Foto do usuário"
            />

            {/* Corrige os espaços no nome */}
            <h3>
              {usuario?.nome?.split("").map((letter, index) => (
                <span key={index}>
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </h3>

            {/* Corrige os espaços no cargo */}
            <p>
              {usuario?.cargo?.split("").map((letter, index) => (
                <span key={index}>
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </p>
          </div>
          <div className="header-home">
            <h2>
              {title.split("").map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
            </h2>
          </div>

          <div className="links">
            <button onClick={() => navigate("/home/gestor")}>
              <i className="fa-solid fa-house"></i>
            </button>

            <button onClick={() => navigate("/calendar/gestor")}>
              <i className="fa-solid fa-calendar"></i>
            </button>

            <button onClick={() => navigate("/monitoring")}>
              <i className="fa-solid fa-eye"></i>
            </button>

            <button onClick={() => navigate("/chat/gestor")}>
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            <button onClick={() => navigate("/create")}>
              <i className="fa-solid fa-plus"></i>
            </button>

            <button className='active'>
              <i className="fa-solid fa-dove"></i>
            </button>
          </div>
        </div>
      </div>
      {/* Grid Principal da IA */}
      <div className="layout-ia2">
        
        {/* Painel Esquerdo: Chat com a IA */}
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
          </div>

          <form onSubmit={handleSendToIa} className="ia-chat-keyboard">
            <input 
              type="text" 
              placeholder="Fale com a IA sobre seu bem-estar ou rotina..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}