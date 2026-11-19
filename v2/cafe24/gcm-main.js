(function(){
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // header turns orange once you leave the hero
  const hdr=document.getElementById('hdr'),hero=document.querySelector('.hero');
  const setHdr=()=>hdr.classList.toggle('solid',scrollY>hero.offsetHeight-90);
  setHdr();addEventListener('scroll',setHdr,{passive:true});
  // active nav pill follows the section in view
  const links=[...document.querySelectorAll('.nav ul a')];
  const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));}}),{rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(s=>s&&so.observe(s));
  // reveal + count-up
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');ro.unobserve(e.target);
    const n=e.target.querySelector('.n');if(n&&!still)count(n);}),{threshold:.15});
  document.querySelectorAll('.rv').forEach(el=>ro.observe(el));
  function count(el){const to=+el.dataset.to,dec=+(el.dataset.dec||0),suf=el.dataset.suf||'';const t0=performance.now();
    (function f(t){const k=Math.min(1,(t-t0)/1400),v=to*(1-Math.pow(1-k,3));el.textContent=v.toFixed(dec)+suf;if(k<1)requestAnimationFrame(f);})(t0);}
  // hero parallax on the floating tags and packs
  if(!still){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*2);hero.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*2);});
    hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--mx',0);hero.style.setProperty('--my',0);});}
  // rings light up one after another while the section is on screen
  const rings=[...document.querySelectorAll('.ring')];let ri=0,timer=null;
  const io=new IntersectionObserver(es=>es.forEach(e=>{clearInterval(timer);if(e.isIntersecting&&!still){timer=setInterval(()=>{rings.forEach((r,i)=>r.classList.toggle('lit',i===ri));ri=(ri+1)%rings.length;},1100);}else rings.forEach(r=>r.classList.remove('lit'));}),{threshold:.3});
  io.observe(document.getElementById('rings'));
  // column board: one post open at a time
  document.querySelectorAll('.board').forEach(bd=>{const posts=[...bd.querySelectorAll('.post')];
    posts.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)posts.forEach(o=>{if(o!==d)o.open=false;});}));});
  document.querySelectorAll('.post-close').forEach(b=>b.addEventListener('click',()=>{const d=b.closest('.post');d.open=false;d.scrollIntoView({block:'nearest',behavior:still?'auto':'smooth'});}));
  document.getElementById('toTop').addEventListener('click',()=>scrollTo({top:0,behavior:still?'auto':'smooth'}));
})();
;
(function(){
  // Hero fluid: domain-warped noise in cobalt, with soft orange/yellow currents drifting through.
  const cv=document.getElementById('flow');if(!cv)return;
  const gl=cv.getContext('webgl',{premultipliedAlpha:false,antialias:false});if(!gl)return;
  const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs=`precision highp float;uniform vec2 R;uniform float T;uniform vec2 M;uniform float MI;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=r*p*2.02;a*=.5;}return v;}
  void main(){
    vec2 uv=gl_FragCoord.xy/R;float as=R.x/R.y;vec2 p=vec2(uv.x*as,uv.y)*1.35;
    vec2 m=vec2(M.x*as,M.y)*1.35;float d=length(p-m);p+=(p-m)*.12*exp(-d*d*2.)*MI;
    float t=T*.018;
    vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));
    vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*.7),fbm(p+3.*q+vec2(8.3,2.8)-t*.6));
    float f=fbm(p+2.6*r);
    vec3 cob=vec3(0.,.294,.871),deep=vec3(.02,.18,.58),mist=vec3(.42,.58,.95),cream=vec3(1.,.93,.82);
    vec3 c=mix(deep,cob,smoothstep(.15,.75,f));
    c=mix(c,mist,smoothstep(.55,.95,r.x)*smoothstep(.35,.8,f)*.45);
    c=mix(c,cream,smoothstep(.75,1.,r.x)*smoothstep(.5,.85,f)*.18);
    c+=(h(gl_FragCoord.xy+floor(T*8.))-.5)*.02;
    gl_FragColor=vec4(c,1.);}`;
  function sh(t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T'),uM=gl.getUniformLocation(pr,'M'),uMI=gl.getUniformLocation(pr,'MI');
  const host=cv.parentElement;let scale=1;
  function size(){scale=Math.min(1,devicePixelRatio||1)*.6;cv.width=Math.max(2,host.clientWidth*scale|0);cv.height=Math.max(2,host.clientHeight*scale|0);gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(uR,cv.width,cv.height);}
  size();addEventListener('resize',size);
  let mx=.5,my=.5,tx=.5,ty=.5,mi=0,ti=0;
  host.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();tx=(e.clientX-b.left)/b.width;ty=1-(e.clientY-b.top)/b.height;ti=1;});
  host.addEventListener('pointerleave',()=>{ti=0;});
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let vis=true;new IntersectionObserver(es=>{vis=es[0].isIntersecting;}).observe(host);
  const t0=performance.now();
  function draw(now){mx+=(tx-mx)*.06;my+=(ty-my)*.06;mi+=(ti-mi)*.04;
    gl.uniform1f(uT,still?20:(now-t0)/1000+20);gl.uniform2f(uM,mx,my);gl.uniform1f(uMI,mi);gl.drawArrays(gl.TRIANGLES,0,3);}
  draw(t0);cv.classList.add('on');
  if(!still)(function loop(now){if(vis)draw(now);requestAnimationFrame(loop);})(t0);
})();
;
(function(){const a=document.getElementById('ask'),b=document.getElementById('askBtn');
b.onclick=()=>{const o=a.classList.toggle('open');b.setAttribute('aria-expanded',o);};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){a.classList.remove('open');b.setAttribute('aria-expanded',false);}});
document.addEventListener('click',e=>{if(!a.contains(e.target)){a.classList.remove('open');b.setAttribute('aria-expanded',false);}});
a.querySelector('[data-kakao]').onclick=e=>{e.preventDefault();const p=a.querySelector('.ask-panel p');p.textContent='카카오톡 채널 주소가 정해지면 연결돼요.';};})();
;
(function(){
  // MACs & Friends — flat shapes, jelly motion (squash/stretch springs, lean toward pointer, boing on hover/tap)
  const box=document.getElementById('friends');if(!box)return;
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){box.classList.add('go');o.disconnect();}},{threshold:.2}).observe(box);
  const chars=[...box.querySelectorAll('.ch')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const faces=chars.map(c=>c.querySelector('.fc'));
  const st=chars.map((c,i)=>({el:c.querySelector('svg.b'),ph:Math.random()*6.28,sp:.9+Math.random()*.5,amp:.022+Math.random()*.018,
    q:0,qv:0, r:0,rv:0, y:0,yv:0, lean:0, near:false}));
  let px=-9999,py=-9999;
  addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;},{passive:true});
  box.addEventListener('pointerleave',()=>{px=py=-9999;});
  const boing=(i,p=1)=>{const s=st[i];s.qv-=5.5*p;s.rv+=(Math.random()-.5)*60*p;};
  const jump=i=>{const s=st[i];s.qv-=7;s.yv-=2.6;};
  chars.forEach((c,i)=>{if(c.classList.contains('mac'))c.addEventListener('click',()=>{chars.forEach(o=>o!==c&&o.classList.remove('tip'));c.classList.toggle('tip');});c.addEventListener('pointerenter',()=>boing(i));c.addEventListener('click',()=>jump(i));
    c.addEventListener('pointerdown',()=>{st[i].qv-=4;c.classList.add('press');});c.addEventListener('pointerup',()=>c.classList.remove('press'));});
  if(reduce)return;
  let last=performance.now(),vis=true;
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;},{}).observe(box);
  function tick(t){
    const dt=Math.min(.033,(t-last)/1000);last=t;
    if(vis){chars.forEach((c,i)=>{
      const s=st[i];const r=c.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2,dx=px-cx,dy=py-cy,d=Math.hypot(dx,dy)||1;
      const reach=Math.max(220,r.width*1.4),infl=Math.max(0,1-d/reach);
      // lean gently toward the pointer, like it's curious
      const tl=Math.max(-1,Math.min(1,dx/reach))*9*infl;
      // springs: squash (q), rotation (r), lift (y)
      s.qv+=(-90*s.q-7*s.qv)*dt; s.q+=s.qv*dt;
      s.rv+=(-70*(s.r-tl)-6*s.rv)*dt; s.r+=s.rv*dt;
      s.yv+=(-60*s.y-5*s.yv)*dt; s.y+=s.yv*dt;
      // idle breathing: volume-preserving squash & stretch + soft sway
      const ph=t/1000*s.sp*2.1+s.ph, br=Math.sin(ph)*s.amp, sw=Math.sin(ph*.5+1.3)*2.2;
      const sq=br+s.q*.12, sx=1+sq, sy=1/(1+sq);
      const lift=Math.max(0,-Math.sin(ph))*-1.2 + s.y*14 - infl*2;
      s.el.style.transform=`translateY(${lift.toFixed(2)}%) rotate(${(sw+s.r).toFixed(2)}deg) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
      const fk=Math.min(1,d/400);
      faces[i].style.setProperty('--fx',(dx/d*4*fk+s.r*.25).toFixed(2)+'px');faces[i].style.setProperty('--fy',(dy/d*3*fk).toFixed(2)+'px');
    });}
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
;
(function(){
  // MAC friends race (2:6:2): 2 green, 6 yellow, 2 blue leave the left start one after another,
  // run along the gut track and line up in front of their goals — green before goal 1,
  // yellow before goal 2, blue at the far end — then their bubbles pop up.
  const sec=document.getElementById('gut');if(!sec)return;
  const frame=document.getElementById('gutFrame'),scroller=document.getElementById('gutScroll'),track=document.getElementById('gutTrack'),replay=document.getElementById('gutReplay');
  const els=[...frame.querySelectorAll('.rn')];
  const bub=[0,1,2].map(g=>frame.querySelector(`.rb[data-g="${g}"]`));
  const VW=1552,VH=936,L=track.getTotalLength();
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P=[];for(let s=0;s<=L;s+=3)P.push([s,track.getPointAtLength(s)]);
  const nearest=(fx,fy)=>{let b=0,d=1e18;for(const [s,p] of P){const q=(p.x-fx)**2+(p.y-fy)**2;if(q<d){d=q;b=s;}}return b;};
  const segDist=(p,a,b)=>{const vx=b[0]-a[0],vy=b[1]-a[1];const t=Math.max(0,Math.min(1,((p.x-a[0])*vx+(p.y-a[1])*vy)/(vx*vx+vy*vy)));return Math.hypot(p.x-a[0]-t*vx,p.y-a[1]-t*vy);};
  const cross=(a,b)=>{let best=0,d=1e18;for(const [s,p] of P){const q=segDist(p,a,b);if(q<d){d=q;best=s;}}return best;};
  const G1=cross([485.6,557.4],[261.6,695.4]),G2=cross([899.6,21.4],[1023.6,259.4]),G3=nearest(1212,370);
  const anchors=[G1-34,G2-34,G3];
  const W0=+els[0].dataset.w,GAP=W0*.62;
  const R=els.map((el,i)=>({el,i,g:+el.dataset.g,w:+el.dataset.w,h:+el.dataset.h,done:false}));
  // within a group, the first one out stands at the front
  [0,1,2].forEach(g=>{R.filter(r=>r.g===g).forEach((r,j)=>{r.goal=anchors[g]-j*GAP;});});
  const DELAY=1100,SPEED=.5;
  let start=0,running=false;
  // runner pose: feet on the track, body leans into the direction of travel and follows the slope a little
  function place(r,s,hop,moving){const ss=Math.max(0,s),p=track.getPointAtLength(ss),q=track.getPointAtLength(Math.min(L,ss+6));
    const dx=q.x-p.x,dy=q.y-p.y,dir=dx>=0?1:-1;const slope=Math.atan2(dy,Math.abs(dx))*180/Math.PI;
    const tilt=moving?dir*(10+Math.max(-25,Math.min(25,slope*.35))):0;
    const k=frame.clientWidth/VW,x=(p.x-r.w/2)*k,y=(p.y-r.h+4)*k-hop*k;
    r.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg) scaleX(${moving?dir:1})`;r.el.style.zIndex=4+Math.round(p.y/20);}
  function reset(){R.forEach(r=>{r.done=false;r.el.classList.remove('run','cheer');place(r,0,0,false);r.el.style.opacity=0;});bub.forEach(b=>b&&b.classList.remove('on'));replay.classList.remove('on');}
  function final(){R.forEach(r=>{r.el.style.opacity=1;place(r,r.goal,0,false);});bub.forEach(b=>b&&b.classList.add('on'));replay.classList.add('on');}
  function go(){reset();if(still){final();return;}start=performance.now();running=true;requestAnimationFrame(tick);}
  function tick(now){
    let all=true,lead=0;
    R.forEach(r=>{const t=now-start-r.g*DELAY;if(t<0){all=false;return;}
      r.el.style.opacity=1;
      const j=R.filter(o=>o.g===r.g).indexOf(r);const dist=Math.min(r.goal,t*SPEED-j*GAP);
      if(dist>=r.goal){if(!r.done){r.done=true;r.el.classList.remove('run');r.el.classList.add('cheer');
          if(R.filter(o=>o.g===r.g).every(o=>o.done)&&bub[r.g])bub[r.g].classList.add('on');}
        place(r,r.goal,0,false);}
      else{all=false;r.el.classList.add('run');r.el.style.opacity=dist<0?0:1;place(r,dist,Math.abs(Math.sin(t/102+j*.9))*7,true);lead=Math.max(lead,dist);}
    });
    if(scroller.scrollWidth>scroller.clientWidth&&lead){const px=track.getPointAtLength(lead).x/VW*frame.clientWidth;scroller.scrollLeft+=(px-scroller.clientWidth*.6-scroller.scrollLeft)*.06;}
    if(!all)requestAnimationFrame(tick);
    else{running=false;replay.classList.add('on');if(scroller.scrollWidth>scroller.clientWidth)scroller.scrollTo({left:(scroller.scrollWidth-scroller.clientWidth)/2,behavior:'smooth'});}
  }
  reset();
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){go();o.disconnect();}},{threshold:.35}).observe(frame);
  replay.addEventListener('click',()=>{if(!running)go();});
  els.forEach(el=>el.addEventListener('click',()=>{el.classList.remove('cheer');void el.offsetWidth;el.classList.add('cheer');}));
  addEventListener('resize',()=>{if(!running)R.forEach(r=>r.done&&place(r,r.goal,0,false));});
})();
;
(function(){const c=document.querySelector('.gh-copy');if(!c)return;
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){c.classList.add('hl');o.disconnect();}},{threshold:.4}).observe(c);})();
;
/* 히어로 서브타이틀을 GOODCARE MACs 타이틀 너비에 맞춤 */
(function(){
  var t=document.querySelector('.hero .mark .line'),p=document.querySelector('.hero .tl');
  if(!t||!p)return;
  function fit(){
    p.style.fontSize='';
    var tw=t.getBoundingClientRect().width,pw=p.scrollWidth,fs=parseFloat(getComputedStyle(p).fontSize);
    if(tw&&pw)p.style.fontSize=(fs*tw/pw).toFixed(2)+'px';
  }
  fit();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  addEventListener('load',fit);addEventListener('resize',fit);
})();
;
(function(){
  // FAQ opens as its own clean screen on #faq and closes back to where the reader was
  const v=document.getElementById('faq'),cl=document.getElementById('fqClose'),root=document.documentElement;let back=0;
  function sync(){const on=location.hash==='#faq';if(on&&v.hidden){back=scrollY;}v.hidden=!on;root.classList.toggle('fq-open',on);if(on)v.scrollTop=0;}
  document.querySelectorAll('a[href="#faq"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(location.hash==='#faq')sync();else location.hash='faq';}));
  function close(){if(location.hash==='#faq'){history.replaceState(null,'',location.pathname+location.search);}sync();scrollTo(0,back);}
  document.querySelectorAll('a[data-fq]').forEach(a=>a.addEventListener('click',()=>{const go=()=>{const t=document.getElementById(a.dataset.fq);if(t&&!v.hidden)v.scrollTop=t.getBoundingClientRect().top-v.getBoundingClientRect().top+v.scrollTop-20;};setTimeout(go,60);setTimeout(go,200);}));
  cl.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!v.hidden)close();});
  addEventListener('hashchange',sync);sync();
})();
;
(function(){
  var L=window.GCM_LINKS||{};
  function list(){return L.cate?'/product/list.html?cate_no='+encodeURIComponent(L.cate):'/product/list.html';}
  function prod(no){return no?'/product/detail.html?product_no='+encodeURIComponent(no):list();}
  var map={list:list(),banana:prod(L.banana),pistachio:prod(L.pistachio),inquiry:L.inquiry||'/board/index.html',imbert:L.imbert||'https://www.immunobiome.co.kr/imbert'};
  document.querySelectorAll('a[data-gcm]').forEach(function(a){var u=map[a.getAttribute('data-gcm')];if(u)a.setAttribute('href',u);});
})();


(function(){
  var stage=document.getElementById('gfStage');if(!stage)return;
  var NS='http://www.w3.org/2000/svg',ASSET=stage.getAttribute('data-assets')||'assets/';
  var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHARS=['green','yellow','blue','yellow','green','yellow','yellow','blue','yellow','yellow']; // 2 green · 6 yellow · 2 blue
  var COLORS=['#B9A8FF','#FF8FC8','#7EDCB5','#9BE35A','#7CC8FF','#FFD54A','#FFB36B','#C9A8FF'];
  var layouts={
    wide:{vb:[1600,660],d:'M -60 150 C 260 150 330 430 610 430 C 880 430 880 95 1070 95 C 1270 95 1290 420 1660 420',band:150,size:78,
      mic:[[.17,-1.25,30],[.24,1.15,34],[.33,-1.05,24],[.42,1.3,36],[.52,-1.2,26],[.6,1.05,32],[.69,-1.3,34],[.77,1.2,24],[.86,-1.15,30],[.93,1.25,28]]},
    narrow:{vb:[800,720],d:'M -60 140 C 150 140 200 470 400 470 C 600 470 620 170 860 170',band:150,size:84,
      mic:[[.2,-1.25,30],[.29,1.2,34],[.4,-1.15,26],[.5,1.3,36],[.62,-1.2,30],[.74,1.2,28],[.87,-1.25,32]]}
  };
  var cur=null,svg,path,L,mics=[],runners=[],raf=0,t0=0,running=false;
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
  function at(l,off){var p=path.getPointAtLength(Math.max(0,Math.min(L,l))),q=path.getPointAtLength(Math.max(0,Math.min(L,l+1)));var dx=q.x-p.x,dy=q.y-p.y,m=Math.hypot(dx,dy)||1;return {x:p.x-dy/m*off,y:p.y+dx/m*off};}
  function build(kind){
    cur=kind;var c=layouts[kind];stage.innerHTML='';mics=[];runners=[];
    svg=el('svg',{viewBox:'0 0 '+c.vb[0]+' '+c.vb[1],'aria-hidden':'true'},stage);
    var defs=el('defs',{},svg);
    var pat=el('pattern',{id:'gfDot',width:7,height:7,patternUnits:'userSpaceOnUse'},defs);el('circle',{cx:2,cy:2,r:1.5,fill:'#C83A00','fill-opacity':.55},pat);
    var g=el('g',{fill:'none','stroke-linecap':'round'},svg),B=c.band;
    el('path',{d:c.d,stroke:'url(#gfDot)','stroke-width':B+70},g);
    el('path',{d:c.d,stroke:'#FF6A1A','stroke-width':B+34},g);
    el('path',{d:c.d,stroke:'#FFE2B8','stroke-width':B+6},g);
    el('path',{d:c.d,stroke:'#FF6A1A','stroke-width':B},g);
    el('path',{d:c.d,stroke:'#FFE2B8','stroke-width':B/3+6},g);
    path=el('path',{d:c.d,stroke:'#FF6A1A','stroke-width':B/3},g);
    L=path.getTotalLength();
    var micLayer=el('g',{},svg),runLayer=el('g',{},svg),yumLayer=el('g',{},svg);
    c.mic.forEach(function(m,i){
      var p=at(m[0]*L,m[1]*B),r=m[2];
      var g=el('g',{class:'gf-mic',transform:'translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')'},micLayer);
      var b=el('g',{class:'mb'},g);
      el('circle',{r:r,fill:'#EBD5C8'},b);
      var s=el('g',{class:'sleep',stroke:'#5b4a40','stroke-width':2.4,fill:'none','stroke-linecap':'round'},b);
      el('path',{d:'M'+(-r*.42)+' -2 q '+(r*.15)+' '+(r*.16)+' '+(r*.3)+' 0 M'+(r*.12)+' -2 q '+(r*.15)+' '+(r*.16)+' '+(r*.3)+' 0'},s);
      var h=el('g',{class:'happy'},b);
      el('circle',{cx:-r*.28,cy:-r*.12,r:Math.max(2.4,r*.09),fill:'#252021'},h);el('circle',{cx:r*.28,cy:-r*.12,r:Math.max(2.4,r*.09),fill:'#252021'},h);
      el('path',{d:'M'+(-r*.22)+' '+(r*.18)+' q '+(r*.22)+' '+(r*.26)+' '+(r*.44)+' 0',stroke:'#252021','stroke-width':2.6,fill:'none','stroke-linecap':'round'},h);
      var yo=el('g',{transform:'translate('+p.x.toFixed(1)+' '+(p.y-r-30).toFixed(1)+')'},yumLayer);
      var y=el('g',{class:'gf-yum'},yo),yi=y;el('rect',{x:-30,y:-20,width:60,height:38,rx:12,fill:'#fff'},yi);
      var tx=el('text',{x:0,y:7,'text-anchor':'middle','font-family':'Noto Sans KR,sans-serif','font-weight':900,'font-size':19,fill:'#F75E03'},yi);tx.textContent='냠!';
      mics.push({g:g,c:g.querySelector('circle'),y:y,l:m[0]*L,color:COLORS[i%COLORS.length],fed:false});
    });
    var S=c.size,lanes=[-B/3,0,B/3];
    CHARS.forEach(function(col,i){
      var im=el('image',{href:ASSET+'run-'+col+'.svg',width:S,height:S*0.92,x:-S/2,y:-S*0.86},runLayer);
      runners.push({el:im,delay:i*0.42,lane:lanes[i%3],ph:i*1.3});
    });
    reset();
  }
  function reset(){running=false;cancelAnimationFrame(raf);
    mics.forEach(function(m){m.fed=false;m.g.classList.remove('fed');m.c.setAttribute('fill','#EBD5C8');m.y.classList.remove('on');});
    runners.forEach(function(r){r.el.setAttribute('transform','translate(-200 -200)');});}
  var SPEED=0.105; // fraction of track per second — same for everyone
  function frame(now){
    var t=(now-t0)/1000,alive=false;
    runners.forEach(function(r){
      var f=(t-r.delay)*SPEED;
      if(f<0||f>1.08){r.el.setAttribute('transform','translate(-200 -200)');if(f<0)alive=true;return;}
      alive=true;var l=f*L,p=at(l,r.lane),bob=Math.abs(Math.sin((t+r.ph)*9))*-7;
      var p2=at(l+6,r.lane),ang=Math.atan2(p2.y-p.y,p2.x-p.x)*180/Math.PI*0.35;
      r.el.setAttribute('transform','translate('+p.x.toFixed(1)+' '+(p.y+bob).toFixed(1)+') rotate('+ang.toFixed(1)+')');
      mics.forEach(function(m){if(!m.fed&&l>=m.l){feed(m);}});
    });
    if(alive)raf=requestAnimationFrame(frame);else running=false;
  }
  function feed(m){m.fed=true;m.g.classList.add('fed');m.c.setAttribute('fill',m.color);m.y.classList.remove('on');void m.y.getBBox();m.y.classList.add('on');}
  function play(){reset();
    if(still){mics.forEach(function(m){m.fed=true;m.g.classList.add('fed');m.c.setAttribute('fill',m.color);});
      runners.forEach(function(r,i){var p=at(L*(0.1+i*0.085),r.lane);r.el.setAttribute('transform','translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')');});return;}
    running=true;t0=performance.now();raf=requestAnimationFrame(frame);}
  function pick(){return stage.clientWidth<640?'narrow':'wide';}
  build(pick());
  var seen=false;
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!running){seen=true;play();}});},{threshold:.35}).observe(stage);
  stage.addEventListener('click',play);
  stage.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();play();}});
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(pick()!==cur){build(pick());if(seen)play();}},200);});
})();

