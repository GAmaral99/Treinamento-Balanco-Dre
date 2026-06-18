/* =========================================================
   STATE.JS — estado central da aplicação
   ========================================================= */

const RAIL_STEPS = [
  { screen: "login", label: "Login" },
  { screen: "empresa", label: "Empresa" },
  { screen: "balanco", label: "Balanço" },
  { screen: "dre", label: "DRE" },
  { screen: "analise", label: "Análise" },
  { screen: "final", label: "Concluído" },
];

function criarFormularioBalancoVazio() {
  return {
    dataInicial: "",
    dataFinal: "",
    contabilizacao: "",
    contaInicial: "",
    contaFinal: "",
    niveis: new Set(),
    consolidadas: false,
    formulas: false,
    somarFormulas: false,
  };
}

function criarFormularioDreVazio() {
  return {
    dataInicial: "",
    dataFinal: "",
    contabilizacao: "",
    plano: "",
    formulaInicial: "",
    formulaFinal: "",
    notaExplicativa: "",
    niveis: new Set(),
    ordemContas: "",
    imprimirConta: "",
    destaqueAnalitica: false,
    ignoraZeramento: false,
    periodoAtual: false,
  };
}

const State = {
  currentScreen: "cover",
  usuario: "",
  modoLivre: false,
  empresas: [],
  empresaSelecionada: null,
  balancoConfig: null,
  dreConfig: null,
  analiseConfig: null,
  contatosConfig: null,
  balancoForm: criarFormularioBalancoVazio(),
  dreForm: criarFormularioDreVazio(),
  analiseRevisados: new Set(),
};

function reiniciarTreinamento() {
  State.currentScreen = "cover";
  State.usuario = "";
  State.modoLivre = false;
  State.empresaSelecionada = null;
  State.balancoForm = criarFormularioBalancoVazio();
  State.dreForm = criarFormularioDreVazio();
  State.analiseRevisados = new Set();
}