import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import nexo from '../../../assets/nexo.png'
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

  async function getKanban(){
    try {
      // Endpoint correto para buscar as colunas do Kanban
      const response = await api.get('/kanban');
      setKanban(response.data);
    } catch (error) {
      console.error("Erro ao buscar colunas do Kanban:", error);
    }
  }

  async function getCard(){
    try {
      const cardFromApi = await api.get('/card');
      setCard(cardFromApi.data);
    } catch (error) {
      console.error("Erro ao buscar cards:", error);
    }
  }

  // Função para mover o card de coluna
  async function moverCard(cardId, direcao) {
    const cardAtual = card.find(c => c.id === cardId);
    if (!cardAtual) return;

    const indiceColunaAtual = kanban.findIndex(k => k.id === cardAtual.kanban_id);
    if (indiceColunaAtual === -1) return;

    let novoIndice = indiceColunaAtual + direcao;

    // Impede que passe dos limites do Kanban
    if (novoIndice < 0 || novoIndice >= kanban.length) return;

    const novaColuna = kanban[novoIndice];

    // 1. Atualização Otimista: muda o estado na tela primeiro para ficar instantâneo
    setCard(prevCards => 
      prevCards.map(c => c.id === cardId ? { ...c, kanban_id: novaColuna.id } : c)
    );

    try {
      // 2. Envia para o Banco de Dados. 
      // Se sua API salvar usando PATCH, PUT ou POST, certifique-se de que a rota está correta:
      await api.patch(`/card/${cardId}`, { kanban_id: novaColuna.id });
    } catch (error) {
      console.error("Erro ao salvar movimento do card no servidor:", error);
      // Se a chamada de API falhar (ex: rota inexistente ou erro 500), 
      // desfazemos a alteração recarregando do banco:
      getCard();
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

      getKanban();
      getCard();
      
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
            <button className="active">
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

            <button onClick={() => navigate("/ia/gestor")}>
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
        <div className="kanban">
          {kanban.map((kan, idxColuna) => (
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
                    <div key={obj.id} className="task-card">
                      {/* Topo do Card: Título e Descrição */}
                      <div className="task-card-header">
                        <h4>{obj.title}</h4>
                        <div className="task-card-description">
                          <p>{obj.description}</p>
                        </div>
                      </div>

                      {/* Rodapé do Card: Barra de Progresso + Setas de Movimentação */}
                      <div className="task-card-footer">
                        {/* Botão de mover para a Esquerda (só aparece se não for a primeira coluna) */}
                        {idxColuna > 0 ? (
                          <button 
                            className="btn-move" 
                            onClick={() => moverCard(obj.id, -1)}
                            title="Mover para esquerda"
                          >
                            <i className="fa-solid fa-chevron-left"></i>
                          </button>
                        ) : <div className="btn-spacer"></div>}

                        {/* Progresso centralizado */}
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

                        {/* Botão de mover para a Direita (só aparece se não for a última coluna) */}
                        {idxColuna < kanban.length - 1 ? (
                          <button 
                            className="btn-move" 
                            onClick={() => moverCard(obj.id, 1)}
                            title="Mover para direita"
                          >
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                        ) : <div className="btn-spacer"></div>}
                      </div>

                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}