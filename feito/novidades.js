/* NOVIDADES — o painel de atualizações, compartilhado pelos apps.
   Desenho escolhido em 21/09/2026: dia dobrável (opção 3), com o dia mais
   recente aberto e os outros fechados com a contagem na pílula.

   Por que dobrável: ele publica várias versões no mesmo dia — 17/09 teve sete.
   Uma lista corrida viraria uma parede; dobrada, quinze dias cabem sem rolagem.

   ⚠️ ESTE ARQUIVO É COPIADO NAS PASTAS DOS APPS. A origem é
   C:\Users\igorf\Qualquer\_fixsync\novidades.js — editar aqui e distribuir com
   espalha-novidades.js, nunca editar a cópia de um app (elas divergem em silêncio,
   que é como os keypad.js já se desencontraram antes).

   Como um app liga:  <script src="novidades.js" data-app="norte"></script>
   e um item que chame  abrirNovidades()
   O data-app é obrigatório: o Feito também roda DENTRO do Stash, então derivar
   o nome do caminho diria "stash" na cópia embutida. */
(function () {
  'use strict';

  var JANELA = 15;   /* dias — o que o painel promete mostrar */

  /* =========================================================================
     OS DADOS  —  [versão, data AAAA-MM-DD, o que mudou em uma linha]
     Uma entrada por VERSÃO PUBLICADA, não por commit: versão é o que o app
     mostra no rodapé, e é por ela que ele confere se atualizou. Quando um
     módulo compartilhado muda sem subir a versão daquele app, não entra —
     não houve atualização para quem usa.
     Guardo mais que a janela de propósito: se ele passar um mês sem mexer num
     app, o painel ainda tem o que mostrar no lugar de uma tela vazia.
     ========================================================================= */
  var DADOS = {
    norte: [
      ['v111', '2026-09-21', 'Este painel: o resumo do que mudou, dentro do menu'],
      ['v110', '2026-09-21', 'Reordenar vale também nos dias futuros já abertos'],
      ['v109', '2026-09-21', 'A ordem que você deixa num dia segue nos dias seguintes'],
      ['v108', '2026-09-21', 'Editar rotina pergunta se vale só no dia ou dali em diante'],
      ['v107', '2026-09-17', 'Cinco cores de categoria para o tema Miri'],
      ['v106', '2026-09-17', 'Varredura de harmonia: alvos de toque e escala de fonte'],
      ['v105', '2026-09-17', 'Sai a caixa creme em volta da barra de categorias'],
      ['v104', '2026-09-17', 'Tema Miri refeito com as cores do Daybook'],
      ['v103', '2026-09-17', 'A aba Listas passa a acompanhar os temas'],
      ['v102', '2026-09-17', 'Conserta a aba Listas'],
      ['v101', '2026-09-17', 'A barra do topo em todas as abas'],
      ['v100', '2026-09-16', 'Botão + na Semana e no fim de semana'],
      ['v99',  '2026-09-15', 'Semana e fim de semana no modelo do Dia'],
      ['v98',  '2026-09-15', 'Categoria na Semana; os dias do topo voltam a abrir'],
      ['v97',  '2026-09-15', '“Atribuir categoria” no menu da tarefa'],
      ['v96',  '2026-09-15', 'Tarefa que vira lista, e reordenar com setas'],
      ['v95',  '2026-09-14', 'O fim de semana ganha aba própria'],
      ['v94',  '2026-09-14', 'A aba ocupa a página inteira'],
      ['v93',  '2026-09-14', 'Aba própria para a Semana'],
      ['v92',  '2026-09-12', 'Botão de atualizar: vira o dia sem reabrir o app']
    ],
    stash: [
      ['v143', '2026-09-21', 'Novidades: o resumo do que mudou, nas configurações'],
      ['v142', '2026-09-20', 'Botão de atualizar no cabeçalho, como no Norte'],
      ['v141', '2026-09-11', 'Data completa nas entradas, para as contas por período'],
      ['v140', '2026-09-03', 'Os subitens do Feito ganham significado por categoria'],
      ['v139', '2026-09-03', 'Teclado certo no computador e o corte no iPhone'],
      ['v138', '2026-09-02', 'A versão passa a aparecer no pé da tela'],
      ['v137', '2026-09-02', 'Feito: navegação em dois níveis, categoria e listas'],
      ['v136', '2026-09-02', 'Stash e Feito embutido passam a mostrar a versão']
    ],
    cashbook: [
      ['v61', '2026-09-21', 'Novidades: o resumo do que mudou, nas configurações'],
      ['v60', '2026-09-09', 'O rodapé de versão passa a dizer a verdade'],
      ['v59', '2026-09-03', 'Teclado certo no computador e o corte no iPhone'],
      ['v58', '2026-09-02', 'A maiúscula volta sozinha depois do ponto final'],
      ['v57', '2026-09-02', 'O campo passa a acompanhar o cursor'],
      ['v56', '2026-09-02', 'Teclas 7% mais largas'],
      ['v55', '2026-09-02', 'Teclas mais encorpadas, de 54 para 62px'],
      ['v54', '2026-09-02', 'O acento vira dois toques: o balão fica aberto'],
      ['v53', '2026-09-02', 'O arco fica visível a 0% e brilha conforme enche'],
      ['v52', '2026-09-02', 'O percentual da categoria vira uma conta só']
    ],
    feito: [
      ['v69', '2026-09-21', 'Novidades: o resumo do que mudou, nas configurações'],
      ['v68', '2026-09-03', 'Cada categoria ganha o subitem que faz sentido nela'],
      ['v67', '2026-09-03', 'Teclado certo no computador e o corte no iPhone'],
      ['v66', '2026-09-02', 'A versão vai para o pé da tela'],
      ['v65', '2026-09-02', 'Navegação em dois níveis: categoria e listas'],
      ['v64', '2026-09-02', 'O app passa a mostrar a versão'],
      ['v63', '2026-09-02', 'A frase ao lado do nome sai da categoria'],
      ['v62', '2026-09-02', 'O ☰ sai do cabeçalho e vai para a linha do nome'],
      ['v61', '2026-09-02', 'Receitas, Treino e Rotina: o miolo das três'],
      ['v60', '2026-09-02', 'O menu de três tracinhos vira a porta das categorias'],
      ['v59', '2026-09-02', 'Viagem e Produção'],
      ['v58', '2026-09-02', 'Categoria Compras']
    ],
    daybook: [
      ['v37', '2026-09-21', 'Novidades: o resumo do que mudou, nas configurações'],
      ['v36', '2026-09-09', 'O rodapé de versão passa a dizer a verdade'],
      ['v35', '2026-09-03', 'Teclado certo no computador e o corte no iPhone'],
      ['v34', '2026-09-02', 'A maiúscula volta sozinha depois do ponto final'],
      ['v33', '2026-09-02', 'O campo passa a acompanhar o cursor'],
      ['v32', '2026-09-02', 'Teclas 7% mais largas'],
      ['v31', '2026-09-02', 'Teclas mais encorpadas, de 54 para 62px'],
      ['v30', '2026-09-02', 'O acento vira dois toques: o balão fica aberto'],
      ['v29', '2026-09-02', 'Som no app: a recompensa e o aviso, não o teclado']
    ],
    prospecta: [
      ['v18', '2026-09-21', 'Novidades: o resumo do que mudou, nas configurações'],
      ['v17', '2026-09-19', 'O título da ficha se edita no lugar, sem abrir folha'],
      ['v16', '2026-09-19', 'Editar os dados do topo da ficha'],
      ['v15', '2026-09-10', 'Conserta a caixa dentro da caixa no painel de números'],
      ['v14', '2026-09-10', 'Ficha de campo, importação e proposta em PDF'],
      ['v13', '2026-09-10', 'Orçamento modular na etapa 3'],
      ['v12', '2026-09-10', 'Estudo corporativo, peso por contexto e responsividade']
    ],
    escavacao: [
      ['v8', '2026-09-05', 'Equipe, minérios, a curva de dureza e a chegada de picape'],
      ['v7', '2026-09-04', 'Picareta proporcional e a direção da descida'],
      ['v6', '2026-09-04', 'Corpo articulado e o túnel com volume'],
      ['v5', '2026-09-04', 'O mineiro, o túnel do tamanho dele, e a loja'],
      ['v4', '2026-09-04', 'Rocha de verdade, picareta encorpada e achados visíveis'],
      ['v3', '2026-09-04', 'Aviso de versão nova'],
      ['v2', '2026-09-04', 'Ajuste de toque e de escala na tela do celular']
    ],
    ninho: [
      ['v1', '2026-09-08', 'O protótipo virou app instalável no celular']
    ]
  };

  /* --- qual app está rodando --- */
  var tag = document.currentScript;
  var APP = (tag && tag.getAttribute('data-app')) || '';
  var LISTA = DADOS[APP] || [];

  /* =========================================================================
     A PELE  —  derivada do app em tempo de execução, não escrita por app.
     São oito apps e o Norte sozinho tem cinco temas: uma paleta fixa por app
     significaria manter quarenta. Em vez disso, leio o fundo real da tela e
     derivo o resto dele, então o painel veste o tema que estiver ativo.
     ========================================================================= */
  function parseCor(s) {
    var m = String(s).match(/-?[\d.]+/g);
    if (!m || m.length < 3) return null;
    return { c: [+m[0], +m[1], +m[2]], a: m.length > 3 ? +m[3] : 1 };
  }
  function rgb(s) {
    var p = parseCor(s);
    return (p && p.a > 0.9) ? p.c : null;   /* só cor que serve de chão */
  }
  /* sobe pelos ancestrais até achar cor sólida: o body costuma ser transparente */
  function fundo() {
    var e = document.body, c;
    while (e) {
      c = rgb(getComputedStyle(e).backgroundColor);
      if (c) return c;
      e = e.parentElement;
    }
    c = rgb(getComputedStyle(document.documentElement).getPropertyValue('--bg'));
    return c || [18, 20, 23];
  }
  function lum(c) {
    var v = c.map(function (x) {
      x /= 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function mix(a, b, t) {
    return 'rgb(' + a.map(function (x, i) {
      return Math.round(x + (b[i] - x) * t);
    }).join(',') + ')';
  }
  function razao(a, b) {
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  /* Os tokens vêm do app, mas nada garante que o par que EU montei aqui seja um
     par que o app usa JUNTO. O Daybook define o taupe como uma superfície e o
     creme como outra: combinados do meu jeito davam 2,5:1, ilegível. Um taupe é
     tom médio — contra ele nem branco puro chega a 3:1, então sobre ele se
     escurece. Em vez de adivinhar, eu meço e ando com a cor em direção ao polo
     que ganha, no menor passo que alcança o piso: assim a matiz do app
     sobrevive o máximo possível e a legibilidade é garantida por construção. */
  function ateContraste(cor, fundo, piso) {
    var c = parseCor(normCor(cor)), s = parseCor(normCor(fundo));
    if (!c || !s) return cor;
    if (razao(c.c, s.c) >= piso) return cor;
    /* qual polo ganha se MEDE, não se decide por limiar de luminância: sobre um
       taupe (lum 0,35) o preto dá 8:1 e o branco só 2,6 — um corte em 0,45
       mandaria clarear e o texto ficaria ilegível. Já errei exatamente isso. */
    var polo = razao([0, 0, 0], s.c) >= razao([255, 255, 255], s.c)
      ? [0, 0, 0] : [255, 255, 255];
    for (var t = 0.1; t < 1.001; t += 0.1) {
      var n = c.c.map(function (x, i) { return Math.round(x + (polo[i] - x) * t); });
      if (razao(n, s.c) >= piso) return 'rgb(' + n.join(',') + ')';
    }
    return 'rgb(' + polo.join(',') + ')';
  }
  function tok(n) {
    return (getComputedStyle(document.documentElement).getPropertyValue(n) || '').trim();
  }
  /* Um token pode vir TRANSLÚCIDO: o tema Neon do Norte define --panel como
     rgba(255,255,255,.04), porque lá existe uma aurora atrás pra ele compor.
     Dentro de um overlay esse chão não existe — o painel ficaria quase
     transparente e o texto cairia sobre a tela borrada. Então todo token vira
     cor SÓLIDA, composta sobre o fundo medido, antes de entrar na pele. */
  /* os tokens vêm em hex, e parseCor só lê rgb() — então deixo o próprio
     navegador normalizar: qualquer notação que o CSS aceite volta como rgb/rgba */
  var _sonda = null;
  function normCor(v) {
    if (!v) return '';
    if (!_sonda) {
      _sonda = document.createElement('span');
      _sonda.style.display = 'none';
      document.documentElement.appendChild(_sonda);
    }
    _sonda.style.color = '';
    _sonda.style.color = v;
    if (!_sonda.style.color) return '';            /* o CSS recusou o valor */
    return getComputedStyle(_sonda).color;
  }
  function tokS(n, bg) {
    var p = parseCor(normCor(tok(n)));
    if (!p) return '';
    return p.a > 0.999 ? 'rgb(' + p.c.join(',') + ')' : mix(bg, p.c, p.a);
  }
  function pele() {
    var bg = fundo(), escuro = lum(bg) < 0.4;
    var polo = escuro ? [255, 255, 255] : [0, 0, 0];   /* para onde o contraste anda */
    /* Quando o app TEM sistema de cor, o painel veste o sistema — é isso que o
       faz acompanhar os cinco temas do Norte sem eu escrever cinco paletas.
       Onde o token não existe (Cashbook e Daybook são anteriores aos tokens),
       o valor é derivado do fundo medido, que é o caso geral que sempre serve. */
    var painel = tokS('--panel', bg) || mix(bg, polo, escuro ? 0.09 : 0.03);
    var chao   = tokS('--panel2', bg) || painel;
    /* alguns temas dão o mesmo valor pros dois (o claro do Norte é branco nos
       dois) — aí o cartão do dia não se separaria do fundo do painel */
    if (chao === painel) chao = mix(bg, polo, escuro ? 0.03 : 0.05);
    /* o texto cai em DUAS superfícies — o cartão do dia e o fundo do painel —
       e elas podem divergir. Corrijo contra as duas em sequência: assim passa
       nas duas, em vez de eu escolher uma e torcer pela outra. */
    function legivel(cor, piso) {
      return ateContraste(ateContraste(cor, painel, piso), chao, piso);
    }
    return {
      escuro: escuro,
      painel: painel,
      fundo:  chao,
      linha:  tokS('--line', bg) || mix(bg, polo, 0.16),
      txt:    legivel(tokS('--txt', bg) || mix(bg, polo, 0.92), 4.5),
      mut:    legivel(tokS('--mut', bg) || mix(bg, polo, 0.58), 3.2),
      acc:    legivel(tokS('--accent', bg) || (escuro ? '#2FD9C9' : '#0E8C80'), 3.0),
      veu:    escuro ? 'rgba(0,0,0,.62)' : 'rgba(0,0,0,.38)'
    };
  }

  /* --- datas --- */
  var SEM = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function dt(iso) { return new Date(iso + 'T12:00:00'); }   /* meio-dia: não vira o dia por fuso */
  function rotulo(iso) {
    var d = dt(iso), hoje = new Date(); hoje.setHours(12, 0, 0, 0);
    var dias = Math.round((hoje - d) / 86400000);
    var data = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
    if (dias === 0) return 'Hoje, ' + data;
    if (dias === 1) return 'Ontem, ' + data;
    return SEM[d.getDay()] + ', ' + data;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* --- agrupa por dia, preservando a ordem (mais recente primeiro) --- */
  function porDia(itens) {
    var dias = [], mapa = {};
    itens.forEach(function (it) {
      if (!mapa[it[1]]) { mapa[it[1]] = { data: it[1], itens: [] }; dias.push(mapa[it[1]]); }
      mapa[it[1]].itens.push(it);
    });
    return dias;
  }

  /* --- CSS: injetado uma vez, com a pele do momento em variáveis --- */
  var CSS = [
    '.nvOv{position:fixed;inset:0;z-index:100010;display:flex;align-items:flex-end;',
    '  justify-content:center;background:var(--nv-veu);backdrop-filter:blur(3px);',
    '  -webkit-backdrop-filter:blur(3px);animation:nvFade .18s ease both;}',
    '.nvPn{width:100%;max-width:560px;max-height:86vh;display:flex;flex-direction:column;',
    '  background:var(--nv-fundo);color:var(--nv-txt);border:1px solid var(--nv-linha);',
    '  border-bottom:none;border-radius:16px 16px 0 0;overflow:hidden;',
    '  font:400 14px/1.5 "Segoe UI",system-ui,-apple-system,sans-serif;',
    '  animation:nvSobe .22s cubic-bezier(.2,.8,.3,1) both;}',
    '@keyframes nvFade{from{opacity:0}to{opacity:1}}',
    '@keyframes nvSobe{from{transform:translateY(14px)}to{transform:none}}',
    '@media (prefers-reduced-motion:reduce){.nvOv,.nvPn{animation:none}}',
    /* cabeçalho */
    '.nvTop{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;',
    '  border-bottom:1px solid var(--nv-linha);background:var(--nv-painel);flex:0 0 auto;}',
    '.nvTit{flex:1;min-width:0;}',
    '.nvTit b{display:block;font-size:15.5px;font-weight:700;letter-spacing:-.01em;}',
    '.nvTit span{display:block;font-size:11.5px;color:var(--nv-mut);margin-top:1px;',
    '  font-variant-numeric:tabular-nums;}',
    '.nvX{flex:0 0 auto;width:40px;height:40px;border:1px solid var(--nv-linha);',
    '  border-radius:10px;background:transparent;color:var(--nv-mut);font-size:17px;',
    '  line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}',
    '.nvX:hover{color:var(--nv-txt);}',
    /* corpo */
    '.nvBody{padding:12px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}',
    /* um dia */
    '.nvDia{border:1px solid var(--nv-linha);border-radius:12px;margin-bottom:8px;',
    '  overflow:hidden;background:var(--nv-painel);}',
    '.nvDia:last-child{margin-bottom:0;}',
    '.nvH{display:flex;align-items:center;gap:10px;width:100%;min-height:46px;',
    '  padding:10px 12px;background:transparent;border:0;color:inherit;cursor:pointer;',
    '  font:inherit;text-align:left;}',
    '.nvDia.on .nvH{border-bottom:1px solid var(--nv-linha);}',
    '.nvH b{flex:1;min-width:0;font-size:13.5px;font-weight:700;}',
    '.nvQt{flex:0 0 auto;font-size:10.5px;font-weight:700;color:var(--nv-acc);',
    '  border:1px solid var(--nv-acc);border-radius:20px;padding:2px 8px;line-height:1.4;',
    '  font-variant-numeric:tabular-nums;opacity:.9;}',
    '.nvCh{flex:0 0 auto;color:var(--nv-mut);opacity:.65;font-size:10px;transition:transform .18s ease;}',
    '.nvDia.on .nvCh{transform:rotate(180deg);}',
    '@media (prefers-reduced-motion:reduce){.nvCh{transition:none}}',
    '.nvIn{padding:10px 12px 12px;}',
    '.nvIt{display:flex;gap:9px;margin-bottom:8px;}',
    '.nvIt:last-child{margin-bottom:0;}',
    '.nvV{flex:0 0 34px;font-size:10.5px;color:var(--nv-mut);padding-top:2px;',
    '  font-variant-numeric:tabular-nums;}',
    '.nvT{flex:1;min-width:0;font-size:13px;line-height:1.45;}',
    /* vazio / rodapé */
    '.nvVaz{padding:22px 14px;text-align:center;color:var(--nv-mut);font-size:13px;line-height:1.6;}',
    '.nvPe{flex:0 0 auto;padding:10px 14px;border-top:1px solid var(--nv-linha);',
    '  background:var(--nv-painel);font-size:11.5px;color:var(--nv-mut);text-align:center;',
    '  font-variant-numeric:tabular-nums;}'
  ].join('\n');

  function injetaCSS() {
    if (document.getElementById('nvCSS')) return;
    var st = document.createElement('style');
    st.id = 'nvCSS';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* --- a versão em que o app está: o rodapé é a fonte, senão a lista --- */
  function versaoAtual() {
    if (typeof window.VERSAO === 'string' && window.VERSAO) return window.VERSAO;
    return LISTA.length ? LISTA[0][0] : '';
  }

  var aberto = null;

  function fechar() {
    if (!aberto) return;
    document.removeEventListener('keydown', naTecla);
    aberto.remove();
    aberto = null;
  }
  function naTecla(e) { if (e.key === 'Escape') fechar(); }

  function abrir() {
    if (aberto) return;
    injetaCSS();

    var p = pele();
    var limite = new Date(); limite.setHours(12, 0, 0, 0);
    limite.setDate(limite.getDate() - JANELA);

    var dentro = LISTA.filter(function (it) { return dt(it[1]) >= limite; });
    /* nada na janela não é uma tela vazia: mostro a última que houve e digo quando foi */
    var antigo = !dentro.length && LISTA.length;
    var dias = porDia(antigo ? LISTA.slice(0, 1) : dentro);

    var corpo;
    if (!LISTA.length) {
      corpo = '<div class="nvVaz">Este app ainda não tem histórico de atualizações registrado.</div>';
    } else {
      corpo = (antigo
        ? '<div class="nvVaz" style="padding:14px 2px 16px">Nenhuma atualização nos últimos ' +
          JANELA + ' dias.<br>A última foi em ' + rotulo(LISTA[0][1]).replace(/^\w+, /, '') + '.</div>'
        : '') +
        dias.map(function (d, i) {
          var on = i === 0;   /* o dia mais recente já vem aberto */
          return '<div class="nvDia' + (on ? ' on' : '') + '">' +
            '<button class="nvH" type="button">' +
              '<b>' + rotulo(d.data) + '</b>' +
              '<span class="nvQt">' + d.itens.length + '</span>' +
              '<span class="nvCh">&#9660;</span>' +
            '</button>' +
            '<div class="nvIn"' + (on ? '' : ' hidden') + '>' +
              d.itens.map(function (it) {
                return '<div class="nvIt"><div class="nvV">' + esc(it[0]) + '</div>' +
                       '<div class="nvT">' + esc(it[2]) + '</div></div>';
              }).join('') +
            '</div></div>';
        }).join('');
    }

    var n = dentro.length;
    var ov = document.createElement('div');
    ov.className = 'nvOv';
    ov.style.cssText =
      '--nv-veu:' + p.veu + ';--nv-painel:' + p.painel + ';--nv-fundo:' + p.fundo +
      ';--nv-linha:' + p.linha + ';--nv-txt:' + p.txt + ';--nv-mut:' + p.mut +
      ';--nv-acc:' + p.acc;
    ov.innerHTML =
      '<div class="nvPn" role="dialog" aria-modal="true" aria-label="Novidades">' +
        '<div class="nvTop">' +
          '<div class="nvTit"><b>Novidades</b><span>' +
            (n ? n + (n > 1 ? ' atualizações' : ' atualização') + ' nos últimos ' + JANELA + ' dias'
               : 'histórico de atualizações') +
          '</span></div>' +
          '<button class="nvX" type="button" aria-label="Fechar">&#10005;</button>' +
        '</div>' +
        '<div class="nvBody">' + corpo + '</div>' +
        (versaoAtual() ? '<div class="nvPe">Você está na ' + esc(versaoAtual()) + '</div>' : '') +
      '</div>';

    /* fechar: o ✕, o véu, Esc. Clique dentro do painel não fecha. */
    ov.querySelector('.nvX').addEventListener('click', fechar);
    ov.addEventListener('click', function (e) { if (e.target === ov) fechar(); });
    document.addEventListener('keydown', naTecla);

    /* dobrar/desdobrar */
    ov.querySelectorAll('.nvH').forEach(function (h) {
      h.addEventListener('click', function () {
        var d = h.parentElement, dentroEl = d.querySelector('.nvIn');
        var vai = !d.classList.contains('on');
        d.classList.toggle('on', vai);
        dentroEl.hidden = !vai;
      });
    });

    document.body.appendChild(ov);
    aberto = ov;
  }

  /* --- porta pública --- */
  window.abrirNovidades = abrir;
  window.fecharNovidades = fechar;

  /* qualquer elemento com data-nv-ver recebe a versão corrente — serve o item
     de menu mostrar "Novidades · v110" sem o app precisar saber de nada */
  function carimba() {
    var v = versaoAtual();
    if (!v) return;
    document.querySelectorAll('[data-nv-ver]').forEach(function (e) { e.textContent = v; });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carimba);
  } else {
    carimba();
  }
})();
