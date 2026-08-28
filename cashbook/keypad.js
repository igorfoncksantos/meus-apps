/* Teclado próprio do app (drop-in, compartilhado) — 2026-08-22
   - Só entra no CELULAR (touch). No note/PC o teclado físico segue normal.
   - Liga sozinho em qualquer <input>/<textarea>: numérico -> discador; texto -> QWERTY com acentos.
   - Opt-out por campo: data-kb="off". Forçar tipo: data-kb="num" | data-kb="text".
   - Cor de acento: window.__SYNC_CFG.accent (respeita o estilo de cada app). */
(function(){
  var CFG = window.__SYNC_CFG || {};
  var ACCENT = CFG.accent || '#2FD9C9';
  var TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints>0);
  if(!TOUCH) return;                       // desktop: nada muda
  if(window.__KP_ON) return; window.__KP_ON=true;

  /* ---- cor de acento -> versões claras/escuras p/ os fundos ---- */
  function hx(h){ h=h.replace('#',''); if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];} return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  var rgb=hx(ACCENT);
  var accSoft='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',.16)';
  var accInk = (rgb[0]*.299+rgb[1]*.587+rgb[2]*.114) > 150 ? '#06131a' : '#04181c';

  /* ---- CSS ---- */
  var css = ''
    + 'body.kbdopen{ padding-bottom:calc(372px + env(safe-area-inset-bottom)) !important; }'
    + '#kbd{ position:fixed; left:0; right:0; bottom:0; z-index:2000000; display:none;'
    + '  background:linear-gradient(180deg,#0e1216,#070a0c); border-top:1px solid #20262b;'
    + '  padding:8px 6px calc(8px + env(safe-area-inset-bottom)); box-shadow:0 -14px 36px rgba(0,0,0,.6);'
    + '  -webkit-user-select:none; user-select:none; touch-action:manipulation;'
    + '  font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif; }'
    + '#kbd.on{ display:block; animation:kbdup .2s cubic-bezier(.25,.9,.3,1); }'
    + '@keyframes kbdup{ from{ transform:translateY(102%); } to{ transform:translateY(0); } }'
    + '#kbd .acc{ display:flex; gap:7px; overflow-x:auto; padding:6px 2px 9px; scrollbar-width:none; }'
    + '#kbd .acc::-webkit-scrollbar{ display:none; }'
    + '#kbd .acc b{ flex:0 0 auto; min-width:44px; height:44px; display:flex; align-items:center; justify-content:center;'
    + '  background:#151a1f; border:1px solid #262d34; border-radius:9px; color:#cfe9e5; font-size:19px; font-weight:600; cursor:pointer; }'
    + '#kbd .acc b:active{ background:'+accSoft+'; }'
    + '#kbd .row{ display:flex; gap:6px; margin-bottom:7px; }'
    + '#kbd .row:last-child{ margin-bottom:0; }'
    + '#kbd .k{ flex:1 1 0; min-width:0; height:54px; display:flex; align-items:center; justify-content:center;'
    + '  background:#20262c; border-radius:9px; color:#eef2f4; font-size:20px; font-weight:600; cursor:pointer;'
    + '  box-shadow:0 2px 0 rgba(0,0,0,.45); transition:transform .05s ease, background .1s ease; }'
    + '#kbd .k *{ pointer-events:none; }'
    + '#kbd .k, #kbd .acc b{ touch-action:none; -webkit-tap-highlight-color:transparent; -webkit-user-select:none; user-select:none; }'
    + '#kbd .k:active{ transform:translateY(2px); background:#2a323a; box-shadow:0 0 0 rgba(0,0,0,.4); }'
    + '#kbd .k.wide{ flex:3 1 0; font-size:14px; font-weight:700; letter-spacing:.4px; color:#9fb0b8; text-transform:uppercase; }'
    + '#kbd .k.fn{ background:#161b20; color:#9fb0b8; font-size:15px; font-weight:700; }'
    + '#kbd .k.act{ background:linear-gradient(135deg,'+ACCENT+',#1aa89b); color:'+accInk+'; box-shadow:0 4px 12px '+accSoft+'; }'
    + '#kbd .k.back{ background:#161b20; color:#f0a3ac; }'
    + '#kbd .k.shift.on{ background:'+accSoft+'; color:#cdeee9; }'
    + '#kbd .k.shift.lock{ background:'+accSoft+'; color:#eaf7f4; }'
    + '#kbd.num .row{ max-width:400px; margin-left:auto; margin-right:auto; gap:10px; margin-bottom:10px; }'
    + '#kbd.num .k{ height:50px; font-size:23px; font-weight:700; }#kbd.num .row{ gap:6px; margin-bottom:6px; }#kbd.num .row:last-child .k{ height:44px; font-size:19px; }#kbd .k,#kbd .acc b{ position:relative; }#kbd .k::after,#kbd .acc b::after{ content:""; position:absolute; inset:0; border-radius:inherit; background:#ffffff; opacity:0; pointer-events:none; }#kbd .k.hit,#kbd .acc b.hit{ animation:kbdpop .2s cubic-bezier(.3,1.5,.5,1); z-index:5; }#kbd .k.hit::after,#kbd .acc b.hit::after{ animation:kbdbrilho .22s ease-out; }@keyframes kbdpop{ 0%{ transform:scale(.93); } 45%{ transform:scale(1.14); } 100%{ transform:scale(1); } }@keyframes kbdbrilho{ 0%{ opacity:.5; } 100%{ opacity:0; } }.kbdpv{ position:fixed; z-index:2000001; display:flex; align-items:center; justify-content:center; pointer-events:none; border-radius:13px; background:linear-gradient(180deg,#f4fbfa,#cbe6e2); color:#07171b; font-weight:800; box-shadow:0 10px 26px rgba(0,0,0,.55); animation:kbdpv .26s cubic-bezier(.25,1.4,.45,1) forwards; font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif; }@keyframes kbdpv{ 0%{ transform:translate(-50%,-50%) scale(.8); opacity:0; } 22%{ transform:translate(-50%,-96%) scale(1.32); opacity:1; } 62%{ transform:translate(-50%,-96%) scale(1.32); opacity:1; } 100%{ transform:translate(-50%,-88%) scale(1.16); opacity:0; } }';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var kbd=document.createElement('div'); kbd.id='kbd';
  function mount(){ if(!kbd.parentNode) document.body.appendChild(kbd); }
  if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount);

  var target=null, form=null, caps=1, layer='abc', startVal=null;
  var ACC=['á','à','â','ã','é','ê','í','ó','ô','õ','ú','ç'];
  var ABC=[['q','w','e','r','t','y','u','i','o','p'],
           ['a','s','d','f','g','h','j','k','l','ç'],
           ['shift','z','x','c','v','b','n','m','back']];
  var NUM=[['1','2','3','4','5','6','7','8','9','0'],
           ['@','#','$','%','&','-','_','/','(',')'],
           ['sym','*','"','’',':',';','!','?','back']];
  var SYM=[['~','`','|','=','+','{','}','[',']','\\'],
           ['<','>','^','°','€','R$','.',',','ç','º'],
           ['sym','ª','½','…','_','!','?','¿','back']];
  var BOT=['layer','comma','space','dot','enter','hide'];
  var NUMPAD=[['1','2','3'],['4','5','6'],['7','8','9'],['comma','0','back']];
  function esc2(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function isNum(el){
    var f=el.getAttribute && el.getAttribute('data-kb');
    if(f==='num') return true; if(f==='text') return false;
    if(el.type==='number') return true;
    var im=(el.getAttribute&&el.getAttribute('inputmode')||'').toLowerCase();
    return im==='decimal'||im==='numeric';
  }
  function keyHTML(k){
    var cls='k', txt, ins=null;
    if(k==='shift'){ cls+=' fn shift'+(caps?(caps===2?' on lock':' on'):''); txt='⇧'; }
    else if(k==='back'){ cls+=' back'; txt='⌫'; }
    else if(k==='layer'){ cls+=' fn'; txt=(layer==='abc'?'123':'ABC'); }
    else if(k==='sym'){ cls+=' fn'; txt=(layer==='sym'?'123':'#+='); }
    else if(k==='enter'){ cls+=' act'; txt='⏎'; }
    else if(k==='hide'){ cls+=' fn'; txt='⌄'; }
    else if(k==='space'){ cls+=' wide'; txt='espaço'; ins=' '; }
    else if(k==='comma'){ txt=','; ins=','; }
    else if(k==='dot'){ txt='.'; ins='.'; }
    else { txt=(caps && /^[a-zà-ÿ]$/i.test(k)) ? k.toUpperCase() : k; ins=txt; }
    return '<div class="'+cls+'" data-k="'+esc2(k)+'"'+(ins!==null?' data-ins="'+esc2(ins)+'"':'')+'>'+esc2(txt)+'</div>';
  }
  function render(){
    if(!target) return;
    var h='';
    if(isNum(target)){
      kbd.classList.add('num');
      NUMPAD.forEach(function(r){ h+='<div class="row">'+r.map(keyHTML).join('')+'</div>'; });
      h+='<div class="row">'+['enter','hide'].map(keyHTML).join('')+'</div>';
    } else {
      kbd.classList.remove('num');
      var rows = layer==='abc'?ABC:(layer==='num'?NUM:SYM);
      h='<div class="acc">'+ACC.map(function(a){return '<b data-ins="'+a+'">'+a+'</b>';}).join('')+'</div>';
      rows.forEach(function(r){ h+='<div class="row">'+r.map(keyHTML).join('')+'</div>'; });
      h+='<div class="row">'+BOT.map(keyHTML).join('')+'</div>';
    }
    kbd.innerHTML=h; if(document.body.classList.contains("kbdopen")) _kbdAltura();
  }
  function fire(){ if(target) target.dispatchEvent(new Event('input',{bubbles:true})); }
  // o teclado escreve o valor por script, e mudanca por script NAO dispara 'change'.
  // commit() reproduz a semantica nativa: 'change' so ao confirmar o campo.
  function commit(){ var t=target, sv=startVal; startVal=null;
    if(t && sv!==null && t.value!==sv){ try{ t.dispatchEvent(new Event('change',{bubbles:true})); }catch(x){} } }
  function ins(ch){
    if(!target) return;
    if(target.type==='number' && ch===',') ch='.';       // number não aceita vírgula
    var s=target.selectionStart, e=target.selectionEnd, v=target.value;
    if(s==null){ target.value=v+ch; }
    else { target.value=v.slice(0,s)+ch+v.slice(e); var p=s+ch.length; try{target.setSelectionRange(p,p);}catch(x){} }
    fire(); if(caps===1){ caps=0; render(); }
  }
  function back(){
    if(!target) return;
    var s=target.selectionStart, e=target.selectionEnd, v=target.value;
    if(s==null){ target.value=v.slice(0,-1); }
    else if(s!==e){ target.value=v.slice(0,s)+v.slice(e); try{target.setSelectionRange(s,s);}catch(x){} }
    else if(s>0){ target.value=v.slice(0,s-1)+v.slice(s); try{target.setSelectionRange(s-1,s-1);}catch(x){} }
    fire();
  }
  function autocaps(){ caps = (target&&target.value.length) ? 0 : 1; }


  function _kbdAltura(){ try{ var a=kbd.offsetHeight; if(a>60) document.body.style.setProperty("padding-bottom", a+"px", "important"); }catch(x){} }
  function _kbdAbre(){ document.body.classList.add('kbdopen'); _kbdAltura(); }
  function _kbdFecha(){ document.body.classList.remove('kbdopen'); try{ document.body.style.removeProperty("padding-bottom"); }catch(x){} }
  var _kbdRepT=null;
  function _kbdSolta(){ if(_kbdRepT){ clearTimeout(_kbdRepT); _kbdRepT=null; } }
  function _kbdApagando(){
    _kbdSolta(); var n=0;
    _kbdRepT=setTimeout(function passo(){
      if(!target || target.value===""){ _kbdSolta(); return; }
      back(); n++;
      _kbdRepT=setTimeout(passo, n<8?55:(n<20?34:20));
    }, 420);
  }
  ["touchend","touchcancel","mouseup","mouseleave","pointerup","pointercancel"].forEach(function(ev){
    try{ kbd.addEventListener(ev, _kbdSolta); }catch(x){}
  });
  try{ document.addEventListener("touchend", _kbdSolta); document.addEventListener("mouseup", _kbdSolta); window.addEventListener("blur", _kbdSolta); }catch(x){}
  function _kbdBrilho(el, txt){ if(!el||!el.classList) return; el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit");
    setTimeout(function(){ try{ el.classList.remove("hit"); }catch(x){} }, 240);
    try{ if(navigator.vibrate) navigator.vibrate(8); }catch(x){}
    try{
      var r=el.getBoundingClientRect(); if(!r.width) return;
      var b=document.createElement("div"); b.className="kbdpv";
      var oculto = target && (target.type==="password");
      b.textContent = (txt != null) ? txt : (oculto ? "\u2022" : (el.textContent||"").trim().slice(0,7));
      var la=el.offsetWidth||r.width, al=el.offsetHeight||r.height;
      var meio=r.left+r.width/2, folga=la*0.70+4;
      if(meio<folga) meio=folga; if(meio>window.innerWidth-folga) meio=window.innerWidth-folga;
      b.style.left=meio+"px"; b.style.top=(r.top+r.height/2)+"px";
      b.style.width=la+"px"; b.style.height=al+"px";
      b.style.fontSize=getComputedStyle(el).fontSize;
      document.body.appendChild(b);
      setTimeout(function(){ try{ b.parentNode.removeChild(b); }catch(y){} }, 300);
    }catch(x){}
  }
  try{ window.__kbdBrilho = _kbdBrilho; }catch(x){}
  function onKey(e){
    var t=e.target.closest && e.target.closest('[data-k],[data-ins]'); if(!t) return; _kbdBrilho(t);
    if(e.cancelable) e.preventDefault();      // não rouba o foco do campo, não vira scroll/zoom
    var k=t.getAttribute('data-k'), di=t.getAttribute('data-ins');
    var special=(k==='shift'||k==='back'||k==='layer'||k==='sym'||k==='enter'||k==='hide');
    if(di!==null && !special){ ins(di); return; }
    if(k==='shift'){ caps = caps===0?1:(caps===1?2:0); render(); return; }
    if(k==='back'){ back(); _kbdApagando(); return; }
    if(k==='layer'){ layer=(layer==='abc'?'num':'abc'); render(); return; }
    if(k==='sym'){ layer=(layer==='sym'?'num':'sym'); render(); return; }
    if(k==='enter'){
      if(target && (target.tagName==='TEXTAREA')){ ins('\n'); return; }
      commit();
      if(form&&form.requestSubmit){ form.requestSubmit(); } else if(form){ form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); } else { try{target.blur();}catch(x){} hide(); return; }
      setTimeout(function(){ autocaps(); render(); },0); return;
    }
    if(k==='hide'){ hide(); try{target.blur();}catch(x){} return; }
  }
  var _ktouch=0;
  kbd.addEventListener('touchstart', function(e){ _ktouch=Date.now(); onKey(e); }, {passive:false});
  kbd.addEventListener('mousedown',  function(e){ if(Date.now()-_ktouch<700) return; onKey(e); });

  function show(){ mount(); autocaps(); render(); kbd.classList.add('on'); _kbdAbre(); }
  function hide(){ commit(); kbd.classList.remove('on'); _kbdFecha(); }

  function handle(el){
    if(!el || !el.tagName) return false;
    var tag=el.tagName;
    if(tag!=='INPUT' && tag!=='TEXTAREA') return false;
    if(el.getAttribute('data-kb')==='off') return false;
    if(el.readOnly || el.disabled) return false;
    if(tag==='INPUT'){
      var bad=['checkbox','radio','range','color','file','button','submit','reset','date','time','datetime-local','month','week'];
      if(bad.indexOf((el.type||'text').toLowerCase())>=0) return false;
    }
    return true;
  }
  function attach(el){
    if(target && target!==el) commit();
    // se o handler de 'change' re-renderizou a tela, o campo novo virou orfao
    if(el.isConnected===false){ kbd.classList.remove('on'); _kbdFecha(); target=null; return; }
    target=el; startVal=el.value; form=el.closest?el.closest('form'):null;
    layer='abc';
    /* decide o tipo ANTES de apagar o inputmode — senao a informacao some
       e todo campo de numero abriria com o teclado de letras */
    if(!el.getAttribute('data-kb')) el.setAttribute('data-kb', isNum(el) ? 'num' : 'text');
    el.setAttribute('inputmode','none');    // suprime o teclado nativo
    el.setAttribute('autocapitalize','off'); el.setAttribute('autocorrect','off'); el.setAttribute('spellcheck','false');
    show();
    setTimeout(function(){ try{ if(target && getComputedStyle(target).position!=='fixed') target.scrollIntoView({block:'center',behavior:'smooth'}); }catch(x){} }, 70);
  }
  // delegação: qualquer input que ganhe foco (inclui os criados depois)
  document.addEventListener('focusin', function(e){ if(handle(e.target)) attach(e.target); }, true);
  document.addEventListener('pointerdown', function(e){
    if(!kbd.classList.contains('on')) return;
    if(kbd.contains(e.target)) return;
    if(handle(e.target)) return;             // vai focar outro campo -> focusin cuida
    hide();
  }, true);
})();


/* ===== calendario do app (troca o do sistema nos campos de data e mes) ===== */
(function(){
  var CFG2 = window.__SYNC_CFG || {};
  var AC = CFG2.accent || '#2FD9C9';
  function hx2(h){ h=h.replace('#',''); if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];} return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  var r2 = hx2(AC);
  var suave = 'rgba('+r2[0]+','+r2[1]+','+r2[2]+',.16)';
  var tinta = (r2[0]*.299+r2[1]*.587+r2[2]*.114) > 150 ? '#06131a' : '#04181c';
  var TOQUE = ('ontouchstart' in window) || (navigator.maxTouchPoints>0);

  var MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var MESC = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  var SEM = ['D','S','T','Q','Q','S','S'];

  var css = ''
    + '#cal{position:fixed;left:0;right:0;bottom:0;z-index:2000001;display:none;'
    +   'background:linear-gradient(180deg,#0e1216,#070a0c);border-top:1px solid #20262b;'
    +   'padding:12px 12px calc(12px + env(safe-area-inset-bottom));'
    +   'box-shadow:0 -14px 36px rgba(0,0,0,.6);-webkit-user-select:none;user-select:none;'
    +   'font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif}'
    + '#cal.on{display:block}'
    + '#cal .cw{max-width:400px;margin:0 auto}'
    + '#cal .ch{display:flex;align-items:center;gap:8px;margin-bottom:10px}'
    + '#cal .ct{flex:1;text-align:center;font-size:15px;font-weight:800;color:#f0f2f4;text-transform:capitalize}'
    + '#cal .cn{width:40px;height:40px;flex:none;border:1px solid #262c32;background:#12171b;color:#9fb0b8;'
    +   'border-radius:11px;font-size:17px;font-weight:800;cursor:pointer;display:grid;place-items:center;font-family:inherit}'
    + '#cal .cn:active{transform:scale(.95)}'
    + '#cal .cs{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px}'
    + '#cal .cs span{text-align:center;font-size:10.5px;font-weight:800;color:#5f6a71;padding:3px 0}'
    + '#cal .cg{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}'
    + '#cal .cg button{height:42px;border:0;background:#12171b;color:#e6eaee;border-radius:10px;'
    +   'font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:transform .1s,background .12s}'
    + '#cal .cg button:active{transform:scale(.93)}'
    + '#cal .cg button.fora{background:transparent;color:#3a4248}'
    + '#cal .cg button.hoje{box-shadow:inset 0 0 0 1px ' + suave + '}'
    + '#cal .cg button.sel{background:' + AC + ';color:' + tinta + '}'
    + '#cal .cm{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'
    + '#cal .cm button{height:48px;border:0;background:#12171b;color:#e6eaee;border-radius:11px;'
    +   'font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;text-transform:capitalize}'
    + '#cal .cm button.sel{background:' + AC + ';color:' + tinta + '}'
    + '#cal .cb{display:flex;gap:8px;margin-top:11px}'
    + '#cal .cb button{flex:1;height:44px;border:1px solid #262c32;background:#12171b;color:#cfd6db;'
    +   'border-radius:12px;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer}'
    + '#cal .cb button.ok{background:' + AC + ';border-color:' + AC + ';color:' + tinta + '}';
  var st2 = document.createElement('style'); st2.textContent = css; document.head.appendChild(st2);

  var cal = document.createElement('div'); cal.id = 'cal';
  var alvo = null, tipo = 'date', vendo = null, escolhido = null;

  function doisD(n){ return (n<10?'0':'') + n; }
  function leValor(el){
    var v = (el.value || '').trim();
    var m;
    if (tipo === 'month') { m = v.match(/^(\d{4})-(\d{2})$/); return m ? new Date(+m[1], +m[2]-1, 1) : null; }
    m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null;
  }
  function grava(d){
    if (!alvo) return;
    alvo.value = d ? (tipo === 'month'
      ? (d.getFullYear() + '-' + doisD(d.getMonth()+1))
      : (d.getFullYear() + '-' + doisD(d.getMonth()+1) + '-' + doisD(d.getDate()))) : '';
    alvo.dispatchEvent(new Event('input', {bubbles:true}));
    alvo.dispatchEvent(new Event('change', {bubbles:true}));
  }

  function pinta(){
    var hoje = new Date();
    var h = '<div class="cw">';
    if (tipo === 'month') {
      h += '<div class="ch"><button class="cn" data-cn="-1">&#8249;</button>'
        +  '<div class="ct">' + vendo.getFullYear() + '</div>'
        +  '<button class="cn" data-cn="1">&#8250;</button></div><div class="cm">';
      for (var m = 0; m < 12; m++) {
        var sel = escolhido && escolhido.getFullYear() === vendo.getFullYear() && escolhido.getMonth() === m;
        h += '<button class="' + (sel?'sel':'') + '" data-cm="' + m + '">' + MESC[m] + '</button>';
      }
      h += '</div>';
    } else {
      h += '<div class="ch"><button class="cn" data-cn="-1">&#8249;</button>'
        +  '<div class="ct">' + MES[vendo.getMonth()] + ' ' + vendo.getFullYear() + '</div>'
        +  '<button class="cn" data-cn="1">&#8250;</button></div><div class="cs">';
      for (var s = 0; s < 7; s++) h += '<span>' + SEM[s] + '</span>';
      h += '</div><div class="cg">';
      var pri = new Date(vendo.getFullYear(), vendo.getMonth(), 1);
      var ini = pri.getDay();
      var dias = new Date(vendo.getFullYear(), vendo.getMonth()+1, 0).getDate();
      var antes = new Date(vendo.getFullYear(), vendo.getMonth(), 0).getDate();
      for (var i = ini - 1; i >= 0; i--) h += '<button class="fora" data-cd="' + (-i-0) + '" disabled>' + (antes-i) + '</button>';
      for (var d = 1; d <= dias; d++) {
        var cls = [];
        if (hoje.getFullYear()===vendo.getFullYear() && hoje.getMonth()===vendo.getMonth() && hoje.getDate()===d) cls.push('hoje');
        if (escolhido && escolhido.getFullYear()===vendo.getFullYear() && escolhido.getMonth()===vendo.getMonth() && escolhido.getDate()===d) cls.push('sel');
        h += '<button class="' + cls.join(' ') + '" data-cd="' + d + '">' + d + '</button>';
      }
      h += '</div>';
    }
    h += '<div class="cb"><button data-cx="limpa">Limpar</button>'
      +  '<button data-cx="hoje">Hoje</button>'
      +  '<button class="ok" data-cx="fecha">Pronto</button></div></div>';
    cal.innerHTML = h;
  }

  function altura(){
    try {
      var a = cal.offsetHeight;
      if (a > 60) {
        document.body.style.setProperty('padding-bottom', a+'px', 'important');
        document.documentElement.style.setProperty('--kbh', a+'px');
      }
    } catch(e){}
  }
  function abre(el){
    if (!cal.parentNode) document.body.appendChild(cal);
    alvo = el;
    tipo = (el.type === 'month') ? 'month' : 'date';
    escolhido = leValor(el);
    vendo = escolhido ? new Date(escolhido.getTime()) : new Date();
    pinta();
    cal.classList.add('on');
    document.body.classList.add('kbdopen');
    altura();
  }
  function fecha(){
    cal.classList.remove('on');
    document.body.classList.remove('kbdopen');
    try { document.body.style.removeProperty('padding-bottom'); } catch(e){}
    try { document.documentElement.style.removeProperty('--kbh'); } catch(e){}
    alvo = null;
  }
  try { window.__calFecha = fecha; } catch(e){}

  cal.addEventListener('pointerdown', function(e){
    var b = e.target.closest('button'); if (!b) return;
    e.preventDefault();
    if (b.hasAttribute('data-cn')) {
      var p = +b.getAttribute('data-cn');
      vendo = (tipo === 'month')
        ? new Date(vendo.getFullYear() + p, 0, 1)
        : new Date(vendo.getFullYear(), vendo.getMonth() + p, 1);
      pinta(); return;
    }
    if (b.hasAttribute('data-cm')) {
      escolhido = new Date(vendo.getFullYear(), +b.getAttribute('data-cm'), 1);
      grava(escolhido); pinta(); fecha(); return;
    }
    if (b.hasAttribute('data-cd')) {
      if (b.disabled) return;
      escolhido = new Date(vendo.getFullYear(), vendo.getMonth(), +b.getAttribute('data-cd'));
      grava(escolhido); pinta(); fecha(); return;
    }
    var x = b.getAttribute('data-cx');
    if (x === 'limpa') { escolhido = null; grava(null); fecha(); }
    else if (x === 'hoje') { escolhido = new Date(); vendo = new Date(); grava(escolhido); pinta(); fecha(); }
    else if (x === 'fecha') { fecha(); }
  });

  function ehData(el){
    if (!el || el.tagName !== 'INPUT') return false;
    if (el.getAttribute('data-kb') === 'off') return false;
    var t = (el.type || '').toLowerCase();
    return t === 'date' || t === 'month';
  }
  document.addEventListener('focusin', function(e){
    if (!TOQUE && !ehData(e.target)) return;
    if (!ehData(e.target)) return;
    /* o campo continua guardando a data no formato de sempre; so quem
       desenha muda. O readOnly e o que impede o painel do sistema de subir. */
    e.target.readOnly = true;
    e.target.blur();
    abre(e.target);
  });
  document.addEventListener('pointerdown', function(e){
    if (!cal.classList.contains('on')) return;
    if (cal.contains(e.target) || e.target === alvo) return;
    fecha();
  }, true);
})();
