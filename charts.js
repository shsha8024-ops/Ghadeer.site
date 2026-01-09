'use strict';

/* Minimal charts helper for the Accounts UI.
   Exposes: window.renderMonthlyYearlyCharts(data)
   Requires: Chart.js loaded (index.html already loads it).
*/

let _monthlyChart = null;
let _yearlyChart = null;

function _sumByMonth(invoices, expenses){
  const map = new Map(); // key YYYY-MM -> {in, ex}
  const add = (key, field, val)=>{
    if(!map.has(key)) map.set(key, {in:0, ex:0});
    map.get(key)[field] += (Number(val)||0);
  };
  invoices.forEach(i=>{
    const d = String(i.date||'').slice(0,7);
    if(d && /^\d{4}-\d{2}$/.test(d)) add(d,'in', i.amount);
  });
  expenses.forEach(e=>{
    const d = String(e.date||'').slice(0,7);
    if(d && /^\d{4}-\d{2}$/.test(d)) add(d,'ex', e.amount);
  });
  const keys = [...map.keys()].sort();
  return { keys, vals: keys.map(k=>map.get(k)) };
}

function _sumByYear(invoices, expenses){
  const map = new Map(); // key YYYY
  const add = (key, field, val)=>{
    if(!map.has(key)) map.set(key, {in:0, ex:0});
    map.get(key)[field] += (Number(val)||0);
  };
  invoices.forEach(i=>{
    const y = String(i.date||'').slice(0,4);
    if(y && /^\d{4}$/.test(y)) add(y,'in', i.amount);
  });
  expenses.forEach(e=>{
    const y = String(e.date||'').slice(0,4);
    if(y && /^\d{4}$/.test(y)) add(y,'ex', e.amount);
  });
  const keys = [...map.keys()].sort();
  return { keys, vals: keys.map(k=>map.get(k)) };
}

window.renderMonthlyYearlyCharts = function(data){
  try{
    if(!window.Chart) return;
    data = data || {invoices:[], expenses:[]};

    // Monthly
    const m = _sumByMonth(data.invoices||[], data.expenses||[]);
    const mLabels = m.keys;
    const mNet = m.vals.map(x=>(x.in - x.ex));

    const mCanvas = document.getElementById('monthlyChart');
    if(mCanvas){
      if(_monthlyChart) _monthlyChart.destroy();
      _monthlyChart = new Chart(mCanvas, {
        type: 'line',
        data: {
          labels: mLabels,
          datasets: [{
            label: 'الصافي الشهري',
            data: mNet,
            tension: 0.35
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Yearly
    const y = _sumByYear(data.invoices||[], data.expenses||[]);
    const yLabels = y.keys;
    const yNet = y.vals.map(x=>(x.in - x.ex));

    const yCanvas = document.getElementById('yearlyChart');
    if(yCanvas){
      if(_yearlyChart) _yearlyChart.destroy();
      _yearlyChart = new Chart(yCanvas, {
        type: 'bar',
        data: {
          labels: yLabels,
          datasets: [{
            label: 'الصافي السنوي',
            data: yNet
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }catch(e){
    console.warn('charts failed', e);
  }
};
