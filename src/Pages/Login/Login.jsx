import { useState } from "react";
import styles from "./Login.module.css";

const SUS_GREEN = "#1B6B3A";

// ─── Ícone de olho (mostrar/ocultar senha) ───────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

// ─── Ícone de sucesso ────────────────────────────────────────────────────────
const CheckCircle = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={SUS_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

// ─── Componente de Input reutilizável ─────────────────────────────────────────
function Input({ label, type = "text", value, onChange, placeholder, error, hint, mask }) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div className={styles.inputWrapper}>
      <label className={styles.inputLabel}>{label}</label>
      <div className={styles.inputContainer}>
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(mask ? mask(e.target.value) : e.target.value)}
          placeholder={placeholder}
          className={[
            styles.input,
            isPassword ? styles.inputWithIcon : "",
            error ? styles.inputError : "",
          ].join(" ")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className={styles.eyeButton}
          >
            <EyeIcon open={showPass} />
          </button>
        )}
      </div>
      {hint && !error && <span className={styles.inputHint}>{hint}</span>}
      {error && <span className={styles.inputErrorText}>{error}</span>}
    </div>
  );
}

// ─── Tela de Sucesso (compartilhada) ─────────────────────────────────────────
export function SuccessScreen({ type, onContinue }) {
  return (
    <div className={styles.successContainer}>
      <div className={styles.successContent}>
        <div className={styles.successIcon}><CheckCircle /></div>
        <h2 className={styles.successTitle}>
          {type === "cadastro" ? "Conta criada!" : "Bem-vindo!"}
        </h2>
        <p className={styles.successText}>
          {type === "cadastro"
            ? "Sua conta foi criada com sucesso. Agora você pode gerenciar sua saúde de forma simples."
            : "Login realizado com sucesso. Acesse seu histórico, postos de saúde e muito mais."}
        </p>
        <button className={styles.successButton} onClick={onContinue}>
          Ir para o início →
        </button>
      </div>
    </div>
  );
}

// ─── Tela de Login ────────────────────────────────────────────────────────────
export function Login({ onSuccess, onCadastro, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setApiError(""); };

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "E-mail inválido";
    if (!form.password) e.password = "Informe sua senha";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    // onLogin recebe email e senha e retorna true/false
    const ok = await onLogin(form.email, form.password);
    setLoading(false);
    if (!ok) {
      setApiError("E-mail ou senha incorretos. Tente novamente.");
      return;
    }
    onSuccess();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLogoBox}>🏥</div>
        <h1 className={styles.headerTitle}>SUS-Helper</h1>
        <p className={styles.headerSubtitle}>Sua saúde, mais simples</p>
      </div>

      {/* Formulário */}
      <div className={styles.form}>
        <h2 className={styles.formTitle}>Bem-vindo de volta 👋</h2>
        <p className={styles.formSubtitle}>Entre com sua conta para continuar</p>

        <Input
          label="E-mail"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="seu@email.com"
          error={errors.email}
        />
        <Input
          label="Senha"
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="Sua senha"
          error={errors.password}
        />

        {apiError && (
          <div className={styles.apiErrorBox}>
            <span>⚠️</span>
            <span className={styles.apiErrorText}>{apiError}</span>
          </div>
        )}

        <div className={styles.forgotWrapper}>
          <button className={styles.forgotButton}>Esqueci minha senha</button>
        </div>

        <button
          className={styles.submitButton}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className={styles.registerText}>
          Não tem conta?{" "}
          <button className={styles.registerLink} onClick={onCadastro}>
            Criar conta grátis
          </button>
        </p>
      </div>
    </div>
  );
}