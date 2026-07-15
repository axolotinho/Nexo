import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import img1 from '../../../assets/img1.jpg'
import img2 from '../../../assets/img2.jpg'
import api from '../../../services/api'
import './style.css'

export default function Home() {
  const title = "Chat"
  const [person, setPerson] = useState(null)
  const [typedMessage, setTypedMessage] = useState("")
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
    return {
      1: [ // ID da Amanda
        { id: 101, sender: 'them', text: 'Oi! Tudo bem?' },
        { id: 102, sender: 'me', text: 'Opa, tudo ótimo! E com você?' },
        { id: 103, sender: 'them', text: 'Tudo certinho também. Conseguiu ver aquele relatório?' }
      ],
      2: [ // ID do Luíz
        { id: 201, sender: 'them', text: 'Fala cara, blz?' },
        { id: 202, sender: 'me', text: 'Fala Luíz, beleza pura!' }
      ]
    };
  });

  const persons = [
    {
      id: 1,
      name: 'Amanda silveira',
      img: img1
    },
    {
      id: 2,
      name: 'Luíz carlos',
      img: img2
    }
  ]

  // Rota de segurança para o Token
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
      if (cargoCru == "G"){
        navigate("/home/gestor");
      }
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !person) return;

    const newMessage = {
      id: Date.now(), // ID único temporário
      sender: 'me',
      text: typedMessage
    };

    // Atualiza o histórico do contato selecionado
    setMessages(prev => ({
      ...prev,
      [person.id]: [...(prev[person.id] || []), newMessage]
    }));

    setTypedMessage("");
  };

  const dia = new Date().getDate();

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
              <i class="fa-solid fa-eye"></i>
            </button>

            <button className="active">
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            <button onClick={() => navigate("/create")}>
              <i class="fa-solid fa-plus"></i>
            </button>

            <button onClick={() => navigate("/ia/gestor")}>
              <i className="fa-solid fa-dove"></i>
            </button>
          </div>
        </div>
      </div>

      <div className='layout'>
        <div className='lateral'>
          {persons.map((p) => (
            <button 
              key={p.id} 
              onClick={() => setPerson(p)}
              className={person?.id === p.id ? "active-person" : ""}
            >
              <img src={p.img} alt={p.name} />
              {p.name}
            </button>
          ))}
        </div>
        
        <div className='chat'>
          {person ? (
            <div>
              <div className="subtitulo">
                {person.name.split("").map((letter, index) => (
                  <span key={index}>
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </div>

              {/* HISTÓRICO DE MENSAGENS */}
              <div className='history'>
                {(messages[person.id] || []).map((msg) => (
                  <div key={msg.id} className={`message-container ${msg.sender}`}>
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* TECLADO / ENTRADA DE TEXTO */}
              <form onSubmit={handleSendMessage} className='keyboard'>
                <input 
                  type="text" 
                  placeholder="Digite uma mensagem..." 
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                />
                <button type="submit">
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </div>
          ) : (
            <div className="no-chat-selected">
              <p>Selecione uma conversa para começar a papear!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}