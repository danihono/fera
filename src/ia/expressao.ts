// Calculadora segura pras funções dos gráficos: a IA manda "2*x - 6" e o app calcula os pontos.
// Nada de eval: um parser pequeno de expressões em x (+ − × ÷ ^, parênteses, multiplicação implícita,
// sin cos tan sqrt abs exp ln log, pi e e).

type Fn = (x: number) => number;

const FUNCOES: Record<string, (v: number) => number> = {
  sin: Math.sin,
  sen: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  tg: Math.tan,
  sqrt: Math.sqrt,
  raiz: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  log2: Math.log2,
};

const CONSTANTES: Record<string, number> = { pi: Math.PI, e: Math.E };

const NOMES = [...Object.keys(FUNCOES), ...Object.keys(CONSTANTES), 'x'].sort((a, b) => b.length - a.length);

type Token ={ t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function normalizar(expr: string) {
  return expr
    .toLowerCase()
    .replace(/^\s*[a-z]\s*\(\s*x\s*\)\s*=|^\s*y\s*=/, '') // "f(x) =" / "y ="
    .replace(/[−–]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\*\*/g, '^')
    .replace(/(\d),(\d)/g, '$1.$2');
}

function tokens(expr: string): Token[] | null {
  const out: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === ' ') {
      i++;
    } else if (/[0-9.]/.test(c)) {
      const m = /^\d*\.?\d+(e[+-]?\d+)?|^\d+\.?/.exec(expr.slice(i));
      if (!m) return null;
      out.push({ t: 'num', v: Number(m[0]) });
      i += m[0].length;
    } else if (/[a-z]/.test(c)) {
      // Nomes grudados ("sinx", "2xsin") viram vários: sempre o nome conhecido mais longo primeiro.
      const nome = NOMES.find((n) => expr.startsWith(n, i));
      if (!nome) return null;
      out.push({ t: 'id', v: nome });
      i += nome.length;
    } else if ('+-*/^()'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
    } else {
      return null;
    }
  }
  return out;
}

/** expr := termo (('+'|'-') termo)* ; termo := fator (('*'|'/'|implícito) fator)* ; fator := unário ('^' fator)? */
function compilarTokens(tk: Token[]): Fn | null {
  let p = 0;
  const peek = () => tk[p];
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v;

  function expr(): Fn {
    let a = termo();
    while (isOp('+') || isOp('-')) {
      const op = tk[p++].v;
      const l = a;
      const r = termo();
      a = op === '+' ? (x) => l(x) + r(x) : (x) => l(x) - r(x);
    }
    return a;
  }

  // Começa um fator (pra multiplicação implícita: 2x, 3(x+1), x sin(x)).
  const comecaFator = () => {
    const t = peek();
    return !!t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && t.v === '('));
  };

  function termo(): Fn {
    let a = potencia();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = tk[p++].v;
        const l = a;
        const r = potencia();
        a = op === '*' ? (x) => l(x) * r(x) : (x) => l(x) / r(x);
      } else if (comecaFator()) {
        const l = a;
        const r = potencia();
        a = (x) => l(x) * r(x);
      } else {
        return a;
      }
    }
  }

  function potencia(): Fn {
    const base = unario();
    if (isOp('^')) {
      p++;
      const exp = potenciaOuUnario();
      return (x) => Math.pow(base(x), exp(x));
    }
    return base;
  }

  // O expoente pode ter sinal: x^-1.
  function potenciaOuUnario(): Fn {
    if (isOp('-')) {
      p++;
      const f = potencia();
      return (x) => -f(x);
    }
    return potencia();
  }

  function unario(): Fn {
    if (isOp('-')) {
      p++;
      const f = potencia();
      return (x) => -f(x);
    }
    if (isOp('+')) {
      p++;
      return potencia();
    }
    return primario();
  }

  function primario(): Fn {
    const t = tk[p++];
    if (!t) throw new Error('fim inesperado');
    if (t.t === 'num') return () => t.v;
    if (t.t === 'op' && t.v === '(') {
      const f = expr();
      if (!isOp(')')) throw new Error('falta )');
      p++;
      return f;
    }
    if (t.t === 'id') {
      if (t.v === 'x') return (x) => x;
      if (t.v in CONSTANTES) {
        const c = CONSTANTES[t.v];
        return () => c;
      }
      const fn = FUNCOES[t.v];
      if (fn) {
        // sin(x) ou sin x
        const arg = isOp('(') ? primario() : potencia();
        return (x) => fn(arg(x));
      }
    }
    throw new Error(`símbolo desconhecido: ${t.v}`);
  }

  try {
    const f = expr();
    return p === tk.length ? f : null;
  } catch {
    return null;
  }
}

const cache = new Map<string, Fn | null>();

/** Compila a expressão em x; null se não for válida. */
export function compilar(expr: string): Fn | null {
  if (cache.has(expr)) return cache.get(expr)!;
  const tk = tokens(normalizar(expr));
  const f = tk && tk.length ? compilarTokens(tk) : null;
  cache.set(expr, f);
  return f;
}

/** Valor da expressão em x (null se a expressão for inválida ou o valor não for um número). */
export function avaliar(expr: string, x: number): number | null {
  const f = compilar(expr);
  if (!f) return null;
  const y = f(x);
  return Number.isFinite(y) ? y : null;
}
