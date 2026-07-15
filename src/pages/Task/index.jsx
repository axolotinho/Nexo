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
    // Resgata o ID do usuário logado guardado no localStorage (converta para número se necessário)
    const loggedUserId = localStorage.getItem("userId"); 
    
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
        nome: nomeExibicao,
        cargo: cargoExibicao,
        foto: decoded.foto
      });
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }

    setUserId(loggedUserId ? Number(loggedUserId) : null);
    getCard();
  }, []);

  // FILTRAGEM: Mostra apenas os cards onde o ID do usuário logado está na lista de responsáveis
  const minhasTarefas = cards.filter(card => 
    card.responsaveis?.some(responsavel => responsavel.id === userId)
  );

  return (
    <div>
      <div className="topo">
        <div className="barra">
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
            <button onClick={() => navigate("/Home")}>
              <i className="fa-solid fa-house"></i>
            </button>

            <button onClick={() => navigate("/Calendar")}>
              <i className="fa-solid fa-calendar"></i>
            </button>

            <button onClick={() => navigate("/Chat")}>
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            <button className="active">
              {dia}
            </button>

            <button onClick={() => navigate("/Ia")}>
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
        {minhasTarefas.length > 0 ? (
          minhasTarefas.map((card) => (
            <div key={card.id} className="task-card">
              <div className="task-header">
                <h3>{card.title}</h3>
              </div>
              
              <p className="task-desc">{card.description}</p>
              
              {/* Barra de Progresso estilizada */}
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
                
                {/* Responsáveis listados (mostrando fotos, se houver) */}
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