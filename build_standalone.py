"""
Gera um único arquivo HTML autocontido (standalone.html) a partir dos
arquivos de desenvolvimento (index.html, static/, data/).

O resultado pode ser baixado e aberto direto com duplo clique, sem
precisar de servidor local nem conexão de rede (exceto pelas fontes do
Google Fonts, que são só um refinamento visual — sem internet, o
navegador usa a fonte padrão do sistema).

Uso:
    python build_standalone.py
"""
import base64
import json
import re
from pathlib import Path

RAIZ = Path(__file__).parent
SAIDA = RAIZ / "standalone.html"


def ler(caminho):
    return (RAIZ / caminho).read_text(encoding="utf-8")


def ler_json_compacto(caminho):
    dados = json.loads(ler(caminho))
    return json.dumps(dados, ensure_ascii=False)


def imagem_base64(caminho):
    bruto = (RAIZ / caminho).read_bytes()
    return "data:image/png;base64," + base64.b64encode(bruto).decode("ascii")


def montar():
    html = ler("index.html")

    # 1) CSS: junta base.css + components.css num único <style>
    css = ler("static/css/base.css") + "\n" + ler("static/css/components.css")
    html = html.replace(
        '  <link rel="stylesheet" href="static/css/base.css">\n'
        '  <link rel="stylesheet" href="static/css/components.css">',
        f"  <style>\n{css}\n  </style>",
    )

    # 2) Dados: embute os 5 JSONs como constantes JS
    dados_js = (
        "const EMPRESAS_DATA = " + ler_json_compacto("data/empresas/empresas.json") + ";\n"
        "const BALANCO_DATA = " + ler_json_compacto("data/relatorios/balanco.json") + ";\n"
        "const DRE_DATA = " + ler_json_compacto("data/relatorios/dre.json") + ";\n"
        "const ANALISE_DATA = " + ler_json_compacto("data/analise/topicos.json") + ";\n"
        "const CONTATOS_DATA = " + ler_json_compacto("data/contatos/contatos.json") + ";\n"
    )

    # 3) api.js simplificado: sem fetch, dados vêm direto das constantes acima
    #    (arquivo standalone não tem backend nem servidor estático — não faz
    #    sentido tentar /api/... nem fetch('data/....json'))
    api_js = """
const Api = (() => {
  function getEmpresas() { return Promise.resolve(EMPRESAS_DATA); }
  function getConfigBalanco() { return Promise.resolve(BALANCO_DATA); }
  function getConfigDre() { return Promise.resolve(DRE_DATA); }
  function getAnalise() { return Promise.resolve(ANALISE_DATA); }
  function getContatos() { return Promise.resolve(CONTATOS_DATA); }

  function login(usuario, senha) {
    // Ambiente de treinamento — aceita qualquer usuário/senha não vazios.
    if (usuario && senha) {
      return Promise.resolve({ sucesso: true, usuario });
    }
    return Promise.resolve({ sucesso: false, mensagem: "Informe usuário e senha." });
  }

  return { getEmpresas, getConfigBalanco, getConfigDre, getAnalise, getContatos, login };
})();
"""

    # 4) screens.js: troca os <img src="static/img/analise/stepN.png"> por data URIs
    screens_js = ler("static/js/screens.js")
    for n in (1, 2, 3):
        caminho_rel = f"static/img/analise/step{n}.png"
        screens_js = screens_js.replace(caminho_rel, imagem_base64(caminho_rel))

    state_js = ler("static/js/state.js")
    validators_js = ler("static/js/validators.js")
    main_js = ler("static/js/main.js")

    bloco_scripts = (
        "  <script>\n" + dados_js + api_js + "\n  </script>\n"
        "  <script>\n" + state_js + "\n  </script>\n"
        "  <script>\n" + validators_js + "\n  </script>\n"
        "  <script>\n" + screens_js + "\n  </script>\n"
        "  <script>\n" + main_js + "\n  </script>\n"
    )

    html = re.sub(
        r'  <script src="static/js/api\.js"></script>\n'
        r'  <script src="static/js/state\.js"></script>\n'
        r'  <script src="static/js/validators\.js"></script>\n'
        r'  <script src="static/js/screens\.js"></script>\n'
        r'  <script src="static/js/main\.js"></script>\n',
        bloco_scripts,
        html,
    )

    SAIDA.write_text(html, encoding="utf-8")
    tamanho_kb = SAIDA.stat().st_size / 1024
    print(f"Gerado {SAIDA.name} ({tamanho_kb:.0f} KB)")


if __name__ == "__main__":
    montar()
