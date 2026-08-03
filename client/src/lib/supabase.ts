import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

let client: SupabaseClient | null = null;
let sessionInitialization: Promise<User> | null = null;

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new SupabaseConfigurationError(
      "Configurazione Supabase incompleta: valorizza VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  client ??= createClient(supabaseUrl, supabasePublishableKey);
  return client;
}

export async function ensureAnonymousSession(): Promise<User> {
  if (!sessionInitialization) {
    sessionInitialization = initializeAnonymousSession();
  }

  try {
    return await sessionInitialization;
  } catch (error) {
    // Consente all'interfaccia di eseguire un nuovo tentativo dopo un errore.
    sessionInitialization = null;
    throw error;
  }
}

async function initializeAnonymousSession(): Promise<User> {
  const supabase = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Impossibile recuperare la sessione Supabase: ${sessionError.message}`);
  }

  if (sessionData.session?.user) {
    return sessionData.session.user;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();

  if (signInError) {
    throw new Error(`Impossibile creare la sessione anonima Supabase: ${signInError.message}`);
  }

  if (!signInData.session?.user) {
    throw new Error("Supabase non ha restituito un utente per la sessione anonima.");
  }

  return signInData.session.user;
}
