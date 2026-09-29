// Termos de uso e Política de privacidade. VERSÃO PRELIMINAR: escrita pra mostrar como o app fica e cobrir o que
// ele faz hoje. Antes de publicar nas lojas, revisar com um advogado e trocar os campos entre colchetes.

export type DocLegal = {
  titulo: string;
  atualizado: string;
  intro: string;
  secoes: { titulo: string; paragrafos: string[] }[];
};

const CONTATO = 'privacidade@fera.app';
const ATUALIZADO = '29 de setembro de 2026';

export const LEGAL: Record<'termos' | 'privacidade', DocLegal> = {
  termos: {
    titulo: 'Termos de uso',
    atualizado: ATUALIZADO,
    intro:
      'Estes termos explicam as regras pra usar o Fera, o app de estudos com o Rugi. Ao usar o app, você concorda com eles. Se você tem menos de 18 anos, seu pai, mãe ou responsável também precisa concordar.',
    secoes: [
      {
        titulo: '1. Quem somos',
        paragrafos: ['O Fera é oferecido por [Razão social], CNPJ [número], com sede em [endereço] ("Fera", "nós"). Fale com a gente em ajuda@fera.app.'],
      },
      {
        titulo: '2. O que o Fera faz',
        paragrafos: [
          'Você manda o conteúdo da sua prova (fotos do caderno, PDFs, documentos, slides, áudios e outros arquivos) e o Fera usa inteligência artificial pra montar missões, resumos, explicações e outros materiais de estudo.',
          'O Fera é uma ferramenta de apoio. Ele não substitui a escola, o professor nem o material oficial da sua turma.',
        ],
      },
      {
        titulo: '3. Conta',
        paragrafos: [
          'Dá pra usar o Fera sem conta: o progresso fica no aparelho e numa cópia na nuvem ligada a ele. Criando uma conta com e-mail e senha, o progresso fica salvo mesmo se você trocar de celular.',
          'Você é responsável por manter sua senha em segredo e pelo que acontece na sua conta. Se achar que alguém entrou nela, troque a senha e avise a gente.',
        ],
      },
      {
        titulo: '4. O conteúdo que você manda',
        paragrafos: [
          'O conteúdo continua sendo seu. Você nos dá permissão só pra processar esse conteúdo (inclusive com os provedores de IA descritos na Política de privacidade) e gerar seus materiais de estudo.',
          'Mande só o que você tem direito de usar pra estudar. Não mande conteúdo ilegal, ofensivo, com dados pessoais de outras pessoas ou que viole direitos autorais de forma que a lei não permita.',
        ],
      },
      {
        titulo: '5. Inteligência artificial pode errar',
        paragrafos: [
          'Os materiais são gerados automaticamente e passam por uma conferência também automática, mas podem ter erros, principalmente se a foto estiver ilegível. Na dúvida, confira com o seu material e com o seu professor. Se achar um erro, reporte em Ajuda.',
        ],
      },
      {
        titulo: '6. Turmas',
        paragrafos: [
          'Nas turmas, quem tem o código vê seu nome (ou apelido), sua foto de perfil, se tiver, e seu XP no ranking. Use um nome que você não se importe de mostrar. Não use as turmas pra ofender ou expor ninguém.',
        ],
      },
      {
        titulo: '7. Fera+ (assinatura)',
        paragrafos: [
          'O Fera+ é uma assinatura paga, cobrada pela loja do seu celular (App Store ou Google Play), que renova automaticamente até você cancelar. Preço, período de teste e renovação aparecem antes da compra.',
          'Pra cancelar, use os ajustes de assinatura da loja. Excluir a conta ou apagar o app não cancela a cobrança. Reembolsos seguem as regras da loja e o Código de Defesa do Consumidor.',
        ],
      },
      {
        titulo: '8. Uso correto',
        paragrafos: [
          'Não tente invadir, copiar em massa, fazer engenharia reversa ou sobrecarregar o app, nem usar o Fera pra colar em provas quando isso for proibido pela sua escola.',
          'Podemos suspender contas que descumprirem estes termos, avisando sempre que possível.',
        ],
      },
      {
        titulo: '9. Mudanças e encerramento',
        paragrafos: [
          'Podemos mudar o app e estes termos. Se a mudança for importante, avisamos no app antes de ela valer. Você pode parar de usar e excluir sua conta quando quiser, em Minha conta → Excluir conta.',
        ],
      },
      {
        titulo: '10. Lei e foro',
        paragrafos: ['Estes termos seguem as leis do Brasil. Fica eleito o foro do domicílio do usuário consumidor.'],
      },
    ],
  },
  privacidade: {
    titulo: 'Política de privacidade',
    atualizado: ATUALIZADO,
    intro:
      'Aqui explicamos quais dados o Fera usa, pra quê, com quem compartilha e como você controla tudo isso, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).',
    secoes: [
      {
        titulo: '1. Controlador',
        paragrafos: [`[Razão social], CNPJ [número], é o controlador dos seus dados. Encarregado (DPO): [nome], ${CONTATO}.`],
      },
      {
        titulo: '2. Dados que usamos',
        paragrafos: [
          'Conta: e-mail e senha (a senha fica guardada de forma criptografada pelo Firebase Authentication, do Google; nós não temos acesso a ela). Sem conta, usamos um identificador anônimo.',
          'Perfil: nome ou apelido, foto de perfil (se você puser) e ano escolar.',
          'Estudo: provas, matérias, datas, respostas, acertos e erros, XP, sequência, conquistas e turmas.',
          'Conteúdo enviado: fotos, arquivos, áudios e textos que você manda pra montar a prova, e o que a IA gerou a partir deles.',
          'Uso do app: eventos anônimos como "terminou uma missão" ou "gerou uma prova" (Google Analytics, sem o conteúdo das provas). Dá pra desligar em Configurações → Estatísticas de uso.',
          'Questões que você reporta como erradas, pra gente conferir e melhorar a IA.',
          'Não pedimos localização, contatos nem documentos, e não vendemos seus dados.',
        ],
      },
      {
        titulo: '3. Pra que usamos',
        paragrafos: [
          'Montar e mostrar seus materiais e missões, salvar seu progresso, mostrar o ranking da turma, dar suporte, manter o app seguro e melhorar o serviço.',
          'Bases legais: execução do contrato (art. 7º, V), legítimo interesse pra segurança e melhorias (art. 7º, IX) e consentimento quando for o caso, como a foto de perfil (art. 7º, I).',
        ],
      },
      {
        titulo: '4. Inteligência artificial e outros parceiros',
        paragrafos: [
          'Pra gerar os materiais, o conteúdo que você manda é processado por provedores de IA: Google (Gemini), Anthropic (Claude) e OpenAI (ilustrações). Eles recebem só o necessário pra gerar o material e, nos planos de API que usamos, não usam esse conteúdo pra treinar seus modelos.',
          'Os dados ficam no Google Firebase (autenticação, banco de dados e servidores). Alguns desses parceiros ficam fora do Brasil; a transferência internacional segue o art. 33 da LGPD, com cláusulas contratuais de proteção.',
          'Estatísticas de uso vão pro Google Analytics, sem nome, e-mail ou conteúdo das provas.',
          'Pagamentos do Fera+ são feitos pela Apple ou pelo Google; não recebemos dados do seu cartão.',
        ],
      },
      {
        titulo: '5. Quanto tempo guardamos',
        paragrafos: [
          'Enquanto você usar o Fera. Ao excluir a conta, apagamos seus dados da nossa base em até 30 dias, exceto o que a lei mandar guardar por mais tempo. As fotos e arquivos originais que você manda não ficam salvos: depois de lidos pela IA, fica só o que foi gerado.',
        ],
      },
      {
        titulo: '6. Crianças e adolescentes',
        paragrafos: [
          'O Fera é pensado pra estudantes, inclusive menores de idade. Tratamos esses dados no melhor interesse deles (art. 14 da LGPD). Pra menores de 12 anos, o uso precisa do consentimento de um dos pais ou responsável. Responsáveis podem pedir acesso ou exclusão dos dados a qualquer momento.',
        ],
      },
      {
        titulo: '7. Seus direitos',
        paragrafos: [
          'Você pode: confirmar se tratamos seus dados, acessar, corrigir, pedir cópia (portabilidade), pedir a exclusão, revogar consentimentos e saber com quem compartilhamos (art. 18 da LGPD).',
          `Corrigir e excluir dá direto no app, em Minha conta. Pro resto, escreva pra ${CONTATO}. Você também pode reclamar na Autoridade Nacional de Proteção de Dados (ANPD).`,
        ],
      },
      {
        titulo: '8. Segurança',
        paragrafos: [
          'Usamos conexões criptografadas, regras de acesso em que cada pessoa só lê e escreve os próprios dados, e as chaves das IAs ficam só no servidor. Nenhum sistema é 100% seguro: se acontecer um incidente relevante, avisamos você e a ANPD.',
        ],
      },
      {
        titulo: '9. Mudanças',
        paragrafos: ['Se esta política mudar de forma importante, avisamos no app antes. A data da última atualização fica no topo.'],
      },
    ],
  },
};
