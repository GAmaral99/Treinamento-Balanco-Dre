/* =========================================================
   SCREENS.JS — construção do HTML das telas dinâmicas
   ========================================================= */

const Screens = (() => {
  function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto == null ? "" : String(texto);
    return div.innerHTML;
  }

  function rotuloSegmento(segmento) {
    return segmento === "industria" ? "Indústria" : "Comércio (Varejo)";
  }

  /* -------------------------------------------------------
     Tela: Empresa
     ------------------------------------------------------- */

  function renderEmpresa() {
    const container = document.getElementById("empresaContainer");
    const linhas = State.empresas
      .map(
        (empresa) => `
        <div class="empresa-row" data-codigo="${empresa.codigo}" role="button" tabindex="0">
          <span class="codigo">${empresa.codigo}</span>
          <span class="apelido">${escapeHtml(empresa.apelido)}</span>
          <span class="nome">${escapeHtml(empresa.nome)}</span>
          <span class="segmento">${rotuloSegmento(empresa.segmento)}</span>
        </div>`
      )
      .join("");

    container.innerHTML = `
      <div class="screen-head">
        <p class="eyebrow">Sistema Único · MG</p>
        <h2>Escolha a empresa atual</h2>
        <p class="subtitulo">Selecione a empresa para a qual os relatórios contábeis serão gerados nas próximas etapas.</p>
      </div>
      <div class="card">
        <div class="empresa-list">${linhas}</div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="btnSelecionarEmpresa" disabled>Selecionar empresa</button>
      </div>
    `;

    const linhasEl = container.querySelectorAll(".empresa-row");
    const botao = document.getElementById("btnSelecionarEmpresa");

    function selecionar(codigo) {
      const empresa = State.empresas.find((item) => item.codigo === Number(codigo));
      if (!empresa) return;
      State.empresaSelecionada = empresa;
      linhasEl.forEach((linha) => {
        linha.classList.toggle("is-selected", linha.dataset.codigo === String(codigo));
      });
      botao.disabled = false;
    }

    linhasEl.forEach((linha) => {
      linha.addEventListener("click", () => selecionar(linha.dataset.codigo));
      linha.addEventListener("keyup", (evento) => {
        if (evento.key === "Enter" || evento.key === " ") selecionar(linha.dataset.codigo);
      });
    });

    botao.addEventListener("click", () => Navigation.goTo("balanco"));

    // Ao voltar para esta tela, restaura a seleção anterior
    if (State.empresaSelecionada) {
      selecionar(State.empresaSelecionada.codigo);
    }
  }

  /* -------------------------------------------------------
     Tela: Balanço Patrimonial
     ------------------------------------------------------- */

  function renderBalanco() {
    const container = document.getElementById("balancoContainer");
    const empresa = State.empresaSelecionada;
    const config = State.balancoConfig;
    const form = State.balancoForm;

    const niveis = ["analiticas", "nivel2", "nivel3", "nivel4", "nivel5", "nivel6"];
    const rotulosNiveis = {
      analiticas: "Analíticas",
      nivel2: "Nível 2",
      nivel3: "Nível 3",
      nivel4: "Nível 4",
      nivel5: "Nível 5",
      nivel6: "Nível 6",
    };

    // Passos extras (Extenso e Saldo Atual) que controlamos manualmente
    const PASSO_EXTENSO   = "extenso";
    const PASSO_SALDO     = "saldoAtual";
    const EXTENSO_TEXTO   = "↵ Extenso Padrão SCI - Balanço Patrimonial";
    const LIVRO_NUMERO    = "2.143";

    // Total de itens = passos do config + 2 extras
    const totalItens = config.passos.length + 2;

    container.innerHTML = `
      <div class="screen-head">
        <p class="eyebrow">Sistema Único · ${escapeHtml(empresa.apelido)}</p>
        <h2>${escapeHtml(config.titulo)}</h2>
        <p class="subtitulo">Siga o passo a passo à esquerda e configure a janela ao lado exatamente como orientado.</p>
        ${State.modoLivre ? '<p class="modo-livre-badge">⚡ Modo livre: você pode avançar mesmo sem preencher tudo corretamente.</p>' : ""}
      </div>
      <div class="work-grid">
        <div class="card steps-card">
          <h3>Passo a passo</h3>
          <p class="progresso" id="balancoProgresso">0 de ${totalItens} corretos</p>
          <ul class="steps-list" id="balancoStepsList">
            ${config.passos.map((passo) => `
              <li data-passo="${passo.id}">
                <span class="mark">✓</span>
                <span>${escapeHtml(passo.texto)}</span>
              </li>`).join("")}
            <li data-passo="${PASSO_EXTENSO}">
              <span class="mark">✓</span>
              <span>Marcar <strong>Extenso</strong> e confirmar o modelo padrão</span>
            </li>
            <li data-passo="${PASSO_SALDO}">
              <span class="mark">✓</span>
              <span>Selecionar <strong>Saldo Atual</strong> na ordem dos dados a imprimir</span>
            </li>
          </ul>
        </div>

        <!-- Janela estilo desktop clássico -->
        <div class="win95">
          <div class="win95-titlebar">
            <span class="win95-title">${escapeHtml(config.janela)}</span>
            <div class="win95-btns">
              <button class="win95-btn" tabindex="-1" aria-hidden="true">─</button>
              <button class="win95-btn" tabindex="-1" aria-hidden="true">□</button>
              <button class="win95-btn win95-btn-close" tabindex="-1" aria-hidden="true">✕</button>
            </div>
          </div>

          <div class="win95-body">

            <!-- Empresa -->
            <div class="win95-row">
              <div class="win95-field win95-field--full">
                <label class="win95-label">Empresa</label>
                <input class="win95-input" type="text" readonly value="${empresa.codigo} · ${escapeHtml(empresa.nome)}">
              </div>
            </div>

            <!-- Data + Contabilização -->
            <div class="win95-row">
              <div class="win95-group" style="flex:2;">
                <span class="win95-group-legend">Data</span>
                <div class="win95-group-body">
                  <div class="win95-field">
                    <label class="win95-label">Inicial</label>
                    <input class="win95-input" type="date" id="balDataInicial">
                  </div>
                  <div class="win95-field">
                    <label class="win95-label">Final</label>
                    <input class="win95-input" type="date" id="balDataFinal">
                  </div>
                </div>
              </div>
              <div class="win95-group">
                <span class="win95-group-legend">Contabilização</span>
                <div class="win95-group-body win95-group-body--col">
                  <label class="win95-radio-opt"><input type="radio" name="balContabilizacao" value="fiscal"> Fiscal</label>
                  <label class="win95-radio-opt"><input type="radio" name="balContabilizacao" value="societaria"> Societária</label>
                </div>
              </div>
            </div>

            <!-- Conta -->
            <div class="win95-group">
              <span class="win95-group-legend">Conta</span>
              <div class="win95-group-body">
                <div class="win95-field">
                  <label class="win95-label">Inicial</label>
                  <input class="win95-input" type="text" id="balContaInicial" placeholder="1">
                </div>
                <div class="win95-field">
                  <label class="win95-label">Final</label>
                  <input class="win95-input" type="text" id="balContaFinal" placeholder="1140">
                </div>
              </div>
            </div>

            <!-- Níveis de contas -->
            <div class="win95-group">
              <span class="win95-group-legend">Níveis de contas</span>
              <div class="win95-group-body win95-group-body--wrap" id="balNiveis">
                ${niveis.map((nivel) => `
                  <label class="win95-check-opt"><input type="checkbox" value="${nivel}"> ${rotulosNiveis[nivel]}</label>`
                ).join("")}
              </div>
            </div>

            <!-- Opções — todos clicáveis, apenas os 3 contam para validação -->
            <div class="win95-group">
              <span class="win95-group-legend">Opções</span>
              <div class="win95-opcoes-grid">
                <label class="win95-check-opt"><input type="checkbox"> Imprimir tipo de contabilização</label>
                <label class="win95-check-opt"><input type="checkbox"> Detalhar por participante</label>
                <label class="win95-check-opt"><input type="checkbox"> Agrupar participante por CNPJ</label>
                <label class="win95-check-opt"><input type="checkbox"> Agrupar participante por CPF</label>
                <label class="win95-check-opt"><input type="checkbox"> Destaca analítica</label>
                <label class="win95-check-opt"><input type="checkbox" id="balFormulas"> Fórmulas</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir cidade e data</label>
                <label class="win95-check-opt"><input type="checkbox"> Detalhar por centro de custo</label>
                <label class="win95-check-opt"><input type="checkbox"> Lançamentos sem centros de custo</label>
                <label class="win95-check-opt"><input type="checkbox"> Linha de espaço nos títulos</label>
                <label class="win95-check-opt"><input type="checkbox" id="balConsolidadas"> Contas consolidadas</label>
                <label class="win95-check-opt"><input type="checkbox"> Detalhar por empreendimentos</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir notas explicativas por conta</label>
                <label class="win95-check-opt"><input type="checkbox"> Mostrar o proprietário</label>
                <label class="win95-check-opt"><input type="checkbox" id="balSomarFormulas"> Somar fórmulas as títulos</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir data na coluna</label>
                <label class="win95-check-opt"><input type="checkbox"> Detalhar por unidades imobiliárias</label>
                <label class="win95-check-opt"><input type="checkbox"> Contas de compensação</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir somente o ano na coluna</label>
                <label class="win95-check-opt"><input type="checkbox"> Ignora zeramento</label>
                <label class="win95-check-opt"><input type="checkbox"> Considera as eliminações do K300/K315</label>
                <label class="win95-check-opt"><input type="checkbox"> Expresso em R$</label>
              </div>
            </div>

            <!-- Extenso -->
            <div class="win95-row win95-row--align-center">
              <label class="win95-check-opt" style="flex-shrink:0;">
                <input type="checkbox" id="balExtenso"> Extenso
              </label>
              <div class="win95-extenso-fields">
                <input class="win95-input" type="text" id="balExtensoNum" value="" readonly style="width:40px; text-align:center;">
                <input class="win95-input" type="text" id="balExtensoTexto" readonly style="flex:1;">
              </div>
            </div>

            <!-- Número do livro diário -->
            <div class="win95-row win95-row--align-center" style="gap:10px;">
              <label class="win95-label" style="white-space:nowrap; flex-shrink:0;">Número do livro diário</label>
              <input class="win95-input" type="text" id="balLivroDiario" readonly style="width:80px;">
            </div>

            <!-- Ordem dos dados a imprimir -->
            <div class="win95-group">
              <span class="win95-group-legend">Ordem dos dados a imprimir</span>
              <div class="win95-group-body">
                <label class="win95-check-opt"><input type="checkbox" id="balSaldoAtual"> Saldo Atual</label>
                <label class="win95-check-opt"><input type="checkbox"> Movimento</label>
                <label class="win95-check-opt"><input type="checkbox"> Saldo Anterior</label>
              </div>
            </div>

            <!-- Rodapé -->
            <div class="win95-footer">
              <button class="btn btn-ghost" id="btnVoltarBalanco">← Voltar</button>
              <span class="win95-status" id="balancoStatus">0 de ${totalItens} itens corretos</span>
              <div class="win95-footer-btns">
                <button class="btn btn-ghost" id="btnVerificarBalanco">Verificar configuração</button>
                <button class="btn btn-primary" id="btnAvancarBalanco" disabled>Avançar →</button>
              </div>
            </div>

          </div><!-- /win95-body -->
        </div><!-- /win95 -->
      </div>
    `;

    // Restaura valores
    document.getElementById("balDataInicial").value = form.dataInicial;
    document.getElementById("balDataFinal").value = form.dataFinal;
    document.getElementById("balContaInicial").value = form.contaInicial;
    document.getElementById("balContaFinal").value = form.contaFinal;
    if (form.contabilizacao) {
      container.querySelector(`input[name="balContabilizacao"][value="${form.contabilizacao}"]`).checked = true;
    }
    container.querySelectorAll("#balNiveis input").forEach((input) => {
      input.checked = form.niveis.has(input.value);
    });
    document.getElementById("balConsolidadas").checked = form.consolidadas;
    document.getElementById("balFormulas").checked = form.formulas;
    document.getElementById("balSomarFormulas").checked = form.somarFormulas;

    // Extenso: ao marcar preenche número e texto; ao desmarcar limpa
    const extensoCheck  = document.getElementById("balExtenso");
    const extensoNum    = document.getElementById("balExtensoNum");
    const extensoTexto  = document.getElementById("balExtensoTexto");
    const livroDiario   = document.getElementById("balLivroDiario");

    extensoCheck.addEventListener("change", () => {
      if (extensoCheck.checked) {
        extensoNum.value   = "1";
        extensoTexto.value = EXTENSO_TEXTO;
        livroDiario.value  = LIVRO_NUMERO;
      } else {
        extensoNum.value   = "";
        extensoTexto.value = "";
        livroDiario.value  = "";
      }
      atualizar();
    });

    const saldoAtualCheck = document.getElementById("balSaldoAtual");

    function atualizar() {
      form.dataInicial = document.getElementById("balDataInicial").value;
      form.dataFinal   = document.getElementById("balDataFinal").value;
      form.contaInicial = document.getElementById("balContaInicial").value;
      form.contaFinal   = document.getElementById("balContaFinal").value;
      const contabRadio = container.querySelector('input[name="balContabilizacao"]:checked');
      form.contabilizacao = contabRadio ? contabRadio.value : "";
      form.niveis = new Set(
        Array.from(container.querySelectorAll("#balNiveis input:checked")).map((i) => i.value)
      );
      form.consolidadas  = document.getElementById("balConsolidadas").checked;
      form.formulas      = document.getElementById("balFormulas").checked;
      form.somarFormulas = document.getElementById("balSomarFormulas").checked;

      const resultado = Validators.validarBalanco(form, config.respostas);

      // Itens extras
      const extensoOk   = extensoCheck.checked;
      const saldoAtualOk = saldoAtualCheck.checked;

      // Atualiza steps do config
      container.querySelectorAll("#balancoStepsList li").forEach((li) => {
        const passo = li.dataset.passo;
        let ok;
        if (passo === PASSO_EXTENSO)   ok = extensoOk;
        else if (passo === PASSO_SALDO) ok = saldoAtualOk;
        else ok = !!resultado[passo];
        li.classList.toggle("is-ok", ok);
      });

      const corretos = Object.values(resultado).filter(Boolean).length
        + (extensoOk ? 1 : 0)
        + (saldoAtualOk ? 1 : 0);

      const statusEl = document.getElementById("balancoStatus");
      statusEl.textContent = `${corretos} de ${totalItens} itens corretos`;
      statusEl.classList.toggle("is-ok",      corretos === totalItens);
      statusEl.classList.toggle("is-pending", corretos !== totalItens);
      document.getElementById("balancoProgresso").textContent = `${corretos} de ${totalItens} corretos`;

      const tudo = Object.values(resultado).every(Boolean) && extensoOk && saldoAtualOk;
      document.getElementById("btnAvancarBalanco").disabled = !(tudo || State.modoLivre);
    }

    container.addEventListener("input",  atualizar);
    container.addEventListener("change", atualizar);
    document.getElementById("btnVoltarBalanco").addEventListener("click", () => Navigation.goTo("empresa"));
    document.getElementById("btnVerificarBalanco").addEventListener("click", () => {
      atualizar();
      const pendente = container.querySelector("#balancoStepsList li:not(.is-ok)");
      if (pendente) pendente.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    document.getElementById("btnAvancarBalanco").addEventListener("click", () => Navigation.goTo("dre"));

    atualizar();
  }

  /* -------------------------------------------------------
     Tela: DRE
     ------------------------------------------------------- */

  function descricaoFormula(codigo) {
    const mapa = { "1": "RECEITA BRUTA", "34": "LUCRO OPERACIONAL LÍQUIDO" };
    return mapa[normalizarCodigo(codigo)] || "";
  }

  function descricaoPlano(codigo) {
    const mapa = {
      "1": "Demonstração do Resultado do Exercício",
      "12": "Demonstração do Resultado do Exercício - Indústria",
    };
    return mapa[normalizarCodigo(codigo)] || "";
  }

  function normalizarCodigo(valor) {
    return (valor || "").toString().trim();
  }

  function renderDre() {
    const container = document.getElementById("dreContainer");
    const empresa = State.empresaSelecionada;
    const config = State.dreConfig;
    const form = State.dreForm;

    const EXTENSO_TEXTO_DRE = "↵ Extenso Padrão SCI - Demonstração do Resultado do Exercício";
    const PASSO_EXTENSO_DRE = "dreExtenso";
    const totalDre = config.passos.length + 1; // +1 extenso

    container.innerHTML = `
      <div class="screen-head">
        <p class="eyebrow">Sistema Único · ${escapeHtml(empresa.apelido)}</p>
        <h2>${escapeHtml(config.titulo)}</h2>
        <p class="subtitulo">Siga o passo a passo à esquerda e configure a janela ao lado exatamente como orientado.</p>
        <p class="subtitulo">Segmento da empresa selecionada: <strong>${rotuloSegmento(empresa.segmento)}</strong></p>
        ${State.modoLivre ? '<p class="modo-livre-badge">⚡ Modo livre: você pode avançar mesmo sem preencher tudo corretamente.</p>' : ""}
      </div>
      <div class="work-grid">
        <div class="card steps-card">
          <h3>Passo a passo</h3>
          <p class="progresso" id="dreProgresso">0 de ${totalDre} corretos</p>
          <ul class="steps-list" id="dreStepsList">
            ${config.passos
              .map(
                (passo) => `
                <li data-passo="${passo.id}">
                  <span class="mark">✓</span>
                  <span>${escapeHtml(passo.texto)}</span>
                </li>`
              )
              .join("")}
            <li data-passo="${PASSO_EXTENSO_DRE}">
              <span class="mark">✓</span>
              <span>Marcar <strong>Extenso</strong> e confirmar o modelo padrão</span>
            </li>
          </ul>
        </div>

        <!-- Janela estilo desktop clássico -->
        <div class="win95">
          <div class="win95-titlebar">
            <span class="win95-title">${escapeHtml(config.janela)}</span>
            <div class="win95-btns">
              <button class="win95-btn" tabindex="-1" aria-hidden="true">─</button>
              <button class="win95-btn" tabindex="-1" aria-hidden="true">□</button>
              <button class="win95-btn win95-btn-close" tabindex="-1" aria-hidden="true">✕</button>
            </div>
          </div>

          <div class="win95-body">

            <!-- Empresa -->
            <div class="win95-row">
              <div class="win95-field win95-field--full">
                <label class="win95-label">Empresa</label>
                <input class="win95-input" type="text" readonly value="${empresa.codigo} · ${escapeHtml(empresa.nome)}">
              </div>
            </div>

            <!-- Data + Contabilização -->
            <div class="win95-row">
              <div class="win95-group" style="flex:2;">
                <span class="win95-group-legend">Data</span>
                <div class="win95-group-body">
                  <div class="win95-field">
                    <label class="win95-label">Inicial</label>
                    <input class="win95-input" type="date" id="dreDataInicial">
                  </div>
                  <div class="win95-field">
                    <label class="win95-label">Final</label>
                    <input class="win95-input" type="date" id="dreDataFinal">
                  </div>
                </div>
              </div>
              <div class="win95-group">
                <span class="win95-group-legend">Contabilização</span>
                <div class="win95-group-body win95-group-body--col">
                  <label class="win95-radio-opt"><input type="radio" name="dreContabilizacao" value="fiscal"> Fiscal</label>
                  <label class="win95-radio-opt"><input type="radio" name="dreContabilizacao" value="societaria"> Societária</label>
                </div>
              </div>
            </div>

            <!-- Fórmulas -->
            <div class="win95-group">
              <span class="win95-group-legend">Fórmulas</span>
              <div class="win95-group-body win95-group-body--col">
                <div class="win95-row win95-row--align-center">
                  <div class="win95-field" style="max-width:170px;">
                    <label class="win95-label">Plano de fórmulas</label>
                    <select class="win95-input" id="drePlano">
                      <option value="">Selecione...</option>
                      <option value="1">1 — Comércio / Varejo</option>
                      <option value="12">12 — Indústria</option>
                    </select>
                  </div>
                  <div class="win95-field" style="flex:1;">
                    <label class="win95-label">&nbsp;</label>
                    <input class="win95-input" type="text" id="drePlanoDescricao" readonly>
                  </div>
                </div>
                <p class="formula-aviso" id="drePlanoAviso" hidden></p>
                <div class="win95-row win95-row--align-center">
                  <div class="win95-field" style="max-width:170px;">
                    <label class="win95-label">Fórmula inicial</label>
                    <input class="win95-input" type="text" id="dreFormulaInicial" placeholder="1">
                  </div>
                  <div class="win95-field" style="flex:1;">
                    <label class="win95-label">&nbsp;</label>
                    <input class="win95-input" type="text" id="dreFormulaInicialDescricao" readonly>
                  </div>
                </div>
                <div class="win95-row win95-row--align-center">
                  <div class="win95-field" style="max-width:170px;">
                    <label class="win95-label">Fórmula final</label>
                    <input class="win95-input" type="text" id="dreFormulaFinal" placeholder="34">
                  </div>
                  <div class="win95-field" style="flex:1;">
                    <label class="win95-label">&nbsp;</label>
                    <input class="win95-input" type="text" id="dreFormulaFinalDescricao" readonly>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notas explicativas -->
            <div class="win95-group">
              <span class="win95-group-legend">Notas explicativas</span>
              <div class="win95-group-body">
                <label class="win95-radio-opt"><input type="radio" name="dreNota" value="nenhuma"> Nenhuma</label>
                <label class="win95-radio-opt"><input type="radio" name="dreNota" value="coluna"> Coluna</label>
                <label class="win95-radio-opt"><input type="radio" name="dreNota" value="conta"> Conta</label>
              </div>
            </div>

            <!-- Níveis de contas -->
            <div class="win95-group">
              <span class="win95-group-legend">Níveis de contas</span>
              <div class="win95-group-body win95-group-body--col">
                <div class="win95-row win95-row--align-center">
                  <label class="win95-label" style="flex-shrink:0;">Filtrar:</label>
                  <div class="win95-group-body" id="dreNiveis" style="margin-top:0;">
                    <label class="win95-check-opt"><input type="checkbox" value="analiticas"> Analíticas</label>
                    <label class="win95-check-opt"><input type="checkbox" value="nivel2"> Nível 2</label>
                  </div>
                </div>
                <div class="win95-row win95-row--align-center">
                  <label class="win95-label" style="flex-shrink:0;">Negrito até:</label>
                  <select class="win95-input" id="dreNegritoAte" style="max-width:160px;">
                    <option value="">Nenhum</option>
                    <option value="2">Nível 2</option>
                    <option value="3">Nível 3</option>
                    <option value="4">Nível 4</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Ordem das contas + Imprimir conta -->
            <div class="win95-row">
              <div class="win95-group">
                <span class="win95-group-legend">Ordem das contas</span>
                <div class="win95-group-body win95-group-body--col">
                  <label class="win95-radio-opt"><input type="radio" name="dreOrdem" value="classificacao"> Classificação</label>
                  <label class="win95-radio-opt"><input type="radio" name="dreOrdem" value="alfabetica"> Alfabética</label>
                </div>
              </div>
              <div class="win95-group" style="flex:1.4;">
                <span class="win95-group-legend">Imprimir conta</span>
                <div class="win95-group-body">
                  <label class="win95-radio-opt"><input type="radio" name="dreImprimir" value="curta"> Curta</label>
                  <label class="win95-radio-opt"><input type="radio" name="dreImprimir" value="longa"> Longa</label>
                  <label class="win95-radio-opt"><input type="radio" name="dreImprimir" value="ambas"> Ambas</label>
                  <label class="win95-radio-opt"><input type="radio" name="dreImprimir" value="nenhuma"> Nenhuma</label>
                </div>
              </div>
            </div>

            <!-- Opções -->
            <div class="win95-group">
              <span class="win95-group-legend">Opções</span>
              <div class="win95-opcoes-grid">
                <label class="win95-check-opt win95-check-opt--disabled"><input type="checkbox" disabled> Detalhar por filial</label>
                <label class="win95-check-opt"><input type="checkbox" id="dreDestaque"> Destaca analítica</label>
                <label class="win95-check-opt"><input type="checkbox"> Pular página por grupo</label>
                <label class="win95-check-opt"><input type="checkbox"> Expresso em R$</label>
                <label class="win95-check-opt"><input type="checkbox"> Contas sem movimento</label>
                <label class="win95-check-opt"><input type="checkbox" id="dreIgnoraZeramento"> Ignora zeramento</label>
                <label class="win95-check-opt win95-check-opt--disabled"><input type="checkbox" disabled> Somente contas DRE</label>
                <label class="win95-check-opt win95-check-opt--disabled"><input type="checkbox" disabled> Ordem ECD</label>
                <label class="win95-check-opt"><input type="checkbox"> Linha de espaço nas títulos</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir data na coluna</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir somente o ano na coluna</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir cidade e data</label>
                <label class="win95-check-opt"><input type="checkbox"> Imprimir tipo de contabilização</label>
                <label class="win95-check-opt"><input type="checkbox"> Considera as eliminações do K300/K315</label>
              </div>
            </div>

            <!-- Opções de centro de custo -->
            <div class="win95-group">
              <span class="win95-group-legend">Opções de centro de custo</span>
              <div class="win95-group-body win95-group-body--col">
                <div class="win95-group-body" style="margin-top:0;">
                  <label class="win95-check-opt"><input type="checkbox"> Detalhar por centro de custo</label>
                  <label class="win95-check-opt win95-check-opt--disabled"><input type="checkbox" disabled> Lançamentos sem centros de custos</label>
                </div>
                <div class="win95-row win95-row--align-center">
                  <label class="win95-label" style="flex-shrink:0; white-space:nowrap;">Totalizar centro de custo no nível:</label>
                  <select class="win95-input" style="max-width:140px;" disabled>
                    <option selected>Nível 1</option>
                    <option>Nível 2</option>
                    <option>Nível 3</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Extenso -->
            <div class="win95-row win95-row--align-center">
              <label class="win95-check-opt" style="flex-shrink:0;">
                <input type="checkbox" id="dreExtenso"> Extenso
              </label>
              <div class="win95-extenso-fields">
                <input class="win95-input" type="text" id="dreExtensoNum" value="" readonly style="width:40px; text-align:center;">
                <input class="win95-input" type="text" id="dreExtensoTexto" readonly style="flex:1;">
              </div>
            </div>

            <!-- Ordem dos dados a imprimir -->
            <div class="win95-group">
              <span class="win95-group-legend">Ordem dos dados a imprimir</span>
              <div class="win95-group-body">
                <label class="win95-check-opt"><input type="checkbox" id="drePeriodoAtual"> Período Atual</label>
                <label class="win95-check-opt"><input type="checkbox" id="dreMovimento"> Movimento</label>
                <label class="win95-check-opt"><input type="checkbox" id="drePeriodoAnterior"> Período Anterior</label>
              </div>
            </div>

            <!-- Data do período anterior -->
            <div class="win95-group">
              <span class="win95-group-legend">Data do período anterior</span>
              <div class="win95-group-body">
                <div class="win95-field">
                  <label class="win95-label">Inicial</label>
                  <input class="win95-input" type="text" id="dreDataPeriodoAnteriorInicial" placeholder="dd/mm/aaaa" disabled>
                </div>
                <div class="win95-field">
                  <label class="win95-label">Final</label>
                  <input class="win95-input" type="text" id="dreDataPeriodoAnteriorFinal" placeholder="dd/mm/aaaa" disabled>
                </div>
              </div>
            </div>

            <!-- Rodapé -->
            <div class="win95-footer">
              <button class="btn btn-ghost" id="btnVoltarDre">← Voltar</button>
              <span class="win95-status" id="dreStatus">0 de ${totalDre} itens corretos</span>
              <div class="win95-footer-btns">
                <button class="btn btn-ghost" id="btnVerificarDre">Verificar configuração</button>
                <button class="btn btn-primary" id="btnAvancarDre" disabled>Avançar →</button>
              </div>
            </div>

          </div><!-- /win95-body -->
        </div><!-- /win95 -->
      </div>
    `;

    // Restaura valores
    document.getElementById("dreDataInicial").value = form.dataInicial;
    document.getElementById("dreDataFinal").value = form.dataFinal;
    document.getElementById("drePlano").value = form.plano;
    document.getElementById("dreFormulaInicial").value = form.formulaInicial;
    document.getElementById("dreFormulaFinal").value = form.formulaFinal;
    if (form.contabilizacao) {
      container.querySelector(`input[name="dreContabilizacao"][value="${form.contabilizacao}"]`).checked = true;
    }
    if (form.notaExplicativa) {
      container.querySelector(`input[name="dreNota"][value="${form.notaExplicativa}"]`).checked = true;
    }
    if (form.ordemContas) {
      container.querySelector(`input[name="dreOrdem"][value="${form.ordemContas}"]`).checked = true;
    }
    if (form.imprimirConta) {
      container.querySelector(`input[name="dreImprimir"][value="${form.imprimirConta}"]`).checked = true;
    }
    container.querySelectorAll("#dreNiveis input").forEach((input) => {
      input.checked = form.niveis.has(input.value);
    });
    document.getElementById("dreDestaque").checked = form.destaqueAnalitica;
    document.getElementById("dreIgnoraZeramento").checked = form.ignoraZeramento;
    document.getElementById("drePeriodoAtual").checked = form.periodoAtual;

    // Extenso: ao marcar preenche número e texto; ao desmarcar limpa
    const extensoCheck = document.getElementById("dreExtenso");
    const extensoNum = document.getElementById("dreExtensoNum");
    const extensoTexto = document.getElementById("dreExtensoTexto");

    // Restaura extenso
    extensoCheck.checked = form.extenso;
    if (form.extenso) {
      extensoNum.value = "1";
      extensoTexto.value = EXTENSO_TEXTO_DRE;
    }

    extensoCheck.addEventListener("change", () => {
      if (extensoCheck.checked) {
        extensoNum.value = "1";
        extensoTexto.value = EXTENSO_TEXTO_DRE;
      } else {
        extensoNum.value = "";
        extensoTexto.value = "";
      }
    });

    // Descrições auto-preenchidas (decorativo, igual ao sistema real)
    function atualizarDescricoes() {
      const planoSelecionado = document.getElementById("drePlano").value;
      document.getElementById("drePlanoDescricao").value = descricaoPlano(planoSelecionado);
      document.getElementById("dreFormulaInicialDescricao").value = descricaoFormula(document.getElementById("dreFormulaInicial").value);
      document.getElementById("dreFormulaFinalDescricao").value = descricaoFormula(document.getElementById("dreFormulaFinal").value);

      const avisoEl = document.getElementById("drePlanoAviso");
      const planoEsperado = config.respostas.planoPorSegmento[empresa.segmento];
      const segmentoNome = rotuloSegmento(empresa.segmento);
      if (planoSelecionado && planoSelecionado !== planoEsperado) {
        avisoEl.textContent = `⚠ Esta empresa é do segmento ${segmentoNome} — o plano correto é ${planoEsperado}.`;
        avisoEl.hidden = false;
      } else {
        avisoEl.hidden = true;
      }
    }
    atualizarDescricoes();

    function atualizar() {
      form.dataInicial = document.getElementById("dreDataInicial").value;
      form.dataFinal = document.getElementById("dreDataFinal").value;
      form.plano = document.getElementById("drePlano").value;
      form.formulaInicial = document.getElementById("dreFormulaInicial").value;
      form.formulaFinal = document.getElementById("dreFormulaFinal").value;

      const contabRadio = container.querySelector('input[name="dreContabilizacao"]:checked');
      form.contabilizacao = contabRadio ? contabRadio.value : "";
      const notaRadio = container.querySelector('input[name="dreNota"]:checked');
      form.notaExplicativa = notaRadio ? notaRadio.value : "";
      const ordemRadio = container.querySelector('input[name="dreOrdem"]:checked');
      form.ordemContas = ordemRadio ? ordemRadio.value : "";
      const imprimirRadio = container.querySelector('input[name="dreImprimir"]:checked');
      form.imprimirConta = imprimirRadio ? imprimirRadio.value : "";

      form.niveis = new Set(
        Array.from(container.querySelectorAll("#dreNiveis input:checked")).map((input) => input.value)
      );
      form.destaqueAnalitica = document.getElementById("dreDestaque").checked;
      form.ignoraZeramento = document.getElementById("dreIgnoraZeramento").checked;
      form.periodoAtual = document.getElementById("drePeriodoAtual").checked;
      form.extenso = extensoCheck.checked;

      atualizarDescricoes();

      const resultado = Validators.validarDre(form, config.respostas, empresa.segmento);
      const extensoOk = extensoCheck.checked;
      const corretos = Object.values(resultado).filter(Boolean).length + (extensoOk ? 1 : 0);

      container.querySelectorAll("#dreStepsList li").forEach((li) => {
        const ok = li.dataset.passo === PASSO_EXTENSO_DRE ? extensoOk : !!resultado[li.dataset.passo];
        li.classList.toggle("is-ok", ok);
      });

      const statusEl = document.getElementById("dreStatus");
      statusEl.textContent = `${corretos} de ${totalDre} itens corretos`;
      statusEl.classList.toggle("is-ok", corretos === totalDre);
      statusEl.classList.toggle("is-pending", corretos !== totalDre);
      document.getElementById("dreProgresso").textContent = `${corretos} de ${totalDre} corretos`;

      const tudoDre = Object.values(resultado).every(Boolean) && extensoOk;
      document.getElementById("btnAvancarDre").disabled = !(tudoDre || State.modoLivre);
    }

    container.addEventListener("input", atualizar);
    container.addEventListener("change", atualizar);
    document.getElementById("btnVoltarDre").addEventListener("click", () => Navigation.goTo("balanco"));
    document.getElementById("btnVerificarDre").addEventListener("click", () => {
      atualizar();
      const pendente = container.querySelector("#dreStepsList li:not(.is-ok)");
      if (pendente) pendente.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    document.getElementById("btnAvancarDre").addEventListener("click", () => Navigation.goTo("analise"));

    atualizar();
  }

  /* -------------------------------------------------------
     Tela: Análise do Balanço
     ------------------------------------------------------- */

  function renderAnalise() {
    const container = document.getElementById("analiseContainer");
    const config = State.analiseConfig;

    function montarTabela(tabela) {
      if (!tabela) return "";
      const cabecalho = tabela.colunas.map((coluna) => `<th>${escapeHtml(coluna)}</th>`).join("");
      const linhas = tabela.linhas
        .map((linha) => `<tr>${linha.map((celula) => `<td>${escapeHtml(celula)}</td>`).join("")}</tr>`)
        .join("");
      return `<table class="mini-table"><thead><tr>${cabecalho}</tr></thead><tbody>${linhas}</tbody></table>`;
    }

    function montarTutorialEncerramento() {
      return `
        <div class="tut-wrap" id="tutEncerramento">
          <p class="tut-titulo">Como verificar no sistema (passo a passo):</p>
          <div class="tut-step is-active" data-step="1">
            <p class="tut-instrucao"><strong>Passo 1 de 3 —</strong> No menu superior, clique em <strong>Processos</strong> e depois em <strong>"Encerramento do exercício - zeramento..."</strong></p>
            <div class="tut-img-wrap"><img src="static/img/analise/step1.png" alt="Menu Processos — Encerramento do exercício"></div>
          </div>
          <div class="tut-step" data-step="2">
            <p class="tut-instrucao"><strong>Passo 2 de 3 —</strong> Na janela que abre, clique na <strong>primeira lupa da esquerda para direita</strong> (ícone acima do número da empresa) para consultar os encerramentos já realizados.</p>
            <div class="tut-img-wrap"><img src="static/img/analise/step2.png" alt="Formulário Encerramento do exercício - zeramento"></div>
          </div>
          <div class="tut-step" data-step="3">
            <p class="tut-instrucao"><strong>Passo 3 de 3 —</strong> Na consulta de encerramentos, analise as informações conforme o enquadramento da empresa:</p>
            <ul class="tut-lista">
              <li>Lucro Real ou Presumido → encerra <strong>trimestralmente</strong> (contas 680, 681, 682, 683)</li>
              <li>Simples Nacional → encerra <strong>anualmente</strong> (conta 684)</li>
              <li>Verifique as colunas <em>Data inicial</em>, <em>Data final</em> e <em>Complemento</em> para confirmar o período correto.</li>
            </ul>
            <div class="tut-img-wrap"><img src="static/img/analise/step3.png" alt="Consulta encerramento do exercício"></div>
          </div>
          <div class="tut-nav">
            <button class="btn btn-ghost tut-prev" disabled>← Anterior</button>
            <span class="tut-indicador">Passo 1 de 3</span>
            <button class="btn btn-ghost tut-next">Próximo →</button>
          </div>
        </div>`;
    }

    container.innerHTML = `
      <div class="screen-head">
        <p class="eyebrow">Sistema Único · ${escapeHtml(State.empresaSelecionada.apelido)}</p>
        <h2>${escapeHtml(config.titulo)}</h2>
        <p class="subtitulo">${escapeHtml(config.subtitulo)} Revise cada ponto abaixo antes de fechar o relatório.</p>
        ${State.modoLivre ? '<p class="modo-livre-badge">⚡ Modo livre: você pode concluir mesmo sem revisar todos os pontos.</p>' : ""}
      </div>
      <p class="analise-progress" id="analiseProgresso">0 de ${config.topicos.length} revisados</p>
      <div id="topicosWrap">
        ${config.topicos
          .map(
            (topico) => `
            <div class="topico" data-topico="${topico.id}">
              <div class="topico-head">
                <span class="num">${String(topico.id).padStart(2, "0")}</span>
                <div class="titulos">
                  <h4>${escapeHtml(topico.titulo)}</h4>
                  <p>${escapeHtml(topico.resumo)}</p>
                </div>
                <span class="chevron">▶</span>
              </div>
              <div class="topico-body">
                <ul>${topico.detalhes.map((linha) => `<li>${escapeHtml(linha)}</li>`).join("")}</ul>
                ${topico.id === 1 ? montarTutorialEncerramento() : ""}
                ${montarTabela(topico.tabela)}
                <label class="topico-confirm">
                  <input type="checkbox" data-confirma="${topico.id}"> Revisei este ponto
                </label>
              </div>
            </div>`
          )
          .join("")}
      </div>
      <div class="btn-row">
        <button class="btn btn-ghost" id="btnVoltarAnalise">← Voltar</button>
        <button class="btn btn-primary" id="btnConcluirTreinamento" disabled>Concluir treinamento</button>
      </div>
    `;

    container.querySelectorAll(".topico-head").forEach((head) => {
      head.addEventListener("click", () => {
        head.closest(".topico").classList.toggle("is-open");
      });
    });

    // Tutorial interativo do tópico 1
    const tutWrap = document.getElementById("tutEncerramento");
    if (tutWrap) {
      function irParaPasso(n) {
        const steps = tutWrap.querySelectorAll(".tut-step");
        steps.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
        tutWrap.querySelector(".tut-indicador").textContent = `Passo ${n} de ${steps.length}`;
        tutWrap.querySelector(".tut-prev").disabled = n === 1;
        tutWrap.querySelector(".tut-next").disabled = n === steps.length;
      }
      tutWrap.querySelector(".tut-prev").addEventListener("click", () => {
        const atual = Number(tutWrap.querySelector(".tut-step.is-active").dataset.step);
        if (atual > 1) irParaPasso(atual - 1);
      });
      tutWrap.querySelector(".tut-next").addEventListener("click", () => {
        const atual = Number(tutWrap.querySelector(".tut-step.is-active").dataset.step);
        const total = tutWrap.querySelectorAll(".tut-step").length;
        if (atual < total) irParaPasso(atual + 1);
      });
    }

    function atualizarProgresso() {
      const total = config.topicos.length;
      const revisados = State.analiseRevisados.size;
      document.getElementById("analiseProgresso").textContent = `${revisados} de ${total} revisados`;
      document.getElementById("btnConcluirTreinamento").disabled = !(revisados === total || State.modoLivre);
    }

    container.querySelectorAll("[data-confirma]").forEach((checkbox) => {
      checkbox.checked = State.analiseRevisados.has(Number(checkbox.dataset.confirma));
      checkbox.addEventListener("change", (evento) => {
        const id = Number(checkbox.dataset.confirma);
        if (evento.target.checked) {
          State.analiseRevisados.add(id);
        } else {
          State.analiseRevisados.delete(id);
        }
        atualizarProgresso();
      });
      checkbox.addEventListener("click", (evento) => evento.stopPropagation());
    });

    document.getElementById("btnVoltarAnalise").addEventListener("click", () => Navigation.goTo("dre"));
    document.getElementById("btnConcluirTreinamento").addEventListener("click", () => Navigation.goTo("final"));

    atualizarProgresso();
  }

  /* -------------------------------------------------------
     Tela: Final / Contatos
     ------------------------------------------------------- */

  function renderFinal() {
    const container = document.getElementById("finalContainer");
    const contatos = State.contatosConfig;

    container.innerHTML = `
      <div class="screen-head">
        <p class="eyebrow">Treinamento concluído</p>
        <h2>Parabéns, ${escapeHtml(State.usuario || "usuário")}!</h2>
        <p class="subtitulo">Você concluiu o passo a passo de Balanço Patrimonial, DRE e o checklist de análise.</p>
      </div>
      <div class="final-banner">Sempre que tiver dúvidas na geração dos relatórios, fale com o time contábil abaixo.</div>
      <div class="card">
        <h3 style="margin-bottom: 14px;">${escapeHtml(contatos.titulo)}</h3>
        <div class="contatos-grid">
          ${contatos.contatos
            .map(
              (pessoa) => `
              <div class="contato-card">
                <h4>${escapeHtml(pessoa.nome)}</h4>
                <p class="cargo">${escapeHtml(pessoa.cargo)}</p>
                <p class="linha">${escapeHtml(pessoa.email)}</p>
                <p class="linha">Cel: ${escapeHtml(pessoa.celular)}</p>
              </div>`
            )
            .join("")}
        </div>
        <p class="endereco-card">${escapeHtml(contatos.endereco)}<br>Telefone: ${escapeHtml(contatos.telefone)}</p>
      </div>
      <div class="btn-row">
        <button class="btn btn-ghost" id="btnReiniciar">Reiniciar treinamento</button>
      </div>
    `;

    document.getElementById("btnReiniciar").addEventListener("click", () => {
      reiniciarTreinamento();
      Navigation.resetFormScreens();
      Navigation.goTo("cover");
    });
  }

  return { renderEmpresa, renderBalanco, renderDre, renderAnalise, renderFinal, escapeHtml };
})();