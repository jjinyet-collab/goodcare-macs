(function(){
  var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // reveal
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.15});
  document.querySelectorAll('.rv,.ratio').forEach(function(el){io.observe(el);});
  // highlighter
  var cp=document.getElementById('copy');
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){cp.classList.add('hl');o.disconnect();}},{threshold:.4}).observe(cp);

  // hero slider
  var sl=document.getElementById('slides'),slides=[].slice.call(sl.children),dots=document.getElementById('dots'),num=document.getElementById('num'),cur=0,timer;
  slides.forEach(function(_,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label',(i+1)+'번 슬라이드');b.onclick=function(){go(i);restart();};dots.appendChild(b);});
  function mark(i){cur=i;slides.forEach(function(s,j){s.classList.toggle('on',j===i);});[].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===i);});num.textContent=(i+1)+' / '+slides.length;}
  function go(i){sl.scrollTo({left:i*sl.clientWidth,behavior:still?'auto':'smooth'});mark(i);}
  sl.addEventListener('scroll',function(){var i=Math.round(sl.scrollLeft/sl.clientWidth);if(i!==cur)mark(i);},{passive:true});
  function restart(){clearInterval(timer);if(!still)timer=setInterval(function(){go((cur+1)%slides.length);},4200);}
  sl.addEventListener('pointerdown',restart);
  mark(0);restart();

  // race: green 2, yellow 6, blue 2 run in groups and line up before the goals
  var track=document.getElementById('track'),race=document.getElementById('race');
  var plan=[ // [color, left%, top%] — each group lines up just before its goal
    ['green',3,46],['green',15,58],
    ['yellow',34,30],['yellow',46.5,30],['yellow',59,30],['yellow',34,60],['yellow',46.5,60],['yellow',59,60],
    ['blue',82,40],['blue',82,64]];
  var groups=[[0,1],[2,3,4,5,6,7],[8,9]],rn=[];
  var order=plan.map(function(p,i){return i;}).sort(function(a,b){return plan[b][1]-plan[a][1];}),startX=[];
  order.forEach(function(i,r){startX[i]=-14-r*9;});
  plan.forEach(function(p){var d=document.createElement('div');d.className='rn';d.style.top=p[2]+'%';d.innerHTML='<img src="https://jjinyet-collab.github.io/goodcare-macs/mobile/assets/run-'+p[0]+'.svg" alt="">';track.appendChild(d);rn.push(d);});
  var bubs=[].slice.call(track.querySelectorAll('.bub'));
  var tids=[];
  function reset(){tids.forEach(clearTimeout);tids=[];race.classList.remove('go','done');rn.forEach(function(d){d.classList.remove('stop');});bubs.forEach(function(b){b.classList.remove('on');});
    rn.forEach(function(d,i){d.style.transition='none';d.style.left=startX[i]+'%';});void track.offsetWidth;}
  function run(){reset();
    if(still){rn.forEach(function(d,i){d.style.left=plan[i][1]+'%';});bubs.forEach(function(b){b.classList.add('on');});race.classList.add('done');return;}
    race.classList.add('go');
    // everyone starts together at the same speed; each stops at its own goal
    var SPEED=42,last=0; // % of track per second — same for everyone
    tids.push(setTimeout(function(){
      rn.forEach(function(d,i){var dur=(plan[i][1]-startX[i])/SPEED;d.style.transition='left '+dur.toFixed(2)+'s linear';d.style.left=plan[i][1]+'%';
        tids.push(setTimeout(function(){d.classList.add('stop');},dur*1000));});
      groups.forEach(function(g,gi){var dur=Math.max.apply(null,g.map(function(i){return (plan[i][1]-startX[i])/SPEED;}));last=Math.max(last,dur);
        tids.push(setTimeout(function(){bubs[gi].classList.add('on');},dur*1000+120));});
      tids.push(setTimeout(function(){race.classList.remove('go');race.classList.add('done');},last*1000+150));
    },300));}
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){run();o.disconnect();}},{threshold:.45}).observe(race);
  document.getElementById('replay').addEventListener('click',run);
  track.addEventListener('click',run);track.setAttribute('role','button');track.setAttribute('tabindex','0');track.setAttribute('aria-label','눌러서 MAC 달리기 다시 보기');
  track.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();run();}});
  reset();

  // stats count-up
  var st=document.getElementById('stats');
  new IntersectionObserver(function(es,o){if(!es[0].isIntersecting)return;o.disconnect();
    st.querySelectorAll('.v').forEach(function(v){var to=+v.dataset.to,dec=+(v.dataset.dec||0),suf=v.dataset.suf||'',t0=performance.now();
      if(still){return;}
      (function f(t){var k=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-k,3);v.textContent=(to*e).toFixed(dec)+suf;if(k<1)requestAnimationFrame(f);})(t0);});
  },{threshold:.4}).observe(st);

  // column: one open at a time + close buttons
  var posts=[].slice.call(document.querySelectorAll('.post'));
  posts.forEach(function(d){d.addEventListener('toggle',function(){if(d.open)posts.forEach(function(o){if(o!==d)o.open=false;});});});
  document.querySelectorAll('.post-close').forEach(function(b){b.addEventListener('click',function(){var d=b.closest('.post');d.open=false;d.scrollIntoView({block:'nearest'});});});


  // mouse drag → horizontal scroll (touch already swipes natively)
  document.querySelectorAll('.rail,.story,.slides').forEach(function(el){
    el.classList.add('drag');var down=false,sx=0,sl=0,moved=false;
    el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=el.scrollLeft;});
    addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5){moved=true;el.classList.add('dragging');}if(moved){el.scrollLeft=sl-dx;e.preventDefault();}});
    addEventListener('pointerup',function(){if(!down)return;down=false;if(!moved)return;
      var snap=el.firstElementChild;var w=snap?snap.getBoundingClientRect().width+parseFloat(getComputedStyle(el).columnGap||getComputedStyle(el).gap||0):el.clientWidth;
      var target=Math.round(el.scrollLeft/w)*w;el.classList.remove('dragging');el.scrollTo({left:target,behavior:'smooth'});});
    el.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
    el.addEventListener('dragstart',function(e){e.preventDefault();});
  });
  // cart count from Cafe24 ({$basket_count}); hide when 0
  document.querySelectorAll('.hd-ic .cnt').forEach(function(c){var v=c.textContent.trim();if(!/^[1-9][0-9]*$/.test(v))c.classList.add('zero');});
  // tabs: active on scroll + keep visible
  var tabs=[].slice.call(document.querySelectorAll('.tabs a')),secs=tabs.map(function(a){return document.getElementById(a.dataset.t);});
  var hd=document.querySelector('.hd');
  function onScroll(){if(openV)return;var y=scrollY+hd.offsetHeight+40,on=0;secs.forEach(function(s,i){if(s&&!viewOf(s)&&s.offsetTop<=y)on=i;});
    tabs.forEach(function(a,i){a.classList.toggle('on',i===on);});
    var a=tabs[on],bar=a.parentNode;if(a.offsetLeft<bar.scrollLeft||a.offsetLeft+a.offsetWidth>bar.scrollLeft+bar.clientWidth)bar.scrollTo({left:a.offsetLeft-16,behavior:'smooth'});
    document.getElementById('toTop').classList.toggle('show',scrollY>600);
    document.getElementById('bbar').classList.toggle('show',scrollY>700);}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  // anchor scroll with sticky header offset
  // sub views: column and WHY MAC · FAQ open as their own screens
  var openV=null,backY=0;
  function viewOf(el){return el&&el.closest?el.closest('.view'):null;}
  function showView(v,target,key){if(openV&&openV!==v)openV.hidden=true;if(!openV)backY=scrollY;openV=v;v.hidden=false;root.classList.add('vw');
    tabs.forEach(function(a){a.classList.toggle('on',a.dataset.t===(key||v.id));});
    v.scrollTop=0;
    if(target&&target!==v)setTimeout(function(){v.scrollTop=target.getBoundingClientRect().top-v.getBoundingClientRect().top+v.scrollTop-66;if(target.tagName==='LI'||target.tagName==='DETAILS')target.classList.add('flash');},30);}
  function hideView(){if(!openV)return;openV.hidden=true;openV=null;root.classList.remove('vw');scrollTo(0,backY);onScroll();if(location.hash)history.replaceState(null,'',location.pathname+location.search);}
  document.querySelectorAll('.v-back').forEach(function(b){b.addEventListener('click',hideView);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&openV&&!root.classList.contains('dr'))hideView();});
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute('href').slice(1),t=id==='top'?document.body:document.getElementById(id);if(!t)return;
    var v=viewOf(t);
    if(v){e.preventDefault();closeDr();showView(v,t,id);history.replaceState(null,'','#'+id);return;}
    e.preventDefault();closeDr();if(openV)hideView();var top=id==='top'?0:t.getBoundingClientRect().top+scrollY-hd.offsetHeight-8;scrollTo({top:top,behavior:still?'auto':'smooth'});
    if(t.tagName==='LI'||t.tagName==='DETAILS'){t.classList.add('flash');}
    history.replaceState(null,'','#'+id);});
  document.getElementById('toTop').addEventListener('click',function(){scrollTo({top:0,behavior:still?'auto':'smooth'});});

  // drawer
  var root=document.documentElement,dr=document.getElementById('drawer'),mb=document.getElementById('menuBtn');
  function openDr(){root.classList.add('dr');dr.setAttribute('aria-hidden','false');mb.setAttribute('aria-expanded','true');}
  function closeDr(){root.classList.remove('dr');dr.setAttribute('aria-hidden','true');mb.setAttribute('aria-expanded','false');}
  mb.addEventListener('click',openDr);document.getElementById('drClose').addEventListener('click',closeDr);document.getElementById('dim').addEventListener('click',closeDr);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDr();});
  (function(){var id=location.hash.slice(1),t=id&&document.getElementById(id),v=viewOf(t);if(v)showView(v,t,id);})();

})();
;
(function(){
  var L=window.GCM_LINKS||{};
  function list(){return L.cate?'/product/list.html?cate_no='+encodeURIComponent(L.cate):'/product/list.html';}
  function prod(no){return no?'/product/detail.html?product_no='+encodeURIComponent(no):list();}
  var map={list:list(),banana:prod(L.banana),pistachio:prod(L.pistachio)};
  ['cart','login','signup','mypage','orders','inquiry','terms','privacy','guide'].forEach(function(k){if(L[k])map[k]=L[k];});
  document.querySelectorAll('a[data-gcm]').forEach(function(a){var u=map[a.getAttribute('data-gcm')];if(u)a.setAttribute('href',u);});
})();
;
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
