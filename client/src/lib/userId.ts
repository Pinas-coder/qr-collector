// Genera e persiste un ID utente anonimo in localStorage.
// Non è autenticazione vera (nessuna password, nessun account), ma permette
// di distinguere le scansioni di persone diverse invece di condividerle tutte
// sotto un unico "anon" globale.

const STORAGE_KEY = "qr-collector:userId";

export function getUserId(): string {
let id = localStorage.getItem(STORAGE_KEY);
if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
}
return id;
}