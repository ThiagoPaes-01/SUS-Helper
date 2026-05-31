import { useState } from "react";
import styles from "./Cadastro.module.css";

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
          className={[styles.input, isPassword ? styles.inputWithIcon : "", error ? styles.inputError : ""].join(" ")}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPass(v => !v)} className={styles.eyeButton}>
            <EyeIcon open={showPass} />
          </button>
        )}
      </div>
      {hint && !error && <span className={styles.inputHint}>{hint}</span>}
      {error && <span className={styles.inputErrorText}>{error}</span>}
    </div>
  );
}

const maskCNS = v =>
  v.replace(/\D/g, "").slice(0, 15)
   .replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4")
   .trim();

const maskDate = v =>
  v.replace(/\D/g, "").slice(0, 8)
   .replace(/(\d{2})(\d{2})(\d{0,4})/, (_, a, b, c) =>
     c ? `${a}/${b}/${c}` : b ? `${a}/${b}` : a
   );

export function Cadastro({ onCadastro, onLogin }) {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ full_name: "", email: "", password: "", confirm: "", cns: "", birth_date: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e = {};
    if (!form.full_name.trim() || form.full_name.trim().split(" ").length < 2) e.full_name = "Informe nome e sobrenome";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "E-mail inválido";
    if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (form.password !== form.confirm) e.confirm = "As senhas não coincidem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.birth_date.replace(/\D/g, "").length < 8) e.birth_date = "Data inválida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    setApiError("");
    try {
      await onCadastro({
        full_name:  form.full_name,
        email:      form.email,
        password:   form.password,
        cns:        form.cns,
        birth_date: form.birth_date,
      });
    } catch (err) {
      setApiError(err.message ?? "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const score = [
    form.password.length >= 8,
    /[A-Z]/.test(form.password),
    /[0-9]/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password),
  ].filter(Boolean).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerBrand}>
          <div className={styles.headerBrandIcon}>🏥</div>
          <span className={styles.headerBrandName}>SUS-Helper</span>
        </div>
        <h1 className={styles.headerTitle}>{step === 1 ? "Criar conta" : "Seus dados"}</h1>
        <p className={styles.headerSubtitle}>{step === 1 ? "Passo 1 de 2 — Dados de acesso" : "Passo 2 de 2 — Dados de saúde"}</p>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>
      </div>

      <div className={styles.form}>
        {step === 1 ? (
          <>
            <Input label="Nome completo" value={form.full_name} onChange={set("full_name")} placeholder="Maria Aparecida Silva" error={errors.full_name} />
            <Input label="E-mail" type="email" value={form.email} onChange={set("email")} placeholder="seu@email.com" error={errors.email} />
            <Input label="Senha" type="password" value={form.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" error={errors.password} hint="Use letras, números e símbolos" />
            <Input label="Confirmar senha" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repita a senha" error={errors.confirm} />
            {form.password.length > 0 && (
              <div>
                <div className={styles.strengthTrack}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={[styles.strengthBar, i <= score ? score <= 2 ? styles.strengthBarWeak : styles.strengthBarFilled : styles.strengthBarEmpty].join(" ")} />
                  ))}
                </div>
                <span className={styles.strengthLabel}>{score <= 2 ? "Senha fraca" : "Senha forte"}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.cnsCard}>
              <div className={styles.cnsCardLabel}>CARTÃO NACIONAL DE SAÚDE</div>
              <div className={styles.cnsCardNumber}>{form.cns || "_ _ _   _ _ _ _   _ _ _ _   _ _ _ _"}</div>
              <div className={styles.cnsCardName}>{form.full_name.toUpperCase() || "SEU NOME AQUI"}</div>
            </div>
            <Input label="CNS — Cartão Nacional de Saúde" value={form.cns} onChange={set("cns")} placeholder="000 0000 0000 0000" error={errors.cns} hint="Opcional — você pode adicionar depois" mask={maskCNS} />
            <Input label="Data de nascimento" value={form.birth_date} onChange={set("birth_date")} placeholder="DD/MM/AAAA" error={errors.birth_date} mask={maskDate} />
            {apiError && (
              <div className={styles.apiErrorBox}>
                <span>⚠️</span>
                <span className={styles.apiErrorText}>{apiError}</span>
              </div>
            )}
            <div className={styles.lgpdBox}>
              <span className={styles.lgpdIcon}>🔒</span>
              <p className={styles.lgpdText}>Seus dados são protegidos pela LGPD e armazenados com criptografia. Nunca compartilhamos informações com terceiros.</p>
            </div>
          </>
        )}

        <button className={styles.submitButton} onClick={step === 1 ? handleNext : handleSubmit} disabled={loading}>
          {loading ? "Criando conta..." : step === 1 ? "Continuar →" : "Criar minha conta"}
        </button>

        {step === 2 && (
          <button className={styles.backButton} onClick={() => setStep(1)}>← Voltar</button>
        )}

        <p className={styles.loginText}>
          Já tem conta?{" "}
          <button className={styles.loginLink} onClick={onLogin}>Entrar</button>
        </p>
      </div>
    </div>
  );
}