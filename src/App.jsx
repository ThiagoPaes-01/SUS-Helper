import { useState, useEffect } from "react";
import { Login }    from "./Pages/Login/Login.jsx";
import { Cadastro } from "./Pages/Cadastro/Cadastro.jsx";
import { Menu }     from "./Pages/Menu/Menu.jsx";
import { MapPosto } from "./Pages/MapPosto/MapPosto.jsx";
import { Historico } from "./Pages/Historico/Historico.jsx";
import { signIn, signUp, signOut, getUserProfile } from "./services/authService.js";

// Páginas: "login" | "cadastro" | "menu" | "postos" | "historico"

export function App() {
  const [page, setPage]           = useState("login");
  const [user, setUser]           = useState(null);
  const [activeNav, setActiveNav] = useState("inicio");

  // Verifica sessão ativa ao abrir o app
  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) { setUser(profile); setPage("menu"); }
    });
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    const ok = await signIn(email, password);
    if (ok) {
      const profile = await getUserProfile();
      setUser(profile);
      setPage("menu"); // vai direto para o menu
    }
    return ok;
  };

  // ── Cadastro ───────────────────────────────────────────────────────────────
  const handleCadastro = async (formData) => {
    await signUp(formData);
    const profile = await getUserProfile();
    setUser(profile);
    setPage("menu"); // vai direto para o menu
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setActiveNav("inicio");
    setPage("login");
  };

  // ── Navegação ──────────────────────────────────────────────────────────────
  const handleNavChange = (id) => {
    setActiveNav(id);
    if (id === "postos")    { setPage("postos");    return; }
    if (id === "historico") { setPage("historico"); return; }
    setPage("menu");
  };

  const voltarParaMenu = () => { setActiveNav("inicio"); setPage("menu"); };

  // ── Renderização ───────────────────────────────────────────────────────────
  if (page === "login")
    return (
      <Login
        onLogin={handleLogin}
        onCadastro={() => setPage("cadastro")}
      />
    );

  if (page === "cadastro")
    return (
      <Cadastro
        onCadastro={handleCadastro}
        onLogin={() => setPage("login")}
      />
    );

  if (page === "postos")
    return <MapPosto onBack={voltarParaMenu} />;

  if (page === "historico")
    return <Historico onBack={voltarParaMenu} />;

  if (page === "menu") {
    if (!user) return <div>Carregando...</div>;
    return (
      <Menu
        user={user}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onActionPress={(id) => {
          if (id === 3) handleNavChange("postos");    // Encontrar posto
          if (id === 1) handleNavChange("historico"); // Marcar consulta
          if (id === 2) handleNavChange("historico"); // Ver exames
        }}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}