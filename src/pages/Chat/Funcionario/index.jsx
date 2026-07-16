import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import img1 from '../../../assets/img1.jpg'
import img2 from '../../../assets/img2.jpg'
import api from '../../../services/api'
import './style.css'

// 1. Lista de cores amigáveis para o fundo do ícone do grupo
const CORES_GRUPOS = [
  "#4F46E5", "#06B6D4", "#10B981", "#F59E0B", 
  "#EC4899", "#8B5CF6", "#EF4444", "#0EA5E9"
];

// Função auxiliar para pegar uma cor aleatória baseada no ID do grupo (assim a cor não muda a cada clique)
const obterCorGrupo = (id) => {
  const index = id % CORES_GRUPOS.length;
  return CORES_GRUPOS[index];
};



export default function Home() {
  const title = "Chat"
  const [person, setPerson] = useState(null) // Canal de chat ativo
  const [typedMessage, setTypedMessage] = useState("")
  const [usuario, setUsuario] = useState(null);
  // Listas vindas do banco
  const [usuariosBanco, setUsuariosBanco] = useState([]);
  const [gruposBanco, setGruposBanco] = useState([]);
  
  const navigate = useNavigate();

  // Inicializa mensagens do LocalStorage
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }

    return {
      "user_1": [ 
        { id: 101, sender: 'them', text: 'Oi! Tudo bem?' },
        { id: 102, sender: 'me', text: 'Opa, tudo ótimo! E com você?' },
        { id: 103, sender: 'them', text: 'Tudo certinho também. Conseguiu ver aquele relatório?' }
      ],
      "user_2": [ 
        { id: 201, sender: 'them', text: 'Fala cara, blz?' },
        { id: 202, sender: 'me', text: 'Fala Luíz, beleza pura!' }
      ]
    };
  });

  // Contatos mockados iniciais
  const staticPersons = [
    { id: 10, name: 'Amanda silveira', img: img1, type: 'user' },
    { id: 11, name: 'Luíz carlos', img: img2, type: 'user' }
  ]
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  // Rota de segurança e decodificação do Token JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
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
        id: decoded.sub || decoded.identity,
        nome: nomeExibicao,
        cargo: cargoExibicao,
        foto: decoded.foto
      });
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }
  }, [navigate]);

  // Carregar Usuários e Grupos criados do seu Backend
  useEffect(() => {
    const carregarDadosDoBanco = async () => {
      try {
        const resUsuarios = await api.get("/usuario");
        const logadoId = usuario?.id;
        
        const outrosUsuarios = resUsuarios.data
          .filter(u => String(u.id) !== String(logadoId))
          .map(u => ({
            id: u.id,
            name: u.nome,
            img: u.foto || "/default-avatar.png",
            type: 'user'
          }));
        
        setUsuariosBanco(outrosUsuarios);

        const resCards = await api.get("/card");
        const gruposExtraidos = resCards.data
          .filter(card => card.grupo !== null)
          .map(card => ({
            id: card.grupo.id,
            name: `Grupo: ${card.grupo.nome}`,
            type: 'group' // Removido 'img', agora usaremos o ícone
          }));

        setGruposBanco(gruposExtraidos);
      } catch (err) {
        console.error("Erro ao buscar contatos/grupos do backend:", err);
      }
    };

    if (usuario) {
      carregarDadosDoBanco();
    }
  }, [usuario]);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  // Enviar Mensagem
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !person) return;

    const chatKey = `${person.type}_${person.id}`;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: typedMessage
    };

    setMessages(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMessage]
    }));

    setTypedMessage("");
  };

  // Unifica todos os tipos de contatos
  const todosOsContatos = [
    ...staticPersons, 
    ...usuariosBanco, 
    ...gruposBanco
  ];

  const dia = new Date().getDate();

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
            <button onClick={() => navigate("/home/funcionario")}>
              <i className="fa-solid fa-house"></i>
            </button>
            <button onClick={() => navigate("/calendar/funcionario")}>
              <i className="fa-solid fa-calendar"></i>
            </button>
            <button className="active">
              <i className="fa-solid fa-comment-dots"></i>
            </button>
            <button onClick={() => navigate("/task")}>
              {dia}
            </button>
            <button onClick={() => navigate("/ia/funcionario")}>
              <i className="fa-solid fa-dove"></i>
            </button>
          </div>
        </div>
      </div>

      <div className={`layout ${person ? "chat-open" : ""}`}>
        {/* BARRA LATERAL DE CONVERSAS */}
        <div className={`lateral ${person ? "hide-mobile" : ""}`}>
          <div className="chat-section-title">Conversas</div>
          
          {todosOsContatos.map((p) => {
            const isSelected = person?.type === p.type && person?.id === p.id;
            
            return (
              <button 
                key={`${p.type}-${p.id}`} 
                onClick={() => setPerson(p)}
                className={isSelected ? "active-person" : ""}
              >
                {/* Condicional para renderizar Imagem (usuários) ou Ícone Colorido (grupos) */}
                {p.type === "group" ? (
                  <div 
                    className="group-avatar-icon" 
                    style={{ 
                      backgroundColor: obterCorGrupo(p.id),
                    }}
                  >
                    <i className="fa-solid fa-comment-dots"></i>
                  </div>
                ) : (
                  <img src={p.img} alt={p.name} />
                )}
                {p.name}
              </button>
            );
          })}
        </div>
        
        {/* ÁREA DO CHAT ATIVO */}
        <div className={`chat ${!person ? "empty-chat" : ""}`}>
          {person ? (
            <div>
              <div className="subtitulo">
                <button
                  className="btn-back"
                  onClick={() => setPerson(null)}
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </button>

                {person.name.split("").map((letter, index) => (
                  <span key={index}>
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </div>

              {/* HISTÓRICO DE MENSAGENS */}
              <div className="history">
                {(messages[`${person.type}_${person.id}`] || []).map((msg) => (
                  <div key={msg.id} className={`message-container ${msg.sender}`}>
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* TECLADO / ENTRADA DE TEXTO */}
              <form onSubmit={handleSendMessage} className="keyboard">
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