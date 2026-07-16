import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import nexo from '../../../assets/nexo.png'
import api from '../../../services/api'
import './style.css'

export default function Home() {
  const title = "Kanban"
  const description = "Veja como está indo o trabalho em equipe"
  const navigate = useNavigate();
  
  // Estados do Kanban, Cards e Usuário
  const [kanban, setKanban] = useState([])
  const [card, setCard] = useState([])
  const [usuario, setUsuario] = useState(null);
  
  // Estado para controlar o Loading das requisições do Kanban/Cards
  const [loading, setLoading] = useState(true);

  // Busca as colunas do Kanban do servidor
  async function getKanban(){
    try {
      const response = await api.get('/kanban');
      setKanban(response.data);
    } catch (error) {
      console.error("Erro ao buscar colunas do Kanban:", error);
    }
  }

  // Busca os cards do servidor
  async function getCard(){
    try {
      const cardFromApi = await api.get('/card');
      setCard(cardFromApi.data);
    } catch (error) {
      console.error("Erro ao buscar cards:", error);
    }
  }

  // Função para mover o card de coluna (Esquerda/Direita)
  async function moverCard(cardId, direcao) {
    const cardAtual = card.find(c => c.id === cardId);
    if (!cardAtual) return;

    const indiceColunaAtual = kanban.findIndex(k => k.id === cardAtual.kanban_id);
    if (indiceColunaAtual === -1) return;

    let novoIndice = indiceColunaAtual + direcao;

    if (novoIndice < 0 || novoIndice >= kanban.length) return;

    const novaColuna = kanban[novoIndice];

    // Atualização Otimista
    setCard(prevCards => 
      prevCards.map(c => c.id === cardId ? { ...c, kanban_id: novaColuna.id } : c)
    );

    try {
      await api.patch(`/card/${cardId}`, { kanban_id: novaColuna.id });
    } catch (error) {
      console.error("Erro ao salvar movimento do card no servidor:", error);
      getCard();
    }
  }

  // Função para deletar uma coluna Kanban (com o botão "X")
  async function deletarColuna(kanbanId) {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta coluna? Todos os cards nela também serão apagados.");
    if (!confirmar) return;

    try {
      await api.delete(`/kanban/${kanbanId}`);
      setKanban(prev => prev.filter(k => k.id !== kanbanId));
      setCard(prev => prev.filter(c => c.kanban_id !== kanbanId));
    } catch (error) {
      console.error("Erro ao deletar coluna:", error);
      alert("Não foi possível deletar a coluna. Verifique se o backend está ativo.");
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

      // Função assíncrona interna para buscar todos os dados juntos e só desativar o Loading no final
      const carregarDadosIniciais = async () => {
        setLoading(true);
        // Executa as duas requisições em paralelo para carregar mais rápido
        await Promise.all([getKanban(), getCard()]);
        setLoading(false);
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
        {/* Se o loading for true, exibe a tela de carregamento */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando seu quadro Kanban...</p>
          </div>
        ) : (
          /* Quando terminar de carregar, exibe o Kanban normalmente */
          <div className="kanban">
            {kanban.map((kan, idxColuna) => (
              <div 
                key={kan.id}
                className="kanban-column"
                style={{ border: `2px solid ${kan.color}`, position: 'relative' }}
              >
                {/* Título da coluna com o botão "X" */}
                <div 
                  className="column-title"
                  style={{ 
                    background: kan.color,
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 15px'
                  }}
                >
                  <h3 style={{ margin: 0 }}>{kan.name}</h3>
                  
                  <button 
                    className="btn-delete-column"
                    onClick={() => deletarColuna(kan.id)}
                    title="Excluir coluna"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 2px'
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <div className="cards">
                  {card.map((obj) =>
                    obj.kanban_id === kan.id ? (
                      <div key={obj.id} className="task-card" onClick={() => navigate(`/task/${obj.id}`)} style={{ cursor: 'pointer' }}>
                        {/* Topo do Card */}
                        <div className="task-card-header">
                          <h4>{obj.title}</h4>
                          <div className="task-card-description">
                            <p>{obj.description}</p>
                          </div>
                        </div>

                        {/* Rodapé do Card */}
                        <div className="task-card-footer">
                          {idxColuna > 0 ? (
                            <button 
                              className="btn-move" 
                              onClick={() => moverCard(obj.id, -1)}
                              title="Mover para esquerda"
                            >
                              <i className="fa-solid fa-chevron-left"></i>
                            </button>
                          ) : <div className="btn-spacer"></div>}

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
        )}
      </div>
    </div>
  );
}