import { useState, useEffect } from "react";
import { Login, SuccessScreen } from "./Pages/Login/Login.jsx";
import { Cadastro }             from "./Pages/Cadastro/Cadastro.jsx";
import { Menu }                 from "./Pages/Menu/Menu.jsx";
import { MapPosto }             from "./Pages/MapPosto/MapPosto.jsx";
import { signIn, signUp, signOut, getUserProfile } from "./services/authService.js";

// Páginas: "login" | "cadastro" | "successLogin" | "successCadastro" | "menu" | "postos"

export function App() {
  const [page, setPage]   = useState("login");
  const [user, setUser]   = useState(null);
  const [activeNav, setActiveNav] = useState("inicio");

  // Verifica sessão ativa ao abrir o app
  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) { setUser(profile); setPage("menu"); }
    });
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    const ok = await signIn(email, password);
    if (ok) {
      const profile = await getUserProfile();
      setUser(profile);
      setPage("successLogin");
    }
    return ok;
  };

  const handleCadastro = async (formData) => {
    await signUp(formData);
    const profile = await getUserProfile();
    setUser(profile);
    setPage("successCadastro");
  };

  // Botão Sair — limpa sessão e volta para login
  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setActiveNav("inicio");
    setPage("login");
  };

  // ── Navegação da navbar ─────────────────────────────────────────────────────
  const handleNavChange = (id) => {
    setActiveNav(id);
    if (id === "postos") { setPage("postos"); return; }
    setPage("menu"); 
  };

  // ── Renderização ────────────────────────────────────────────────────────────
  if (page === "login")
    return <Login onLogin={handleLogin} onSuccess={() => setPage("successLogin")} onCadastro={() => setPage("cadastro")} />;

  if (page === "cadastro")
    return <Cadastro onCadastro={handleCadastro} onLogin={() => setPage("login")} />;

  if (page === "successLogin")
    return <SuccessScreen type="login" onContinue={() => setPage("menu")} />;

  if (page === "successCadastro")
    return <SuccessScreen type="cadastro" onContinue={() => setPage("menu")} />;

  if (page === "postos")
    return <MapPosto onBack={() => { setActiveNav("inicio"); setPage("menu"); }} />;

  if (page === "menu") {
    if (!user) return <div>Carregando...</div>;
    return (
      <Menu
        user={user}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onActionPress={(id) => console.log("acao:", id)}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}