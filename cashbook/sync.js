/* ============================================================
   Sincronização multiplataforma — módulo compartilhado (drop-in)
   Requer: <script>window.__SYNC_CFG={app,keys,accent,name}</script>
           <script src="supabase.js"></script>  ANTES deste arquivo.
   Login SEM SENHA (link no e-mail / Google) + PIN opcional.
   ============================================================ */
(function(){
  var CFG=window.__SYNC_CFG||{};
  var APP_ID=CFG.app||'app', KEYS=CFG.keys||[], ACCENT=CFG.accent||'#2FD9C9', NAME=CFG.name||'App';
  var SUPA_URL='https://ldvbnknynxnlbgmgrkjf.supabase.co';
  var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdmJua255bnhubGJnbWdya2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODI2MTcsImV4cCI6MjEwMjk1ODYxN30.pxZ9BiP0bKpaN7t0L1bDpENQH5C25fjOHtuYlq-p6j0';
  var LK={login:APP_ID+'-login',pin:APP_ID+'-pin',synced:APP_ID+'-syncedAt',nag:APP_ID+'-nag',sess:APP_ID+'-sess',diag:APP_ID+'-diag'};
  var sb=null,session=null,_pushT=null,_rtChan=null,_applying=false,_synced=false,_myStamp=null,_lastBlob='',_initDone=false,_pending=null;
  var _pin='',_pinMode='',_pinTmp='';
  function ready(){ return !!(sb&&session); }

  /* ---------- blob no localStorage ---------- */
  var _set=localStorage.setItem.bind(localStorage);
  function skip(k){ return !k || k.indexOf('sb-')===0 || k.indexOf('welcome')===0 || k===LK.login || k===LK.pin || k===LK.synced || k===LK.nag; }
  function inScope(k){ if(!k||skip(k))return false; if(KEYS==='*')return true; for(var i=0;i<KEYS.length;i++){ var p=KEYS[i]; if(p.charAt(p.length-1)==='*'){ if(k.indexOf(p.slice(0,-1))===0)return true; } else if(k===p)return true; } return false; }
  localStorage.setItem=function(k,v){ _set(k,v); if(!_applying && inScope(k)) schedulePush(); };
  function getBlob(){ var o={}; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(inScope(k))o[k]=localStorage.getItem(k); } return o; }
  function setBlob(o){ _applying=true; try{ for(var k in o){ if(o.hasOwnProperty(k) && inScope(k)) _set(k,o[k]); } }catch(e){} _applying=false; }
  function hasLocal(){ return Object.keys(getBlob()).length>0; }
  function reload(){ location.reload(); }

  /* ---------- init ---------- */
  function init(){ try{ if(window.supabase && SUPA_URL.indexOf('http')===0){ sb=window.supabase.createClient(SUPA_URL,SUPA_KEY,{auth:{persistSession:true,autoRefreshToken:true}}); } }catch(e){ sb=null; } }
  async function sha(s){ try{ var b=new TextEncoder().encode(s); var h=await crypto.subtle.digest('SHA-256',b); return Array.from(new Uint8Array(h)).map(function(x){return x.toString(16).padStart(2,'0');}).join(''); }catch(e){ return 'x'+s.length; } }

  /* ---------- motor de sync ---------- */
  function schedulePush(){ if(!ready())return; clearTimeout(_pushT); _pushT=setTimeout(pushRemote,700); }
  function _diag(oque, erro){
    try{
      var d=JSON.parse(localStorage.getItem(LK.diag)||'{}');
      if(erro){ d[oque+'_erro']=erro; d[oque+'_quando']=new Date().toISOString(); if(window.toast) window.toast('Falha no '+oque+': '+erro); }
      else { delete d[oque+'_erro']; d[oque+'_ok']=new Date().toISOString(); }
      localStorage.setItem(LK.diag, JSON.stringify(d));
    }catch(e){}
  }
  async function pushRemote(){ if(!ready())return; var blob=getBlob(); var stamp=new Date().toISOString(); _myStamp=stamp;
    try{ var r=await sb.from('app_state').upsert({user_id:session.user.id,app:APP_ID,data:blob,updated_at:stamp});
      if(r.error){ _diag('envio', r.error.message||JSON.stringify(r.error)); return; }
      _set(LK.synced,stamp); _lastBlob=JSON.stringify(blob); _diag('envio', null);
    }catch(e){ _diag('envio', (e&&e.message)||String(e)); } }
  async function pullRemote(){ if(!ready())return;
    try{ var q=await sb.from('app_state').select('data,updated_at').eq('user_id',session.user.id).eq('app',APP_ID).maybeSingle();
      if(q.error){ _diag('leitura', q.error.message||JSON.stringify(q.error)); return; }
      _diag('leitura', null); var d=q.data; var firstLink=!localStorage.getItem(LK.synced);
      if(d && d.data && Object.keys(d.data).length){
        if(firstLink && hasLocal()){
          var down=await uiConfirm('Este aparelho já tem dados, e sua conta na nuvem também. Qual você quer manter?',{title:'Dados nos dois lados',ok:'Baixar da nuvem',cancel:'Manter deste aparelho'});
          if(down){ applyAdopt(d.data,d.updated_at,true); } else { _set(LK.synced,''); await pushRemote(); toast('Enviado pra nuvem ✓'); }
          return;
        }
        if((d.updated_at||'')>(localStorage.getItem(LK.synced)||'')){
          if(JSON.stringify(d.data)===JSON.stringify(getBlob())){ _set(LK.synced,d.updated_at); return; }
          applyAdopt(d.data,d.updated_at);
        }
      } else { await pushRemote(); }
    }catch(e){} }
  function applyAdopt(data,stamp,force){ if(force || !_initDone){ setBlob(data); _set(LK.synced,stamp); reload(); }
    else { _pending={data:data,stamp:stamp}; showUpdateBar(); } }
  function showUpdateBar(){ if(document.getElementById('syncUpd'))return; var b=document.createElement('button'); b.id='syncUpd';
    b.style.cssText='position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:100002;background:'+ACCENT+';color:#04231f;border:none;border-radius:16px;padding:12px 18px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 12px 34px rgba(0,0,0,.5);font-family:"Segoe UI",Arial,sans-serif';
    b.textContent='Novos dados de outro aparelho — atualizar'; b.onclick=applyPending; document.body.appendChild(b); }
  function applyPending(){ if(!_pending)return; setBlob(_pending.data); _set(LK.synced,_pending.stamp); reload(); }
  function subscribeRT(){ if(!ready())return; _lastBlob=JSON.stringify(getBlob()); if(_rtChan){ try{sb.removeChannel(_rtChan);}catch(e){} _rtChan=null; }
    try{ _rtChan=sb.channel('as-'+APP_ID+'-'+session.user.id).on('postgres_changes',{event:'*',schema:'public',table:'app_state',filter:'user_id=eq.'+session.user.id},function(){ pullRemote(); }).subscribe(); }catch(e){}
    if(!window.__syncPoll){ window.__syncPoll=setInterval(function(){ if(ready()&&document.visibilityState!=='hidden'){ pullRemote(); if(JSON.stringify(getBlob())!==_lastBlob) schedulePush(); } },15000); }
    if(!window.__syncVis){ window.__syncVis=1; document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&ready())pullRemote(); }); }
  }
  function markSess(){ try{ sessionStorage.setItem(LK.sess,'1'); }catch(e){} }
  function onSignedIn(){ if(_synced)return; _synced=true; try{ if(session&&session.user&&session.user.email)_set(LK.login,session.user.email); }catch(e){} localStorage.removeItem(LK.nag);
    try{history.replaceState(null,'',location.pathname);}catch(e){} closeOv(); subscribeRT(); pullRemote(); toast('Conectado ✓'); updateBtn(); setTimeout(function(){ _initDone=true; },3000); }

  /* ---------- CSS + overlay ---------- */
  function injectCSS(){ if(document.getElementById('syncCss'))return; var st=document.createElement('style'); st.id='syncCss';
    st.textContent=
    '.syncov{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(0,0,0,.74);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);--sacc:'+ACCENT+';font-family:"Segoe UI",Arial,sans-serif}'+
    '.syncov.hidden{display:none!important}'+
    '.sync-card{width:100%;max-width:380px;background:linear-gradient(160deg,#12161a,#0a0d10);border:1px solid #23282e;border-radius:22px;padding:26px 22px 22px;box-shadow:0 24px 70px rgba(0,0,0,.6);max-height:92vh;overflow:auto;animation:syncpop .42s cubic-bezier(.2,.9,.3,1)}'+
    '@keyframes syncpop{from{opacity:0;transform:translateY(18px) scale(.95)}to{opacity:1;transform:none}}'+
    '.sync-ic{font-size:42px;text-align:center;margin-bottom:6px;line-height:1}.sync-ic svg{width:40px;height:40px;stroke:var(--sacc);display:inline-block}.sync-ic.danger svg{stroke:#ff6b7a}'+
    '.sync-card h2{color:#fff;font-size:21px;text-align:center;margin:0 0 9px}.sync-card p{color:#9aa2a8;font-size:13.5px;line-height:1.55;text-align:center;margin:0 0 16px}.sync-card p.note{font-size:11.5px;color:#6f7a80;margin-top:-9px}'+
    '.sync-f{margin-bottom:13px}.sync-f label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a97a0;margin-bottom:6px}'+
    '.sync-f input{width:100%;background:#0b0e11;border:1px solid #2a2f35;color:#e8ebed;border-radius:13px;padding:14px;font-size:14px;font-family:inherit;transition:border-color .18s,box-shadow .18s}.sync-f input:focus{outline:none;border-color:var(--sacc);box-shadow:0 0 0 3px rgba(47,217,201,.16)}'+
    '.sync-err{display:none;color:#f87171;font-size:12.5px;text-align:center;margin:2px 0 12px;font-weight:600;min-height:15px}'+
    '.sync-act{display:flex;gap:11px;margin-top:15px}.sync-act button{flex:1;padding:15px 16px;border-radius:14px;border:none;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:transform .13s cubic-bezier(.34,1.4,.5,1),filter .2s}.sync-act button:active{transform:scale(.955)}'+
    '.sbtn-p{background:var(--sacc);color:#04231f}.sbtn-p:active{filter:brightness(1.06)}.sbtn-g{background:transparent;color:#f0f2f4;border:1.5px solid #333b43!important}.sbtn-d{background:linear-gradient(135deg,#ef5064,#cc2f3d);color:#fff}'+
    '.sync-list button{display:flex;width:100%;align-items:center;gap:12px;background:#0b0e11;border:1px solid #22272c;color:#e8ebed;font-size:14px;padding:14px;border-radius:13px;cursor:pointer;margin-bottom:8px;font-family:inherit;font-weight:600;text-align:left}.sync-list button:active{background:#181c21}.sync-list button.d{color:#ff8a8a;border-color:#5c2a2f;background:#1c1113}'+
    '.sync-link{display:block;width:100%;background:none;border:none;color:#8a97a0;font-size:12.5px;margin-top:11px;cursor:pointer;text-decoration:underline;font-family:inherit}'+
    '.gbtn-g{width:100%;display:flex;align-items:center;justify-content:center;gap:11px;padding:14px;border-radius:14px;border:1.5px solid #d7dbe0;background:#fff;color:#1f2226;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:2px;box-shadow:0 3px 12px rgba(0,0,0,.18);font-family:inherit}.gbtn-g:active{transform:scale(.97)}.gbtn-g b{color:#4285F4;font-size:19px}'+
    '.sync-or{display:flex;align-items:center;gap:10px;color:#98a1a8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:13px 0}.sync-or::before,.sync-or::after{content:"";flex:1;height:1px;background:#2a2f35}'+
    '.pdots{display:flex;gap:16px;justify-content:center;margin:8px 0 12px}.pdot{width:15px;height:15px;border-radius:50%;border:2px solid #3a3f45;transition:.15s}.pdot.on{background:var(--sacc);border-color:var(--sacc);box-shadow:0 0 10px rgba(47,217,201,.5)}.pdots.shake{animation:pinsh .4s}@keyframes pinsh{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}'+
    '.pkeypad{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin:4px 0 2px}.pkey{height:66px;border-radius:18px;border:1px solid #2a2f35;background:#121417;color:#f0f2f4;font-size:27px;font-weight:600;cursor:pointer;font-family:inherit;position:relative}.pinpv{position:fixed;z-index:2000001;display:flex;align-items:center;justify-content:center;pointer-events:none;border-radius:18px;background:linear-gradient(180deg,#f4fbfa,#cbe6e2);color:#07171b;font-weight:800;box-shadow:0 10px 26px rgba(0,0,0,.55);font-family:inherit;animation:pinpv .26s cubic-bezier(.25,1.4,.45,1) forwards}@keyframes pinpv{0%{transform:translate(-50%,-50%) scale(.8);opacity:0}22%{transform:translate(-50%,-96%) scale(1.28);opacity:1}62%{transform:translate(-50%,-96%) scale(1.28);opacity:1}100%{transform:translate(-50%,-88%) scale(1.12);opacity:0}}.pkey:active{transform:scale(.93);background:rgba(47,217,201,.14)}.pkey.empty{background:none;border:none}.pkey.pkb{font-size:21px;color:#98a1a8}'+
    '#syncBtn{position:fixed;top:calc(10px + env(safe-area-inset-top));right:12px;z-index:9998;width:38px;height:38px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(20,23,27,.82);backdrop-filter:blur(8px);color:#cfd6db;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4)}#syncBtn.on{color:'+ACCENT+';border-color:rgba(47,217,201,.4)}#syncBtn svg{width:19px;height:19px}'+
    '#syncToast{position:fixed;left:50%;bottom:calc(28px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:100001;background:#12161b;color:#eafcf6;border:1px solid #1f5c4d;border-radius:12px;padding:10px 16px;font-size:13px;font-weight:700;opacity:0;transition:opacity .3s;box-shadow:0 10px 30px rgba(0,0,0,.5);font-family:"Segoe UI",Arial,sans-serif}';
    document.head.appendChild(st);
  }
  function ov(){ var e=document.getElementById('syncOv'); if(!e){ e=document.createElement('div'); e.id='syncOv'; e.className='syncov hidden'; document.body.appendChild(e); } return e; }
  function screen(html,lock){ var e=ov(); e.innerHTML='<div class="sync-card">'+html+'</div>'; e.classList.remove('hidden'); e.dataset.lock=lock?'1':'';
    e.onclick=function(ev){ if(ev.target===e && !lock) closeOv(); }; }
  function closeOv(){ var e=document.getElementById('syncOv'); if(e)e.classList.add('hidden'); }
  function val(id){ var e=document.getElementById(id); return e?e.value.trim():''; }
  function err(m){ var e=document.getElementById('syncErr'); if(e){ e.textContent=m; e.style.display='block'; } }
  function toast(m){ var t=document.getElementById('syncToast'); if(!t){ t=document.createElement('div'); t.id='syncToast'; document.body.appendChild(t); } t.textContent=m; t.style.opacity='1'; clearTimeout(t._h); t._h=setTimeout(function(){t.style.opacity='0';},2400); }

  var IC={sync:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'};

  /* ---------- modais ---------- */
  window.uiConfirm=function(msg,o){ o=o||{}; return new Promise(function(res){ window.__ur=function(v){ closeOv(); res(v); };
    screen('<div class="sync-ic'+(o.danger?' danger':'')+'">'+(o.danger?IC.help:IC.help)+'</div>'+(o.title?'<h2>'+o.title+'</h2>':'')+'<p>'+msg+'</p><div class="sync-act"><button class="sbtn-g" onclick="__ur(false)">'+(o.cancel||'Cancelar')+'</button><button class="'+(o.danger?'sbtn-d':'sbtn-p')+'" onclick="__ur(true)">'+(o.ok||'Confirmar')+'</button></div>'); }); };
  window.uiAlert=function(msg,o){ o=o||{}; return new Promise(function(res){ window.__ur=function(){ closeOv(); res(); };
    screen('<div class="sync-ic">'+IC.info+'</div>'+(o.title?'<h2>'+o.title+'</h2>':'')+'<p>'+msg+'</p><div class="sync-act"><button class="sbtn-p" onclick="__ur()">'+(o.ok||'Ok')+'</button></div>'); }); };

  /* ---------- login sem senha ---------- */
  function showConnect(){ screen('<div class="sync-ic">'+IC.sync+'</div><h2>Sincronizar aparelhos</h2><p>Entre com <b>e-mail e senha</b> pra ver os mesmos dados no computador e no celular.<br><span style="opacity:.72">Se ainda não tiver conta, ela é criada na hora — sem e-mail de confirmação.</span></p>'+
    '<div class="sync-f"><label>E-mail</label><input id="syEmail" type="email" inputmode="email" placeholder="voce@email.com" value="'+(localStorage.getItem(LK.login)||'')+'"></div>'+
    '<div class="sync-f"><label>Senha</label><input id="syPw" type="password" placeholder="mín. 6 caracteres"></div>'+
    '<div class="sync-err" id="syncErr"></div>'+
    '<div class="sync-act"><button class="sbtn-p" id="syGo" onclick="window.__enter()" style="width:100%">Entrar ou criar conta</button></div>'+
    '<button class="sync-link" onclick="window.__forgot()">Esqueci a senha</button>'+
    '<button class="sync-link" onclick="window.__codeLogin()">Entrar por link no e-mail</button>'); }
  window.__scn=function(){ showConnect(); };
  window.__sc=closeOv;
  window.__codeLogin=function(){ screen('<div class="sync-ic">'+IC.mail+'</div><h2>Entrar por e-mail</h2><p>Mando um <b>link de acesso</b> pro seu e-mail. Abra o link neste mesmo aparelho.</p>'+
    '<div class="sync-f"><label>Seu e-mail</label><input id="mlEmail" type="email" inputmode="email" placeholder="voce@email.com" value="'+(localStorage.getItem(LK.login)||'')+'"></div><div class="sync-err" id="syncErr"></div>'+
    '<div class="sync-act"><button class="sbtn-g" onclick="window.__scn()">Voltar</button><button class="sbtn-p" onclick="window.__sm()">Enviar link</button></div>'); };
  function showCode(e){ _pending=e; screen('<div class="sync-ic">'+IC.mail+'</div><h2>Confira o e-mail</h2><p>Mandei um e-mail pra <b style="color:#f0f2f4">'+e+'</b>. <b>Toque no link</b> — ele abre já conectado.<br><span style="opacity:.72">Se vier um código de 6 dígitos, dá pra digitar aqui.</span></p>'+
      '<div class="sync-f"><input id="otpCode" type="text" inputmode="numeric" autocomplete="one-time-code" data-kb="off" maxlength="6" placeholder="000000" style="text-align:center;letter-spacing:8px;font-size:24px;font-weight:800"></div><div class="sync-err" id="syncErr"></div>'+
      '<div class="sync-act"><button class="sbtn-g" onclick="window.__sm2()">Reenviar</button><button class="sbtn-p" onclick="window.__sv()">Entrar</button></div>'+
      '<button class="sync-link" onclick="window.__scn()">Trocar e-mail</button>');
    setTimeout(function(){ var i=document.getElementById('otpCode'); if(i){ i.focus(); i.oninput=function(){ this.value=this.value.replace(/\D/g,'').slice(0,6); if(this.value.length===6)window.__sv(); }; } },120); }
  window.__sm=async function(){ var e=val('mlEmail'); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){ err('Digite um e-mail válido.'); return; } if(!sb){ err('Sem conexão.'); return; }
    try{ _set(LK.login,e); var r=await sb.auth.signInWithOtp({email:e,emailRedirectTo:location.href.split('#')[0].split('?')[0]}); if(r.error){ err(r.error.message); return; }
      showCode(e);
    }catch(x){ err('Erro: '+(x.message||x)); } };
  window.__sm2=async function(){ var e=_pending||localStorage.getItem(LK.login); if(!e||!sb)return; try{ await sb.auth.signInWithOtp({email:e,emailRedirectTo:location.href.split('#')[0].split('?')[0]}); toast('Reenviado ✓'); }catch(x){} };
  window.__sv=async function(){ var c=(val('otpCode')||'').replace(/\D/g,''); var e=_pending||localStorage.getItem(LK.login);
    if(c.length<6){ err('Digite os 6 dígitos.'); return; } if(!sb){ err('Sem conexão.'); return; }
    try{ var r=await sb.auth.verifyOtp({email:e,token:c,type:'email'}); if(r.error){ err('Código inválido ou expirado. Toque em Reenviar.'); return; }
      session=(r.data&&r.data.session)||session; onSignedIn();
    }catch(x){ err('Erro: '+(x.message||x)); } };
  window.__enter=async function(){ var e=((val('syEmail')||'')+'').trim().toLowerCase(), pw=(document.getElementById('syPw')||{}).value||'';
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){ err('Digite um e-mail válido.'); return; }
    if(pw.length<6){ err('A senha precisa de ao menos 6 caracteres.'); return; }
    if(!sb){ err('Sem conexão com o servidor.'); return; }
    var b=document.getElementById('syGo'); function busy(v){ if(b){ b.disabled=v; b.textContent=v?'Entrando…':'Entrar ou criar conta'; } }
    busy(true);
    try{
      var r=await sb.auth.signInWithPassword({email:e,password:pw});
      if(!r.error){ _set(LK.login,e); session=r.data.session; busy(false); onSignedIn(); return; }
      var m=((r.error&&r.error.message)||'')+'';
      if(!/invalid login credentials/i.test(m)){ busy(false); err(m); return; }
      var s2=await sb.auth.signUp({email:e,password:pw});
      if(s2.error){ var m2=((s2.error&&s2.error.message)||'')+''; busy(false);
        if(/already|registered|exists/i.test(m2)){ err('Esse e-mail já tem conta, mas a senha não confere. Toque em "Esqueci a senha" pra definir uma nova.'); }
        else { err(m2); }
        return; }
      var s=(s2.data&&s2.data.session)||null;
      if(!s){ var g=await sb.auth.signInWithPassword({email:e,password:pw}); s=(g.data&&g.data.session)||null; }
      busy(false);
      if(!s){ err('Conta criada, mas falta confirmar o e-mail. Abra o link que enviei.'); return; }
      _set(LK.login,e); session=s; toast('Conta criada ✓'); onSignedIn();
    }catch(x){ busy(false); err('Erro: '+(x.message||x)); } };
  window.__login=async function(){ var e=val('syEmail'), pw=(document.getElementById('syPw')||{}).value||'';
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){ err('Digite um e-mail válido.'); return; }
    if(!pw){ err('Digite a senha.'); return; } if(!sb){ err('Sem conexão.'); return; }
    try{ var r=await sb.auth.signInWithPassword({email:e,password:pw}); if(r.error){ err(((r.error.message||'')+'').replace(/^Invalid login credentials$/i,'E-mail ou senha incorretos.')); return; }
      _set(LK.login,e); session=r.data.session; onSignedIn();
    }catch(x){ err('Erro: '+(x.message||x)); } };
  window.__signup=async function(){ var e=val('syEmail'), pw=(document.getElementById('syPw')||{}).value||'';
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){ err('Digite um e-mail válido.'); return; }
    if(pw.length<6){ err('A senha precisa de ao menos 6 caracteres.'); return; } if(!sb){ err('Sem conexão.'); return; }
    try{ var r=await sb.auth.signUp({email:e,password:pw});
      if(r.error){ if(/registered|already/i.test(r.error.message)){ r=await sb.auth.signInWithPassword({email:e,password:pw}); if(r.error){ err('Esse e-mail já tem conta e a senha não confere. Use "Entrar" ou "Esqueci a senha".'); return; } } else { err(r.error.message); return; } }
      var s=(r.data&&r.data.session)||null;
      if(!s){ var g=await sb.auth.signInWithPassword({email:e,password:pw}); s=(g.data&&g.data.session)||null; }
      if(!s){ err('Conta criada — agora toque em Entrar.'); return; }
      _set(LK.login,e); session=s; toast('Conta criada ✓'); onSignedIn();
    }catch(x){ err('Erro: '+(x.message||x)); } };
  window.__forgot=async function(){ var e=val('syEmail')||localStorage.getItem(LK.login); if(!e){ err('Digite seu e-mail primeiro.'); return; } if(!sb){ err('Sem conexão.'); return; }
    try{ await sb.auth.resetPasswordForEmail(e,{redirectTo:location.href.split('#')[0].split('?')[0]}); screen('<div class="sync-ic">'+IC.mail+'</div><h2>Recuperar senha</h2><p>Enviei um link pra <b style="color:#f0f2f4">'+e+'</b>. Abra no mesmo aparelho pra definir uma nova senha (veja o spam).</p><div class="sync-act"><button class="sbtn-p" onclick="window.__sc()">Ok</button></div>'); }catch(x){ err('Erro: '+(x.message||x)); } };
  function showRecovery(){ screen('<div class="sync-ic">'+IC.lock+'</div><h2>Nova senha</h2><p>Defina uma nova senha pra sua conta.</p>'+
    '<div class="sync-f"><label>Nova senha</label><input id="rcPw" type="password" placeholder="mín. 6"></div>'+
    '<div class="sync-err" id="syncErr"></div>'+
    '<div class="sync-act"><button class="sbtn-p" onclick="window.__setpw()">Salvar</button></div>'); }
  window.__setpw=async function(){ var p=(document.getElementById('rcPw')||{}).value||''; if(p.length<6){ err('Mínimo 6 caracteres.'); return; } if(!sb){ err('Sem conexão.'); return; }
    try{ var r=await sb.auth.updateUser({password:p}); if(r.error){ err(r.error.message); return; }
      var g=await sb.auth.getSession(); session=(g.data&&g.data.session)||session; toast('Senha redefinida ✓'); onSignedIn();
    }catch(x){ err('Erro: '+(x.message||x)); } };

  window.__mkpw=function(){ screen('<div class="sync-ic">'+IC.lock+'</div><h2>Senha da conta</h2><p>Defina uma senha pra entrar em qualquer aparelho novo <b>sem depender de e-mail</b>.</p>'+
    '<div class="sync-f"><label>Nova senha</label><input id="npPw" type="password" placeholder="mín. 6 caracteres"></div>'+
    '<div class="sync-err" id="syncErr"></div>'+
    '<div class="sync-act"><button class="sbtn-g" onclick="window.openSync()">Voltar</button><button class="sbtn-p" onclick="window.__savepw()">Salvar</button></div>'); };
  window.__savepw=async function(){ var p=(document.getElementById('npPw')||{}).value||''; if(p.length<6){ err('Mínimo 6 caracteres.'); return; } if(!sb){ err('Sem conexão.'); return; }
    try{ var r=await sb.auth.updateUser({password:p}); if(r.error){ err(r.error.message); return; }
      closeOv(); toast('Senha definida ✓');
    }catch(x){ err('Erro: '+(x.message||x)); } };

  function _diagHtml(){
    var d={}; try{ d=JSON.parse(localStorage.getItem(LK.diag)||'{}'); }catch(e){}
    function q(iso){ if(!iso) return 'nunca'; var t=new Date(iso), m=Math.round((Date.now()-t)/60000);
      if(m<1) return 'agora'; if(m<60) return 'há '+m+' min'; return t.toLocaleString('pt-BR'); }
    var err = d.envio_erro || d.leitura_erro;
    var cor = err ? '#f87171' : '#22C55E';
    var txt = err ? ('⚠ ' + (d.envio_erro?'envio':'leitura') + ': ' + err)
                  : ('✓ enviado ' + q(d.envio_ok) + ' · lido ' + q(d.leitura_ok));
    return '<div style="font-size:11.5px;line-height:1.5;color:'+cor+';background:#0e1216;border:1px solid #23282e;border-radius:10px;padding:9px 11px;margin:0 0 12px;word-break:break-word">'+txt+'</div>';
  }
  window.openSync=function(){
    if(!ready()){ showConnect(); return; }
    screen('<div class="sync-ic">'+IC.sync+'</div><h2>Sincronização</h2><p>Conectado como <b style="color:#f0f2f4">'+(localStorage.getItem(LK.login)||(session.user&&session.user.email)||'')+'</b><br>Seus dados aparecem nos seus aparelhos.</p>'+
      _diagHtml()+'<div class="sync-list"><button onclick="window.__mkpw()">'+IC.pen+' Senha da conta</button><button onclick="window.__pin()">'+IC.lock+' Bloqueio por PIN</button><button class="d" onclick="window.__dc()">Sair da conta (parar de sincronizar)</button></div>'+
      '<div class="sync-act"><button class="sbtn-p" onclick="window.__sc()">Fechar</button></div>'); };
  window.__dc=async function(){ if(!await uiConfirm('Você vai parar de sincronizar neste aparelho. Os dados continuam aqui, só não atualizam no outro. Pra voltar, é só entrar de novo.',{title:'Sair da conta?',ok:'Sair',danger:true}))return;
    _synced=false; try{ if(sb)await sb.auth.signOut(); }catch(e){} if(_rtChan){ try{sb.removeChannel(_rtChan);}catch(e){} _rtChan=null; }
    session=null; localStorage.removeItem(LK.synced); localStorage.setItem(LK.nag,'1'); closeOv(); updateBtn(); toast('Desconectado'); };

  /* ---------- PIN ---------- */
  function pinTitles(m){ return ({unlock:['Digite seu PIN',''],set1:['Criar PIN','Escolha um PIN de 4 dígitos'],set2:['Confirmar PIN','Repita o PIN'],chgcur:['PIN atual','Digite seu PIN atual'],chgnew:['Novo PIN','Escolha o novo PIN'],chgconf:['Confirmar','Repita o novo PIN'],offcur:['Desativar PIN','Digite seu PIN pra desativar']})[m]||['PIN','']; }
  function pdots(){ var s=''; for(var i=0;i<4;i++)s+='<span class="pdot'+(i<_pin.length?' on':'')+'"></span>'; return s; }
  function keypad(){ var k=''; ['1','2','3','4','5','6','7','8','9','x','0','back'].forEach(function(d){ if(d==='x')k+='<span class="pkey empty"></span>'; else if(d==='back')k+='<button class="pkey pkb" onclick="window.__pb()">⌫</button>'; else k+='<button class="pkey" onclick="window.__pt(\''+d+'\')">'+d+'</button>'; }); return k; }
  function showPin(m){ _pinMode=m; _pin=''; var t=pinTitles(m); screen('<div class="sync-ic">'+IC.lock+'</div><h2>'+t[0]+'</h2>'+(t[1]?'<p>'+t[1]+'</p>':'')+'<div class="pdots" id="pdots">'+pdots()+'</div><div class="sync-err" id="syncErr" style="min-height:15px"></div><div class="pkeypad">'+keypad()+'</div>'+(m==='unlock'?'':'<button class="sync-link" onclick="window.__sc()">Cancelar</button>'), m==='unlock'); }

  /* aviso de toque no teclado do PIN: bolha + vibracao, e segurar apaga.
     A bolha mostra um PONTO, nunca o digito -- e um PIN; quem olha por cima
     do ombro veria o numero. O que importa e saber ONDE se tocou. */
  var _pinRep=null;
  function _pinSolta(){ if(_pinRep){ clearTimeout(_pinRep); _pinRep=null; } }
  function _pinBolha(el, txt){
    try{ if(navigator.vibrate) navigator.vibrate(8); }catch(x){}
    try{
      var r=el.getBoundingClientRect(); if(!r.width) return;
      var b=document.createElement('div'); b.className='pinpv'; b.textContent=txt;
      var al=el.offsetHeight||r.height;
      var la=Math.min(el.offsetWidth||r.width, al*1.15);
      var meio=r.left+r.width/2, folga=la*0.66+4;
      if(meio<folga) meio=folga;
      if(meio>window.innerWidth-folga) meio=window.innerWidth-folga;
      b.style.left=meio+'px'; b.style.top=(r.top+r.height/2)+'px';
      b.style.width=la+'px'; b.style.height=al+'px';
      b.style.fontSize=getComputedStyle(el).fontSize;
      document.body.appendChild(b);
      setTimeout(function(){ try{ b.parentNode.removeChild(b); }catch(y){} }, 300);
    }catch(x){}
  }
  document.addEventListener('pointerdown', function(e){
    var t=e.target && e.target.closest && e.target.closest('.pkey');
    if(!t || t.classList.contains('empty')) return;
    var apaga=t.classList.contains('pkb');
    _pinBolha(t, apaga ? '⌫' : '•');
    if(!apaga) return;
    _pinSolta(); var n=0;
    _pinRep=setTimeout(function passo(){
      if(!_pin){ _pinSolta(); return; }
      window.__pb(); n++;
      _pinRep=setTimeout(passo, n<4?90:60);
    }, 420);
  });
  ['pointerup','pointercancel','touchend','touchcancel','mouseup'].forEach(function(ev){
    document.addEventListener(ev, _pinSolta);
  });
  function pinRef(){ var e=document.getElementById('pdots'); if(e)e.innerHTML=pdots(); }
  window.__pb=function(){ _pin=_pin.slice(0,-1); pinRef(); };
  window.__pt=function(d){ if(_pin.length>=4)return; _pin+=d; pinRef(); if(_pin.length===4)setTimeout(pinDone,130); };
  function pinErrShake(m){ _pin=''; pinRef(); err(m); var c=document.querySelector('.pdots'); if(c){ c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); } }
  async function pinDone(){ var code=_pin,h=await sha(code);
    if(_pinMode==='unlock'){ if(h===localStorage.getItem(LK.pin)){ markSess(); closeOv(); } else pinErrShake('PIN incorreto'); }
    else if(_pinMode==='set1'){ _pinTmp=code; showPin('set2'); }
    else if(_pinMode==='set2'){ if(code===_pinTmp){ _set(LK.pin,h); markSess(); closeOv(); toast('PIN ativado ✓'); } else { pinErrShake('Não conferiu'); setTimeout(function(){showPin('set1');},650); } }
    else if(_pinMode==='chgcur'){ if(h===localStorage.getItem(LK.pin))showPin('chgnew'); else pinErrShake('PIN incorreto'); }
    else if(_pinMode==='chgnew'){ _pinTmp=code; showPin('chgconf'); }
    else if(_pinMode==='chgconf'){ if(code===_pinTmp){ _set(LK.pin,h); closeOv(); toast('PIN alterado ✓'); } else { pinErrShake('Não conferiu'); setTimeout(function(){showPin('chgnew');},650); } }
    else if(_pinMode==='offcur'){ if(h===localStorage.getItem(LK.pin)){ localStorage.removeItem(LK.pin); closeOv(); toast('PIN desativado'); } else pinErrShake('PIN incorreto'); } }
  window.__pin=function(){ if(!localStorage.getItem(LK.pin)){ showPin('set1'); return; }
    screen('<div class="sync-ic">'+IC.lock+'</div><h2>Bloqueio por PIN</h2><p>O PIN está <b style="color:#5c9a6b">ativado</b> — pedido só ao abrir o app neste aparelho.</p><div class="sync-list"><button onclick="window.__pc()">'+IC.pen+' Trocar PIN</button><button class="d" onclick="window.__po()">Desativar PIN</button></div><div class="sync-act"><button class="sbtn-p" onclick="window.__sc()">Fechar</button></div>'); };
  window.__pc=function(){ showPin('chgcur'); };
  window.__po=function(){ showPin('offcur'); };
  function maybeLock(){ if(localStorage.getItem(LK.pin) && !sessionStorage.getItem(LK.sess)) showPin('unlock'); }

  /* ---------- botão de acesso ---------- */
  function updateBtn(){ var b=document.getElementById('syncBtn'); if(!b)return; b.classList.toggle('on', ready()||!!localStorage.getItem(LK.login)); b.innerHTML=IC.sync; }
  function injectBtn(){ if(document.getElementById('syncBtn'))return; var b=document.createElement('button'); b.id='syncBtn'; b.title='Sincronização'; b.onclick=window.openSync; b.innerHTML=IC.sync; document.body.appendChild(b); updateBtn(); }

  /* ---------- boot ---------- */
  async function boot(){ injectCSS(); init(); injectBtn();
    if(sb){ try{ var g=await sb.auth.getSession(); session=(g&&g.data&&g.data.session)||null; }catch(e){}
      sb.auth.onAuthStateChange(function(ev,ses){ if(ev==='PASSWORD_RECOVERY'){ session=ses||session; showRecovery(); return; } if(ses){ session=ses; if(ev==='SIGNED_IN')onSignedIn(); } }); }
    if(session){ onSignedIn(); }
    maybeLock();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
