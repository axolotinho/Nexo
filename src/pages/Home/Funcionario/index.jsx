import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from '../../../services/api'
import './style.css'

export default function Home() {
  const title = "Kanban"
  const description = "Veja como está indo o trabalho em equipe"
  const dia = new Date().getDate();
  const navigate = useNavigate();
  const [kanban, setKanban] = useState([])
  const [card, setCard] = useState([])
  const [usuario, setUsuario] = useState(null);

  const [loading, setLoading] = useState(true);

  // Função para fazer logout e limpar a sessão
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  async function getKanban(){
    const kanbanFromApi = await api.get('/kanban')
    setKanban(kanbanFromApi.data);
  }

  async function getCard(){
    const cardFromApi = await api.get('/card')
    setCard(cardFromApi.data);
  }

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
        nome: nomeExibicao,
        cargo: cargoExibicao,
        foto: decoded.foto
      });

      if (cargoCru == "G"){
        navigate("/home/gestor");
      }
      const carregarDadosIniciais = async () => {
        setLoading(true);
        try {
          await Promise.all([getKanban(), getCard()]);
        } catch (error) {
          console.error("Erro ao carregar dados iniciais:", error);
        } finally {
          setLoading(false);
        }
      };

      carregarDadosIniciais();
      
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }
  }, []);

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
            <button className="active" title="Início">
              <i className="fa-solid fa-house"></i>
            </button>

            <button onClick={() => navigate("/calendar/funcionario")} title="Calendário">
              <i className="fa-solid fa-calendar"></i>
            </button>

            <button onClick={() => navigate("/chat/funcionario")} title="Chat">
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            <button onClick={() => navigate("/task")} title="Tarefas">
              <span>{dia}</span>
            </button>

            <button onClick={() => navigate("/ia/funcionario")} title="Assistente IA">
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

      <div className="layout1">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando seu quadro Kanban...</p>
          </div>
        ) : (
          <div className="kanban">
            {kanban.map((kan) => (
              <div 
                key={kan.id}
                className="kanban-column"
                style={{ border: `2px solid ${kan.color}` }}
              >
                <div 
                  className="column-title"
                  style={{background: kan.color}}
                >
                  <h3>{kan.name}</h3>
                </div>

                <div className="cards">
                  {card.map((obj) =>
                    obj.kanban_id === kan.id ? (
                      <div key={obj.id} className="task-card" onClick={() => navigate(`/task/${obj.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="task-card-header">
                          <h4>{obj.title}</h4>
                          <p className="task-card-description">{obj.description}</p>
                        </div>

                        <div className="task-card-progress-container">
                          <div className="task-card-progress-bar">
                            <div 
                              className="task-card-progress-fill" 
                              style={{ width: `${obj.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="task-card-progress-text">
                            {obj.progress || 0}%
                          </span>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}