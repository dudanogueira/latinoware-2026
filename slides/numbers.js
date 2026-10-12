// ════════════════════════════════════════════════════════════════════
// TODOS os números medidos da palestra, num lugar só.
// Cole os valores como os notebooks imprimem (ponto decimal, sem
// separador de milhar): o deck formata em pt-BR (0,995 · 25.000).
// Percentuais e razões nos slides (−30%, 754×, 0,948 → 0,993, …) são
// calculados a partir daqui. Depois de editar: python3 build.py
// ════════════════════════════════════════════════════════════════════
const NUM = {
  // ── 01_vetores_do_zero (NumPy, roda fora do Weaviate) ──
  nb01: {
    bruteForceMs: 9.9,        // 25.000 vetores comparados em X ms
    bruteForceN: 25000,
  },

  // ── 02_primeiros_passos_weaviate ──
  nb02: {
    importS: 4.2,             // "25,000 objetos em Xs"
    importN: 25000,
  },

  // ── 03_schema_e_indices_invertidos ──
  nb03: {
    auto:      { buckets: 11, mb: 232, importS: 6.7 },
    explicito: { buckets: 7,  mb: 171, importS: 6.5 },
  },

  // ── 04_indices_vetoriais: tabela "resultados" ──
  nb04: {
    nVetores: 49500,
    nPerguntas: 500,
    indices: [
      // nome,              recall@10, p50 ms, p99 ms, import+índice s
      ["flat",               1.000,  9.87, 19.12,  7.3],
      ["HNSW ef=16",         0.945,  2.29,  4.40, 12.8],
      ["HNSW ef=64",         0.994,  3.48,  7.76, 12.8],
      ["HNSW ef=256",        1.000,  5.36,  8.54, 12.8],
      ["dynamic (→ HNSW)",   0.998,  3.68,  8.70, 18.6],
      ["HFresh",             1.000,  8.75, 23.33,  8.0],
    ],
    // tabela "mv" (multi-vetor)
    paginas: 399,
    vetoresMulti: 300845,
    multi: [
      // nome,                    vetores no índice, import s, página certa em 1º, recall@10 MaxSim, p50 ms
      ["HNSW, multi-vetor puro",  300845, 31.0, 1.00, 1.000,  50.1],
      ["HNSW + MUVERA",              399,  7.3, 1.00, 1.000,  54.3],
      ["HFresh + MUVERA (v1.40)",    399,  6.2, 1.00, 0.998,  87.3],
    ],
  },

  // ── 05_quantizacao: recall cru (rescore_limit=0) e com rescore ──
  nb05: {
    // nome,              bytes/vetor, recall cru (null = não medido), recall com rescore
    metodos: [
      ["sem compressão",   4096, null,  0.997],
      ["SQ",               1024, 0.987, 0.997],
      ["RQ 8 bits",        1040, 0.994, 0.998],
      ["RQ 4 bits",         528, 0.950, 0.999],
      ["RQ 4 + centering",  528, 0.959, 0.998],
      ["PQ (256 seg.)",     256, null,  0.999],
      ["BQ",                128, 0.994, 0.994],
    ],
  },

  // ── 06_cluster_e_observabilidade ──
  nb06: {
    importS: 5.6,             // 25.000 objetos no WikiCluster
    resyncS: 29,              // "weaviate-2 recebeu ... Xs depois de voltar"
    tenants: 100,
    tenantsAtivos: 50,
    shardsPorNo: [33, 31, 36],
    prom: {
      nos: 3,
      objetos: 918700,
      qps: 455.1,
      p95ms: 9.5,
      fila: 18,
      heapMbMin: 1329.1,
      heapMbMax: 1511.7,
      falhasLsm: 0,
    },
  },
};
