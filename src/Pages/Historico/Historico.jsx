import { useState, useEffect } from "react";
import styles from "./Historico.module.css";
import { supabase } from "../../services/supabaseClient";

// ─── Config por tipo ──────────────────────────────────────────────────────────
const TIPO_CONFIG = {
  consulta:    { icon: "🩺", label: "Consulta",    cor: { bg: "#E8F5EE", color: "#1B6B3A" } },
  exame:       { icon: "🔬", label: "Exame",       cor: { bg: "#EEF2FF", color: "#3730A3" } },
  vacina:      { icon: "💉", label: "Vacina",      cor: { bg: "#FEF3C7", color: "#92400E" } },
  medicamento: { icon: "💊", label: "Medicamento", cor: { bg: "#FEE2E2", color: "#991B1B" } },
};

const FILTROS = [
  { id: "todos",       label: "Todos"        },
  { id: "consulta",    label: "Consultas"    },
  { id: "exame",       label: "Exames"       },
  { id: "vacina",      label: "Vacinas"      },
  { id: "medicamento", label: "Medicamentos" },
];

// ─── Campos do formulário por tipo ────────────────────────────────────────────
const CAMPOS = {
  consulta: [
    { key: "data",     label: "Data",         type: "date",   required: true  },
    { key: "doctor",   label: "Médico(a)",    type: "text",   placeholder: "Dr(a). Ana Paula" },
    { key: "location", label: "Local (UBS)",  type: "text",   placeholder: "UBS Vila Madalena" },
    { key: "notes",    label: "Observações",  type: "textarea", placeholder: "Retorno em 30 dias..." },
  ],
  exame: [
    { key: "data",     label: "Data",         type: "date",   required: true  },
    { key: "name",     label: "Nome do exame",type: "text",   required: true, placeholder: "Hemograma completo" },
    { key: "location", label: "Local",        type: "text",   placeholder: "Laboratório Central SUS" },
    { key: "result",   label: "Resultado",    type: "textarea", placeholder: "Normal, sem alterações..." },
    { key: "status",   label: "Status",       type: "select", options: ["concluido", "aguardando"] },
  ],
  vacina: [
    { key: "data",     label: "Data",         type: "date",   required: true  },
    { key: "name",     label: "Nome da vacina",type: "text",  required: true, placeholder: "Gripe, COVID-19..." },
    { key: "location", label: "Local",        type: "text",   placeholder: "UBS Vila Madalena" },
  ],
  medicamento: [
    { key: "name",     label: "Medicamento",  type: "text",   required: true, placeholder: "Dorflex, Losartana..." },
    { key: "dosage",   label: "Dosagem",      type: "text",   placeholder: "500mg, 1 comprimido" },
    { key: "frequency",label: "Frequência",   type: "text",   placeholder: "2x ao dia, em jejum..." },
  ],
};

function formatarData(dataStr) {
  if (!dataStr) return "-";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function agruparPorMes(itens) {
  const grupos = {};
  itens.forEach(item => {
    const d = new Date(item.data + "T00:00:00");
    const chave = d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(item);
  });
  return grupos;
}

// ─── Modal de cadastro ────────────────────────────────────────────────────────
function ModalCadastro({ onClose, onSalvo }) {
  const [tipo, setTipo]       = useState("consulta");
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSalvar = async () => {
    // Valida campos obrigatórios
    const obrigatorios = CAMPOS[tipo].filter(c => c.required);
    for (const c of obrigatorios) {
      if (!form[c.key]?.trim()) { setErro(`O campo "${c.label}" é obrigatório.`); return; }
    }
    setErro("");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const tabela = { consulta: "consultations", exame: "exams", vacina: "vaccines", medicamento: "medications" }[tipo];
      const payload = { ...form, user_id: user.id };
      const { error } = await supabase.from(tabela).insert(payload);
      if (error) throw new Error(error.message);
      onSalvo();
      onClose();
    } catch (err) {
      setErro(err.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Cabeçalho */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Novo registro</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* Seletor de tipo */}
        <div className={styles.tipoGrid}>
          {Object.entries(TIPO_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`${styles.tipoBtn} ${tipo === key ? styles.tipoBtnAtivo : ""}`}
              onClick={() => { setTipo(key); setForm({}); setErro(""); }}
            >
              <span className={styles.tipoIcon}>{cfg.icon}</span>
              <span className={styles.tipoLabel}>{cfg.label}</span>
            </button>
          ))}
        </div>

        {/* Formulário dinâmico */}
        <div className={styles.modalForm}>
          {CAMPOS[tipo].map(campo => (
            <div key={campo.key} className={styles.field}>
              <label className={styles.fieldLabel}>
                {campo.label}
                {campo.required && <span className={styles.fieldRequired}> *</span>}
              </label>

              {campo.type === "textarea" ? (
                <textarea
                  className={styles.textarea}
                  placeholder={campo.placeholder}
                  value={form[campo.key] ?? ""}
                  onChange={set(campo.key)}
                  rows={3}
                />
              ) : campo.type === "select" ? (
                <select className={styles.select} value={form[campo.key] ?? "concluido"} onChange={set(campo.key)}>
                  {campo.options.map(o => (
                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type={campo.type}
                  placeholder={campo.placeholder}
                  value={form[campo.key] ?? ""}
                  onChange={set(campo.key)}
                />
              )}
            </div>
          ))}

          {erro && <div className={styles.erroModal}>⚠️ {erro}</div>}

          <button className={styles.salvarBtn} onClick={handleSalvar} disabled={loading}>
            {loading ? "Salvando..." : `Salvar ${TIPO_CONFIG[tipo].label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card da timeline ─────────────────────────────────────────────────────────
function CardItem({ item }) {
  const cfg = TIPO_CONFIG[item.tipo];
  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.cardIconBox} style={{ background: cfg.cor.bg }}>
          <span className={styles.cardIcon}>{cfg.icon}</span>
        </div>
        <div className={styles.cardLine} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitulo}>{item.titulo}</span>
          <span className={styles.cardTag} style={{ background: cfg.cor.bg, color: cfg.cor.color }}>
            {cfg.label}
          </span>
        </div>
        {item.subtitulo ? <div className={styles.cardSub}>📍 {item.subtitulo}</div> : null}
        {item.extra     ? <div className={styles.cardExtra}>{item.extra}</div>       : null}
        {item.status    ? (
          <span className={`${styles.cardStatus} ${item.status === "aguardando" ? styles.cardStatusAguardando : styles.cardStatusConcluido}`}>
            {item.status === "aguardando" ? "⏳ Aguardando" : "✅ Concluído"}
          </span>
        ) : null}
        {item.data && <div className={styles.cardData}>{formatarData(item.data)}</div>}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function Historico({ onBack }) {
  const [itens, setItens]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState("");
  const [filtro, setFiltro]     = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");
      const uid = user.id;

      const [consultas, exames, vacinas, medicamentos] = await Promise.all([
        supabase.from("consultations").select("*").eq("user_id", uid).order("data", { ascending: false }),
        supabase.from("exams").select("*").eq("user_id", uid).order("data", { ascending: false }),
        supabase.from("vaccines").select("*").eq("user_id", uid).order("data", { ascending: false }),
        supabase.from("medications").select("*").eq("user_id", uid),
      ]);

      const lista = [
        ...(consultas.data ?? []).map(c => ({
          id: c.id, tipo: "consulta", data: c.data,
          titulo: c.doctor ? `Dr(a). ${c.doctor}` : "Consulta médica",
          subtitulo: c.location ?? "", extra: c.notes ?? "",
        })),
        ...(exames.data ?? []).map(e => ({
          id: e.id, tipo: "exame", data: e.data,
          titulo: e.name, subtitulo: e.location ?? "",
          status: e.status, extra: e.result ?? "",
        })),
        ...(vacinas.data ?? []).map(v => ({
          id: v.id, tipo: "vacina", data: v.data,
          titulo: v.name, subtitulo: v.location ?? "",
        })),
        ...(medicamentos.data ?? []).map(m => ({
          id: m.id, tipo: "medicamento", data: null,
          titulo: m.name, subtitulo: m.dosage ?? "", extra: m.frequency ?? "",
        })),
      ];

      lista.sort((a, b) => {
        if (!a.data) return 1;
        if (!b.data) return -1;
        return new Date(b.data) - new Date(a.data);
      });

      setItens(lista);
    } catch (err) {
      setErro(err.message ?? "Erro ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  };

  const itensFiltrados = filtro === "todos" ? itens : itens.filter(i => i.tipo === filtro);
  const counts = {
    consulta:    itens.filter(i => i.tipo === "consulta").length,
    exame:       itens.filter(i => i.tipo === "exame").length,
    vacina:      itens.filter(i => i.tipo === "vacina").length,
    medicamento: itens.filter(i => i.tipo === "medicamento").length,
  };

  const grupos  = agruparPorMes(itensFiltrados.filter(i => i.data));
  const semData = itensFiltrados.filter(i => !i.data);

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>←</button>
        <div className={styles.headerText}>
          <h1 className={styles.headerTitle}>📋 Meu histórico</h1>
          <p className={styles.headerSub}>Consultas, exames e vacinas</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {Object.entries(counts).map(([tipo, total]) => {
          const cfg = TIPO_CONFIG[tipo];
          return (
            <button key={tipo}
              className={`${styles.statCard} ${filtro === tipo ? styles.statCardAtivo : ""}`}
              onClick={() => setFiltro(filtro === tipo ? "todos" : tipo)}
            >
              <span className={styles.statIcon}>{cfg.icon}</span>
              <span className={styles.statNum}>{total}</span>
              <span className={styles.statLabel}>{cfg.label}s</span>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {FILTROS.map(f => (
          <button key={f.id}
            className={`${styles.filtroBtn} ${filtro === f.id ? styles.filtroBtnAtivo : ""}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className={styles.body}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <span>Carregando histórico...</span>
          </div>
        )}

        {erro && <div className={styles.erro}>⚠️ {erro}</div>}

        {!loading && !erro && itensFiltrados.length === 0 && (
          <div className={styles.vazio}>
            <span className={styles.vazioIcon}>📭</span>
            <p className={styles.vazioText}>Nenhum registro ainda.</p>
            <p className={styles.vazioSub}>Toque no botão + para adicionar seu primeiro registro.</p>
          </div>
        )}

        {!loading && Object.entries(grupos).map(([mes, registros]) => (
          <div key={mes} className={styles.grupo}>
            <div className={styles.grupoLabel}>{mes.charAt(0).toUpperCase() + mes.slice(1)}</div>
            {registros.map(item => <CardItem key={item.id} item={item} />)}
          </div>
        ))}

        {!loading && semData.length > 0 && (filtro === "todos" || filtro === "medicamento") && (
          <div className={styles.grupo}>
            <div className={styles.grupoLabel}>Medicamentos em uso</div>
            {semData.map(item => <CardItem key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Botão flutuante + */}
      <button className={styles.fab} onClick={() => setModalAberto(true)} title="Novo registro">
        +
      </button>

      {/* Modal */}
      {modalAberto && (
        <ModalCadastro
          onClose={() => setModalAberto(false)}
          onSalvo={carregarDados}
        />
      )}
    </div>
  );
}