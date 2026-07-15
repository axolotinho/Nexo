import { useState, useEffect } from 'react' 
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
  const [loading, setLoading] = useState(true); // Estado de loading para UX

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
    try {
      const cardFromApi = await api.get('/card')
      setCard(cardFromApi.data);
    } catch (error) {
      console.error("Erro ao buscar cards:", error);
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

      if (cargoCru === "G"){
        navigate("/home/gestor");
        return;
      }
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      navigate("/");
      return;
    }

    // Busca as tarefas controlando o loading
    const carregarDados = async () => {
      setLoading(true);
      await getCard();
      setLoading(false);
    };

    carregarDados();
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
        <h3 style={{ textTransform: 'capitalize' }}>{mes} de {hoje.getFullYear()}</h3>
        <div className="calendar-wrapper">
          
          {loading ? (
            /* Componente de loading estilizado e centralizado */
            <div className="loading-container-calendar" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              width: '100%',
              textAlign: 'center'
            }}>
              <div className="spinner"></div>
              <p style={{ color: '#0d3b66', fontWeight: 800, marginTop: '15px' }}>
                Carregando calendário de tarefas...
              </p>
            </div>
          ) : (
            <div className="calendar-grid">
              {dias.map((diaCorrente) => (
                <div key={diaCorrente} className="day">
                  <span className="day-number">{diaCorrente}</span>

                  {card
                    .filter((ca) => {
                      // Usa ca.due_date que é o padrão que você usou na tela de Tasks
                      if (!ca.due_date) return false;

                      // Divide a string "AAAA-MM-DD" para evitar problemas de fuso horário local do JS
                      const partesData = ca.due_date.split("T")[0].split("-");
                      const anoCard = parseInt(partesData[0], 10);
                      const mesCard = parseInt(partesData[1], 10) - 1; // Ajusta mês base-0
                      const diaCard = parseInt(partesData[2], 10);

                      return (
                        diaCard === diaCorrente &&
                        mesCard === hoje.getMonth() &&
                        anoCard === hoje.getFullYear()
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
          )}
          
        </div>
      </div>
    </div>
  );
}