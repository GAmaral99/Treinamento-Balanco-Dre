"""
Backend do treinamento "Relatórios Contábeis".

Responsável por:
- Servir o front-end estático (index.html, /static, /data)
- Expor uma API simples em /api/* usada pelo front-end
- Simular a autenticação (qualquer usuário/senha não vazios é aceito,
  pois este é um ambiente de TREINAMENTO, não um sistema real)

Para rodar localmente:
    pip install -r requirements.txt
    python app.py
Depois acesse http://localhost:5000
"""

import json
import os

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")

app = Flask(
    __name__,
    static_folder=os.path.join(ROOT_DIR, "static"),
    static_url_path="/static",
)


def carregar_json(caminho_relativo):
    caminho = os.path.join(DATA_DIR, caminho_relativo)
    with open(caminho, "r", encoding="utf-8") as arquivo:
        return json.load(arquivo)


# ---------------------------------------------------------------------------
# Rotas de página / arquivos estáticos
# ---------------------------------------------------------------------------

@app.route("/")
@app.route("/index.html")
def servir_index():
    return send_from_directory(ROOT_DIR, "index.html")


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

@app.route("/api/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    usuario = (payload.get("usuario") or "").strip()
    senha = (payload.get("senha") or "").strip()

    if not usuario or not senha:
        return jsonify({"sucesso": False, "mensagem": "Informe usuário e senha."}), 400

    # Ambiente de treinamento: qualquer usuário/senha não vazios é aceito.
    return jsonify({"sucesso": True, "usuario": usuario})


@app.route("/api/empresas", methods=["GET"])
def empresas():
    return jsonify(carregar_json(os.path.join("empresas", "empresas.json")))


@app.route("/api/config/balanco", methods=["GET"])
def config_balanco():
    return jsonify(carregar_json(os.path.join("relatorios", "balanco.json")))


@app.route("/api/config/dre", methods=["GET"])
def config_dre():
    return jsonify(carregar_json(os.path.join("relatorios", "dre.json")))


@app.route("/api/analise", methods=["GET"])
def analise():
    return jsonify(carregar_json(os.path.join("analise", "topicos.json")))


@app.route("/api/contatos", methods=["GET"])
def contatos():
    return jsonify(carregar_json(os.path.join("contatos", "contatos.json")))


if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=porta, debug=True)
