import { useState, useEffect} from 'react' 
import { useNavigate } from "react-router-dom";
import api from '../../services/api'
import './style.css'

export default function Home() {
  const title = "Kanban"
  const description = "Veja como está indo o trabalho em equipe"
  const dia = new Date().getDate();
  const navigate = useNavigate();
  const [kanban, setKanban] = useState([])
  const [card, setCard] = useState([])
  async function getKanban(){
    const kanbanFromApi = await api.get('/kanban')
    setKanban(kanbanFromApi.data);
  }

  async function getCard(){
    const cardFromApi = await api.get('/card')

    setCard(cardFromApi.data);
  }

  useEffect (() =>  {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/");
    }
    getKanban();
    getCard();
  }, []);

  return (
    <div>
      <div className="background">
        <span></span>
        <span></span>
        <span></span>
      </div>
    <div className="topo">

      <div className="barra">

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
      <div className="layout">

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