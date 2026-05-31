import { useState, useEffect } from "react";
import { Login, SuccessScreen } from "./Pages/Login/Login.jsx";
import { Cadastro } from "./Pages/Cadastro/Cadastro.jsx";
import { Menu } from "./Pages/Menu/Menu.jsx";
import {
  signIn,
  signUp,
  signOut,
  getUserProfile,
} from "./services/authService.js";

// Páginas "login" | "cadastro" | "successLogin" | "successCadastro" | "menu"

export function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // ─── Ao abrir o app, verifica se já tem sessão ativa ───────────────────────
  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile) {
        setUser(profile);
        setPage("menu");
      }
    });
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    const ok = await signIn(email, password);
    if (ok) {
      const profile = await getUserProfile();
      setUser(profile);
      setPage("successLogin");
    }
    return ok;
  };

  // ─── Cadastro ──────────────────────────────────────────────────────────────
  const handleCadastro = async (formData) => {
    await signUp(formData);
    const profile = await getUserProfile();
    setUser(profile);
    setPage("successCadastro");
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setPage("login");
  };

  // ─── Renderização ──────────────────────────────────────────────────────────
  if (page === "login")
    return (
      <Login
        onLogin={handleLogin}
        onSuccess={() => setPage("successLogin")}
        onCadastro={() => setPage("cadastro")}
      />
    );

  if (page === "cadastro")
    return (
      <Cadastro onCadastro={handleCadastro} onLogin={() => setPage("login")} />
    );

  if (page === "successLogin")
    return <SuccessScreen type="login" onContinue={() => setPage("menu")} />;

  if (page === "successCadastro")
    return <SuccessScreen type="cadastro" onContinue={() => setPage("menu")} />;

  if (page === "menu") {
    if (!user) return <div>Carregando...</div>;
    return (
      <Menu
        user={user}
        activeNav="inicio"
        onNavChange={(id) => console.log("nav:", id)}
        onActionPress={(id) => console.log("acao:", id)}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
