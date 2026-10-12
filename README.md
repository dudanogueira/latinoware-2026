# Vetores sem Limites: Open Source para IA em Escala de Verdade

Material da palestra de **Duda Nogueira** na **Latinoware 2026** (Espaço Brasil, trilha Inteligência Artificial e Automação): 40 min de palestra + 10 min de perguntas.

```
slides/      deck (abre offline no navegador) + PDF
notebooks/   demos, já executadas (os outputs servem de fallback no palco)
docker/      cluster Weaviate 1.40 com 3 nós + Prometheus + Grafana
```

**Slides:** [dudanogueira.github.io/latinoware-2026](https://dudanogueira.github.io/latinoware-2026/) (setas ← → para navegar) · [PDF](slides/vetores-sem-limites.pdf)

Para editar o deck: os números medidos ficam em `slides/numbers.js` e o conteúdo em `slides/slides.js`. Depois rode `python3 slides/build.py` (gera `slides/index.html`, autocontido e offline) e `python3 slides/export_pdf.py` (gera o PDF; precisa de `playwright` e `pillow`).

## Notebooks

| # | Notebook | Bloco da palestra | Precisa de |
|---|---|---|---|
| 00 | `00_setup` | baixa dados + modelo (rodar **antes**, com internet) | internet |
| 01 | `01_vetores_do_zero` | lat/long → RGB → CMYK → 1024 dims; força bruta | nada |
| 02 | `02_primeiros_passos_weaviate` | collection, import, busca vetorial/BM25/híbrida, filtros | cluster |
| 03 | `03_schema_e_indices_invertidos` | Auto Schema × schema explícito, custo dos índices | cluster |
| 04 | `04_indices_vetoriais` | flat, HNSW (`ef`), dynamic, HFresh, multi-vetor + MUVERA | cluster |
| 05 | `05_quantizacao` | SQ, RQ 8/4 bits (+ centering), PQ, BQ; recall × memória | cluster |
| 06 | `06_cluster_e_observabilidade` | 3 nós, réplicas, nó caindo ao vivo, multi-tenancy, métricas | cluster |
| 07 | `07_rag_local_ollama` | RAG 100% local: `text2vec-ollama` (bge-m3) + `generative-ollama` (llama3.2) | cluster + Ollama no host |

Os dados são **pré-vetorizados** ([`weaviate/wiki-sample`](https://huggingface.co/datasets/weaviate/wiki-sample), Snowflake arctic-embed-l-v2.0, e [`weaviate/arXiv-AI-papers-multi-vector`](https://huggingface.co/datasets/weaviate/arXiv-AI-papers-multi-vector), ColQwen2). As perguntas são vetorizadas localmente com o mesmo modelo open source, sem API key. Depois do `00_setup`, tudo roda **sem internet**.

## Como rodar

```sh
python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m ipykernel install --user --name latinoware --display-name "Latinoware 2026 (.venv)"

# Um único ambiente para todos os notebooks: 3 nós nas portas padrão (REST 8080, gRPC 50051)
cd docker && docker compose up -d && cd ..

.venv/bin/jupyter lab notebooks/
```

| Serviço | Endereço |
|---|---|
| Weaviate (`weaviate-0`) | `localhost:8080` / gRPC `50051` |
| `weaviate-1`, `weaviate-2` | `:8081`, `:8082` / gRPC `50052`, `50053` |
| Grafana (anônimo, pasta *Weaviate*) | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

Os dashboards do Grafana vêm de [weaviate/grafana-dashboard-weaviate#1](https://github.com/weaviate/grafana-dashboard-weaviate/pull/1) (branch `revamp`, commit `2a67269`), sem os dashboards de Kubernetes, host macOS e usage.

O cluster guarda os dados em volumes (`docker compose down` mantém; `docker compose down -v` apaga tudo). Cada nó tem IP fixo e entra no cluster por qualquer um dos três (`CLUSTER_JOIN` com a lista completa): sem isso, reiniciar os 3 nós juntos podia deixar um deles fora do cluster para sempre (testado no 1.40.0).

O notebook 06 dá `docker stop`/`docker start` no container `latinoware-cluster-weaviate-2-1`.

## No palco

Os notebooks 04 e 05 importam 50 mil vetores várias vezes e levam alguns minutos cada. **Não reexecute** esses dois ao vivo: mostre os outputs salvos e rode só uma ou duas células. Os outros rodam em segundos (o 01 leva ~30 s para carregar o modelo; o 06, alguns minutos por causa do nó derrubado e da carga para o Grafana).

## Checklist pré-palco

- [ ] `00_setup` rodado na véspera (datasets + modelo no cache do Hugging Face)
- [ ] Ollama rodando no host com `bge-m3` e `llama3.2` (`ollama pull ...`); rode o 07 uma vez para aquecer o modelo
- [ ] `docker pull` das imagens: `weaviate:1.40.0`, `prom/prometheus:v3.5.0`, `grafana/grafana-oss:12.1.1`
- [ ] Wi-Fi **desligado** e notebooks 01–03 rodados de novo, para provar que funciona offline
- [ ] Docker Desktop/Rancher com ≥ 6 GB de RAM
- [ ] Jupyter com fonte grande (`Ctrl/Cmd +`) e tema claro
- [ ] Cluster de pé (`docker compose up -d`) **antes** de subir ao palco; Grafana aberto no *Overview*
- [ ] Deck aberto em `slides/` (funciona offline); PDF de backup num pendrive
