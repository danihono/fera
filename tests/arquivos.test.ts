// Leitura de arquivos (npm run test:arquivos): monta docx/pptx/xlsx/odt/epub/zip de verdade e confere o texto.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { strToU8, zipSync } from 'fflate';
import { deBase64, decodificar, htmlParaTexto, lerArquivo, LIMITES, paraBase64, rtfParaTexto } from '../src/lib/arquivos';

const u8 = (s: string) => strToU8(s);
const textoDe = (nome: string, bytes: Uint8Array) => {
  const r = lerArquivo(nome, bytes);
  assert.equal(r.arquivos.length, 1, JSON.stringify(r.ignorados));
  const a = r.arquivos[0];
  assert.equal(a.tipo, 'texto');
  return a.tipo === 'texto' ? a.texto : '';
};

const docx = zipSync({
  '[Content_Types].xml': u8('<Types/>'),
  'word/document.xml': u8(
    '<w:document><w:body><w:p><w:r><w:t>Função do 1º grau</w:t></w:r></w:p><w:p><w:r><w:t xml:space="preserve">f(x) = ax + b, com a </w:t></w:r><w:r><w:t>&#8800; 0 &amp; b livre</w:t></w:r></w:p><w:p><w:r><w:t>linha</w:t><w:br/><w:t>quebrada</w:t></w:r></w:p></w:body></w:document>',
  ),
  'word/footnotes.xml': u8('<w:footnotes><w:footnote><w:p><w:r><w:t>Fonte: caderno</w:t></w:r></w:p></w:footnote></w:footnotes>'),
});

test('Word (.docx): parágrafos, entidades, quebras e notas', () => {
  const t = textoDe('aula.docx', docx);
  assert.match(t, /^Função do 1º grau\nf\(x\) = ax \+ b, com a ≠ 0 & b livre\nlinha\nquebrada/);
  assert.match(t, /Notas:\nFonte: caderno/);
});

test('PowerPoint (.pptx): slides em ordem numérica e notas do slide', () => {
  const slide = (t: string) => u8(`<p:sld><a:p><a:r><a:t>${t}</a:t></a:r></a:p><a:p><a:r><a:t>detalhe ${t}</a:t></a:r></a:p></p:sld>`);
  const pptx = zipSync({
    'ppt/slides/slide10.xml': slide('Dez'),
    'ppt/slides/slide2.xml': slide('Dois'),
    'ppt/slides/slide1.xml': slide('Um'),
    'ppt/notesSlides/notesSlide2.xml': u8('<p:notes><a:p><a:r><a:t>fala do professor</a:t></a:r></a:p><a:p><a:r><a:t>2</a:t></a:r></a:p></p:notes>'),
  });
  const t = textoDe('slides.pptx', pptx);
  assert.equal(t.indexOf('Um') < t.indexOf('Dois') && t.indexOf('Dois') < t.indexOf('Dez'), true);
  assert.match(t, /Slide 2:\nDois\ndetalhe Dois\nNotas do slide: fala do professor/);
});

test('Excel (.xlsx): textos compartilhados, números e nome da planilha', () => {
  const xlsx = zipSync({
    'xl/workbook.xml': u8('<workbook><sheets><sheet name="Notas" sheetId="1"/></sheets></workbook>'),
    'xl/sharedStrings.xml': u8('<sst><si><t>Aluno</t></si><si><t>Nota</t></si><si><r><t>Ma</t></r><r><t>ju</t></r></si></sst>'),
    'xl/worksheets/sheet1.xml': u8(
      '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2"><v>9.5</v></c></row><row r="3"><c r="A3" t="inlineStr"><is><t>Leo</t></is></c><c r="B3"><v>7</v></c></row></sheetData></worksheet>',
    ),
  });
  assert.equal(textoDe('notas.xlsx', xlsx), 'Planilha Notas:\nAluno | Nota\nMaju | 9.5\nLeo | 7');
});

test('OpenDocument (.odt) e EPUB', () => {
  const odt = zipSync({ 'content.xml': u8('<office:document-content><text:h>Revolução Francesa</text:h><text:p>Começou em<text:s/>1789.</text:p></office:document-content>') });
  assert.equal(textoDe('historia.odt', odt), 'Revolução Francesa\nComeçou em 1789.');
  const ep = zipSync({
    'META-INF/container.xml': u8('<container><rootfiles><rootfile full-path="OEBPS/livro.opf"/></rootfiles></container>'),
    'OEBPS/livro.opf': u8('<package><manifest><item id="c2" href="cap2.xhtml"/><item id="c1" href="cap1.xhtml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>'),
    'OEBPS/cap1.xhtml': u8('<html><body><h1>Capítulo 1</h1><p>Célula</p></body></html>'),
    'OEBPS/cap2.xhtml': u8('<html><body><h1>Capítulo 2</h1><p>Mitose</p></body></html>'),
  });
  assert.equal(textoDe('bio.epub', ep), 'Capítulo 1\nCélula\n\nCapítulo 2\nMitose');
});

test('HTML: tira script/estilo, marca listas e tabela, decodifica entidades', () => {
  const html = `<!doctype html><html><head><title>Aula 3</title><style>p{color:red}</style><script>alert(1)</script></head>
    <body><nav>menu</nav><h1>Fun&ccedil;&otilde;es</h1><p>a &gt; 0 &rarr; <b>cresce</b></p><ul><li>raiz</li><li>gr&aacute;fico</li></ul>
    <table><tr><th>x</th><th>f(x)</th></tr><tr><td>3</td><td>0</td></tr></table><!-- comentário --></body></html>`;
  const t = htmlParaTexto(html);
  assert.ok(!/alert|color|menu|comentário/.test(t));
  assert.match(t, /^Aula 3\nFunções\na > 0 → cresce\n• raiz\n• gráfico\nx \| f\(x\)\n3 \| 0$/);
  assert.equal(lerArquivo('pagina.html', u8(html)).arquivos[0].tipo, 'texto');
});

test('RTF, legenda e texto em Latin-1 (Windows)', () => {
  assert.equal(rtfParaTexto('{\\rtf1\\ansi{\\fonttbl{\\f0 Arial;}}\\f0 Fun\\\'e7\\\'e3o\\par Segunda linha}'), 'Função\nSegunda linha');
  const srt = '1\n00:00:01,000 --> 00:00:03,000\nOlá turma\n\n2\n00:00:04,000 --> 00:00:06,000\nhoje é raiz\n';
  assert.equal(textoDe('aula.srt', u8(srt)), 'Olá turma\nhoje é raiz');
  const latin1 = new Uint8Array([0x46, 0x75, 0x6e, 0xe7, 0xe3, 0x6f]); // "Função" em Windows-1252
  assert.equal(decodificar(latin1), 'Função');
  assert.equal(decodificar(u8('﻿com BOM')), 'com BOM');
});

test('imagem, PDF, áudio e vídeo passam direto; .doc antigo e desconhecido são avisados', () => {
  assert.equal(lerArquivo('foto.HEIC', new Uint8Array([1])).arquivos[0].tipo, 'imagem');
  assert.equal(lerArquivo('apostila.pdf', new Uint8Array([1])).arquivos[0].tipo, 'pdf');
  const a = lerArquivo('aula.m4a', new Uint8Array([1])).arquivos[0];
  assert.ok(a.tipo === 'midia' && a.categoria === 'audio' && a.mime === 'audio/mp4');
  const v = lerArquivo('explicacao.mov', new Uint8Array([1])).arquivos[0];
  assert.ok(v.tipo === 'midia' && v.categoria === 'video');
  assert.match(lerArquivo('velho.doc', new Uint8Array([1])).ignorados[0].motivo, /docx/);
  assert.match(lerArquivo('programa.exe', new Uint8Array([1])).ignorados[0].motivo, /ainda não leio/);
});

test('zip: lê tudo de dentro (inclusive zip dentro de zip), ignora lixo do Mac e marca a origem', () => {
  const interno = zipSync({ 'resumo.txt': u8('resumo de dentro') });
  const zip = zipSync({
    'aulas/1-slides.pptx': zipSync({ 'ppt/slides/slide1.xml': u8('<a:p><a:t>Slide A</a:t></a:p>') }),
    'aulas/2-texto.docx': docx,
    'aulas/foto.jpg': new Uint8Array([255, 216, 255]),
    'aulas/pagina.html': u8('<p>web</p>'),
    'extra.zip': interno,
    '__MACOSX/aulas/._foto.jpg': new Uint8Array([0]),
    '.DS_Store': new Uint8Array([0]),
    'virus.exe': new Uint8Array([0]),
  });
  const r = lerArquivo('materia.zip', zip);
  assert.deepEqual(
    r.arquivos.map((a) => [a.nome, a.tipo, a.origem]),
    [
      ['1-slides.pptx', 'texto', 'materia.zip'],
      ['2-texto.docx', 'texto', 'materia.zip'],
      ['foto.jpg', 'imagem', 'materia.zip'],
      ['pagina.html', 'texto', 'materia.zip'],
      ['resumo.txt', 'texto', 'materia.zip'],
    ],
  );
  assert.deepEqual(r.ignorados, [{ nome: 'virus.exe', motivo: 'tipo de arquivo que eu ainda não leio' }]);
});

test('zip: limite de arquivos, zip corrompido e profundidade', () => {
  const muitos: Record<string, Uint8Array> = {};
  for (let i = 0; i < LIMITES.arquivosNoZip + 5; i++) muitos[`t${String(i).padStart(3, '0')}.txt`] = u8(`texto ${i}`);
  const r = lerArquivo('muitos.zip', zipSync(muitos));
  assert.equal(r.arquivos.length, LIMITES.arquivosNoZip);
  assert.match(r.ignorados[0].motivo, /passou de/);
  assert.match(lerArquivo('quebrado.zip', u8('isso não é zip')).ignorados[0].motivo, /corrompido/);
  const fundo = zipSync({ 'a.zip': zipSync({ 'b.zip': zipSync({ 'c.txt': u8('fundo') }) }) });
  assert.match(lerArquivo('fundo.zip', fundo).ignorados[0].motivo, /zip dentro de zip/);
});

test('texto enorme é cortado com aviso; vazio é avisado', () => {
  const r = lerArquivo('grande.txt', u8('a'.repeat(LIMITES.caracteresPorTexto + 10)));
  assert.equal(r.arquivos.length, 1);
  assert.match(r.ignorados[0].motivo, /começo/);
  assert.match(lerArquivo('vazio.txt', u8('   ')).ignorados[0].motivo, /não achei texto/);
});

test('base64 ida e volta', () => {
  for (const n of [0, 1, 2, 3, 4, 5, 255, 1000]) {
    const b = new Uint8Array(n).map((_, i) => (i * 37) % 256);
    assert.deepEqual(deBase64(paraBase64(b)), b);
  }
  assert.equal(paraBase64(u8('Fera')), Buffer.from('Fera').toString('base64'));
});
