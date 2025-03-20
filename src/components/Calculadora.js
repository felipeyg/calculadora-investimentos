import React, { useState } from 'react';
import './Calculadora.css';

function Calculadora() {
  // Estados para armazenar os valores do formulário
  const [valorInicial, setValorInicial] = useState('');
  const [valorMensal, setValorMensal] = useState('');
  const [taxaJuros, setTaxaJuros] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [resultados, setResultados] = useState(null);

  // Função para calcular o investimento
  const calcularInvestimento = (e) => {
    e.preventDefault();
    
    // Converter valores para números
    const principal = parseFloat(valorInicial) || 0;
    const aporteMensal = parseFloat(valorMensal) || 0;
    const taxa = parseFloat(taxaJuros) / 100; // Convertendo porcentagem para decimal
    const meses = parseInt(periodo) || 0;
    
    // Array para armazenar os resultados de cada mês
    const resultadosMensais = [];
    
    // Valor acumulado inicializa com o valor principal
    let valorAcumulado = principal;
    let totalInvestido = principal;
    
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
        totalJuros: valorAcumulado - totalInvestido
      });
    }
    
    // Atualizar o estado com os resultados
    setResultados({
      valorFinal: valorAcumulado,
      totalInvestido: totalInvestido,
      totalJuros: valorAcumulado - totalInvestido,
      resultadosMensais: resultadosMensais
    });
  };

  // Formatar valores para moeda brasileira
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="calculadora-container">
      <h1>Calculadora de Investimentos</h1>
      
      <form onSubmit={calcularInvestimento}>
        <div className="form-group">
          <label>Valor Inicial (R$):</label>
          <input
            type="number"
            value={valorInicial}
            onChange={(e) => setValorInicial(e.target.value)}
            placeholder="Ex: 1000"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label>Aporte Mensal (R$):</label>
          <input
            type="number"
            value={valorMensal}
            onChange={(e) => setValorMensal(e.target.value)}
            placeholder="Ex: 100"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label>Taxa de Juros (% ao ano):</label>
          <input
            type="number"
            value={taxaJuros}
            onChange={(e) => setTaxaJuros(e.target.value)}
            placeholder="Ex: 12"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label>Período (meses):</label>
          <input
            type="number"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            placeholder="Ex: 12"
            min="1"
            step="1"
          />
        </div>
        
        <button type="submit" className="calcular-btn">Calcular</button>
      </form>
      
      {resultados && (
        <div className="resultados">
          <h2>Resultados</h2>
          
          <div className="resultado-final">
            <div className="resultado-item">
              <h3>Valor Final</h3>
              <p>{formatarMoeda(resultados.valorFinal)}</p>
            </div>
            
            <div className="resultado-item">
              <h3>Total Investido</h3>
              <p>{formatarMoeda(resultados.totalInvestido)}</p>
            </div>
            
            <div className="resultado-item">
              <h3>Total em Juros</h3>
              <p>{formatarMoeda(resultados.totalJuros)}</p>
            </div>
          </div>
          
          <h3>Evolução Mensal</h3>
          <div className="tabela-container">
            <table className="tabela-resultados">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Valor Acumulado</th>
                  <th>Juros no Mês</th>
                  <th>Total Investido</th>
                  <th>Total em Juros</th>
                </tr>
              </thead>
              <tbody>
                {resultados.resultadosMensais.map((resultado) => (
                  <tr key={resultado.mes}>
                    <td>{resultado.mes}</td>
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