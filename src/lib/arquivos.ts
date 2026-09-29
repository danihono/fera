// Lê qualquer arquivo que o aluno mandar e devolve o que a IA consegue usar.
// JS puro (fflate pra zip): roda igual na web, no celular e nos testes.
//   imagens → foto · PDF → pdf (a IA lê direto) · áudio/vídeo → mídia (o Gemini ouve/assiste)
//   Word, PowerPoint, Excel, OpenDocument, EPUB, HTML, RTF, legendas, txt/md/csv/json → texto extraído
//   .zip → abre e lê cada arquivo de dentro com as mesmas regras
import { strFromU8, unzipSync, type Unzipped } from 'fflate';

export type Categoria = 'imagem' | 'pdf' | 'texto' | 'word' | 'slides' | 'planilha' | 'pagina' | 'ebook' | 'audio' | 'video';

export type ArquivoLido =
  | { tipo: 'imagem'; nome: string; mime: string; bytes: Uint8Array; origem?: string }
  | { tipo: 'pdf'; nome: string; bytes: Uint8Array; origem?: string }
  | { tipo: 'midia'; nome: string; mime: string; bytes: Uint8Array; categoria: 'audio' | 'video'; origem?: string }
  | { tipo: 'texto'; nome: string; texto: string; categoria: Categoria; origem?: string };

export type Ignorado = { nome: string; motivo: string };
export type Leitura = { arquivos: ArquivoLido[]; ignorados: Ignorado[] };

/** Proteções contra zip gigante ou "bomba". */
export const LIMITES = { arquivosNoZip: 200, bytesDescompactados: 150 * 1024 * 1024, profundidade: 2, caracteresPorTexto: 150_000 };

const IMAGENS: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', heic: 'image/heic', heif: 'image/heif' };
const AUDIOS: Record<string, string> = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', flac: 'audio/flac', aiff: 'audio/aiff', aif: 'audio/aiff' };
const VIDEOS: Record<string, string> = { mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mpeg: 'video/mpeg', mpg: 'video/mpeg', avi: 'video/avi', wmv: 'video/wmv', '3gp': 'video/3gpp' };
const TEXTOS: Record<string, Categoria> = { txt: 'texto', md: 'texto', markdown: 'texto', csv: 'planilha', tsv: 'planilha', json: 'texto', xml: 'texto', tex: 'texto', log: 'texto' };
const ANTIGOS: Record<string, string> = {
  doc: 'Word antigo (.doc): salva como .docx ou PDF e manda de novo',
  ppt: 'PowerPoint antigo (.ppt): salva como .pptx ou PDF',
  xls: 'Excel antigo (.xls): salva como .xlsx ou CSV',
};

export const extensao = (nome: string) => (/\.([a-z0-9]+)$/i.exec(nome)?.[1] ?? '').toLowerCase();
const nomeCurto = (caminho: string) => caminho.split('/').pop() || caminho;

// ——— Texto ———

/** UTF-8 válido? (senão é Latin-1 / Windows-1252, comum em arquivo salvo no Windows). */
function ehUtf8(b: Uint8Array) {
  let i = 0;
  while (i < b.length) {
    const c = b[i];
    const n = c < 0x80 ? 0 : (c & 0xe0) === 0xc0 ? 1 : (c & 0xf0) === 0xe0 ? 2 : (c & 0xf8) === 0xf0 ? 3 : -1;
    if (n < 0) return false;
    // Sequência cortada no fim do arquivo não conta como erro.
    for (let k = 1; k <= n && i + k < b.length; k++) if ((b[i + k] & 0xc0) !== 0x80) return false;
    i += n + 1;
  }
  return true;
}

export function decodificar(b: Uint8Array) {
  const semBom = b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf ? b.subarray(3) : b;
  return strFromU8(semBom, !ehUtf8(semBom));
}

const ENTIDADES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ordm: 'º', ordf: 'ª', deg: '°', middot: '·', hellip: '…', ndash: '–', mdash: '—',
  rarr: '→', larr: '←', harr: '↔', uarr: '↑', darr: '↓', rArr: '⇒', hArr: '⇔', ne: '≠', le: '≤', ge: '≥', infin: '∞', minus: '−', radic: '√', asymp: '≈', sum: '∑',
  theta: 'θ', lambda: 'λ', mu: 'μ', sigma: 'σ', Sigma: 'Σ', omega: 'ω', Omega: 'Ω', gamma: 'γ', epsilon: 'ε', rho: 'ρ', phi: 'φ',
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', bull: '•', times: '×', divide: '÷', plusmn: '±', sup2: '²', sup3: '³', frac12: '½',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  agrave: 'à', Agrave: 'À', atilde: 'ã', otilde: 'õ', Atilde: 'Ã', Otilde: 'Õ', acirc: 'â', ecirc: 'ê', ocirc: 'ô', Acirc: 'Â', Ecirc: 'Ê', Ocirc: 'Ô',
  ccedil: 'ç', Ccedil: 'Ç', uuml: 'ü', Uuml: 'Ü', ntilde: 'ñ', Ntilde: 'Ñ', euro: '€', copy: '©', reg: '®', alpha: 'α', beta: 'β', pi: 'π', Delta: 'Δ', delta: 'δ',
};

export const decodificarEntidades = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    return ENTIDADES[e] ?? m;
  });

/** Espaços arrumados, no máximo uma linha em branco seguida. */
export const limparTexto = (s: string) =>
  s
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t ]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** HTML → texto: tira script/estilo, quebra linha nos blocos, marca listas e células de tabela. */
export function htmlParaTexto(html: string) {
  const s = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|svg|head|nav|footer|iframe)\b[\s\S]*?<\/\1>/gi, (m, tag: string) => (tag.toLowerCase() === 'head' ? (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(m)?.[1] ?? '') + '\n' : ''))
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<(td|th)\b[^>]*>/gi, ' | ')
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|table|ul|ol|blockquote|pre|header|main|figure|figcaption|dt|dd)>/gi, '\n')
    .replace(/<h([1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  // Em página web a linha em branco não diz nada: fica uma linha por bloco.
  return limparTexto(decodificarEntidades(s).replace(/^\s*\|\s*/gm, '')).replace(/\n{2,}/g, '\n');
}

/** Tira as tags de um XML de documento, com quebra de linha no fim de cada parágrafo. */
function xmlParaTexto(xml: string, fimDeParagrafo: RegExp, quebras: RegExp[] = []) {
  let s = xml.replace(fimDeParagrafo, '\n');
  for (const q of quebras) s = s.replace(q, '\n');
  s = s.replace(/<w:tab\/>|<a:tab\/>|<text:tab\/>/g, '\t').replace(/<text:s\/>/g, ' ');
  return limparTexto(decodificarEntidades(s.replace(/<[^>]+>/g, '')));
}

const RTF_ESCAPES: Record<string, string> = { par: '\n', line: '\n', tab: '\t', emdash: '—', endash: '–', bullet: '•', lquote: '‘', rquote: '’', ldblquote: '“', rdblquote: '”' };

export function rtfParaTexto(rtf: string) {
  const s = rtf
    .replace(/\{\\\*[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '')
    .replace(/\{\\(fonttbl|colortbl|stylesheet|info)[\s\S]*?\}\s*\}/g, '')
    .replace(/\\'([0-9a-f]{2})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\u(-?\d+)\??/g, (_, n: string) => String.fromCharCode((Number(n) + 65536) % 65536))
    .replace(/\\([a-z]+)-?\d* ?/gi, (_, w: string) => RTF_ESCAPES[w] ?? '')
    .replace(/\\([{}\\])/g, '$1')
    .replace(/[{}]/g, '');
  return limparTexto(s);
}

/** Legendas (.srt/.vtt): só as falas. */
export const legendaParaTexto = (s: string) =>
  limparTexto(
    s
      .replace(/^WEBVTT.*$/m, '')
      .split('\n')
      .filter((l) => l.trim() && !/^\d+$/.test(l.trim()) && !/-->/.test(l) && !/^(NOTE|STYLE)\b/.test(l.trim()))
      .join('\n'),
  );

// ——— Office e OpenDocument (são zips de XML) ———

const txt = (z: Unzipped, caminho: string) => (z[caminho] ? decodificar(z[caminho]) : '');
const porNumero = (a: string, b: string) => Number(/(\d+)\.xml$/.exec(a)?.[1] ?? 0) - Number(/(\d+)\.xml$/.exec(b)?.[1] ?? 0);

function docx(z: Unzipped) {
  const corpo = xmlParaTexto(txt(z, 'word/document.xml'), /<\/w:p>/g, [/<w:br\/>/g]);
  const notas = [txt(z, 'word/footnotes.xml'), txt(z, 'word/endnotes.xml')]
    .map((x) => xmlParaTexto(x, /<\/w:p>/g))
    .filter(Boolean)
    .join('\n');
  return notas ? `${corpo}\n\nNotas:\n${notas}` : corpo;
}

function pptx(z: Unzipped) {
  const slides = Object.keys(z)
    .filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))
    .sort(porNumero);
  return slides
    .map((s, i) => {
      const n = /(\d+)\.xml$/.exec(s)![1];
      const texto = xmlParaTexto(txt(z, s), /<\/a:p>/g);
      const nota = xmlParaTexto(txt(z, `ppt/notesSlides/notesSlide${n}.xml`), /<\/a:p>/g)
        .split('\n')
        .filter((l) => l && !/^\d+$/.test(l))
        .join('\n');
      return `Slide ${i + 1}:\n${texto}${nota ? `\nNotas do slide: ${nota}` : ''}`;
    })
    .join('\n\n');
}

function xlsx(z: Unzipped) {
  const compartilhadas = [...txt(z, 'xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    decodificarEntidades([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')),
  );
  const nomes = [...txt(z, 'xl/workbook.xml').matchAll(/<sheet [^>]*name="([^"]*)"/g)].map((m) => decodificarEntidades(m[1]));
  const planilhas = Object.keys(z)
    .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k))
    .sort(porNumero);
  return planilhas
    .map((p, i) => {
      const linhas = [...txt(z, p).matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].slice(0, 500).map((r) =>
        [...r[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)]
          .map((c) => {
            const tipo = /t="(\w+)"/.exec(c[1])?.[1];
            const v = /<v>([\s\S]*?)<\/v>/.exec(c[2] ?? '')?.[1];
            if (tipo === 's') return compartilhadas[Number(v)] ?? '';
            if (tipo === 'inlineStr') return decodificarEntidades(/<t[^>]*>([\s\S]*?)<\/t>/.exec(c[2] ?? '')?.[1] ?? '');
            return decodificarEntidades(v ?? '');
          })
          .join(' | ')
          .replace(/( \| )+$/, ''),
      );
      return `Planilha ${nomes[i] ?? i + 1}:\n${linhas.filter((l) => l.replace(/[ |]/g, '')).join('\n')}`;
    })
    .join('\n\n');
}

const odf = (z: Unzipped) =>
  xmlParaTexto(txt(z, 'content.xml').replace(/<table:table-cell\b[^>]*>/g, ' | '), /<\/text:(p|h)>/g, [/<\/table:table-row>/g, /<text:line-break\/>/g]).replace(/^\s*\|\s*/gm, '');

function epub(z: Unzipped) {
  // Ordem da leitura: a "spine" do OPF; sem ela, ordem alfabética dos capítulos.
  const container = txt(z, 'META-INF/container.xml');
  const opfCaminho = /full-path="([^"]+)"/.exec(container)?.[1];
  const opf = opfCaminho ? txt(z, opfCaminho) : '';
  const base = opfCaminho?.includes('/') ? opfCaminho.slice(0, opfCaminho.lastIndexOf('/') + 1) : '';
  const manifesto = new Map([...opf.matchAll(/<item [^>]*id="([^"]+)"[^>]*href="([^"]+)"/g)].map((m) => [m[1], base + decodeURIComponent(m[2])]));
  const ordem = [...opf.matchAll(/<itemref [^>]*idref="([^"]+)"/g)].map((m) => manifesto.get(m[1])).filter((x): x is string => !!x && !!z[x]);
  const capitulos = ordem.length ? ordem : Object.keys(z).filter((k) => /\.x?html?$/.test(k)).sort();
  return capitulos.map((c) => htmlParaTexto(txt(z, c))).join('\n\n');
}

// ——— Entrada ———

function textoLido(nome: string, texto: string, categoria: Categoria, origem: string | undefined, ignorados: Ignorado[]): ArquivoLido[] {
  const limpo = texto.trim();
  if (!limpo) {
    ignorados.push({ nome, motivo: 'não achei texto dentro' });
    return [];
  }
  const cortado = limpo.length > LIMITES.caracteresPorTexto;
  if (cortado) ignorados.push({ nome, motivo: 'muito longo: usei só o começo' });
  return [{ tipo: 'texto', nome, texto: cortado ? `${limpo.slice(0, LIMITES.caracteresPorTexto)}\n…(cortado)` : limpo, categoria, ...(origem ? { origem } : {}) }];
}

function abrirZip(nome: string, bytes: Uint8Array, ignorados: Ignorado[]): Unzipped | null {
  let total = 0;
  let quantos = 0;
  try {
    return unzipSync(bytes, {
      filter: (f) => {
        if (f.name.endsWith('/') || /(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|desktop\.ini)(\/|$)/.test(f.name) || /(^|\/)\._/.test(f.name)) return false;
        total += f.originalSize;
        quantos++;
        return quantos <= LIMITES.arquivosNoZip * 4 && total <= LIMITES.bytesDescompactados;
      },
    });
  } catch {
    ignorados.push({ nome, motivo: 'arquivo compactado corrompido ou com senha' });
    return null;
  }
}

/** Lê um arquivo (ou tudo o que tem dentro de um zip). */
export function lerArquivo(nome: string, bytes: Uint8Array, mime = '', origem?: string, profundidade = 0): Leitura {
  const ext = extensao(nome);
  const ignorados: Ignorado[] = [];
  const com = (x: object) => ({ ...x, ...(origem ? { origem } : {}) });
  const so = (arquivos: ArquivoLido[]): Leitura => ({ arquivos, ignorados });

  if (IMAGENS[ext] || (!ext && mime.startsWith('image/'))) return so([com({ tipo: 'imagem', nome, mime: IMAGENS[ext] ?? mime, bytes }) as ArquivoLido]);
  if (ext === 'pdf' || mime === 'application/pdf') return so([com({ tipo: 'pdf', nome, bytes }) as ArquivoLido]);
  if (AUDIOS[ext] || (!ext && mime.startsWith('audio/'))) return so([com({ tipo: 'midia', nome, mime: AUDIOS[ext] ?? mime, bytes, categoria: 'audio' }) as ArquivoLido]);
  if (VIDEOS[ext] || (!ext && mime.startsWith('video/'))) return so([com({ tipo: 'midia', nome, mime: VIDEOS[ext] ?? mime, bytes, categoria: 'video' }) as ArquivoLido]);

  if (ext === 'html' || ext === 'htm' || ext === 'xhtml' || mime === 'text/html') return so(textoLido(nome, htmlParaTexto(decodificar(bytes)), 'pagina', origem, ignorados));
  if (ext === 'rtf') return so(textoLido(nome, rtfParaTexto(decodificar(bytes)), 'word', origem, ignorados));
  if (ext === 'srt' || ext === 'vtt') return so(textoLido(nome, legendaParaTexto(decodificar(bytes)), 'texto', origem, ignorados));
  if (TEXTOS[ext] || (!ext && mime.startsWith('text/'))) return so(textoLido(nome, limparTexto(decodificar(bytes)), TEXTOS[ext] ?? 'texto', origem, ignorados));

  if (ANTIGOS[ext]) {
    ignorados.push({ nome, motivo: ANTIGOS[ext] });
    return so([]);
  }

  const zipados: Record<string, [(z: Unzipped) => string, Categoria]> = {
    docx: [docx, 'word'],
    dotx: [docx, 'word'],
    pptx: [pptx, 'slides'],
    ppsx: [pptx, 'slides'],
    xlsx: [xlsx, 'planilha'],
    odt: [odf, 'word'],
    odp: [odf, 'slides'],
    ods: [odf, 'planilha'],
    epub: [epub, 'ebook'],
  };
  if (zipados[ext]) {
    const z = abrirZip(nome, bytes, ignorados);
    if (!z) return so([]);
    const [extrair, categoria] = zipados[ext];
    return so(textoLido(nome, extrair(z), categoria, origem, ignorados));
  }

  // Pages/Keynote/Numbers da Apple: por dentro têm uma prévia em PDF.
  if (ext === 'pages' || ext === 'key' || ext === 'numbers') {
    const z = abrirZip(nome, bytes, ignorados);
    const pdf = z && (z['QuickLook/Preview.pdf'] ?? z['preview.pdf']);
    if (pdf) return so([com({ tipo: 'pdf', nome: nome.replace(/\.\w+$/, '.pdf'), bytes: pdf }) as ArquivoLido]);
    ignorados.push({ nome, motivo: 'exporta como PDF no app da Apple e manda de novo' });
    return so([]);
  }

  if (ext === 'zip' || mime === 'application/zip' || mime === 'application/x-zip-compressed') {
    if (profundidade >= LIMITES.profundidade) {
      ignorados.push({ nome, motivo: 'zip dentro de zip dentro de zip: abre e manda de novo' });
      return so([]);
    }
    const z = abrirZip(nome, bytes, ignorados);
    if (!z) return so([]);
    const caminhos = Object.keys(z).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
    const arquivos: ArquivoLido[] = [];
    for (const [i, caminho] of caminhos.entries()) {
      if (i >= LIMITES.arquivosNoZip) {
        ignorados.push({ nome: `${caminhos.length - i} arquivos de ${nome}`, motivo: `passou de ${LIMITES.arquivosNoZip} arquivos` });
        break;
      }
      const r = lerArquivo(nomeCurto(caminho), z[caminho], '', origem ?? nome, profundidade + 1);
      arquivos.push(...r.arquivos);
      ignorados.push(...r.ignorados);
    }
    if (!arquivos.length && !ignorados.length) ignorados.push({ nome, motivo: 'zip vazio' });
    return { arquivos, ignorados };
  }

  ignorados.push({ nome, motivo: 'tipo de arquivo que eu ainda não leio' });
  return so([]);
}

// ——— base64 (sem depender de btoa/atob, que nem todo motor JS tem) ———

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function paraBase64(b: Uint8Array) {
  let out = '';
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < b.length ? B64[(n >> 6) & 63] : '=') + (i + 2 < b.length ? B64[n & 63] : '=');
  }
  return out;
}

export function deBase64(s: string) {
  const limpo = s.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((limpo.length * 3) / 4));
  let j = 0;
  for (let i = 0; i < limpo.length; i += 4) {
    const n = (B64.indexOf(limpo[i]) << 18) | (B64.indexOf(limpo[i + 1]) << 12) | ((B64.indexOf(limpo[i + 2]) & 63) << 6) | (B64.indexOf(limpo[i + 3]) & 63);
    out[j++] = (n >> 16) & 255;
    if (i + 2 < limpo.length) out[j++] = (n >> 8) & 255;
    if (i + 3 < limpo.length) out[j++] = n & 255;
  }
  return out.subarray(0, j);
}

/** "3 fotos", "1 PDF", "2 áudios"… */
export const NOMES_CATEGORIA: Record<Categoria, [string, string]> = {
  imagem: ['foto', 'fotos'],
  pdf: ['PDF', 'PDFs'],
  texto: ['texto', 'textos'],
  word: ['documento', 'documentos'],
  slides: ['apresentação', 'apresentações'],
  planilha: ['planilha', 'planilhas'],
  pagina: ['página web', 'páginas web'],
  ebook: ['livro digital', 'livros digitais'],
  audio: ['áudio', 'áudios'],
  video: ['vídeo', 'vídeos'],
};
