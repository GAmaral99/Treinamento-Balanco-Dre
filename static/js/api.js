/* =========================================================
   API.JS — acesso a dados
   Tenta primeiro o backend Flask (/api/...). Se não houver
   backend rodando (ex.: hospedagem 100% estática no GitHub
   Pages), cai automaticamente para os arquivos .json em /data.
   ========================================================= */

const Api = (() => {
  async function tentarApiOuArquivo(rotaApi, caminhoArquivo, opcoes) {
    try {
      const resposta = await fetch(rotaApi, opcoes);
      if (resposta.ok) return await resposta.json();
    } catch (erro) {
      /* backend indisponível — segue para o arquivo estático */
    }
    const respostaArquivo = await fetch(caminhoArquivo);
    if (!respostaArquivo.ok) {
      throw new Error(`Não foi possível carregar ${caminhoArquivo}`);
    }
    return await respostaArquivo.json();
  }

  function getEmpresas() {
    return tentarApiOuArquivo("/api/empresas", "data/empresas/empresas.json");
  }

  function getConfigBalanco() {
    return tentarApiOuArquivo("/api/config/balanco", "data/relatorios/balanco.json");
  }

  function getConfigDre() {
    return tentarApiOuArquivo("/api/config/dre", "data/relatorios/dre.json");
  }

  function getAnalise() {
    return tentarApiOuArquivo("/api/analise", "data/analise/topicos.json");
  }

  function getContatos() {
    return tentarApiOuArquivo("/api/contatos", "data/contatos/contatos.json");
  }

  async function login(usuario, senha) {
    try {
      const resposta = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      const tipo = resposta.headers.get("content-type") || "";
      if (tipo.includes("application/json")) {
        return await resposta.json();
      }
      /* Resposta não é JSON (ex.: página 404 de um servidor estático sem
         backend) — não é uma resposta real da API, segue para o fallback. */
    } catch (erro) {
      /* Sem backend disponível (erro de rede/conexão) — segue para o fallback. */
    }

    // Ambiente de treinamento — aceita qualquer usuário/senha não vazios.
    if (usuario && senha) {
      return { sucesso: true, usuario };
    }
    return { sucesso: false, mensagem: "Informe usuário e senha." };
  }

  return {
    getEmpresas,
    getConfigBalanco,
    getConfigDre,
    getAnalise,
    getContatos,
    login,
  };
})();
