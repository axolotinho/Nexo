import { useState, useEffect} from 'react' 
import { useNavigate } from "react-router-dom";
import api from '../../services/api'
import './style.css'

export default function Calendar() {
  const title = "Calendário"
  const description = "Veja como está sua agenda"
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.toLocaleString("pt-BR", {
    month: "long",
  });
  const diasNoMes = new Date(
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    0
  ).getDate();
  const dias = Array.from(
    { length: diasNoMes },
    (_, i) => i + 1
  );
  const navigate = useNavigate();
  const [card, setCard] = useState([])
  async function getCard(){
    const cardFromApi = await api.get('/card')

    setCard(cardFromApi.data);
  }

  useEffect (() =>  {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/");
    }

    getCard();
  }, []);

  return (
    <div>
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

            <button onClick={() => navigate("/home")}>
              <i className="fa-solid fa-house"></i>
            </button>

            <button className="active">
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
      <div className="calendar">
        <h3>{mes} de {hoje.getFullYear()}</h3>

        <div className="calendar-grid">
          {dias.map((dia) => (
            <div key={dia} className="day">

              <span className="day-number">{dia}</span>

              {card
                .filter((ca) => {
                  const data = new Date(ca.data_entrega);

                  return (
                    data.getDate() === dia &&
                    data.getMonth() === hoje.getMonth() &&
                    data.getFullYear() === hoje.getFullYear()
                  );
                })
                .map((ca) => (
                  <div key={ca.id} className="card">
                    <span>{ca.title}</span>
                  </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}