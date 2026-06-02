import { useState, useEffect } from "react";
import styles from "./MapPosto.module.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// ─── Ícone padrão (fallback) ──────────────────────────────────────────────────
L.Marker.prototype.options.icon = L.icon({
  iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// ─── Ícone do usuário — bolinha verde ────────────────────────────────────────
const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#1B6B3A;border:3px solid white;box-shadow:0 0 0 4px rgba(27,107,58,0.3);"></div>`,
  iconAnchor: [8, 8],
});

// ─── Ícone dos postos — cruz médica ──────────────────────────────────────────
const postoIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#1B6B3A;border:2.5px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
    font-size:15px;line-height:1;">🏥</div>`,
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

// ─── Ajusta zoom para mostrar rota inteira ────────────────────────────────────
function AjustarMapa({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (pontos?.length > 0) map.fitBounds(L.latLngBounds(pontos), { padding: [50, 50] });
  }, [pontos, map]);
  return null;
}

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => { map.setView(coords, 15); }, [coords, map]);
  return null;
}

// ─── Gera postos simulados perto da localização do usuário ───────────────────
// Em produção, aqui viria uma chamada à API da RNDS ou Overpass (OpenStreetMap)
function gerarPostosPerto(lat, lng) {
  return [
    { id: 1, name: "UBS Vila Próxima",  address: "Rua das Flores, 120",   distance: "0,3 km", coords: [lat + 0.003, lng + 0.002], wait: "~20 min", status: "Aberto",     types: ["Consulta", "Vacina", "Exame"] },
    { id: 2, name: "UBS Bairro Centro", address: "Av. Principal, 450",    distance: "0,8 km", coords: [lat - 0.004, lng + 0.005], wait: "~40 min", status: "Aberto",     types: ["Consulta", "Emergência"]      },
    { id: 3, name: "UPA 24h",           address: "Rua da Saúde, 800",     distance: "1,5 km", coords: [lat + 0.006, lng - 0.007], wait: "~1h10",   status: "Aberto 24h", types: ["Emergência", "Exames"]        },
  ];
}

// Postos padrão (SP) usados antes da localização carregar
const POSTOS_PADRAO = gerarPostosPerto(-23.5505, -46.6890);

const tagColor = {
  Consulta:   { bg: "#E8F5EE", color: "#1B6B3A" },
  Vacina:     { bg: "#EEF2FF", color: "#3730A3" },
  Exame:      { bg: "#FEF3C7", color: "#92400E" },
  Emergência: { bg: "#FEE2E2", color: "#991B1B" },
  Exames:     { bg: "#FEF3C7", color: "#92400E" },
};

const waitColor = (wait) => {
  if (wait.includes("20")) return { bg: "#D1FAE5", color: "#065F46" };
  if (wait.includes("40")) return { bg: "#FEF3C7", color: "#92400E" };
  return                          { bg: "#FEE2E2", color: "#991B1B" };
};

// ─── Rota a pé via OSRM ───────────────────────────────────────────────────────
async function buscarRota(origem, destino) {
  const url = `https://router.project-osrm.org/route/v1/foot/` +
    `${origem[1]},${origem[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`;
  const data = await (await fetch(url)).json();
  if (data.code !== "Ok") throw new Error("Rota não encontrada");
  const coords    = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const distancia = (data.routes[0].distance / 1000).toFixed(1);
  const duracao   = Math.round(data.routes[0].duration / 60);
  return { coords, distancia, duracao };
}

export function MapPosto({ onBack }) {
  const [centro, setCentro]           = useState([-23.5505, -46.6890]);
  const [minhaLoc, setMinhaLoc]       = useState(null);
  const [postos, setPostos]           = useState(POSTOS_PADRAO);
  const [locError, setLocError]       = useState("");
  const [busca, setBusca]             = useState("");
  const [mapaAberto, setMapaAberto]   = useState(false);
  const [rotaCoords, setRotaCoords]   = useState(null);
  const [postoAtivo, setPostoAtivo]   = useState(null);
  const [loadingRota, setLoadingRota] = useState(false);
  const [rotaError, setRotaError]     = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setMinhaLoc(loc);
        setCentro(loc);
        // Gera postos simulados ao redor da posição real do usuário
        setPostos(gerarPostosPerto(loc[0], loc[1]));
      },
      () => setLocError("Localização não disponível. Mostrando postos de exemplo.")
    );
  }, []);

  const iniciarCaminhada = async (posto) => {
    if (!minhaLoc) { setRotaError("Ative sua localização para traçar a rota."); return; }
    setLoadingRota(true);
    setRotaError("");
    setRotaCoords(null);
    setPostoAtivo(posto);
    setMapaAberto(true);
    try {
      const rota = await buscarRota(minhaLoc, posto.coords);
      setRotaCoords(rota.coords);
    } catch {
      setRotaError("Não foi possível calcular a rota. Tente novamente.");
    } finally {
      setLoadingRota(false);
    }
  };

  const cancelarRota = () => { setRotaCoords(null); setPostoAtivo(null); setRotaError(""); };
  const voltarParaMim = () => { if (minhaLoc) setCentro([...minhaLoc]); };

  const postosFiltrados = postos.filter(p =>
    p.name.toLowerCase().includes(busca.toLowerCase()) ||
    p.address.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>←</button>
        <div className={styles.headerText}>
          <h1 className={styles.headerTitle}>Postos de saúde</h1>
          <p className={styles.headerSub}>Unidades mais próximas de você</p>
        </div>
      </div>

      <div className={styles.body}>

        {/* ── Mapa ── */}
        <div className={styles.mapWrapper}>
          <MapContainer
            center={centro}
            zoom={15}
            style={{ height: mapaAberto ? "680px" : "400px", borderRadius: "16px", zIndex: 0, transition: "height 0.35s ease" }}
          >
            {rotaCoords  && <AjustarMapa pontos={rotaCoords} />}
            {!rotaCoords && <RecenterMap coords={centro} />}

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />

            {minhaLoc && (
              <Marker position={minhaLoc} icon={userIcon}>
                <Popup>Você está aqui</Popup>
              </Marker>
            )}

            {postos.map(posto => (
              <Marker key={posto.id} position={posto.coords} icon={postoIcon}>
                <Popup>
                  <strong>{posto.name}</strong><br />
                  {posto.address}<br />
                  ⏱ Espera: {posto.wait}
                </Popup>
              </Marker>
            ))}

            {rotaCoords && (
              <Polyline positions={rotaCoords} pathOptions={{ color: "#2563EB", weight: 5, opacity: 0.85 }} />
            )}
          </MapContainer>

          {/* Botões flutuantes */}
          <div className={styles.mapControls}>
            <button className={styles.mapControlBtn} onClick={() => setMapaAberto(v => !v)}>
              {mapaAberto ? "⊖" : "⊕"}
            </button>
            <button className={styles.mapControlBtn} onClick={voltarParaMim} disabled={!minhaLoc} style={{ opacity: minhaLoc ? 1 : 0.4 }}>
              🎯
            </button>
            {rotaCoords && (
              <button className={styles.mapControlBtn} onClick={cancelarRota} title="Cancelar rota" style={{ color: "#EF4444" }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading + erros */}
        {loadingRota && <div className={styles.rotaLoading}>⏳ Calculando rota a pé...</div>}
        {locError    && <div className={styles.locError}>⚠️ {locError}</div>}
        {rotaError   && <div className={styles.locError}>⚠️ {rotaError}</div>}

        {/* ── Busca ── */}
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input className={styles.searchInput} type="text" placeholder="Buscar por nome ou endereço..."
            value={busca} onChange={e => setBusca(e.target.value)} />
          {busca && <button className={styles.clearBtn} onClick={() => setBusca("")}>✕</button>}
        </div>

        <p className={styles.listCount}>{postosFiltrados.length} unidades encontradas</p>

        <div className={styles.list}>
          {postosFiltrados.length === 0 ? (
            <div className={styles.empty}>Nenhum posto encontrado para "{busca}"</div>
          ) : postosFiltrados.map(posto => {
            const wc = waitColor(posto.wait);
            const esteAtivo = postoAtivo?.id === posto.id;
            return (
              <div key={posto.id} className={`${styles.card} ${esteAtivo ? styles.cardAtivo : ""}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardName}>
                      {posto.name}
                      <span className={[styles.cardStatus, posto.status === "Aberto 24h" ? styles.cardStatus24 : styles.cardStatusOpen].join(" ")}>
                        {posto.status}
                      </span>
                    </div>
                    <div className={styles.cardAddress}>{posto.address} · {posto.distance}</div>
                  </div>
                  <div className={styles.waitBadge} style={{ background: wc.bg, color: wc.color }}>
                    ⏱ {posto.wait}
                  </div>
                </div>

                <div className={styles.tags}>
                  {posto.types.map(t => (
                    <span key={t} className={styles.tag} style={{ background: tagColor[t]?.bg, color: tagColor[t]?.color }}>{t}</span>
                  ))}
                </div>

                <div className={styles.cardBtns}>
                  <button className={styles.verMapaBtn} onClick={() => { setCentro([...posto.coords]); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    📌 Ver no mapa
                  </button>
                  <button
                    className={`${styles.caminharBtn} ${esteAtivo ? styles.caminharBtnAtivo : ""}`}
                    onClick={() => esteAtivo ? cancelarRota() : iniciarCaminhada(posto)}
                    disabled={loadingRota}
                  >
                    {esteAtivo ? "✕ Cancelar rota" : " Iniciar Rota"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}