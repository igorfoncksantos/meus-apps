/* som.js — o som dos apps, gerado por codigo.

   Nao ha arquivo de audio nenhum: cada som e calculado na hora pelo navegador.
   Por isso pesa zero no download, funciona offline e nao precisa entrar no
   cache do operador como midia.

   Uso:  som('feito')   — e so isso.

   REGRA DO NAVEGADOR: o contexto de audio so pode nascer DENTRO de um toque.
   Por isso ele e criado preguicosamente, na primeira vez que um som toca — e
   todos os sons daqui saem de uma acao do usuario, entao sempre ha permissao.

   O liga/desliga mora no APARELHO, nao na conta: som e preferencia de lugar.
   No onibus se quer mudo; em casa, nao. A chave e uma so pros cinco apps
   (mesmo endereco), porque o que a pessoa quer e um interruptor, nao cinco. */
(function () {
  var CHAVE = 'apps-som';
  var ctx = null;

  function ligado() {
    try { return localStorage.getItem(CHAVE) !== '0'; } catch (e) { return true; }
  }
  function ac() {
    if (!ligado()) return null;
    try {
      if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  /* uma nota: onda, frequencia (ou deslize), duracao e volume */
  function nota(o) {
    var a = ac(); if (!a) return;
    try {
      var t = a.currentTime + (o.atraso || 0);
      var osc = a.createOscillator(), g = a.createGain();
      osc.type = o.onda || 'sine';
      osc.frequency.setValueAtTime(o.de, t);
      if (o.para) osc.frequency.exponentialRampToValueAtTime(o.para, t + o.dur);
      /* o ataque de 8ms evita o estalo de comecar no volume cheio */
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol || 0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
      osc.connect(g); g.connect(a.destination);
      osc.start(t); osc.stop(t + o.dur + 0.02);
    } catch (e) {}
  }

  var SONS = {
    /* ---- a recompensa ---- */
    feito:   function () { nota({ de: 660, dur: 0.09, vol: 0.15 });
                           nota({ de: 880, dur: 0.16, vol: 0.15, atraso: 0.075 }); },
    dia:     function () { [523, 659, 784, 1047].forEach(function (f, i) {
                             nota({ de: f, dur: 0.20, vol: 0.12, atraso: i * 0.075 }); }); },
    salvo:   function () { nota({ de: 760, dur: 0.10, vol: 0.10 }); },
    meta:    function () { [523, 659, 784].forEach(function (f, i) {
                             nota({ de: f, dur: 0.26, vol: 0.13, atraso: i * 0.055 }); });
                           nota({ de: 1047, dur: 0.42, vol: 0.11, atraso: 0.17 }); },
    /* ---- o aviso ---- */
    erro:    function () { nota({ onda: 'square', de: 180, dur: 0.09, vol: 0.08 });
                           nota({ onda: 'square', de: 150, dur: 0.13, vol: 0.08, atraso: 0.085 }); },
    atencao: function () { nota({ onda: 'triangle', de: 880, dur: 0.10, vol: 0.11 });
                           nota({ onda: 'triangle', de: 880, dur: 0.10, vol: 0.11, atraso: 0.16 }); }
  };

  /* ---------- uma acao, um som ----------
     Concluir a ultima tarefa do dia pede "feito", "meta" e "dia" ao mesmo
     tempo. Empilhados viram barulho. Os pedidos da mesma acao caem numa
     janela de 30ms e so o mais importante toca — fechar o dia ja contem
     concluir a tarefa. */
  var PESO = { dia: 3, meta: 2, feito: 1, salvo: 1, atencao: 1, erro: 1 };
  var _fila = null, _t = null;

  /* som que nao existe nao quebra nada, so nao toca */
  window.som = function (nome) {
    if (!SONS[nome]) return;
    if (!_fila || (PESO[nome] || 1) > (PESO[_fila] || 1)) _fila = nome;
    if (_t) return;
    _t = setTimeout(function () {
      var n = _fila; _fila = null; _t = null;
      var f = SONS[n]; if (f) try { f(); } catch (e) {}
    }, 30);
  };
  window.somLigado = ligado;
  window.somTrocar = function () {
    var novo = ligado() ? '0' : '1';
    try { localStorage.setItem(CHAVE, novo); } catch (e) {}
    if (novo === '1') window.som('salvo');   /* devolve a resposta na propria moeda */
    return novo === '1';
  };
})();
