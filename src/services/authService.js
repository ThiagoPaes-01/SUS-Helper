import { supabase } from "./supabaseClient";

// Cadastro
export async function signUp({ full_name, email, password, cns, birth_date }) {
  // 1. Cria o usuário no auth
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw new Error(authError.message);

  const userId = data.user.id;

  // 2. Insere o perfil na tabela profiles
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: full_name.trim(),
    cns: cns || null,
    birth_date: birth_date ? birth_date.split("/").reverse().join("-") : null,
  });
  if (profileError) throw new Error(profileError.message);

  // 3. Abre a sessão imediatamente (sem esperar confirmação de e-mail)
  //    Isso funciona porque no Supabase Dashboard > Auth > Settings
  //    "Enable email confirmations" deve estar DESLIGADO para ambiente local.
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (loginError) throw new Error(loginError.message);

  return data.user;
}

// Login
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Loga o erro real no console para facilitar o debug
    console.error("[signIn] erro:", error.message);
  }
  return !error;
}

// Busca o perfil do usuário logado
export async function getUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, cns")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);

  const firstName = data.full_name.split(" ")[0];
  const initials = firstName[0].toUpperCase();

  return {
    name: firstName,
    initials: initials,
    cnsNumber: data.cns ?? "-",
    cnsName: data.full_name.toUpperCase(),
  };
}

// Sair
export async function signOut() {
  await supabase.auth.signOut();
}  