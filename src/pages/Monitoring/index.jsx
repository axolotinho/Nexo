import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import nexo from '../../assets/nexo.png'
import api from '../../services/api'
import './style.css'

// 1. Banco de Cargos, IA e Tarefas para Aleatorização Estilizada
const CARGOS_POOL = [
  {
    cargo: "Social Media",
    gerarIA: (nome) => `Dovely analisa: ${nome} apresentou excelente engajamento nas últimas postagens. O tempo de resposta aos comentários na comunidade está abaixo de 8 minutos, impulsionando a fidelização orgânica.`,
    tarefas: [
      { id: 1, titulo: "Planejamento de Feed Semanal", status: "concluida", dataFim: "15/07/2026", tempoGasto: "4h 12m", anexos: ["cronograma_julho.xlsx", "artworks_v1.zip"] },
      { id: 2, titulo: "Responder directs do Instagram (Críticos)", status: "concluida", dataFim: "16/07/2026", tempoGasto: "1h 45m", anexos: [] },
      { id: 3, titulo: "Relatório de Métrica Mensal", status: "em_progresso", progresso: 75, tempoDecorrido: "3h 20m" },
      { id: 4, titulo: "Criação de Stories Diários", status: "em_progresso", progresso: 40, tempoDecorrido: "1h 05m" }
    ]
  },
  {
    cargo: "Design Gráfico",
    gerarIA: (nome) => `Dovely analisa: O fluxo criativo de ${nome} está operando em alta performance. Os feedbacks de ajustes foram reduzidos em 30% nesta semana devido à precisão na entrega dos briefings iniciais.`,
    tarefas: [
      { id: 1, titulo: "Identidade Visual - Campanha de Inverno", status: "concluida", dataFim: "14/07/2026", tempoGasto: "8h 30m", anexos: ["logo_final.svg", "paleta_cores.pdf"] },
      { id: 2, titulo: "Banner para Carrossel do Blog", status: "concluida", dataFim: "16/07/2026", tempoGasto: "2h 10m", anexos: ["banner_blog.png"] },
      { id: 3, titulo: "Templates de Postagens para Afiliados", status: "em_progresso", progresso: 60, tempoDecorrido: "5h 15m" },
      { id: 4, titulo: "Tratamento de fotos do time de Vendas", status: "em_progresso", progresso: 15, tempoDecorrido: "45m" }
    ]
  },
  {
    cargo: "Gestor de Tráfego",
    gerarIA: (nome) => `Dovely analisa: ${nome} monitorou de perto a flutuação do CPC. Houve uma otimização no CPL (Custo por Lead) de 12% nos anúncios ativos do Facebook Ads de ontem para hoje.`,
    tarefas: [
      { id: 1, titulo: "Setup de Pixel e Conversões da API", status: "concluida", dataFim: "13/07/2026", tempoGasto: "3h 05m", anexos: ["setup_pixel_doc.txt"] },
      { id: 2, titulo: "Análise de Públicos Semelhantes (LAL)", status: "concluida", dataFim: "15/07/2026", tempoGasto: "1h 50m", anexos: [] },
      { id: 3, titulo: "Otimização de Orçamento (CBO) - Google Ads", status: "em_progresso", progresso: 90, tempoDecorrido: "2h 40m" },
      { id: 4, titulo: "Escalar Campanha de Remarketing", status: "em_progresso", progresso: 30, tempoDecorrido: "1h 15m" }
    ]
  },
  {
    cargo: "Redator SEO",
    gerarIA: (nome) => `Dovely analisa: A otimização de palavras-chave feita por ${nome} resultou em 4 novos artigos ranqueados na primeira página do Google esta semana. Excelente aplicação técnica.`,
    tarefas: [
      { id: 1, titulo: "Artigo: 'Como gerenciar times de suporte híbridos'", status: "concluida", dataFim: "14/07/2026", tempoGasto: "5h 40m", anexos: ["artigo_suporte_seo.docx"] },
      { id: 2, titulo: "Revisão de Copy da Landing Page Principal", status: "concluida", dataFim: "16/07/2026", tempoGasto: "3h 15m", anexos: [] },
      { id: 3, titulo: "Pesquisa de Keyword Gap (Semrush)", status: "em_progresso", progresso: 80, tempoDecorrido: "4h 00m" },
      { id: 4, titulo: "Newsletter Semanal de Conteúdo", status: "em_progresso", progresso: 50, tempoDecorrido: "1h 30m" }
    ]
  }
];

export default function Monitoring() {
  const title = "Monitoramento"
  const description = "Veja como está o desempenho de cada funcionário"
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  
  // Define se o detalhe mostra "metricas" ou os "cartoes" (tarefas)
  const [activeTab, setActiveTab] = useState("metricas");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }; 

  // Carrega os funcionários reais do banco de dados e mescla com os fictícios
  async function carregarFuncionarios() {
    try {
      const response = await api.get('/usuario'); 
      const usuariosDoBanco = response.data || [];
      
      const apenasFuncionariosDoBanco = usuariosDoBanco
        .filter(
          u => u.cargo?.toUpperCase() === "F" || 
               u.cargo?.toLowerCase() === "funcionário" || 
               u.cargo?.toLowerCase() === "funcionario"
        )
        .map(u => {
          // Seleciona um template aleatório para cargos/tarefas
          const templateAleatorio = CARGOS_POOL[Math.floor(Math.random() * CARGOS_POOL.length)];
          const desempenhoGerado = Math.floor(Math.random() * 20) + 80;

          return {
            id: u.id,
            nome: u.nome,
            cargo: templateAleatorio.cargo,
            foto: u.foto || null,
            status: Math.random() > 0.3 ? "Online" : "Offline",
            tarefasFeitas: Math.floor(Math.random() * 10) + 5,
            horaEntrada: "09:00",
            horaSaida: "18:00",
            desempenho: desempenhoGerado,
            resumoIA: templateAleatorio.gerarIA(u.nome),
            tarefas: templateAleatorio.tarefas // Injeta as tarefas fictícias relacionadas ao cargo
          };
        });

      // Funcionários Fictícios complementares
      const mock1Template = CARGOS_POOL[0]; // Social Media
      const mock2Template = CARGOS_POOL[1]; // Design Gráfico

      const funcionariosFicticios = [
        {
          id: "mock-1",
          nome: "Lucas Alencar",
          cargo: mock1Template.cargo,
          foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
          status: "Online",
          tarefasFeitas: 18,
          horaEntrada: "08:02",
          horaSaida: "17:05",
          desempenho: 96,
          resumoIA: "Dovely analisa: Lucas é o destaque da operação esta semana! Mostrou proatividade excepcional ao resolver gargalos no fluxo de tickets críticos de suporte técnico.",
          tarefas: mock1Template.tarefas
        },
        {
          id: "mock-2",
          nome: "Mariana Costa",
          cargo: mock2Template.cargo,
          foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          status: "Offline",
          tarefasFeitas: 11,
          horaEntrada: "08:55",
          horaSaida: "18:01",
          desempenho: 84,
          resumoIA: "Dovely analisa: Mariana obedece rigorosamente às metas de SLA estabelecidas. Sugiro atenção para o tempo de pausa produtiva que se estendeu ligeiramente na terça-feira.",
          tarefas: mock2Template.tarefas
        }
      ];

      const listaCompleta = [...apenasFuncionariosDoBanco, ...funcionariosFicticios];
      setFuncionarios(listaCompleta);

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
            <button className="btn-logout" onClick={handleLogout} title="Sair da Conta">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>

            <img 
              src={usuario?.foto || "/default-avatar.png"} 
              alt="Foto do usuário"
            />
            <div className="user-details">
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

      <div className="layout9">
        
        {/* COLUNA ESQUERDA: LISTA DE FUNCIONÁRIOS */}
        <div className="monitoring-sidebar">
          <h3>Equipe de Atendimento</h3>
          <div className="employees-list">
            {funcionarios.map((func) => (
              <div 
                key={func.id} 
                className={`employee-item ${selectedFuncionario?.id === func.id ? 'active-employee' : ''}`}
                onClick={() => {
                  setSelectedFuncionario(func);
                  setActiveTab("metricas"); // Reseta para métricas ao trocar de funcionário
                }}
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

                {/* Alternador de visualização Manual caso queira clicar direto */}
                <div className="tab-navigation">
                  <button 
                    className={`tab-btn ${activeTab === "metricas" ? "active" : ""}`}
                    onClick={() => setActiveTab("metricas")}
                  >
                    Geral
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === "cartoes" ? "active" : ""}`}
                    onClick={() => setActiveTab("cartoes")}
                  >
                    Atividades
                  </button>
                </div>
              </div>

              {/* CONTEÚDO CONDICIONAL */}
              {activeTab === "metricas" ? (
                <>
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

                  {/* Gráfico de Desempenho Visual (Com gatilho onClick) */}
                  <div 
                    className="performance-chart-section interactive-chart" 
                    onClick={() => setActiveTab("cartoes")} 
                    title="Clique no gráfico para auditar cartões deste funcionário"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="chart-header-interactive">
                      <h4>Gráfico de Rendimento Semanal</h4>
                      <span className="click-indicator"><i className="fa-solid fa-arrow-pointer"></i> Clique para ver Tarefas</span>
                    </div>
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
                </>
              ) : (
                /* PAINEL DE CARTÕES (Telas de Tarefas) */
                <div className="tasks-audit-panel">
                  <div className="audit-header">
                    <h3>Cartões Atuais - Kanban Monitor</h3>
                    <button className="back-btn" onClick={() => setActiveTab("metricas")}>
                      <i className="fa-solid fa-arrow-left"></i> Voltar às Métricas
                    </button>
                  </div>

                  <div className="tasks-container">
                    {/* Coluna Em Progresso */}
                    <div className="task-column-kanban">
                      <h4><span className="bullet-progress"></span> Em Progresso</h4>
                      <div className="task-list-cards">
                        {selectedFuncionario.tarefas?.filter(t => t.status === "em_progresso").map(task => (
                          <div key={task.id} className="task-card card-progress">
                            <h5>{task.titulo}</h5>
                            
                            <div className="progress-bar-wrapper">
                              <span className="progress-label">Progresso: {task.progresso}%</span>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${task.progresso}%` }}></div>
                              </div>
                            </div>

                            <div className="card-footer-meta">
                              <span><i className="fa-regular fa-clock"></i> Ativo há: {task.tempoDecorrido}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coluna Concluídas Hoje */}
                    <div className="task-column-kanban">
                      <h4><span className="bullet-done"></span> Concluídas</h4>
                      <div className="task-list-cards">
                        {selectedFuncionario.tarefas?.filter(t => t.status === "concluida").map(task => (
                          <div key={task.id} className="task-card card-done">
                            <h5>{task.titulo}</h5>
                            
                            <div className="card-completion-info">
                              <p><strong>Duração da tarefa:</strong> {task.tempoGasto}</p>
                              <p><strong>Finalizado em:</strong> {task.dataFim}</p>
                            </div>

                            {task.anexos && task.anexos.length > 0 && (
                              <div className="card-attachments">
                                <p><strong>Anexos ({task.anexos.length}):</strong></p>
                                <div className="attachment-badges">
                                  {task.anexos.map((anexo, idx) => (
                                    <span key={idx} className="badge-file">
                                      <i className="fa-solid fa-paperclip"></i> {anexo}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

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