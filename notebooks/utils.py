"""Funções compartilhadas pelos notebooks da palestra.

Depois de rodar o 00_setup.ipynb uma vez (com internet), tudo aqui funciona offline:
os datasets e o modelo ficam no cache do Hugging Face.
"""

import os
import time

import numpy as np
import pandas as pd
import pyarrow.parquet as pq
import weaviate

# Depois do setup, não precisamos da rede (Wi-Fi de evento...)
os.environ.setdefault("HF_HUB_OFFLINE", "1")

from huggingface_hub import hf_hub_download  # noqa: E402

# Wikipedia (simple English) já vetorizada com Snowflake arctic-embed-l-v2.0 (1024 dims, multilíngue)
WIKI_REPO = "weaviate/wiki-sample"
WIKI_FILES = ["weaviate/snowflake-arctic-v2/0001.parquet", "weaviate/snowflake-arctic-v2/0002.parquet"]
MODEL_NAME = "Snowflake/snowflake-arctic-embed-l-v2.0"

# Páginas de papers de IA com multi-vetores ColQwen2 (~750 vetores de 128 dims por página)
ARXIV_REPO = "weaviate/arXiv-AI-papers-multi-vector"
ARXIV_FILE = "n40_p10_images.parquet"


def load_wiki(n_files=1):
    """Até 25.000 passagens por arquivo: title, text, url, wiki_id e vector."""
    paths = [hf_hub_download(WIKI_REPO, f, repo_type="dataset") for f in WIKI_FILES[:n_files]]
    return pd.concat([pq.read_table(p).to_pandas() for p in paths], ignore_index=True)


def load_wiki_vectors(n_files=2):
    """Só os vetores, como matriz float32 (n, 1024)."""
    paths = [hf_hub_download(WIKI_REPO, f, repo_type="dataset") for f in WIKI_FILES[:n_files]]
    return np.vstack([
        np.array(pq.read_table(p, columns=["vector"]).column("vector").to_pylist(), dtype=np.float32)
        for p in paths
    ])


_model = None


def embedder():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_query(text):
    """Vetor de uma pergunta, no mesmo espaço dos vetores do dataset."""
    return embedder().encode(text, prompt_name="query", normalize_embeddings=True).tolist()


def wait_for_indexing(client, name, compressed=False, poll=1.0):
    """Com ASYNC_INDEXING, o import termina antes do índice: espera a fila zerar em todos os shards."""
    while True:
        shards = [s for n in client.cluster.nodes(collection=name, output="verbose") for s in (n.shards or [])]
        done = all(s.vector_queue_length == 0 and s.vector_indexing_status == "READY" for s in shards)
        if done and (not compressed or all(s.compressed for s in shards)):
            return
        time.sleep(poll)


def recall_at_k(found_ids, truth_ids):
    return len(set(found_ids) & set(truth_ids)) / len(truth_ids)
