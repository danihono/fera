// Na web não tem notificação agendada (o navegador só avisa com a aba aberta): os lembretes são do app do celular.
export const notificacoesDisponiveis = false;
export const permitirNotificacoes = async (_pedir: boolean) => false;
export const reagendar = async () => {};
export const iniciarLembretes = () => () => {};
export const useAbrirPelaNotificacao = () => {};
