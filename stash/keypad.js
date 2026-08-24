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
    + 'body.kbdopen{ padding-bottom:calc(316px + env(safe-area-inset-bottom)) !important; }'
    + '#kbd{ position:fixed; left:0; right:0; bottom:0; z-index:2000000; display:none;'
    + '  background:linear-gradient(180deg,#0e1216,#070a0c); border-top:1px solid #20262b;'
    + '  padding:8px 6px calc(8px + env(safe-area-inset-bottom)); box-shadow:0 -14px 36px rgba(0,0,0,.6);'
    + '  -webkit-user-select:none; user-select:none; touch-action:manipulation;'
    + '  font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif; }'
    + '#kbd.on{ display:block; animation:kbdup .2s cubic-bezier(.25,.9,.3,1); }'
    + '@keyframes kbdup{ from{ transform:translateY(102%); } to{ transform:translateY(0); } }'
    + '#kbd .acc{ display:flex; gap:6px; overflow-x:auto; padding:0 2px 8px; scrollbar-width:none; }'
    + '#kbd .acc::-webkit-scrollbar{ display:none; }'
    + '#kbd .acc b{ flex:0 0 auto; min-width:36px; height:36px; display:flex; align-items:center; justify-content:center;'
    + '  background:#151a1f; border:1px solid #262d34; border-radius:9px; color:#cfe9e5; font-size:17px; font-weight:600; cursor:pointer; }'
    + '#kbd .acc b:active{ background:'+accSoft+'; }'
    + '#kbd .row{ display:flex; gap:5px; margin-bottom:6px; }'
    + '#kbd .row:last-child{ margin-bottom:0; }'
    + '#kbd .k{ flex:1 1 0; min-width:0; height:46px; display:flex; align-items:center; justify-content:center;'
    + '  background:#20262c; border-radius:9px; color:#eef2f4; font-size:18px; font-weight:600; cursor:pointer;'
    + '  box-shadow:0 2px 0 rgba(0,0,0,.45); transition:transform .05s ease, background .1s ease; }'
    + '#kbd .k *{ pointer-events:none; }'
    + '#kbd .k, #kbd .acc b{ touch-action:none; -webkit-tap-highlight-color:transparent; -webkit-user-select:none; user-select:none; }'
    + '#kbd .k:active{ transform:translateY(2px); background:#2a323a; box-shadow:0 0 0 rgba(0,0,0,.4); }'
    + '#kbd .k.wide{ flex:3 1 0; font-size:13px; font-weight:700; letter-spacing:.4px; color:#9fb0b8; text-transform:uppercase; }'
    + '#kbd .k.fn{ background:#161b20; color:#9fb0b8; font-size:14px; font-weight:700; }'
    + '#kbd .k.act{ background:linear-gradient(135deg,'+ACCENT+',#1aa89b); color:'+accInk+'; box-shadow:0 4px 12px '+accSoft+'; }'
    + '#kbd .k.back{ background:#161b20; color:#f0a3ac; }'
    + '#kbd .k.shift.on{ background:'+accSoft+'; color:#cdeee9; }'
    + '#kbd .k.shift.lock{ background:'+accSoft+'; color:#eaf7f4; }'
    + '#kbd.num .row{ max-width:360px; margin-left:auto; margin-right:auto; gap:9px; margin-bottom:9px; }'
    + '#kbd.num .k{ height:56px; font-size:23px; font-weight:700; }';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var kbd=document.createElement('div'); kbd.id='kbd';
  function mount(){ if(!kbd.parentNode) document.body.appendChild(kbd); }
  if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount);

  var target=null, form=null, caps=1, layer='abc';
  var ACC=['á','à','â','ã','é','ê','í','ó','ô','õ','ú','ç'];
  var ABC=[['q','w','e','r','t','y','u','i','o','p'],
           ['a','s','d','f','g','h','j','k','l'],
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
    kbd.innerHTML=h;
  }
  function fire(){ if(target) target.dispatchEvent(new Event('input',{bubbles:true})); }
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

  function onKey(e){
    var t=e.target.closest && e.target.closest('[data-k],[data-ins]'); if(!t) return;
    if(e.cancelable) e.preventDefault();      // não rouba o foco do campo, não vira scroll/zoom
    var k=t.getAttribute('data-k'), di=t.getAttribute('data-ins');
    var special=(k==='shift'||k==='back'||k==='layer'||k==='sym'||k==='enter'||k==='hide');
    if(di!==null && !special){ ins(di); return; }
    if(k==='shift'){ caps = caps===0?1:(caps===1?2:0); render(); return; }
    if(k==='back'){ back(); return; }
    if(k==='layer'){ layer=(layer==='abc'?'num':'abc'); render(); return; }
    if(k==='sym'){ layer=(layer==='sym'?'num':'sym'); render(); return; }
    if(k==='enter'){
      if(target && (target.tagName==='TEXTAREA')){ ins('\n'); return; }
      if(form&&form.requestSubmit){ form.requestSubmit(); } else if(form){ form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); } else { try{target.blur();}catch(x){} hide(); return; }
      setTimeout(function(){ autocaps(); render(); },0); return;
    }
    if(k==='hide'){ hide(); try{target.blur();}catch(x){} return; }
  }
  var _ktouch=0;
  kbd.addEventListener('touchstart', function(e){ _ktouch=Date.now(); onKey(e); }, {passive:false});
  kbd.addEventListener('mousedown',  function(e){ if(Date.now()-_ktouch<700) return; onKey(e); });

  function show(){ mount(); autocaps(); render(); kbd.classList.add('on'); document.body.classList.add('kbdopen'); }
  function hide(){ kbd.classList.remove('on'); document.body.classList.remove('kbdopen'); }

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
    target=el; form=el.closest?el.closest('form'):null;
    layer='abc';
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
