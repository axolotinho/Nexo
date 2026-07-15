import { useState, useEffect} from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from '../../../services/api'
import './style.css'

export default function Calendar() {
  const title = "Calendário"
  const description = "Veja como está sua agenda"
  const hoje = new Date();
  const dia = hoje.getDate();
  const [usuario, setUsuario] = useState(null);
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
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
    }
    getCard();
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

            <button onClick={() => navigate("/home/funcionario")}>
              <i className="fa-solid fa-house"></i>
            </button>

            <button className="active">
              <i className="fa-solid fa-calendar"></i>
            </button>

            <button onClick={() => navigate("/chat/funcionario")}>
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            <button onClick={() => navigate("/task")}>
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