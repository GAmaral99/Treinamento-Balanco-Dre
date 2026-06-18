/* =========================================================
   MAIN.JS — navegação entre telas e inicialização da app
   ========================================================= */

const Navigation = (() => {
  // Hooks chamados sempre que a tela correspondente é exibida
  const beforeEnter = {
    empresa: () => Screens.renderEmpresa(),
    balanco: () => Screens.renderBalanco(),
    dre: () => Screens.renderDre(),
    analise: () => Screens.renderAnalise(),
    final: () => Screens.renderFinal(),
  };

  function atualizarRail(nomeTela) {
    const rail = document.getElementById("rail");
    if (nomeTela === "cover") {
      rail.hidden = true;
      return;
    }
    rail.hidden = false;

    // A tela "intro" compartilha o marcador da etapa "login"
    const referencia = nomeTela === "intro" ? "login" : nomeTela;
    const indiceAtual = RAIL_STEPS.findIndex((etapa) => etapa.screen === referencia);

    document.querySelectorAll(".rail-step").forEach((passo) => {
      const indice = RAIL_STEPS.findIndex((etapa) => etapa.screen === passo.dataset.screen);
      passo.classList.toggle("is-active", indice === indiceAtual);
      passo.classList.toggle("is-done", indice < indiceAtual && indiceAtual !== -1);
    });
  }

  function goTo(nomeTela) {
    document.querySelectorAll(".screen").forEach((tela) => {
      tela.hidden = tela.dataset.screen !== nomeTela;
    });

    State.currentScreen = nomeTela;
    atualizarRail(nomeTela);

    if (beforeEnter[nomeTela]) {
      beforeEnter[nomeTela]();
    }

    const screensEl = document.getElementById("screens");
    screensEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFormScreens() {
    // Limpa os campos visuais do login para a próxima pessoa que for treinar
    const usuarioEl = document.getElementById("loginUsuario");
    const senhaEl = document.getElementById("loginSenha");
    const erroEl = document.getElementById("loginErro");
    if (usuarioEl) usuarioEl.value = "";
    if (senhaEl) senhaEl.value = "";
    if (erroEl) erroEl.textContent = "";
  }

  return { goTo, resetFormScreens };
})();

/* -------------------------------------------------------
   Inicialização: carrega dados e liga os eventos estáticos
   ------------------------------------------------------- */

async function iniciarApp() {
  const avisoEl = document.getElementById("avisoCarregamento");

  try {
    const [empresas, balanco, dre, analise, contatos] = await Promise.all([
      Api.getEmpresas(),
      Api.getConfigBalanco(),
      Api.getConfigDre(),
      Api.getAnalise(),
      Api.getContatos(),
    ]);

    State.empresas = empresas;
    State.balancoConfig = balanco;
    State.dreConfig = dre;
    State.analiseConfig = analise;
    State.contatosConfig = contatos;

    if (avisoEl) avisoEl.hidden = true;
  } catch (erro) {
    console.error("Falha ao carregar dados do treinamento:", erro);
    if (avisoEl) {
      avisoEl.hidden = false;
      avisoEl.textContent =
        "Não foi possível carregar os dados do treinamento. Verifique sua conexão e recarregue a página.";
    }
  }
}

function ligarEventosEstaticos() {
  // Capa -> Login
  document.getElementById("btnIniciar").addEventListener("click", () => {
    Navigation.goTo("login");
  });

  // Login -> Intro
  const formLogin = document.getElementById("formLogin");
  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const usuario = document.getElementById("loginUsuario").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();
    const erroEl = document.getElementById("loginErro");
    const botao = document.getElementById("btnEntrar");

    erroEl.textContent = "";
    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {
      const resultado = await Api.login(usuario, senha);
      if (resultado.sucesso) {
        State.usuario = resultado.usuario || usuario;
        // Conta de revisão: pula a obrigatoriedade de preencher tudo certo
        // para permitir navegar por todas as telas livremente.
        State.modoLivre = usuario.trim().toLowerCase() === "amaral" && senha.trim().toLowerCase() === "amaral";
        Navigation.goTo("intro");
      } else {
        erroEl.textContent = resultado.mensagem || "Usuário ou senha inválidos.";
      }
    } catch (erro) {
      erroEl.textContent = "Não foi possível entrar agora. Tente novamente.";
    } finally {
      botao.disabled = false;
      botao.textContent = "Entrar";
    }
  });

  // Intro -> Empresa
  document.getElementById("btnContinuarIntro").addEventListener("click", () => {
    Navigation.goTo("empresa");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  ligarEventosEstaticos();
  iniciarApp();
});