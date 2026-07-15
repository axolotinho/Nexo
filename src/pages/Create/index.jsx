import { useState, useEffect } from 'react' 
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from '../../services/api'
import './style.css'

export default function Create() {
  const title = "Criar"
  const description = "Crie tarefas ou kanban para sua equipe"
  const dia = new Date().getDate();
  const navigate = useNavigate();
  
  // Estados para dados buscados do banco
  const [kanbans, setKanbans] = useState([])
  const [cards, setCards] = useState([])
  const [usuario, setUsuario] = useState(null);

  // --- ESTADOS DO FORMULÁRIO DE KANBAN ---
  const [kanbanName, setKanbanName] = useState("");
  const [kanbanColor, setKanbanColor] = useState("#000000");

  // --- ESTADOS DO FORMULÁRIO DE CARD ---
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardProgress, setCardProgress] = useState(0);
  const [cardDueDate, setCardDueDate] = useState("");
  const [cardDifficulty, setCardDifficulty] = useState(1);
  const [cardWorkload, setCardWorkload] = useState(1);
  const [cardKanbanId, setCardKanbanId] = useState("");
  const [cardResponsaveis, setCardResponsaveis] = useState(""); // Ex: "1, 2" (separado por vírgula)
  const [cardImages, setCardImages] = useState([]);
  const [cardFiles, setCardFiles] = useState([]);

  // Busca inicial dos Kanbans e Cards existentes (GET)
  async function getKanbansFromApi() {
    try {
      const response = await api.get('/kanban');
      setKanbans(response.data);
    } catch (error) {
      console.error("Erro ao buscar Kanbans:", error);
    }
  }

  async function getCardsFromApi() {
    try {
      const response = await api.get('/card');
      setCards(response.data);
    } catch (error) {
      console.error("Erro ao buscar Cards:", error);
    }
  }

  // --- SUBMISSÃO DO KANBAN (POST) ---
  async function handleCreateKanban(e) {
    e.preventDefault();
    if (!kanbanName || !kanbanColor) {
      alert("Por favor, preencha todos os campos do Kanban.");
      return;
    }

    try {
      await api.post('/kanban', {
        name: kanbanName,
        color: kanbanColor
      });
      alert("Coluna Kanban criada com sucesso!");
      setKanbanName("");
      setKanbanColor("#000000");
      getKanbansFromApi(); // Atualiza a lista
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao criar Kanban.");
    }
  }

  // --- SUBMISSÃO DO CARD (POST com Multipart Form Data) ---
  async function handleCreateCard(e) {
    e.preventDefault();
    if (!cardTitle || !cardDescription || !cardKanbanId) {
      alert("Título, descrição e coluna Kanban são obrigatórios.");
      return;
    }

    const formData = new FormData();
    formData.append("title", cardTitle);
    formData.append("description", cardDescription);
    formData.append("progress", cardProgress);
    formData.append("kanban_id", cardKanbanId);
    formData.append("difficulty", cardDifficulty);
    formData.append("workload", cardWorkload);
    if (cardDueDate) formData.append("due_date", cardDueDate);

    // Processa os responsáveis se digitados (ex: "1, 2" -> ["1", "2"])
    if (cardResponsaveis) {
      const listaIds = cardResponsaveis.split(",").map(id => id.trim());
      listaIds.forEach(id => formData.append("responsaveis", id));
    }

    // Anexa as múltiplas imagens selecionadas
    Array.from(cardImages).forEach(imagem => {
      formData.append("images", imagem);
    });

    // Anexa os múltiplos arquivos selecionados
    Array.from(cardFiles).forEach(arquivo => {
      formData.append("files", arquivo);
    });

    try {
      const token = localStorage.getItem("token");
      await api.post('/card', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Inclui o token JWT para o decorator @jwt_required() do backend
        }
      });
      alert("Cartão criado com sucesso!");
      
      // Limpa os campos do formulário do Card
      setCardTitle("");
      setCardDescription("");
      setCardProgress(0);
      setCardDueDate("");
      setCardDifficulty(1);
      setCardWorkload(1);
      setCardKanbanId("");
      setCardResponsaveis("");
      setCardImages([]);
      setCardFiles([]);
      getCardsFromApi(); // Atualiza a lista
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao criar o Cartão.");
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

      getKanbansFromApi();
      getCardsFromApi();
      
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

            <button onClick={() => navigate("/monitoring")}>
              <i className="fa-solid fa-eye"></i>
            </button>

            <button onClick={() => navigate("/chat/gestor")}>
              <i className="fa-solid fa-comment-dots"></i>
            </button>

            <button className='active'>
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

      <div className="layout5">
        
        {/* PARTE ESQUERDA: CRIAÇÃO DO KANBAN */}
        <section className="container-create-kanban">
          <h2 className="title-section">Nova Coluna Kanban</h2>
          <form onSubmit={handleCreateKanban} className="form-create">
            <div className="input-group">
              <label htmlFor="kanbanName">Nome da Coluna</label>
              <input 
                type="text" 
                id="kanbanName" 
                placeholder="Ex: Em Andamento" 
                value={kanbanName}
                onChange={(e) => setKanbanName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="kanbanColor">Cor de Destaque</label>
              <input 
                type="color" 
                id="kanbanColor" 
                value={kanbanColor}
                onChange={(e) => setKanbanColor(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit">Criar Coluna</button>
          </form>
        </section>

        {/* PARTE DIREITA: CRIAÇÃO DO CARTÃO (CARD) */}
        <section className="container-create-card">
          <h2 className="title-section">Novo Cartão de Tarefa</h2>
          <form onSubmit={handleCreateCard} className="form-create">
            
            <div className="input-group">
              <label htmlFor="cardTitle">Título</label>
              <input 
                type="text" 
                id="cardTitle" 
                placeholder="Nome da atividade"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="cardDescription">Descrição</label>
              <textarea 
                id="cardDescription" 
                placeholder="Detalhes da tarefa..."
                value={cardDescription}
                onChange={(e) => setCardDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="row">
              <div className="input-group">
                <label htmlFor="cardKanban">Coluna Kanban</label>
                <select 
                  id="cardKanban"
                  value={cardKanbanId}
                  onChange={(e) => setCardKanbanId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma coluna</option>
                  {kanbans.map(k => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="cardDueDate">Prazo de Entrega</label>
                <input 
                  type="date" 
                  id="cardDueDate" 
                  value={cardDueDate}
                  onChange={(e) => setCardDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="row-three">
              <div className="input-group">
                <label htmlFor="cardProgress">Progresso (%)</label>
                <input 
                  type="number" 
                  id="cardProgress" 
                  min="0" 
                  max="100" 
                  value={cardProgress}
                  onChange={(e) => setCardProgress(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="cardDifficulty">Dificuldade (1-5)</label>
                <input 
                  type="number" 
                  id="cardDifficulty" 
                  min="1" 
                  max="5" 
                  value={cardDifficulty}
                  onChange={(e) => setCardDifficulty(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="cardWorkload">Carga (1-5)</label>
                <input 
                  type="number" 
                  id="cardWorkload" 
                  min="1" 
                  max="5" 
                  value={cardWorkload}
                  onChange={(e) => setCardWorkload(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="cardResponsaveis">IDs dos Responsáveis (separados por vírgula)</label>
              <input 
                type="text" 
                id="cardResponsaveis" 
                placeholder="Ex: 2, 5, 8"
                value={cardResponsaveis}
                onChange={(e) => setCardResponsaveis(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="cardImages">Imagens explicativas</label>
              <input 
                type="file" 
                id="cardImages" 
                multiple 
                accept="image/*"
                onChange={(e) => setCardImages(e.target.files)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="cardFiles">Documentos e Arquivos</label>
              <input 
                type="file" 
                id="cardFiles" 
                multiple 
                onChange={(e) => setCardFiles(e.target.files)}
              />
            </div>

            <button type="submit" className="btn-submit">Criar Cartão</button>
          </form>
        </section>

      </div>
    </div>
  );
}