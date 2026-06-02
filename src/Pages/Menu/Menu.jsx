import styles from "./Menu.module.css";

// ─── Dados estáticos de UI (não vêm do banco) ─────────────────────────────────
const notifications = [
  { id: 1, icon: "💉", text: "Vacina da gripe disponível na sua UBS",  variant: "yellow" },
  { id: 2, icon: "⏰", text: "Você não visita o médico há 8 meses",    variant: "red"    },
];

const actions = [
  { id: 1, icon: "📅", title: "Marcar consulta",  subtitle: "Agendar atendimento",  color: "Green"  },
  { id: 2, icon: "🔬", title: "Ver exames",        subtitle: "Resultados e pedidos", color: "Blue"   },
  { id: 3, icon: "🗺️", title: "Encontrar posto",   subtitle: "UBS mais próxima",     color: "Yellow" },
  { id: 4, icon: "💊", title: "Meus remédios",     subtitle: "Receitas e lista",     color: "Pink"   },
  { id: 5, icon: "💬", title: "Tirar dúvida",      subtitle: "Assistente SUS",       color: "Purple" },
  { id: 6, icon: "⭐", title: "Avaliar posto",      subtitle: "Sua opinião importa",  color: "Orange" },
];

const navItems = [
  { id: "inicio",    icon: "🏠", label: "Início"    },
  { id: "postos",    icon: "🗺️", label: "Postos"    },  
  { id: "historico", icon: "📋", label: "Histórico" },
  { id: "ajuda",     icon: "💬", label: "Ajuda"     },
  { id: "docs",      icon: "📄", label: "Docs"      },
];

export function Menu({ user, activeNav, onNavChange, onActionPress, onLogout }) {
  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.headerGreeting}>Olá, {user.name} 👋</span>
          <span className={styles.headerQuestion}>O que você precisa hoje?</span>
        </div>

        <div className={styles.headerRight}>
          {/* Avatar */}
          <div className={styles.headerAvatar}>{user.initials}</div>

          {/* Botão Sair */}
          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            title="Sair da conta"
          >
            <span className={styles.logoutLabel}>Sair</span>
          </button>
        </div>
      </div>

      {/* ── Corpo ── */}
      <div className={styles.body}>

        {/* Notificações */}
        <div className={styles.notifications}>
          {notifications.map(n => (
            <div
              key={n.id}
              className={[
                styles.notifCard,
                n.variant === "yellow" ? styles.notifCardYellow : styles.notifCardRed,
              ].join(" ")}
            >
              <span className={styles.notifIcon}>{n.icon}</span>
              <span>{n.text}</span>
            </div>
          ))}
        </div>

        {/* Cartão CNS */}
        <div className={styles.cnsCard}>
          <div className={styles.cnsCardLabel}>CARTÃO NACIONAL DE SAÚDE</div>
          <div className={styles.cnsCardNumber}>{user.cnsNumber}</div>
          <div className={styles.cnsCardName}>{user.cnsName}</div>
        </div>

        {/* Ações rápidas */}
        <span className={styles.sectionTitle}>Ações rápidas</span>

        <div className={styles.actionsGrid}>
          {actions.map(a => (
            <button
              key={a.id}
              className={[styles.actionCard, styles[`actionCard${a.color}`]].join(" ")}
              onClick={() => {
                // Ação "Encontrar posto" vai direto para o MapPosto
                if (a.id === 3) { onNavChange?.("postos"); return; }
                onActionPress?.(a.id);
              }}
            >
              <span className={styles.actionIcon}>{a.icon}</span>
              <span className={styles.actionTitle}>{a.title}</span>
              <span className={styles.actionSubtitle}>{a.subtitle}</span>
            </button>
          ))}
        </div>

      </div>

      {/* ── Navbar inferior ── */}
      <nav className={styles.navbar}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={[
              styles.navItem,
              activeNav === item.id ? styles.navItemActive : "",
            ].join(" ")}
            onClick={() => onNavChange?.(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}