/* =========================================================
   VALIDATORS.JS — confere as respostas dos formulários
   simulados contra a configuração correta vinda de /data
   ========================================================= */

const Validators = (() => {
  function normalizar(valor) {
    return (valor || "").toString().trim().toLowerCase();
  }

  function periodoValido(form) {
    if (!form.dataInicial || !form.dataFinal) return false;
    return form.dataInicial <= form.dataFinal;
  }

  function niveisIguais(setAtual, listaEsperada) {
    if (setAtual.size !== listaEsperada.length) return false;
    return listaEsperada.every((nivel) => setAtual.has(nivel));
  }

  function validarBalanco(form, respostas) {
    return {
      empresa: true,
      periodo: periodoValido(form),
      contabilizacao: form.contabilizacao === respostas.contabilizacao,
      contaInicial: normalizar(form.contaInicial) === normalizar(respostas.contaInicial),
      contaFinal: normalizar(form.contaFinal) === normalizar(respostas.contaFinal),
      niveis: niveisIguais(form.niveis, respostas.niveis),
      consolidadas: form.consolidadas === respostas.consolidadas,
      formulas: form.formulas === respostas.formulas,
      somarFormulas: form.somarFormulas === respostas.somarFormulas,
    };
  }

  function validarDre(form, respostas, segmentoEmpresa) {
    const planoEsperado = respostas.planoPorSegmento[segmentoEmpresa] || "";
    return {
      empresa: true,
      periodo: periodoValido(form),
      contabilizacao: form.contabilizacao === respostas.contabilizacao,
      plano: normalizar(form.plano) === normalizar(planoEsperado),
      formulaInicial: normalizar(form.formulaInicial) === normalizar(respostas.formulaInicial),
      formulaFinal: normalizar(form.formulaFinal) === normalizar(respostas.formulaFinal),
      notaExplicativa: form.notaExplicativa === respostas.notaExplicativa,
      niveis: niveisIguais(form.niveis, respostas.niveis),
      ordemContas: form.ordemContas === respostas.ordemContas,
      imprimirConta: form.imprimirConta === respostas.imprimirConta,
      destaqueAnalitica: form.destaqueAnalitica === respostas.destaqueAnalitica,
      ignoraZeramento: form.ignoraZeramento === respostas.ignoraZeramento,
      periodoAtual: form.periodoAtual === respostas.periodoAtual,
    };
  }

  function tudoOk(resultado) {
    return Object.values(resultado).every(Boolean);
  }

  return { validarBalanco, validarDre, tudoOk };
})();
