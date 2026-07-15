import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import nexo from '../../assets/nexo.png'
import api from '../../services/api'
import './style.css'

export default function Monitoring() {
  const title = "Monitoramento"
  const description = "Veja como está o desempenho de cada funcionário"
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);

  // 1. Carrega os funcionários reais do banco de dados
  // 1. Carrega os funcionários reais do banco de dados e mescla com os fictícios
  async function carregarFuncionarios() {
    try {
      // Tentativa de buscar na rota de usuários do seu backend. 
      // Se a sua rota for diferente (ex: '/usuario' ou '/users'), mude o endpoint abaixo:
      const response = await api.get('/usuario'); 
      const usuariosDoBanco = response.data || [];
      
      // Filtra e formata para garantir que só entram funcionários ("cargo" === "F" ou "Funcionário")
      const apenasFuncionariosDoBanco = usuariosDoBanco
        .filter(
          u => u.cargo?.toUpperCase() === "F" || 
               u.cargo?.toLowerCase() === "funcionário" || 
               u.cargo?.toLowerCase() === "funcionario"
        )
        .map(u => ({
          id: u.id,
          nome: u.nome,
          cargo: u.cargo_exibicao || "Atendente de Suporte", // Cargo temático ou o do banco
          foto: u.foto || null,
          status: Math.random() > 0.3 ? "Online" : "Offline", // Status aleatório para os reais (ou mude para "Online")
          tarefasFeitas: Math.floor(Math.random() * 15) + 5, // Número fictício de tarefas para ilustrar o painel
          horaEntrada: "09:00",
          horaSaida: "18:00",
          desempenho: Math.floor(Math.random() * 20) + 80, // Gera uma média de 80% a 100% de performance
          resumoIA: `Dovely analisa: ${u.nome} demonstra excelente consistência no atendimento de chamados nesta semana. Mantém o tempo médio de resposta baixo de 5 minutos e possui alto índice de satisfação do cliente.`
        }));

      // 2. Funcionários Fictícios ("de mentirinha") para complementar a lista
      const funcionariosFicticios = [
        {
          id: "mock-1",
          nome: "Lucas Alencar",
          cargo: "Atendente Sênior (Chat)",
          foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
          status: "Online",
          tarefasFeitas: 18,
          horaEntrada: "08:02",
          horaSaida: "17:05",
          desempenho: 96,
          resumoIA: "Dovely analisa: Lucas é o destaque da operação esta semana! Mostrou proatividade excepcional ao resolver gargalos no fluxo de tickets críticos de suporte técnico."
        },
        {
          id: "mock-2",
          nome: "Mariana Costa",
          cargo: "Atendente de Call Center",
          foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          status: "Offline",
          tarefasFeitas: 11,
          horaEntrada: "08:55",
          horaSaida: "18:01",
          desempenho: 84,
          resumoIA: "Dovely analisa: Mariana obedece rigorosamente às metas de SLA estabelecidas. Sugiro atenção para o tempo de pausa produtiva que se estendeu ligeiramente na terça-feira."
        }
      ];

      // Une as duas listas de forma limpa
      const listaCompleta = [...apenasFuncionariosDoBanco, ...funcionariosFicticios];
      setFuncionarios(listaCompleta);

      // Define o primeiro funcionário como selecionado por padrão se houver algum
      if (listaCompleta.length > 0) {
        setSelectedFuncionario(listaCompleta[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários do banco de dados:", error);
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

      carregarFuncionarios();
      
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
            <button onClick={() => navigate("/home/gestor")}>
              <i className="fa-solid fa-house"></i>
            </button>

            <button onClick={() => navigate("/calendar/gestor")}>
              <i className="fa-solid fa-calendar"></i>
            </button>

            <button className="active">
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

      {/* NOVO LAYOUT 9: MONITORAMENTO */}
      <div className="layout9">
        
        {/* COLUNA ESQUERDA: LISTA DE FUNCIONÁRIOS */}
        <div className="monitoring-sidebar">
          <h3>Equipe de Atendimento</h3>
          <div className="employees-list">
            {funcionarios.map((func) => (
              <div 
                key={func.id} 
                className={`employee-item ${selectedFuncionario?.id === func.id ? 'active-employee' : ''}`}
                onClick={() => setSelectedFuncionario(func)}
              >
                <div className="employee-avatar-wrapper">
                  <img 
                    src={func.foto || "/default-avatar.png"} 
                    alt={func.nome} 
                    className="employee-avatar"
                  />
                  <span className={`status-badge ${func.status.toLowerCase()}`}></span>
                </div>
                <div className="employee-info">
                  <h4>{func.nome}</h4>
                  <p>{func.cargo}</p>
                </div>
                <div className="employee-performance-badge">
                  {func.desempenho}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: PAINEL DE DETALHES DO SELECIONADO */}
        <div className="monitoring-detail-panel">
          {selectedFuncionario ? (
            <div className="detail-container">
              
              {/* Cabeçalho do Detalhe */}
              <div className="detail-header">
                <img 
                  src={selectedFuncionario.foto || "/default-avatar.png"} 
                  alt={selectedFuncionario.nome} 
                  className="detail-avatar"
                />
                <div className="detail-title">
                  <h2>{selectedFuncionario.nome}</h2>
                  <span className="detail-role">{selectedFuncionario.cargo}</span>
                  <span className={`detail-status ${selectedFuncionario.status.toLowerCase()}`}>
                    {selectedFuncionario.status}
                  </span>
                </div>
              </div>

              {/* Grid de Informações e Métricas */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <i className="fa-solid fa-circle-check"></i>
                  <div className="metric-data">
                    <h5>Feitos na Semana</h5>
                    <p>{selectedFuncionario.tarefasFeitas} atendimentos</p>
                  </div>
                </div>

                <div className="metric-card">
                  <i className="fa-solid fa-right-to-bracket"></i>
                  <div className="metric-data">
                    <h5>Última Entrada</h5>
                    <p>{selectedFuncionario.horaEntrada}h</p>
                  </div>
                </div>

                <div className="metric-card">
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <div className="metric-data">
                    <h5>Última Saída</h5>
                    <p>{selectedFuncionario.horaSaida}h</p>
                  </div>
                </div>
              </div>

              {/* Gráfico de Desempenho Visual (HTML Semântico estruturado) */}
              <div className="performance-chart-section">
                <h4>Gráfico de Rendimento Semanal</h4>
                <div className="bar-chart">
                  {/* Segunda */}
                  <div className="chart-column">
                    <div className="chart-bar-fill" style={{ height: `${selectedFuncionario.desempenho - 10}%` }}>
                      <span className="chart-tooltip">{selectedFuncionario.desempenho - 10}%</span>
                    </div>
                    <span className="chart-label">Seg</span>
                  </div>
                  {/* Terça */}
                  <div className="chart-column">
                    <div className="chart-bar-fill" style={{ height: `${selectedFuncionario.desempenho - 15}%` }}>
                      <span className="chart-tooltip">{selectedFuncionario.desempenho - 15}%</span>
                    </div>
                    <span className="chart-label">Ter</span>
                  </div>
                  {/* Quarta */}
                  <div className="chart-column">
                    <div className="chart-bar-fill" style={{ height: `${selectedFuncionario.desempenho}%` }}>
                      <span className="chart-tooltip">{selectedFuncionario.desempenho}%</span>
                    </div>
                    <span className="chart-label">Qua</span>
                  </div>
                  {/* Quinta */}
                  <div className="chart-column">
                    <div className="chart-bar-fill" style={{ height: `${selectedFuncionario.desempenho - 5}%` }}>
                      <span className="chart-tooltip">{selectedFuncionario.desempenho - 5}%</span>
                    </div>
                    <span className="chart-label">Qui</span>
                  </div>
                  {/* Sexta */}
                  <div className="chart-column">
                    <div className="chart-bar-fill" style={{ height: `${selectedFuncionario.desempenho - 2}%` }}>
                      <span className="chart-tooltip">{selectedFuncionario.desempenho - 2}%</span>
                    </div>
                    <span className="chart-label">Sex</span>
                  </div>
                </div>
              </div>

              {/* Resumo da IA Dovely */}
              <div className="dovely-ai-section">
                <div className="dovely-ai-header">
                  <i className="fa-solid fa-dove dovely-icon"></i>
                  <h4>Análise Inteligente da Dovely</h4>
                </div>
                <div className="dovely-ai-content">
                  <p>{selectedFuncionario.resumoIA}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="no-selection">
              <i className="fa-solid fa-users"></i>
              <p>Selecione um atendente para monitorar em tempo real.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}