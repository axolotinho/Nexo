import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import './style.css'; 

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Estados de edição
  const [progress, setProgress] = useState(0);
  const [novasImagens, setNovasImagens] = useState([]);
  const [novosDocumentos, setNovosDocumentos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Estado do Chat Interno da Atividade
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");

  // Estados do Cronômetro Interativo
  const [timerAtivo, setTimerAtivo] = useState(false); // Inicia pausado caso precise de validação
  const [segundosAcumulados, setSegundosAcumulados] = useState(0);
  const tempoRef = useRef(0);

  // --- CONTROLES DE PERMISSÃO ---
  const ehGestor = usuarioLogado?.cargo === "G" || usuarioLogado?.cargo === "GESTOR";
  
  const ehResponsavel = card?.responsaveis?.some(
    resp => Number(resp.id) === Number(usuarioLogado?.id)
  ) || false;

  const ehCriador = Number(card?.created_by_id || card?.created_by?.id) === Number(usuarioLogado?.id);

  // Permissões de Ação
  const podeProduzir = ehResponsavel && !ehGestor; // Só quem põe a mão na massa acumula tempo
  const podeEditar = ehResponsavel || ehGestor || ehCriador; // Quem pode salvar progresso, arquivos e concluir

  // 1. Controle do Cronômetro (Automático apenas para quem pode produzir)
  useEffect(() => {
    // Só ativa o cronômetro automaticamente se o usuário for o responsável de fato
    if (podeProduzir) {
      setTimerAtivo(true);
    } else {
      setTimerAtivo(false);
    }
  }, [podeProduzir]);

  useEffect(() => {
    let interval = null;

    if (timerAtivo && podeProduzir) {
      interval = setInterval(() => {
        tempoRef.current += 1;
        setSegundosAcumulados(tempoRef.current);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerAtivo, podeProduzir]);

  // Enviar tempo gasto acumulado ao desmontar a tela
  useEffect(() => {
    return () => {
      if (tempoRef.current > 0 && usuarioLogado?.id && podeProduzir) {
        enviarTempoGasto(tempoRef.current);
      }
    };
  }, [usuarioLogado, podeProduzir]);

  const enviarTempoGasto = async (segundos) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/card/${id}/adicionar-tempo`, {
        usuario_id: usuarioLogado.id,
        segundos: segundos
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`[Timer] ${segundos}s salvos.`);
    } catch (error) {
      console.error("Falha ao sincronizar tempo de produção:", error);
    }
  };

  const formatarTempo = (totalSegundos) => {
    const hrs = String(Math.floor(totalSegundos / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSegundos % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // 2. Carregar dados iniciais do Card e Usuário
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      
      // Padroniza a leitura do cargo para validação
      const cargoCru = decoded.cargo ? String(decoded.cargo).trim().toUpperCase() : "";

      setUsuarioLogado({
        id: Number(decoded.sub || decoded.identity),
        nome: decoded.nome,
        foto: decoded.foto,
        cargo: cargoCru
      });
    } catch (e) {
      navigate("/");
      return;
    }

    const buscarCard = async () => {
      try {
        const res = await api.get('/card');
        const cardEncontrado = res.data.find(c => String(c.id) === String(id));
        if (cardEncontrado) {
          setCard(cardEncontrado);
          setProgress(cardEncontrado.progress || 0);
        } else {
          // Se o card não está visível para ele nem na listagem geral, volta para as tasks
          navigate("/task");
        }
      } catch (err) {
        console.error("Erro ao carregar card:", err);
      } finally {
        setLoading(false);
      }
    };

    buscarCard();

    const savedChat = localStorage.getItem(`task_chat_${id}`);
    if (savedChat) {
      setComentarios(JSON.parse(savedChat));
    }
  }, [id, navigate]);

  useEffect(() => {
    if (comentarios.length > 0) {
      localStorage.setItem(`task_chat_${id}`, JSON.stringify(comentarios));
    }
  }, [comentarios, id]);

  const handleSalvarCard = async (e) => {
    e.preventDefault();
    if (!podeEditar) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("progress", progress);
      formData.append("title", card.title);
      formData.append("description", card.description);
      formData.append("kanban_id", card.kanban_id);

      novasImagens.forEach(img => {
        formData.append("images", img);
      });
      novosDocumentos.forEach(doc => {
        formData.append("files", doc);
      });

      await api.put(`/card/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      if (tempoRef.current > 0 && podeProduzir) {
        await enviarTempoGasto(tempoRef.current);
        tempoRef.current = 0; 
        setSegundosAcumulados(0);
      }

      alert("Progresso e arquivos salvos com sucesso! 🎉");
      navigate("/task");
    } catch (error) {
      console.error("Erro ao atualizar card:", error);
      alert("Erro ao salvar alterações no servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleConcluirTarefa = async () => {
    if (!podeEditar) return;
    const confirmar = window.confirm("Tem certeza que deseja marcar essa tarefa como pronta? Ela será arquivada e removida.");
    if (!confirmar) return;

    setCompleting(true);
    try {
      const token = localStorage.getItem("token");
      
      if (tempoRef.current > 0 && podeProduzir) {
        await enviarTempoGasto(tempoRef.current);
      }

      await api.delete(`/card/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Tarefa concluída com sucesso!");
      navigate("/task");
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
      alert("Não foi possível excluir o card do servidor.");
    } finally {
      setCompleting(false);
    }
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    const comentario = {
      id: Date.now(),
      senderName: usuarioLogado?.nome || "Usuário",
      senderFoto: usuarioLogado?.foto || "/default-avatar.png",
      text: novoComentario,
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setComentarios(prev => [...prev, comentario]);
    setNovoComentario("");
  };

  if (loading) {
    return (
      <div className="loading-container-fullscreen">
        <div className="spinner"></div>
        <p>Buscando detalhes do card...</p>
      </div>
    );
  }

  return (
    <div className="task-detail-container">
      {/* Cabeçalho */}
      <div className="detail-header">
        <button className="btn-voltar" onClick={() => navigate("/task")}>
          <i className="fa-solid fa-arrow-left"></i> Voltar
        </button>

        {/* Cronômetro Interativo - Só exibe se for o Responsável Técnico (Funcionário Atribuído) */}
        {podeProduzir ? (
          <div className="cronometro-box flex-center">
            <button 
              className={`btn-timer ${timerAtivo ? "btn-pause" : "btn-play"}`}
              onClick={() => setTimerAtivo(!timerAtivo)}
              title={timerAtivo ? "Pausar Produção" : "Iniciar Produção"}
            >
              <i className={`fa-solid ${timerAtivo ? "fa-pause" : "fa-play"}`}></i>
            </button>
            <span className="timer-text">
              {timerAtivo ? "Produzindo: " : "Pausado: "} 
              <strong>{formatarTempo(segundosAcumulados)}</strong>
            </span>
          </div>
        ) : (
          <div className="cronometro-box flex-center readonly-badge">
            <i className="fa-solid fa-clock"></i>
            <span className="timer-text">Modo Visualização (Sem Timer)</span>
          </div>
        )}

        {/* Botão de Concluir Atividade - Desabilitado para funcionários normais de fora */}
        {podeEditar && (
          <button 
            className="btn-concluir" 
            onClick={handleConcluirTarefa}
            disabled={completing}
          >
            <i className="fa-regular fa-circle-check"></i> {completing ? "Finalizando..." : "Tarefa Pronta"}
          </button>
        )}
      </div>

      <div className="detail-grid">
        {/* Painel Esquerdo: Informações do Card */}
        <div className="panel-info">
          <h1>{card.title}</h1>
          <p className="description-text">{card.description}</p>

          <div className="meta-dates">
            <div>
              <strong>Criado em:</strong> 
              <span> {new Date(card.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <strong>Prazo final:</strong> 
              <span className="text-danger"> {card.due_date ? new Date(card.due_date).toLocaleDateString('pt-BR') : "Sem prazo"}</span>
            </div>
          </div>

          <hr />

          {/* Criador do Card */}
          <div className="creator-box">
            <h4>Criador da Atividade:</h4>
            <div className="creator-profile">
              <img src={card.created_by?.foto || "/default-avatar.png"} alt={card.created_by?.nome} />
              <div>
                <h5>{card.created_by?.nome}</h5>
                <p>{card.created_by?.cargo === "G" ? "Gestor" : "Funcionário"}</p>
              </div>
            </div>
          </div>

          <hr />

          {/* Renderização de TODOS os Anexos Salvos */}
          <div className="attachments-section">
            <h4>Anexos Atuais no Servidor:</h4>
            
            {card.images && card.images.length > 0 ? (
              <div className="gallery">
                {card.images.map((imgUrl, idx) => (
                  <a href={imgUrl} target="_blank" rel="noreferrer" key={idx}>
                    <img src={imgUrl} alt={`Anexo ${idx + 1}`} className="thumbnail" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="no-attachments">Nenhuma imagem cadastrada.</p>
            )}

            {card.files && card.files.length > 0 ? (
              <ul className="files-list">
                {card.files.map((fileUrl, idx) => (
                  <li key={idx}>
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                      <i className="fa-solid fa-file-pdf"></i> Ver Documento {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-attachments">Nenhum documento cadastrado.</p>
            )}
          </div>
        </div>

        {/* Painel Direito: Ações, Progresso e Uploads */}
        <div className="panel-actions">
          <form onSubmit={handleSalvarCard} className="form-producao">
            <h3>Painel de Produção</h3>
            
            {/* Controle de Progresso - Desabilitado para quem não pode editar */}
            <div className="form-group">
              <label>Progresso da Tarefa: <strong>{progress}%</strong></label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                disabled={!podeEditar}
                onChange={(e) => setProgress(Number(e.target.value))} 
              />
            </div>

            {/* Inputs de Novos Uploads - Só aparecem ou ficam ativos para quem pode editar */}
            <div className="form-group">
              <label>Adicionar Novas Imagens:</label>
              <input 
                type="file" 
                multiple={true} 
                accept="image/*" 
                disabled={!podeEditar}
                onChange={(e) => setNovasImagens(Array.from(e.target.files))} 
              />
              {novasImagens.length > 0 && <span className="upload-indicator">({novasImagens.length} preparadas)</span>}
            </div>

            <div className="form-group">
              <label>Adicionar Novos Documentos:</label>
              <input 
                type="file" 
                multiple={true} 
                disabled={!podeEditar}
                onChange={(e) => setNovosDocumentos(Array.from(e.target.files))} 
              />
              {novosDocumentos.length > 0 && <span className="upload-indicator">({novosDocumentos.length} preparados)</span>}
            </div>

            {podeEditar ? (
              <button type="submit" className="btn-salvar" disabled={saving}>
                {saving ? "Enviando Alterações..." : "Salvar Progresso & Arquivos"}
              </button>
            ) : (
              <div className="badge-readonly-alert">
                <i className="fa-solid fa-lock"></i> Somente leitura para esta tarefa
              </div>
            )}
          </form>

          {/* Chat Interno - Livre para QUALQUER UM interagir */}
          <div className="chat-interno">
            <h3>Discussão da Atividade</h3>
            <div className="chat-interno-history">
              {comentarios.length > 0 ? (
                comentarios.map((c) => (
                  <div key={c.id} className="comentario-bubble">
                    <img src={c.senderFoto} alt={c.senderName} className="comentario-avatar" />
                    <div className="comentario-content">
                      <div className="comentario-meta">
                        <strong>{c.senderName}</strong> • <small>{c.createdAt}</small>
                      </div>
                      <p>{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-messages">Nenhum comentário enviado ainda.</p>
              )}
            </div>

            <form onSubmit={handleSendComment} className="chat-interno-input-box">
              <input 
                type="text" 
                placeholder="Escreva uma mensagem no chat da atividade..." 
                value={novoComentario} 
                onChange={(e) => setNovoComentario(e.target.value)}
              />
              <button type="submit">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}