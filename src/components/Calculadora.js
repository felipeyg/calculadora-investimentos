import React, { useState } from 'react';
import './Calculadora.css';

function Calculadora() {
  // Estado para lista de investimentos
  const [investimentos, setInvestimentos] = useState([
    {
      id: 1,
      nome: "Investimento 1",
      valorInicial: '',
      valorMensal: '',
      taxaJuros: '',
      periodo: '',
      resultados: null
    }
  ]);
  
  // Estado para resultados consolidados
  const [resultadosConsolidados, setResultadosConsolidados] = useState(null);

  // Adicionar novo investimento
  const adicionarInvestimento = () => {
    const novoId = investimentos.length > 0 
      ? Math.max(...investimentos.map(inv => inv.id)) + 1 
      : 1;
    
    setInvestimentos([
      ...investimentos,
      {
        id: novoId,
        nome: `Investimento ${novoId}`,
        valorInicial: '',
        valorMensal: '',
        taxaJuros: '',
        periodo: '',
        resultados: null
      }
    ]);
  };

  // Remover investimento
  const removerInvestimento = (id) => {
    if (investimentos.length <= 1) {
      alert("É necessário manter pelo menos um investimento!");
      return;
    }
    
    setInvestimentos(investimentos.filter(inv => inv.id !== id));
  };

  // Atualizar valores de um investimento específico
  const atualizarInvestimento = (id, campo, valor) => {
    setInvestimentos(investimentos.map(inv => 
      inv.id === id ? { ...inv, [campo]: valor } : inv
    ));
  };

  // Função para calcular um investimento individual
  const calcularInvestimentoIndividual = (investimento, saldoInicial = 0) => {
    // Converter valores para números
    const principal = parseFloat(investimento.valorInicial) || saldoInicial;
    const aporteMensal = parseFloat(investimento.valorMensal) || 0;
    const taxa = parseFloat(investimento.taxaJuros) / 100; // Convertendo porcentagem para decimal
    const meses = parseInt(investimento.periodo) || 0;
    
    // Array para armazenar os resultados de cada mês
    const resultadosMensais = [];
    
    // Valor acumulado inicializa com o valor principal
    let valorAcumulado = principal;
    // Total investido, no caso de investimento sequencial, considera apenas o que for aportado neste investimento
    let totalInvestido = saldoInicial > 0 ? 0 : principal;
    // Registra o valor transferido do investimento anterior (se houver)
    const valorTransferidoDeInvestimentoAnterior = saldoInicial;
    
    // Calcular para cada mês
    for (let i = 1; i <= meses; i++) {
      // Adicionar o aporte mensal
      valorAcumulado += aporteMensal;
      totalInvestido += aporteMensal;
      
      // Aplicar os juros
      const jurosDoMes = valorAcumulado * (taxa / 12);
      valorAcumulado += jurosDoMes;
      
      // Adicionar ao array de resultados
      resultadosMensais.push({
        mes: i,
        valorAcumulado: valorAcumulado,
        jurosDoMes: jurosDoMes,
        totalInvestido: totalInvestido,
        totalJuros: (valorAcumulado - totalInvestido - valorTransferidoDeInvestimentoAnterior)
      });
    }
    
    // Retornar os resultados
    return {
      valorFinal: valorAcumulado,
      valorInicial: principal,
      totalInvestido: totalInvestido,
      valorTransferidoDeInvestimentoAnterior: valorTransferidoDeInvestimentoAnterior,
      totalJuros: (valorAcumulado - totalInvestido - valorTransferidoDeInvestimentoAnterior),
      resultadosMensais: resultadosMensais
    };
  };

  // Calcular todos os investimentos sequencialmente
  const calcularTodosInvestimentos = (e) => {
    e.preventDefault();
    
    // Ordenar investimentos por ID para garantir ordem de cálculo
    const investimentosOrdenados = [...investimentos].sort((a, b) => a.id - b.id);
    const novosInvestimentos = [];
    
    // Valor que será transferido entre investimentos
    let saldoAcumulado = 0;
    let mesesAcumulados = 0;
    
    // Calcular cada investimento sequencialmente
    for (const investimento of investimentosOrdenados) {
      let valorInicialEfetivo = 0;
      
      // Se não for o primeiro investimento, o valor inicial é o saldo do anterior
      if (novosInvestimentos.length > 0) {
        valorInicialEfetivo = saldoAcumulado;
      } else if (parseFloat(investimento.valorInicial) > 0) {
        valorInicialEfetivo = parseFloat(investimento.valorInicial);
      }
      
      // Calcular o investimento atual
      const resultados = calcularInvestimentoIndividual(investimento, novosInvestimentos.length > 0 ? saldoAcumulado : 0);
      
      // Atualizar o saldo acumulado para o próximo investimento
      saldoAcumulado = resultados.valorFinal;
      
      // Ajustar os meses nos resultados para refletir a sequência
      const resultadosAjustados = {
        ...resultados,
        resultadosMensais: resultados.resultadosMensais.map(res => ({
          ...res,
          mesSequencial: res.mes + mesesAcumulados
        }))
      };
      
      // Adicionar aos investimentos calculados
      novosInvestimentos.push({ 
        ...investimento, 
        resultados: resultadosAjustados,
        mesInicio: mesesAcumulados + 1
      });
      
      // Acumular meses para o próximo investimento
      mesesAcumulados += parseInt(investimento.periodo) || 0;
    }
    
    // Atualizar o estado dos investimentos com os resultados
    setInvestimentos(novosInvestimentos);
    
    // Calcular resultados consolidados
    calcularResultadosConsolidados(novosInvestimentos, mesesAcumulados);
  };

  // Calcular resultados consolidados (em sequência)
  const calcularResultadosConsolidados = (investimentosCalculados, totalMeses) => {
    if (totalMeses <= 0) {
      setResultadosConsolidados(null);
      return;
    }
    
    // Criar array para resultados mensais consolidados
    const resultadosMensaisConsolidados = Array(totalMeses).fill().map((_, i) => ({
      mes: i + 1,
      valorAcumulado: 0,
      jurosDoMes: 0,
      totalInvestido: 0,
      totalJuros: 0,
      investimentoAtivo: null
    }));
    
    // Para cada investimento, adicionar seus valores nos meses correspondentes
    investimentosCalculados.forEach(inv => {
      if (!inv.resultados || !inv.resultados.resultadosMensais) return;
      
      const mesInicio = inv.mesInicio || 1;
      
      inv.resultados.resultadosMensais.forEach((resMes, idx) => {
        const mesGlobal = mesInicio + idx - 1;
        
        if (mesGlobal < resultadosMensaisConsolidados.length) {
          resultadosMensaisConsolidados[mesGlobal].valorAcumulado = resMes.valorAcumulado;
          resultadosMensaisConsolidados[mesGlobal].jurosDoMes = resMes.jurosDoMes;
          resultadosMensaisConsolidados[mesGlobal].totalInvestido += resMes.totalInvestido;
          resultadosMensaisConsolidados[mesGlobal].totalJuros = resMes.totalJuros;
          resultadosMensaisConsolidados[mesGlobal].investimentoAtivo = inv.nome;
        }
      });
    });
    
    // Ajustar o total investido acumulado
    let totalInvestidoAcumulado = 0;
    resultadosMensaisConsolidados.forEach(res => {
      // Somar apenas o que foi efetivamente investido neste mês
      // (diferença entre o total investido deste mês e o anterior)
      const investidoAnterior = totalInvestidoAcumulado;
      if (res.mes === 1) {
        totalInvestidoAcumulado = res.totalInvestido;
      } else {
        const investimentoAnterior = resultadosMensaisConsolidados[res.mes - 2];
        // Se mudou de investimento, considerar apenas o que foi efetivamente aportado
        const novoValorInvestido = res.totalInvestido - investimentoAnterior.totalInvestido;
        if (novoValorInvestido > 0) {
          totalInvestidoAcumulado += novoValorInvestido;
        }
      }
    });
    
    // Pegar o último valor acumulado e o total investido para calcular juros
    const valorFinalTotal = resultadosMensaisConsolidados[resultadosMensaisConsolidados.length - 1].valorAcumulado;
    
    // Calcular o total efetivamente investido (aportes iniciais e mensais)
    const totalInvestidoEfetivo = investimentosCalculados.reduce((total, inv) => {
      // Considerar apenas o aporte inicial do primeiro investimento
      const valorInicial = inv.id === investimentosCalculados[0].id ? 
        (parseFloat(inv.valorInicial) || 0) : 0;
      
      // Somar todos os aportes mensais
      const totalAportesMensais = (parseFloat(inv.valorMensal) || 0) * (parseInt(inv.periodo) || 0);
      
      return total + valorInicial + totalAportesMensais;
    }, 0);
    
    const totalJurosGeral = valorFinalTotal - totalInvestidoEfetivo;
    
    setResultadosConsolidados({
      valorFinal: valorFinalTotal,
      totalInvestido: totalInvestidoEfetivo,
      totalJuros: totalJurosGeral,
      resultadosMensais: resultadosMensaisConsolidados
    });
  };

  // Formatar valores para moeda brasileira
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Alternar visualização detalhada de um investimento
  const [investimentoDetalhado, setInvestimentoDetalhado] = useState(null);
  
  const toggleDetalhes = (id) => {
    if (investimentoDetalhado === id) {
      setInvestimentoDetalhado(null);
    } else {
      setInvestimentoDetalhado(id);
    }
  };

  // Renomear investimento
  const renomearInvestimento = (id, novoNome) => {
    if (!novoNome.trim()) return;
    
    setInvestimentos(investimentos.map(inv => 
      inv.id === id ? { ...inv, nome: novoNome } : inv
    ));
  };

  return (
    <div className="calculadora-container">
      <h1>Calculadora de Investimentos Sequenciais</h1>
      <p className="info-sequencial">
        Os investimentos são calculados em sequência. O saldo final do investimento anterior
        é transferido automaticamente como saldo inicial do próximo investimento.
      </p>
      
      <form onSubmit={calcularTodosInvestimentos}>
        {investimentos.map((investimento, index) => (
          <div key={investimento.id} className="investimento-card">
            <div className="investimento-header">
              <div className="investimento-nome-container">
                <input
                  type="text"
                  className="investimento-nome"
                  value={investimento.nome}
                  onChange={(e) => renomearInvestimento(investimento.id, e.target.value)}
                />
                {index > 0 && investimento.resultados && investimento.resultados.valorTransferidoDeInvestimentoAnterior > 0 && (
                  <div className="valor-transferido">
                    <span>Valor transferido do investimento anterior: </span>
                    <span>{formatarMoeda(investimento.resultados.valorTransferidoDeInvestimentoAnterior)}</span>
                  </div>
                )}
              </div>
              <button 
                type="button" 
                className="remover-btn"
                onClick={() => removerInvestimento(investimento.id)}
              >
                ×
              </button>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Valor Inicial (R$):</label>
                <input
                  type="number"
                  value={investimento.valorInicial}
                  onChange={(e) => atualizarInvestimento(investimento.id, 'valorInicial', e.target.value)}
                  placeholder="Ex: 1000"
                  min="0"
                  step="0.01"
                  disabled={index > 0} // Desabilita para investimentos após o primeiro
                />
                {index > 0 && (
                  <div className="input-help">Será o saldo final do investimento anterior</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Aporte Mensal (R$):</label>
                <input
                  type="number"
                  value={investimento.valorMensal}
                  onChange={(e) => atualizarInvestimento(investimento.id, 'valorMensal', e.target.value)}
                  placeholder="Ex: 100"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Taxa de Juros (% ao ano):</label>
                <input
                  type="number"
                  value={investimento.taxaJuros}
                  onChange={(e) => atualizarInvestimento(investimento.id, 'taxaJuros', e.target.value)}
                  placeholder="Ex: 12"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Período (meses):</label>
                <input
                  type="number"
                  value={investimento.periodo}
                  onChange={(e) => atualizarInvestimento(investimento.id, 'periodo', e.target.value)}
                  placeholder="Ex: 12"
                  min="1"
                  step="1"
                />
              </div>
            </div>
            
            {investimento.resultados && (
              <div className="resultado-resumo">
                <div className="resultado-resumo-item">
                  <span>Valor Final:</span>
                  <span>{formatarMoeda(investimento.resultados.valorFinal)}</span>
                </div>
                <button 
                  type="button" 
                  className="detalhe-btn"
                  onClick={() => toggleDetalhes(investimento.id)}
                >
                  {investimentoDetalhado === investimento.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                </button>
              </div>
            )}
            
            {investimentoDetalhado === investimento.id && investimento.resultados && (
              <div className="detalhes-investimento">
                <h3>Detalhes de {investimento.nome}</h3>
                
                <div className="resultado-final">
                  <div className="resultado-item">
                    <h4>Valor Final</h4>
                    <p>{formatarMoeda(investimento.resultados.valorFinal)}</p>
                  </div>
                  
                  <div className="resultado-item">
                    <h4>Total Investido</h4>
                    <p>{formatarMoeda(investimento.resultados.totalInvestido)}</p>
                  </div>
                  
                  <div className="resultado-item">
                    <h4>Total em Juros</h4>
                    <p>{formatarMoeda(investimento.resultados.totalJuros)}</p>
                  </div>
                </div>
                
                <h4>Evolução Mensal</h4>
                <div className="tabela-container">
                  <table className="tabela-resultados">
                    <thead>
                      <tr>
                        <th>Mês</th>
                        <th>Mês Sequencial</th>
                        <th>Valor Acumulado</th>
                        <th>Juros no Mês</th>
                        <th>Total Investido</th>
                        <th>Total em Juros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investimento.resultados.resultadosMensais.map((resultado) => (
                        <tr key={resultado.mes}>
                          <td>{resultado.mes}</td>
                          <td>{resultado.mesSequencial}</td>
                          <td>{formatarMoeda(resultado.valorAcumulado)}</td>
                          <td>{formatarMoeda(resultado.jurosDoMes)}</td>
                          <td>{formatarMoeda(resultado.totalInvestido)}</td>
                          <td>{formatarMoeda(resultado.totalJuros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="botoes-container">
          <button 
            type="button" 
            className="adicionar-btn"
            onClick={adicionarInvestimento}
          >
            Adicionar Investimento
          </button>
          
          <button type="submit" className="calcular-btn">
            Calcular Investimentos Sequenciais
          </button>
        </div>
      </form>
      
      {resultadosConsolidados && (
        <div className="resultados">
          <h2>Resultados Consolidados</h2>
          
          <div className="resultado-final">
            <div className="resultado-item">
              <h3>Valor Final Total</h3>
              <p>{formatarMoeda(resultadosConsolidados.valorFinal)}</p>
            </div>
            
            <div className="resultado-item">
              <h3>Total Investido</h3>
              <p>{formatarMoeda(resultadosConsolidados.totalInvestido)}</p>
            </div>
            
            <div className="resultado-item">
              <h3>Total em Juros</h3>
              <p>{formatarMoeda(resultadosConsolidados.totalJuros)}</p>
            </div>
          </div>
          
          <h3>Evolução Mensal Consolidada</h3>
          <div className="tabela-container">
            <table className="tabela-resultados">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Investimento Ativo</th>
                  <th>Valor Acumulado</th>
                  <th>Juros no Mês</th>
                  <th>Total Investido</th>
                  <th>Total em Juros</th>
                </tr>
              </thead>
              <tbody>
                {resultadosConsolidados.resultadosMensais.map((resultado) => (
                  <tr key={resultado.mes}>
                    <td>{resultado.mes}</td>
                    <td>{resultado.investimentoAtivo}</td>
                    <td>{formatarMoeda(resultado.valorAcumulado)}</td>
                    <td>{formatarMoeda(resultado.jurosDoMes)}</td>
                    <td>{formatarMoeda(resultado.totalInvestido)}</td>
                    <td>{formatarMoeda(resultado.totalJuros)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calculadora;