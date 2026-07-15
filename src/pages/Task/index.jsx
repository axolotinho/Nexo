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
    
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      
      // Captura o ID do usuário diretamente do token JWT decodificado
      // Normalmente o jwt-decode coloca a identidade no campo 'sub'
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
      }
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }

    getCard();
  }, []);


  // Filtra comparando os IDs convertidos para String (método mais seguro)
  // Filtra apenas as tarefas do usuário que devem ser entregues hoje
  const minhasTarefas = cards.filter(card => {
    // 1. Verifica se o usuário logado é um dos responsáveis
    const ehResponsavel = card.responsaveis?.some(
      responsavel => String(responsavel.id) === String(userId)
    );

    if (!ehResponsavel) return false;

    // 2. Verifica se o card tem prazo definido
    if (!card.due_date) return false;

    // Extrai apenas a parte da data "AAAA-MM-DD" para ignorar horas/fuso horário
    const dataCardStr = card.due_date.split("T")[0];

    // Obtém a data de hoje formatada em "AAAA-MM-DD" no fuso local
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const diaCorrente = String(hoje.getDate()).padStart(2, '0');
    const hojeStr = `${ano}-${mes}-${diaCorrente}`;

    // Retorna apenas se a data do card coincidir exatamente com o dia de hoje
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