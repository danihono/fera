// Links que a gente manda pros outros (convite de turma). Vão pro site no Firebase Hosting (app na raiz);
// dá pra trocar com EXPO_PUBLIC_SITE_URL. No celular com o app instalado, fera://turma?codigo=… abre direto.
const PROJETO = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const SITE = (process.env.EXPO_PUBLIC_SITE_URL || (PROJETO ? `https://${PROJETO}.web.app` : 'https://danihono.github.io/fera/app')).replace(/\/$/, '');

export const linkDaTurma = (codigo: string) => `${SITE}/turma?codigo=${encodeURIComponent(codigo)}`;
