import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from '../../services/api'
import './style.css'

export default function Task() {
  const description = "O que temos para hoje?"
  const dia = new Date().getDate();
  const title = dia.toString();
  const navigate = useNavigate();
  const [cards, setCards] = useState([])
  const [userId, setUserId] = useState(null)
  const [usuario, setUsuario] = useState(null);
  
  // 1. ADICIONADO: Estado para controlar o carregamento dos cards
  const [loading, setLoading] = useState(true);

  async function getCard() {
    try {
      const cardFromApi = await api.get('/card')
      setCards(cardFromApi.data);
    } catch (error) {
      console.error("Erro ao carregar os cards:", error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      
      const idDoUsuario = decoded.sub || decoded.identity; 
      setUserId(idDoUsuario ? Number(idDoUsuario) : null);

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

      if (cargoCru === "G"){
        navigate("/home/gestor");
        return;
      }
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
      return;
    }

    // 2. ALTERADO: Executa a busca de cards gerenciando o estado do loading
    const carregarDados = async () => {
      setLoading(true);
      await getCard();
      setLoading(false);
    };

    carregarDados();
  }, []);


  // Filtra apenas as tarefas do usuário que devem ser entregues hoje
  const minhasTarefas = cards.filter(card => {
    const ehResponsavel = card.responsaveis?.some(
      responsavel => String(responsavel.id) === String(userId)
    );

    if (!ehResponsavel) return false;
    if (!card.due_date) return false;

    const dataCardStr = card.due_date.split("T")[0];

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const diaCorrente = String(hoje.getDate()).padStart(2, '0');
    const hojeStr = `${ano}-${mes}-${diaCorrente}`;

    return dataCardStr === hojeStr;
  });

  return (
    <div>
      <div className="topo">
        <div className="barra">
          <div className="account">
            <img 
              src={usuario?.foto || "/default-avatar.png"} 
              alt="Foto do usuário"
            />

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

            <button className="active">
              {dia}
            </button>

            <button onClick={() => navigate("/ia/funcionario")}>
              <i className="fa-solid fa-dove"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="subtitulo">
        {description.split("").map((letter, index) => (
          <span key={index}>
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </div>

      {/* ÁREA DE LAYOUT DOS CARDS */}
      <div className="layout2">
        {/* 3. ALTERADO: Agora verifica se está carregando antes de renderizar os cards ou o "Sem tarefas" */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Buscando suas tarefas de hoje...</p>
          </div>
        ) : minhasTarefas.length > 0 ? (
          minhasTarefas.map((card) => (
            <div key={card.id} className="task-card">
              <div className="task-header">
                <h3>{card.title}</h3>
              </div>
              
              <p className="task-desc">{card.description}</p>
              
              <div className="task-progress-container">
                <div className="task-progress-bar" style={{ width: `${card.progress}%` }}></div>
                <span className="task-progress-text">{card.progress}% concluído</span>
              </div>

              <div className="task-footer">
                {card.due_date && (
                  <span className="task-due">
                    <i className="fa-regular fa-clock"></i> {new Date(card.due_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                
                <div className="task-responsaveis">
                  {card.responsaveis.map(resp => (
                    <img 
                      key={resp.id} 
                      src={resp.foto || 'https://via.placeholder.com/150'} 
                      alt={resp.nome} 
                      title={resp.nome}
                      className="avatar-responsavel"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-tasks">
            <p>Você não tem nenhuma tarefa atribuída para hoje! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}