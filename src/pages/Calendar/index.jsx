import { useState, useEffect} from 'react' 
import { useNavigate } from "react-router-dom";
import api from '../../services/api'
import './style.css'

export default function Calendar() {
  const title = "Calendário"
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
      <div className="background">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="header">
        <h2>
          {title.split("").map((letter, index) => (
            <span key={index}>{letter}</span>
          ))}
        </h2>
      </div>
      <div className="calendar">
        <h3>{mes}</h3>

        <div className="calendar-grid">
          {dias.map((dia) => (
            <div key={dia} className="day">

              <span className="day-number">{dia}</span>

              {card
                .filter(
                  (ca) => new Date(ca.data_entrega).getDate() === dia
                )
                .map((ca) => (
                  <div key={ca.id} className="card">
                    <span>{ca.title}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      <div className='rodape'>
        <button onClick={() => navigate("/Home")}><i class="fa-solid fa-house"></i></button>
        <button className='active'><i class="fa-solid fa-calendar"></i></button>
        <button onClick={() => navigate("/Chat")}><i class="fa-solid fa-comment-dots"></i></button>
        <button onClick={() => navigate("/Task")}>{dia}</button>
        <button onClick={() => navigate("/Ia")}><i class="fa-solid fa-dove"></i></button>
      </div>
    </div>
  );
}