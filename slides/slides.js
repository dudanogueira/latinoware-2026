const { Deck, TitleSlide, SectionSlide, ContentSlide, ThankYouSlide,
        SplitTextBulletsSlide, Card, CardGrid, Stat, CodeBlock, Fragment,
        Columns, Column, BadgeGrid, BadgeItem } = W;
const h = React.createElement;
const IMG = window.__IMG || {};

// ── números (todos vêm de numbers.js) ──────────────────────
const f = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (a, b) => Math.round((a / b - 1) * 100);  // -30
const N1 = NUM.nb01, N2 = NUM.nb02, N3 = NUM.nb03, N4 = NUM.nb04, N5 = NUM.nb05, N6 = NUM.nb06;
const idx = name => N4.indices.find(r => r[0] === name);
const quant = name => N5.metodos.find(r => r[0] === name);
const diskPct = pct(N3.explicito.mb, N3.auto.mb);           // ex.: -30
const muveraX = Math.round(N4.vetoresMulti / N4.paginas);  // ex.: 754
const dur = ms => ms < 1000 ? `${f(ms)} ms` : ms < 60000 ? `${f(ms / 1000)} s` : `${f(ms / 60000, 1)} min`;
const bruteMs = n => N1.bruteForceMs * n / N1.bruteForceN;

// ── helpers ────────────────────────────────────────────────

/** Full-bleed table in the TableSlide style, with column widths and a footnote. */
function Tabela(p) {
  const widths = p.widths || [];
  return h('div', { className: 'slide slide-table' },
    h('div', { className: 'table-topbar' },
      h('h2', null, p.greenWord && p.title.includes(p.greenWord)
        ? [p.title.slice(0, p.title.indexOf(p.greenWord)),
           h('span', { className: 'green', key: 'g' }, p.greenWord),
           p.title.slice(p.title.indexOf(p.greenWord) + p.greenWord.length)]
        : p.title)
    ),
    h('div', { className: 'table-body' },
      h('table', null,
        h('colgroup', null, ...p.headers.map((_, i) => h('col', { key: i, style: { width: widths[i] } }))),
        h('thead', null, h('tr', null, ...p.headers.map((x, i) => h('th', { key: i }, x)))),
        h('tbody', null, ...p.rows.map((r, ri) =>
          h('tr', { key: ri }, ...r.map((c, ci) => h('td', {
            key: ci,
            style: (p.bold || []).includes(ri) ? { fontWeight: 700 } : null
          }, c)))
        ))
      ),
      p.note && h('div', {
        style: { padding: '20px 84px', fontSize: '0.55em', color: 'rgba(19,12,73,0.7)', background: '#eceff3' }
      }, p.note)
    )
  );
}

function Results(items) {
  return h('ul', { className: 'results' }, ...items.map(([score, title, snip, bad], i) =>
    h('li', { key: i, className: bad ? 'bad' : '' },
      h('span', { className: 'score' }, score),
      h('span', null, h('span', { className: 'ttl' }, title), snip && h('span', { className: 'snip' }, snip))
    )));
}

function Query(code, q) {
  return h('div', { className: 'query' }, code, '(', h('span', { className: 'q' }, `"${q}"`), ')');
}

const sw = (rgb) => h('span', { className: 'sw', style: { background: `rgb(${rgb})` } });

// Cosine-similarity heatmap (real values from notebook 01)
const FRASES = [
  'cachorro latindo (pt)', 'dog barking (en)', 'perro ladra (es)', 'gato dorme (pt)',
  'Cataratas do Iguaçu (pt)', 'Iguazu Falls (en)', 'trocar o óleo (pt)'
];
const SIM = [
  [1.00, .67, .72, .48, .26, .12, .28],
  [.67, 1.00, .73, .43, .26, .18, .27],
  [.72, .73, 1.00, .49, .24, .13, .31],
  [.48, .43, .49, 1.00, .20, .07, .39],
  [.26, .26, .24, .20, 1.00, .72, .16],
  [.12, .18, .13, .07, .72, 1.00, .08],
  [.28, .27, .31, .39, .16, .08, 1.00],
];
function heatColor(v) {
  // single-hue sequential: very light mint -> deep green
  const a = [236, 246, 239], b = [31, 107, 51];
  const t = Math.max(0, Math.min(1, v));
  return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;
}
function Heatmap() {
  const fmt = v => v.toFixed(2).replace('.', ',');
  return h('table', { className: 'heat' },
    h('tbody', null,
      ...SIM.map((row, i) => h('tr', { key: i },
        h('td', { className: 'rl' }, `${i + 1}. ${FRASES[i]}`),
        ...row.map((v, j) => h('td', {
          key: j, className: 'cell', title: `${FRASES[i]} × ${FRASES[j]}: ${fmt(v)}`,
          style: { background: heatColor(v), color: v > 0.5 ? '#fff' : '#130c49' }
        }, fmt(v)))
      )),
      h('tr', null, h('td', null), ...FRASES.map((_, j) => h('td', { key: j, className: 'cl' }, j + 1)))
    )
  );
}

// Quantization: RAM per 100M vectors (GB) + recall (notebook 05, via numbers.js)
const QUANT = N5.metodos.map(([name, bytes, raw, rec], i) => [
  name, Math.round(bytes * 100e6 / 1e9), `${Math.round(4096 / bytes)}×`,
  f(rec, 3), raw == null ? '—' : f(raw, 3), i === 0
]);
function QuantBars() {
  const max = Math.max(...QUANT.map(q => q[1]));
  const head = (txt, cls) => h('span', { className: 'bh ' + (cls || '') }, txt);
  return h('div', { className: 'bars' },
    h('div', { className: 'bar-row bars-head' },
      head(''),
      head('memória (RAM)'),
      head('com rescore', 'num'),
      head('sem rescore', 'num muted')),
    ...QUANT.map(([name, gb, x, rec, raw, base], i) =>
      h('div', { className: 'bar-row', key: i, title: `${name}: ${gb} GB (${x} menor), recall@10 ${rec}, sem rescore ${raw}` },
        h('span', { className: 'lbl' }, name),
        h('div', { className: 'track' },
          h('div', { className: 'fill' + (base ? ' base' : ''), style: { width: `${(gb / max) * 72}%` } }),
          h('span', { className: 'val', style: { left: `${(gb / max) * 72}%` } }, `${gb} GB`, h('span', { className: 'x' }, base ? '' : ` ${x} menor`))),
        h('span', { className: 'rec' }, rec),
        h('span', { className: 'raw' }, raw)
      ))
  );
}

function Step(n, title, nodes, out, down) {
  return h('div', { className: 'step' + (down ? ' down' : '') },
    h('div', { className: 'n' }, n),
    h('div', { className: 'h' }, title),
    h('div', { className: 'nodes' }, ...nodes.map((on, i) =>
      h('span', { key: i, className: 'node' + (on ? '' : ' off') }, `w-${i}`))),
    h('div', { className: 'out' }, ...out)
  );
}

// ── deck ───────────────────────────────────────────────────

const App = () => Deck({ title: "Vetores sem Limites" },

  (() => {
    const t = TitleSlide({
      title: "Vetores sem Limites",
      greenWord: "sem Limites",
      subtitle: "Open Source para IA em Escala de Verdade",
      author: "Duda Nogueira · Weaviate",
      date: "Foz do Iguaçu"
    });
    return React.cloneElement(t, null, ...React.Children.toArray(t.props.children),
      IMG.latinoware && h('img', { key: 'ltw', className: 'event-logo', src: IMG.latinoware, alt: "Latinoware 2026" }));
  })(),

  ContentSlide({ title: "O caminho de hoje", variant: "light" },
    BadgeGrid(null,
      BadgeItem({ n: 1, title: "Vetores do zero" }, "GPS, cores e o significado de um texto"),
      BadgeItem({ n: 2, title: "Weaviate na prática" }, "busca semântica, BM25, híbrida e filtros"),
      BadgeItem({ n: 3, title: "Weaviate Studio" }, "navegue nos dados sem escrever código"),
      BadgeItem({ n: 4, title: "Schema" }, "o que o Auto Schema decide por você, e quanto custa"),
      BadgeItem({ n: 5, title: "Índices vetoriais" }, "flat, HNSW, dynamic, HFresh e MUVERA"),
      BadgeItem({ n: 6, title: "Quantização" }, "o mesmo índice com uma fração da memória"),
      BadgeItem({ n: 7, title: "Cluster e observabilidade" }, "réplicas, um nó caindo ao vivo, multi-tenancy, métricas"),
      BadgeItem({ n: 8, title: "Integrações" }, "modelos, frameworks, dados e um RAG 100% local")
    )
  ),

  ContentSlide({ title: "Tudo aqui roda num laptop, offline" },
    h('div', { className: 'card-grid cols-3' },
        Card({ title: "Weaviate 1.40" },
          h('p', null, "um docker compose: cluster de 3 nós, Prometheus e Grafana")),
        Card({ title: "Dados reais" },
          h('p', null, "50 mil passagens da Wikipedia (1024 dims) e 399 páginas de papers do arXiv com multi-vetores ColQwen2")),
        Card({ title: "Modelo aberto" },
          h('p', null, h('code', null, "snowflake-arctic-embed-l-v2.0"), ": multilíngue, roda local e reproduz os vetores do dataset (cosseno 0,96–0,98)"))
    ),
    h('div', { className: 'takeaway' }, "Todos os números saíram de notebooks executados nesta máquina. Código, notebooks e slides: ",
      h('a', { href: "https://github.com/dudanogueira/latinoware-2026", target: "_blank", rel: "noopener" }, h('strong', null, "github.com/dudanogueira/latinoware-2026")))
  ),

  // ── 1. Vetores do zero ──────────────────────────────────
  SectionSlide({ title: "Vetores do zero", greenWord: "zero", subtitle: "um vetor é só uma lista de números que posiciona algo num espaço" }),

  ContentSlide({ title: "2 dimensões: Foz do Iguaçu é um vetor", variant: "light" },
    Columns(null,
      Column(null,
        h('div', { className: 'big-line' }, "Foz = ", h('span', { className: 'green' }, "[-25,52, -54,59]")),
        h('p', { className: 'mt small' }, "Cada cidade é um vetor [latitude, longitude]. Perto no mapa = vetores próximos."),
        Fragment(null, h('p', { className: 'mt small' },
          h('strong', null, "A métrica muda os números, a ordem não. "),
          "Busca por similaridade = achar os vizinhos mais próximos."))
      ),
      Column(null,
        h('table', { className: 'tbl' },
          h('thead', null, h('tr', null, h('th', null, "Vizinho de Foz"), h('th', { className: 'num' }, "euclidiana"), h('th', { className: 'num' }, "distância real"))),
          h('tbody', null,
            ...[["Ciudad del Este", "0,03", "3 km"], ["Puerto Iguazú", "0,08", "9 km"], ["Cascavel", "1,26", "130 km"],
                ["Assunção", "3,00", "302 km"], ["Curitiba", "5,31", "533 km"]]
              .map((r, i) => h('tr', { key: i }, h('td', null, r[0]), h('td', { className: 'num' }, r[1]), h('td', { className: 'num' }, r[2]))))
        )
      )
    )
  ),

  ContentSlide({ title: "3 dimensões: cores RGB", variant: "light" },
    Columns({ },
      Column(null, IMG.rgb && h('div', { className: 'img-frame' }, h('img', { src: IMG.rgb, alt: "Cubo RGB com 15 cores" }))),
      Column(null,
        h('p', { className: 'small' }, "Uma cor é um vetor [R, G, B]. Cores parecidas ficam perto no cubo."),
        h('p', { className: 'small mt' }, h('strong', null, "Consulta: "), sw('240,110,20'), "laranja Latinoware (240, 110, 20)"),
        h('ul', { className: 'nn-list mt' },
          h('li', null, sw('245,130,30'), "laranja", h('span', { className: 'd' }, "23")),
          h('li', null, sw('230,30,40'), "vermelho", h('span', { className: 'd' }, "83")),
          h('li', null, sw('250,220,40'), "amarelo", h('span', { className: 'd' }, "112"))
        ),
        h('p', { className: 'xsmall muted' }, "distância euclidiana no cubo RGB, 15 cores")
      )
    )
  ),

  ContentSlide({ title: "Euclidiana × cosseno" },
    h('div', { className: 'card-grid' },
      Card({ title: "Mesmo vermelho, brilho diferente" },
        h('p', { style: { fontSize: '1em' } }, sw('100,0,0'), "(100, 0, 0) × ", sw('250,0,0'), "(250, 0, 0)"),
        h('div', { className: 'columns', style: { marginTop: '0.6em' } },
          Stat({ value: "150", label: "euclidiana: longe" }),
          Stat({ value: "1,0", label: "cosseno: iguais" }))
      ),
      Card({ title: "Cores diferentes" },
        h('p', { style: { fontSize: '1em' } }, sw('250,0,0'), "(250, 0, 0) × ", sw('0,0,250'), "(0, 0, 250)"),
        h('div', { className: 'columns', style: { marginTop: '0.6em' } },
          Stat({ value: "354", label: "euclidiana" }),
          Stat({ value: "0,0", label: "cosseno: ortogonais" }))
      )
    ),
    h('div', { className: 'takeaway' }, "O cosseno olha só a direção. Em embeddings de texto, o que importa é para onde o vetor aponta.")
  ),

  SplitTextBulletsSlide({
    title: "4 dimensões: CMYK",
    greenWord: "CMYK",
    copy: "A gráfica descreve a mesma cor com 4 números. Laranja: RGB (245, 130, 30) = CMYK (0; 0,47; 0,88; 0,04)."
  },
    h('li', null, "O número de dimensões depende de ", h('strong', null, "quem codifica"), ", não da coisa em si"),
    h('li', null, "Vetores de sistemas diferentes ", h('strong', null, "não são comparáveis"), ": não existe distância entre um RGB e um CMYK"),
    h('li', null, "Com embeddings é igual: pergunta e documentos vetorizados ", h('strong', null, "com o mesmo modelo"))
  ),

  ContentSlide({ title: "1024 dimensões: o significado de um texto", variant: "light" },
    Columns({},
      h('div', { className: 'column', style: { flex: 1.6 } }, Heatmap()),
      Column(null,
        h('p', { className: 'small' }, h('strong', null, "cachorro · dog · perro"), ": 0,67–0,73 sem nenhuma palavra em comum"),
        h('p', { className: 'small' }, h('strong', null, "Cataratas · Iguazu Falls"), ": 0,72 entre português e inglês"),
        h('p', { className: 'small' }, h('strong', null, "trocar o óleo"), ": no máximo 0,39 com o resto"),
        h('div', { className: 'takeaway', style: { marginTop: '1em' } }, "Isso é busca semântica. Não dá para desenhar 1024 dimensões, mas a matemática é a mesma do mapa.")
      )
    )
  ),

  ContentSlide({ title: "Força bruta funciona… até não funcionar" },
    Columns({ },
      Column(null,
        CodeBlock({ language: "python", title: "01_vetores_do_zero.ipynb" },
`matriz = np.vstack(wiki.vector)        # (25000, 1024)
matriz /= np.linalg.norm(matriz, axis=1, keepdims=True)

q = embed_query("qual é a maior cachoeira do mundo?")
scores = matriz @ q                     # compara com TODOS
top = np.argsort(-scores)[:3]`)
      ),
      Column(null,
        h('div', { className: 'card-grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0.6em' } },
          Card(null, Stat({ value: dur(bruteMs(25e3)), label: "25 mil · 0,1 GB" })),
          Card(null, Stat({ value: dur(bruteMs(1e6)), label: "1 milhão · 4,1 GB" })),
          Card(null, Stat({ value: dur(bruteMs(1e8)), label: "100 milhões · 410 GB" })),
          Card(null, Stat({ value: dur(bruteMs(1e9)), label: "1 bilhão · 4 TB de RAM" }))
        ),
        h('p', { className: 'xsmall muted mt' }, `medido com ${f(N1.bruteForceN)} vetores (${f(N1.bruteForceMs, 1)} ms), extrapolado linearmente`)
      )
    ),
    Fragment(null, h('div', { className: 'takeaway', style: { marginTop: '0.8em' } },
      "E ainda faltam persistência, filtros, update e delete, réplicas, backup, controle de acesso… É para isso que existe um banco de dados vetorial."))
  ),

  // ── 2. Weaviate na prática ──────────────────────────────
  SectionSlide({ title: "Weaviate na prática", greenWord: "Weaviate", subtitle: "banco de dados vetorial open source (BSD-3), escrito em Go" }),

  ContentSlide({ title: "Uma collection, 25 mil objetos" },
    Columns({},
      Column({},
        CodeBlock({ language: "python", title: "02_primeiros_passos_weaviate.ipynb" },
`client = weaviate.connect_to_local()

wiki = client.collections.create(
    "Wiki",
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="text", data_type=DataType.TEXT),
    ],
    vector_config=Configure.Vectors.self_provided(),  # HNSW + cosseno
)

with wiki.batch.fixed_size(batch_size=500) as batch:
    for linha in dados.itertuples():
        batch.add_object(properties={...}, vector=linha.vector)`)
      ),
      Column({},
        Card(null, Stat({ value: `${f(N2.importS, 1)} s`, label: `${f(N2.importN)} objetos importados no cluster, 0 falhas` })),
        h('p', { className: 'xsmall muted mt' }, "Vetores prontos aqui; o Weaviate também vetoriza sozinho com módulos para OpenAI, Cohere, Ollama, Hugging Face, Weaviate Embeddings…")
      )
    )
  ),

  ContentSlide({ title: "Busca vetorial: pergunta em português, textos em inglês", variant: "light" },
    Query('wiki.query.near_vector(embed_query', "como os vulcões entram em erupção?"),
    Results([
      ["0,563", "Volcanism", "Intrusive volcanism is when magma is forced into the rocks that make up the Earth's crust…"],
      ["0,582", "Intrusion", "An intrusion is magma (melted rock) which cools and becomes solid under the Earth's surface…"],
      ["0,597", "Carbon cycle", "The main ways that carbon gets into the carbon cycle are volcanoes, and the burning of fossil fuels…"],
    ]),
    h('p', { className: 'col-note' }, "distância de cosseno: menor = mais perto")
  ),

  ContentSlide({ title: "BM25 procura palavras, não significado", variant: "light" },
    Columns(null,
      Column(null,
        h('div', { className: 'col-label' }, "A mesma pergunta em português…"),
        Query('wiki.query.bm25', "como os vulcões entram em erupção?"),
        Results([
          ["8,25", "OS/2", "“os” casou com OS…", true],
          ["7,18", "Mac OS X Server 1.0", null, true],
          ["6,25", "Hit 'Em Up", "“em” casou com “Em”", true],
        ])
      ),
      Column(null,
        h('div', { className: 'col-label' }, "…mas imbatível em termos exatos"),
        Query('wiki.query.bm25', "Merapi"),
        Results([["4,41", "Mount Merapi", "In 2006, scientists believed that the volcano would erupt soon…"]]),
        h('p', { className: 'col-note' }, "nomes, códigos, siglas, números de série")
      )
    )
  ),

  ContentSlide({ title: "Híbrida e filtros: o melhor dos dois", variant: "light" },
    Columns(null,
      Column(null,
        h('div', { className: 'col-label' }, "hybrid(alpha=0.6): vetor + BM25"),
        Query('wiki.query.hybrid', "Merapi eruption"),
        Results([
          ["0,637", "Mount Merapi"],
          ["0,601", "2021 Cumbre Vieja volcanic eruption"],
          ["0,272", "Garibaldi Volcanic Belt"],
        ]),
        h('p', { className: 'col-note' }, "alpha=1: só vetor · alpha=0: só BM25 · comece entre 0,5 e 0,75")
      ),
      Column(null,
        h('div', { className: 'col-label' }, "near_vector + Filter title like “*guitar*”"),
        Query('wiki.query.near_vector(embed_query', "instrumentos musicais de corda"),
        Results([
          ["0,631", "Electric guitar"],
          ["0,696", "Guitar"],
          ["0,724", "Bass guitar"],
        ]),
        h('p', { className: 'col-note' }, "o filtro é aplicado durante a travessia do índice (ACORN), sem perder resultados")
      )
    )
  ),

  // ── 3. Weaviate Studio ──────────────────────────────────
  SectionSlide({ title: "Weaviate Studio", greenWord: "Studio", subtitle: "navegue nos dados sem escrever código, de dentro do editor" }),

  ContentSlide({ title: "Weaviate Studio: o cluster dentro do editor" },
    h('div', { className: 'columns studio-cols' },
      h('div', { className: 'column', style: { flex: 2.3 } },
        IMG.studio && h('div', { className: 'shot-wrap' },
          h('img', { className: 'shot', src: IMG.studio, alt: "Weaviate Studio no VS Code: 3 nós saudáveis e o schema de Produto" }),
          h('span', { className: 'shot-hl', style: { top: '40.4%', left: '6.6%', width: '20.6%', height: '2.8%' } }),
          h('span', { className: 'shot-hl', style: { top: '50.3%', left: '6.6%', width: '20.6%', height: '2.8%' } })),
        h('p', { className: 'shot-cap' }, "O cluster desta palestra: 3 nós saudáveis e, no schema de ", h('code', null, "Produto"), ", ", h('code', null, "preco"), " e ", h('code', null, "price"), " lado a lado.")
      ),
      h('div', { className: 'column studio-side' },
        h('ul', { className: 'studio-feats' },
          h('li', null, h('strong', null, "Data Explorer"), ": objetos, filtros, busca vetorial, export"),
          h('li', null, h('strong', null, "Schema"), " em árvore: propriedades, vetores, índices"),
          h('li', null, h('strong', null, "Consultas"), " com resultados em tabela ou JSON"),
          h('li', null, h('strong', null, "Operação"), ": nós, backups, RBAC, modo somente leitura")
        ),
        h('div', { className: 'install' },
          h('div', { className: 'install-h' }, "Instalar"),
          h('code', null, "prasadmuley.weaviate-studio"),
          h('div', { className: 'install-n' }, "VS Code Marketplace ou Open VSX (Cursor, Windsurf)")),
        h('p', { className: 'xsmall muted' }, "Open source (MIT), feito pela comunidade: github.com/muleyprasad/weaviate-studio")
      )
    )
  ),

  ContentSlide({ title: "Studio ao vivo, nos dados desta palestra", variant: "light" },
    h('div', { className: 'timeline' },
      h('div', { className: 'step' },
        h('div', { className: 'n' }, "1"), h('div', { className: 'h' }, "Conectar"),
        h('p', { className: 'small' }, h('code', null, "localhost:8080"), ": o cluster aparece com os 3 nós e a saúde de cada um")),
      h('div', { className: 'step' },
        h('div', { className: 'n' }, "2"), h('div', { className: 'h' }, "Navegar"),
        h('p', { className: 'small' }, "Abrir a collection ", h('code', null, "Wiki"), ": objetos, propriedades e o vetor de cada um")),
      h('div', { className: 'step' },
        h('div', { className: 'n' }, "3"), h('div', { className: 'h' }, "Buscar"),
        h('p', { className: 'small' }, "Busca vetorial e filtros no Data Explorer, sem escrever código")),
      h('div', { className: 'step down' },
        h('div', { className: 'n' }, "4"), h('div', { className: 'h' }, "Ver o problema"),
        h('p', { className: 'small' }, "No schema de ", h('code', null, "Produto"), ": ", h('code', null, "preco"), " e ", h('code', null, "price"), " lado a lado. É o próximo assunto."))
    ),
    h('div', { className: 'takeaway', style: { marginTop: '1em' } },
      "Bom para explorar e depurar; o código continua sendo a fonte da verdade do schema.")
  ),

  // ── 4. Schema ───────────────────────────────────────────
  SectionSlide({ title: "Schema: o que você não vê também custa", greenWord: "custa", subtitle: "Auto Schema × schema explícito" }),

  ContentSlide({ title: "Auto Schema: o primeiro objeto decide tudo", variant: "light" },
    Columns(null,
      Column(null,
        CodeBlock({ language: "python", title: "insert numa collection que não existe" },
`produtos.data.insert({
    "nome": "Camiseta Latinoware 2026",
    "preco": 59,
    "estoque": 120,
    "lancamento": "2026-10-14T09:00:00Z",
    "tags": ["evento", "algodão"],
    "ativo": True,
    "sku": "LTW-2026-001",
})`)
      ),
      Column(null,
        h('table', { className: 'tbl' },
          h('thead', null, h('tr', null, h('th', null, "propriedade"), h('th', null, "inferido"), h('th', null, "repare"))),
          h('tbody', null,
            h('tr', { className: 'hl' }, h('td', null, "preco, estoque"), h('td', null, "number"), h('td', null, "float, não int")),
            h('tr', null, h('td', null, "lancamento"), h('td', null, "date"), h('td', null, "só porque era RFC 3339")),
            h('tr', { className: 'hl' }, h('td', null, "sku"), h('td', null, "text, word"), h('td', null, h('code', null, "ltw · 2026 · 001"))),
            h('tr', null, h('td', null, "todo text"), h('td', null, "filtro + BM25"), h('td', null, "dois índices cada")),
            h('tr', null, h('td', null, "tags · ativo"), h('td', null, "text[] · boolean"), h('td', null, "ok"))
          )
        ),
        h('p', { className: 'col-note' }, "Com tokenização word, filtrar por “2026” acha todos os SKUs que têm esse pedaço.")
      )
    )
  ),

  ContentSlide({ title: "Três armadilhas em produção" },
    h('div', { className: 'card-grid cols-3' },
      Card({ title: "O primeiro valor manda" },
        h('p', null, h('code', null, '"estoque": "dez unidades"')),
        h('p', null, "→ 422: invalid number property, requires a float")),
      Card({ title: "Acento não entra" },
        h('p', null, h('code', null, '"preço": 39')),
        h('p', null, "→ nome inválido: propriedades seguem a regra do GraphQL")),
      Card({ title: "Typo vira schema" },
        h('p', null, h('code', null, '"price": 39')),
        h('p', null, "→ agora existem preco e price, em silêncio. Metade dos filtros erra."))
    ),
    Fragment(null, h('div', { className: 'takeaway', style: { marginTop: '1.2em' } },
      "Em produção: ", h('code', null, "AUTOSCHEMA_ENABLED=false"), " e schema versionado junto com o código."))
  ),

  ContentSlide({ title: "Cada índice é um bucket LSM no disco", variant: "light" },
    Columns(null,
      h('div', { className: 'column', style: { flex: 1.25 } },
        h('div', { className: 'card-grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0.6em' } },
          Card({ title: "Auto Schema" }, Stat({ value: `${f(N3.auto.mb)} MB`, label: `${N3.auto.buckets} buckets · import ${f(N3.auto.importS, 1)} s` })),
          Card({ title: "Explícito" }, Stat({ value: `${f(N3.explicito.mb)} MB`, label: `${N3.explicito.buckets} buckets · import ${f(N3.explicito.importS, 1)} s` }))
        ),
        h('p', { className: 'small mt' }, h('strong', null, `${diskPct < 0 ? '−' : '+'}${Math.abs(diskPct)}% de disco`), " com os mesmos 25 mil artigos. Com 100 milhões, é a diferença entre caber ou não caber no nó.")
      ),
      Column(null,
        h('div', { className: 'col-label' }, "Para cada propriedade, pergunte:"),
        h('ol', { className: 'small', style: { paddingLeft: '1.2em' } },
          h('li', null, "Vou filtrar por ela? → ", h('code', null, "index_filterable")),
          h('li', null, "Vou fazer BM25/híbrida? → ", h('code', null, "index_searchable"), " + tokenização"),
          h('li', null, "Filtro por faixa (>, <)? → ", h('code', null, "index_range_filters")),
          h('li', null, "Nada disso? → desligue tudo, ela só é armazenada")
        )
      )
    )
  ),

  // ── 4. Índices vetoriais ────────────────────────────────
  SectionSlide({ title: "Índices vetoriais", greenWord: "vetoriais", subtitle: "recall × latência × memória × custo de escrita" }),

  ContentSlide({ title: "Quatro índices, quatro trocas" },
    h('div', { className: 'card-grid' },
      Card({ title: "flat" }, h('p', null, "Força bruta, vetores no disco. Coleções pequenas e muitos tenants pequenos.")),
      Card({ title: "HNSW" }, h('p', null, "Grafo em camadas, em memória. Baixa latência e alto QPS: o padrão.")),
      Card({ title: "dynamic" }, h('p', null, "Começa flat e vira HNSW ao passar do threshold. Tenants de tamanhos variados.")),
      Card({ title: "HFresh (v1.40)" }, h('p', null, "Posting lists no disco, só centróides em memória. Quando a RAM é o limite."))
    )
  ),

  Tabela({
    title: "Índices vetoriais, medidos",
    greenWord: "medidos",
    headers: ["Índice", "recall@10", "p50 (ms)", "p99 (ms)", "import + índice (s)"],
    widths: ["32%", "17%", "17%", "17%", "17%"],
    rows: N4.indices.map(([n, rec, p50, p99, imp]) => [n, f(rec, 3), f(p50, 2), f(p99, 2), f(imp, 1)]),
    bold: [N4.indices.findIndex(r => r[0] === "HFresh")],
    note: `${f(N4.nVetores)} vetores reais de 1024 dims e ${f(N4.nPerguntas)} perguntas, com gabarito top 10 exato calculado em NumPy. Latência via gRPC, cluster local de 3 nós (Weaviate 1.40.0, ASYNC_INDEXING=true).`
  }),

  ContentSlide({ title: "O que a tabela diz" },
    h('div', { className: 'card-grid cols-3' },
      Card({ title: "ef é um botão ao vivo" },
        h('p', null, `ef 16 → 256: recall ${f(idx("HNSW ef=16")[1], 3)} → ${f(idx("HNSW ef=256")[1], 3)} e p50 ${f(idx("HNSW ef=16")[2], 1)} → ${f(idx("HNSW ef=256")[2], 1)} ms.`),
        h('p', null, "Muda com ", h('code', null, "config.update()"), ", sem reindexar.")),
      Card({ title: "flat é exato, mas linear" },
        h('p', null, `${f(idx("flat")[2], 1)} ms com ${f(Math.round(N4.nVetores / 1000))} mil vetores. Com milhões, cresce junto.`),
        h('p', null, "O HNSW cresce ~log, mas o grafo vive em memória.")),
      Card({ title: "HFresh: import rápido, recall alto" },
        h('p', null, `${f(idx("HFresh")[1], 3)} de recall, import em ${f(idx("HFresh")[4], 1)} s (flat: ${f(idx("flat")[4], 1)} s · HNSW: ${f(idx("HNSW ef=64")[4], 1)} s).`),
        h('p', null, "Troca alguns ms de latência por muito menos RAM."))
    )
  ),

  SplitTextBulletsSlide({
    title: "HFresh por dentro",
    greenWord: "HFresh",
    copy: "Novo na v1.40, baseado no SPFresh: os vetores são agrupados em clusters (posting lists) no disco. Na memória ficam só os centróides."
  },
    h('li', null, h('strong', null, "Centróides"), " em memória, comprimidos com RQ 8 bits"),
    h('li', null, h('strong', null, "Posting lists"), " no disco com RQ 1 bit (até 48 KB cada)"),
    h('li', null, h('strong', null, "Rescore"), " dos melhores candidatos com o vetor original (", h('code', null, "rescore_limit=350"), ")"),
    h('li', null, h('code', null, "search_probe=256"), ": quantos clusters visitar por busca")
  ),

  ContentSlide({ title: "Multi-vetor: um vetor por pedaço da página" },
    h('div', { className: 'card-grid cols-3' },
      Card(null, Stat({ value: f(N4.paginas), label: "páginas de papers de IA" })),
      Card(null, Stat({ value: f(N4.vetoresMulti), label: "vetores ColQwen2 de 128 dims" })),
      Card(null, Stat({ value: `~${muveraX}`, label: "vetores por página" }))
    ),
    h('div', { className: 'card-grid', style: { marginTop: '0.8em' } },
      Card({ title: "MaxSim" }, h('p', null, "Cada vetor da pergunta procura o seu melhor par no documento, e as notas são somadas. Muito preciso, muito caro.")),
      Card({ title: "MUVERA" }, h('p', null, "Codifica o documento multi-vetor num único vetor de tamanho fixo. O índice busca nesses vetores e reranqueia com MaxSim exato."))
    )
  ),

  Tabela({
    title: `MUVERA: ${muveraX}× menos vetores no índice`,
    greenWord: `${muveraX}×`,
    headers: ["Configuração", "vetores no índice", "import (s)", "página certa em 1º", "recall@10 (MaxSim)", "p50 (ms)"],
    widths: ["28%", "16%", "12%", "16%", "16%", "12%"],
    rows: N4.multi.map(([n, vec, imp, first, rec, p50]) => [n, f(vec), f(imp, 1), `${f(first * 100)}%`, f(rec, 3), f(p50, 1)]),
    bold: [1],
    note: `40 trechos de 32 vetores sorteados de uma página; a busca deve achar a página de origem. O HFresh multi-vetor reranqueia até 350 candidatos com MaxSim exato, quase a coleção inteira (${N4.paginas} páginas): em coleções grandes a conta muda, e o ganho dele é memória.`
  }),

  // ── 5. Quantização ──────────────────────────────────────
  SectionSlide({ title: "Quantização", greenWord: "Quantização", subtitle: "o mesmo índice, uma fração da memória" }),

  ContentSlide({ title: "O HNSW navega com os vetores em memória", variant: "light" },
    h('div', { className: 'big-line' }, "1 bilhão × 1024 dims × 4 bytes = ", h('span', { className: 'green' }, "4 TB de RAM")),
    h('p', { className: 'small mt' }, "Quantizar = navegar com uma versão comprimida e reavaliar (", h('em', null, "rescore"), ") os melhores candidatos com o vetor original, que fica no disco."),
    h('table', { className: 'tbl mt' },
      h('thead', null, h('tr', null, h('th', null, "Método"), h('th', null, "Ideia"), h('th', { className: 'num' }, "bytes / vetor"))),
      h('tbody', null,
        ...[["SQ (scalar)", "cada número vira 1 byte; precisa de treino", "1.024"],
            ["RQ 8 bits (rotational)", "rotaciona e quantiza; sem treino, qualquer modelo", "1.040"],
            ["RQ 4 bits + centering (v1.40)", "idem com 4 bits, subtraindo a média dos vetores", "528"],
            ["PQ (product)", "segmentos + um codebook k-means por segmento", "256"],
            ["BQ (binary)", "1 bit por dimensão: só o sinal", "128"]]
          .map((r, i) => h('tr', { key: i }, h('td', null, h('strong', null, r[0])), h('td', null, r[1]), h('td', { className: 'num' }, r[2]))))
    )
  ),

  ContentSlide({ title: "Quanta memória cada método economiza", variant: "light" },
    h('p', { className: 'lead' }, "RAM para guardar 100 milhões de vetores de 1024 dims, e quanto da busca continua certa (recall@10)"),
    QuantBars(),
    h('p', { className: 'col-note' }, `recall@10 = fração do top 10 exato que a busca acertou, medido com ${f(N4.nVetores)} vetores reais. Rescore (o padrão) reavalia os melhores candidatos com o vetor original; “sem rescore” mostra o erro da compressão sozinha.`),
    h('div', { className: 'takeaway', style: { marginTop: '0.6em' } },
      `RQ 4 bits: ${f(quant("RQ 4 bits")[2], 3)} sem rescore, ${f(quant("RQ 4 bits")[3], 3)} com. 8× menos memória, quase o mesmo recall.`)
  ),

  ContentSlide({ title: "Quantização: o que levar para casa" },
    h('div', { className: 'card-grid' },
      Card({ title: "RQ 8 bits é a escolha segura" },
        h('p', null, `4× menos memória, sem treino, recall ${f(quant("RQ 8 bits")[3], 3)}. Coleções`, " nascem sem compressão: mude o padrão com ", h('code', null, "DEFAULT_QUANTIZATION=rq-8"), ".")),
      Card({ title: "Rescore custa disco" },
        h('p', null, "A qualidade volta lendo o vetor original na busca. Use SSD.")),
      Card({ title: "BQ: 32×, mas teste" },
        h('p', null, `Recall ${f(quant("BQ")[3], 3)} com rescore (${f(quant("BQ")[2], 3)} sem). Funciona bem`, " com modelos grandes; meça com os seus dados.")),
      Card({ title: "⚠ centering precisa de async" },
        h('p', null, h('code', null, "centering=True"), " só comprime com ", h('code', null, "ASYNC_INDEXING=true"), ". Sem isso, fica sem compressão e sem aviso."))
    )
  ),

  // ── 6. Cluster e observabilidade ────────────────────────
  SectionSlide({ title: "Escala horizontal", greenWord: "horizontal", subtitle: "cluster de 3 nós, réplicas, multi-tenancy e métricas" }),

  ContentSlide({ title: "Sharding + replicação" },
    Columns({},
      Column({ },
        CodeBlock({ language: "python", title: "06_cluster_e_observabilidade.ipynb" },
`wiki = client.collections.create(
    "WikiCluster",
    vector_config=Configure.Vectors.self_provided(
        quantizer=Configure.VectorIndex.Quantizer.rq(bits=8)),
    sharding_config=Configure.sharding(desired_count=3),
    replication_config=Configure.replication(
        factor=3, async_enabled=True),
)`),
        h('ul', { className: 'small mt' },
          h('li', null, h('strong', null, "Schema"), " via RAFT (consenso)"),
          h('li', null, h('strong', null, "Dados"), ": replicação sem líder + replicação assíncrona")
        )
      ),
      Column({ },
        h('table', { className: 'shards' },
          h('thead', null, h('tr', null, h('th', null, ''), h('th', null, 'weaviate-0'), h('th', null, 'weaviate-1'), h('th', null, 'weaviate-2'))),
          h('tbody', null, ...['shard A', 'shard B', 'shard C'].map((s, i) =>
            h('tr', { key: i }, h('td', { className: 'r' }, s), h('td', { className: 's' }, '✓'), h('td', { className: 's' }, '✓'), h('td', { className: 's' }, '✓'))))
        ),
        h('p', { className: 'small mt' }, "3 shards × 3 réplicas: cada nó guarda uma cópia de cada shard."),
        Card(null, Stat({ value: `${f(N6.importS, 1)} s`, label: "25.000 objetos com 3 réplicas, 0 falhas" }))
      )
    )
  ),

  ContentSlide({ title: "Derrubando um nó ao vivo", variant: "light" },
    h('div', { className: 'timeline' },
      Step("1", "Cluster saudável", [1, 1, 1], ["busca → ", h('b', null, "Volcanism")]),
      Fragment(null, Step("2", "docker stop weaviate-2", [1, 1, 0], ["busca → ", h('b', null, "Volcanism")], true)),
      Fragment(null, Step("3", "Escrita com o nó fora", [1, 1, 0], ["insert “Latinoware 2026” → ", h('b', null, "aceito")], true)),
      Fragment(null, Step("4", "docker start weaviate-2", [1, 1, 1], ["recebe o objeto ", h('b', null, `~${f(N6.resyncS)} s`), " depois"]))
    ),
    Fragment(null, h('div', { className: 'takeaway', style: { marginTop: '1em' } },
      "A replicação assíncrona compara árvores de hash entre réplicas e transfere só o que difere. Nenhuma intervenção manual."))
  ),

  ContentSlide({ title: "Multi-tenancy: um shard por cliente" },
    Columns({},
      Column({},
        CodeBlock({ language: "python" },
`notas = client.collections.create(
    "Notas",
    vector_config=Configure.Vectors.self_provided(
        vector_index_config=Configure.VectorIndex.dynamic()),
    multi_tenancy_config=Configure.multi_tenancy(
        enabled=True, auto_tenant_creation=True,
        auto_tenant_activation=True),
    replication_config=Configure.replication(factor=2),
)
notas.with_tenant("cliente-007").query.near_vector(q)`)
      ),
      Column({},
        h('div', { className: 'card-grid', style: { gridTemplateColumns: '1fr 1fr', gap: '0.6em' } },
          Card(null, Stat({ value: f(N6.tenants), label: "tenants criados" })),
          Card(null, Stat({ value: `${N6.tenantsAtivos} / ${N6.tenants - N6.tenantsAtivos}`, label: "ativos / inativos" }))
        ),
        h('ul', { className: 'small mt' },
          h('li', null, `Shards ativos por nó: ${N6.shardsPorNo.join(' · ')}`),
          h('li', null, "Isolamento, e deleção de um cliente é trivial (LGPD!)"),
          h('li', null, "Inativos saem da memória; com offload-s3, vão para o S3")
        )
      )
    )
  ),

  ContentSlide({ title: "Observabilidade: :2112/metrics", variant: "light" },
    h('p', { className: 'lead' }, "PROMETHEUS_MONITORING_ENABLED=true, cluster de 3 nós sob carga de busca vetorial + BM25"),
    h('table', { className: 'tbl' },
      h('thead', null, h('tr', null, h('th', null, "Sinal"), h('th', null, "PromQL"), h('th', { className: 'num' }, "valor"))),
      h('tbody', null,
        ...[["nós no ar", 'count(up{job="weaviate"} == 1)', f(N6.prom.nos)],
            ["objetos (todas as réplicas)", "sum(object_count)", f(N6.prom.objetos)],
            ["consultas/s", "sum(rate(queries_durations_ms_count[1m]))", f(N6.prom.qps)],
            ["latência p95", "histogram_quantile(0.95, … queries_durations_ms_bucket …)", `${f(N6.prom.p95ms, 1)} ms`],
            ["fila de indexação assíncrona", "sum(queue_size)", f(N6.prom.fila)],
            ["heap Go por nó", "go_memstats_heap_inuse_bytes", `${f(N6.prom.heapMbMin)}–${f(N6.prom.heapMbMax)} MB`],
            ["falhas de compactação LSM", "sum(weaviate_lsm_bucket_compaction_failure_count)", f(N6.prom.falhasLsm)]]
          .map((r, i) => h('tr', { key: i }, h('td', null, h('strong', null, r[0])), h('td', null, h('code', null, r[1])), h('td', { className: 'num' }, r[2]))))
    ),
    h('p', { className: 'col-note' }, "Dashboards Grafana (:3000): Overview, Querying, Async Indexing, Cluster & RAFT, Replication.")
  ),

  ContentSlide({ title: "O que alertar em produção" },
    h('div', { className: 'card-grid cols-3' },
      Card({ title: "Nó fora" }, h('p', null, h('code', null, "up == 0"))),
      Card({ title: "Latência" }, h('p', null, "p95 / p99 acima do SLO")),
      Card({ title: "Fila de indexação" }, h('p', null, "crescendo sem parar")),
      Card({ title: "Memória" }, h('p', null, "heap perto do ", h('code', null, "GOMEMLIMIT"))),
      Card({ title: "LSM" }, h('p', null, "falhas de compactação ou flush")),
      Card({ title: "Disco" }, h('p', null, "acima de ~80%"))
    )
  ),

  // ── 7. Integrações ──────────────────────────────────────
  SectionSlide({ title: "Integrações", greenWord: "Integrações", subtitle: "o banco vetorial no meio do ecossistema open source" }),

  ContentSlide({ title: "Onde o Weaviate se conecta" },
    h('div', { className: 'card-grid' },
      Card({ title: "Modelos: uma linha de config" },
        h('p', null, "Ollama, Hugging Face, OpenAI, Cohere, Google, AWS Bedrock, Mistral, Voyage AI, Jina AI, NVIDIA, Weaviate Embeddings")),
      Card({ title: "Frameworks de LLM e agentes" },
        h('p', null, "LangChain, LlamaIndex, Haystack, DSPy, CrewAI, Semantic Kernel")),
      Card({ title: "Dados e orquestração" },
        h('p', null, "Unstructured, Airbyte, Kafka / Confluent, Spark, dlt, Kestra")),
      Card({ title: "Clientes e apps" },
        h('p', null, "Clientes Python, TypeScript, Go, Java e C#. Apps open source como AnythingLLM e mem0 já falam Weaviate."))
    )
  ),

  ContentSlide({ title: "RAG 100% local: Weaviate + Ollama" },
    Columns({},
      h('div', { className: 'column', style: { flex: 1.6 } },
        CodeBlock({ language: "python", title: "07_rag_local_ollama.ipynb" },
`OLLAMA = "http://host.docker.internal:11434"
docs = client.collections.create(
    "Docs",
    vector_config=Configure.Vectors.text2vec_ollama(
        api_endpoint=OLLAMA, model="bge-m3"),  # multilíngue
    generative_config=Configure.Generative.ollama(
        api_endpoint=OLLAMA, model="llama3.2"),
)
docs.data.insert_many([{"text": t} for t in textos])  # o Weaviate vetoriza
wait_for_indexing(client, "Docs")  # ASYNC_INDEXING: espere o índice

r = docs.generate.near_text(
    query="como os vulcões entram em erupção?", limit=3,
    grouped_task="Responda em português usando só estes trechos")
print(r.generative.text)`)
      ),
      Column({},
        Card({ title: "Sem chave de API" }, h('p', null, "Embeddings e LLM rodando no laptop, ao lado do cluster.")),
        h('div', { style: { height: '0.5em' } }),
        Card({ title: "Troque numa linha" }, h('p', null, h('code', null, "text2vec_ollama"), " → ", h('code', null, "text2vec_huggingface"), ", ", h('code', null, "text2vec_cohere"), "…"))
      )
    )
  ),

  // ── Fechamento ──────────────────────────────────────────
  ContentSlide({ title: "Para levar para casa", variant: "light" },
    BadgeGrid(null,
      BadgeItem({ n: 1, title: "Mesmo modelo" }, "vetor é coordenada: pergunta e documentos no mesmo espaço"),
      BadgeItem({ n: 2, title: "Híbrida + filtros" }, "significado e termos exatos na mesma consulta"),
      BadgeItem({ n: 3, title: "Schema explícito" }, `só os índices que você usa: ${diskPct < 0 ? '−' : '+'}${Math.abs(diskPct)}% de disco`),
      BadgeItem({ n: 4, title: "Índice certo" }, "HNSW por padrão, HFresh quando a RAM limita, MUVERA no multi-vetor"),
      BadgeItem({ n: 5, title: "Quantize" }, `RQ 8 bits: 4× menos memória, recall ${f(quant("RQ 8 bits")[3], 3)}`),
      BadgeItem({ n: 6, title: "Réplicas + métricas" }, "um nó caiu e ninguém percebeu, a não ser o Grafana")
    )
  ),

  ThankYouSlide({ title: "Valeu! Perguntas?", links: [] },
    h('a', { className: 'repo-cta', href: "https://github.com/dudanogueira/latinoware-2026", target: "_blank", rel: "noopener" },
      h('span', { className: 'repo-cta-label' }, "Slides, notebooks e docker compose"),
      h('span', { className: 'repo-cta-url' }, "github.com/dudanogueira/latinoware-2026")),
    h('div', { className: 'columns thanks-cols' },
      h('div', { className: 'column' },
        h('div', { className: 'thanks-head' }, "Duda Nogueira"),
        h('div', { className: 'thankyou-links' },
          ...[["in", "linkedin.com/in/dudanogueira"], ["gh", "github.com/dudanogueira"], ["@", "duda@weaviate.io"]]
            .map(([i, t], k) => h('div', { className: 'thankyou-link', key: k }, h('span', { className: 'link-icon' }, i), t)))
      ),
      h('div', { className: 'column' },
        h('div', { className: 'thanks-head' }, "Weaviate"),
        h('div', { className: 'thankyou-links' },
          ...[["\uD83C\uDF10", "weaviate.io"], ["gh", "github.com/weaviate/weaviate"], ["\uD83D\uDCDA", "docs.weaviate.io"], ["\uD83D\uDCAC", "forum.weaviate.io"]]
            .map(([i, t], k) => h('div', { className: 'thankyou-link', key: k }, h('span', { className: 'link-icon' }, i), t)))
      )
    )
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
