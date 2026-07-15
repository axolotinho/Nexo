import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from '../../services/api'
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

        // 1. LÓGICA DO NOME: Remove espaços em branco nas pontas e separa pelas lacunas.
        // Em seguida, pega apenas os dois primeiros pedaços (primeiro e segundo nome).
        const nomeCompleto = decoded.nome ? String(decoded.nome).trim() : "";
        const partesNome = nomeCompleto.split(/\s+/); // Divide por qualquer quantidade de espaços
        const nomeExibicao = partesNome.slice(0, 2).join(" "); // Pega do índice 0 ao 1 e junta com um espaço

        // 2. LÓGICA DO CARGO: Remove espaços e converte para MAIÚSCULA antes de comparar
        const cargoCru = decoded.cargo ? String(decoded.cargo).trim().toUpperCase() : "";
        let cargoExibicao = "";

        if (cargoCru === "F") {
          cargoExibicao = "Funcionário";
        } else if (cargoCru === "G") {
          cargoExibicao = "Gestor";
        } else {
          cargoExibicao = decoded.cargo || ""; // Caso venha outra coisa, mantém o original
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
            <button className="active">
              <i className="fa-solid fa-house"></i>
            </button>

            <button onClick={() => navigate("/Calendar")}>
              <i className="fa-solid fa-calendar"></i>
            </button>

            <button onClick={() => navigate("/Chat")}>
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            <button onClick={() => navigate("/Task")}>
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

      <div className="layout1">
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
                    <div key={obj.id} className="task-card">
                      <h4>{obj.title}</h4>
                      <p>{obj.description}</p>
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