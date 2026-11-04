/* ToAPIs gift card face renderer — shared by make.html (maker) and index.html (customer page).
 * Card logical size 1149x672, corner radius 40 (matches CSS .face border-radius 3.5%/6%).
 * Rounding is done ONCE here with an anti-aliased canvas clip; backgrounds are fully opaque
 * (no alpha holes), so exported PNGs have clean transparent corners and no black notches.
 * Themes: default | halloween | christmas | gold | diamond  (URL param `t`, see README).
 */
(function(g){
const W=1149,H=672,R=40;
const THEMES={
 default:{label:'默认',bg:'bg_blank.png?v=4',logo:false,base:'#f26a1b',
  ink:'#fff9f3',shBig:'rgba(70,20,0,.16)',sh:'rgba(90,30,5,.25)',hi:'rgba(255,255,255,.8)',
  box:['#ffffff','#faf3ed'],boxSh:'rgba(80,20,0,.14)',boxLine:null,codeInk:'#4a2a14',codeHi:'rgba(255,255,255,.85)',
  glow:'242,106,27',page:['#3a1606','#1d0a03','#0b0401'],accent:'#f26a1b',accentSoft:'#f8b27f',rim:'255,220,190'},
 halloween:{label:'万圣节',bg:'bg_halloween.jpg?v=2',logo:true,base:'#2a0f12',
  ink:'#fbf1e2',shBig:'rgba(0,0,0,.35)',sh:'rgba(0,0,0,.45)',hi:'rgba(255,226,180,.22)',
  box:['#fffaf2','#f1e3cd'],boxSh:'rgba(0,0,0,.38)',boxLine:'rgba(196,146,74,.85)',codeInk:'#3a1d0e',codeHi:'rgba(255,255,255,.7)',
  glow:'214,120,48',page:['#2a1008','#150806','#070303'],accent:'#d9853a',accentSoft:'#e6b878',rim:'226,180,110'},
 christmas:{label:'圣诞节',bg:'bg_christmas.jpg?v=2',logo:true,base:'#0a2e22',
  ink:'#f8f2e2',shBig:'rgba(0,0,0,.35)',sh:'rgba(0,0,0,.45)',hi:'rgba(255,240,200,.2)',
  box:['#fffdf6','#f0e8d4'],boxSh:'rgba(0,0,0,.36)',boxLine:'rgba(196,160,88,.85)',codeInk:'#12382a',codeHi:'rgba(255,255,255,.7)',
  glow:'196,160,88',page:['#0e3326','#07201a','#030c09'],accent:'#c9a45a',accentSoft:'#e3cc8f',rim:'226,200,140'},
 gold:{label:'金卡',bg:'bg_gold.jpg?v=1',logo:true,base:'#3a2a08',
  ink:'#fffaf0',shBig:'rgba(40,25,0,.45)',sh:'rgba(40,25,0,.55)',hi:'rgba(255,240,200,.25)',
  box:['#fffbf0','#f3e4bf'],boxSh:'rgba(40,25,0,.4)',boxLine:'rgba(184,140,40,.9)',codeInk:'#4a3305',codeHi:'rgba(255,255,255,.7)',
  glow:'230,180,60',page:['#2e2206','#171003','#080501'],accent:'#d4a72c',accentSoft:'#f0d58a',rim:'240,210,140'},
 diamond:{label:'钻石卡',bg:'bg_diamond.jpg?v=1',logo:true,base:'#0b0d12',
  ink:'#f4f8ff',shBig:'rgba(0,0,0,.45)',sh:'rgba(0,0,0,.55)',hi:'rgba(220,235,255,.22)',
  box:['#ffffff','#e6ecf5'],boxSh:'rgba(0,0,0,.45)',boxLine:'rgba(160,180,210,.9)',codeInk:'#1b2433',codeHi:'rgba(255,255,255,.8)',
  glow:'170,200,255',page:['#161c28','#0a0d14','#030406'],accent:'#9fb8e6',accentSoft:'#dbe6fb',rim:'210,225,250'}
};
const THEME_ORDER=['default','halloween','christmas','gold','diamond'];
function pickTheme(v){v=(v||'').trim().toLowerCase();if(v==='xmas')v='christmas';if(v==='hw')v='halloween';if(v==='diamonds')v='diamond';return THEMES[v]?v:'default'}
const CJK_FB=',"Noto Sans CJK SC","Noto Sans SC","PingFang SC","Hiragino Sans","Microsoft YaHei","Malgun Gothic","Apple SD Gothic Neo","Noto Sans Arabic","Segoe UI",Tahoma,sans-serif';
const F=f=>f+CJK_FB;
const isLatin=T=>/^(en|es|pt-BR|fr|de|ru|uk)$/.test(T.code);
const imgCache={};
function loadImg(src){if(!imgCache[src]){const i=new Image();i.src=src;imgCache[src]=new Promise(r=>{if(i.complete&&i.naturalWidth)r(i);else{i.onload=()=>r(i);i.onerror=()=>r(null)}})}return imgCache[src]}
function loadTheme(t){const th=THEMES[pickTheme(t)];return Promise.all([loadImg(th.bg),th.logo?loadImg('logo_tile.png?v=1'):Promise.resolve(null)]).then(([bg,logo])=>({th,bg,logo}))}
function rr(x,X,Y,WW,HH,RR){x.beginPath();x.moveTo(X+RR,Y);x.arcTo(X+WW,Y,X+WW,Y+HH,RR);x.arcTo(X+WW,Y+HH,X,Y+HH,RR);x.arcTo(X,Y+HH,X,Y,RR);x.arcTo(X,Y,X+WW,Y,RR);x.closePath()}
/* draw(ctx, {T, theme:{th,bg,logo}, name, code, amount, scale, clip}) — clip:false when a CSS border-radius already rounds the canvas (index.html), to avoid a double anti-aliased edge */
function draw(x,o){
 const T=o.T,th=o.theme.th,bg=o.theme.bg,logo=o.theme.logo,S=o.scale||2;
 const LS=v=>isLatin(T)?v:'0px';
 function emb(t,px,py,font,op={}){
  x.font=font;x.textBaseline='alphabetic';try{x.letterSpacing=op.ls||'0px'}catch(e){}
  x.textAlign=op.align||'left';x.save();try{x.direction=op.ltr?'ltr':(T.dir||'ltr')}catch(e){}x.globalAlpha=op.alpha||1;
  const ft=()=>op.max?x.fillText(t,px,py,op.max):x.fillText(t,px,py);
  if(op.big){x.shadowColor=th.shBig;x.shadowBlur=10;x.shadowOffsetY=4;x.fillStyle=op.color||th.ink;ft()}
  x.shadowColor=th.sh;x.shadowBlur=op.big?1.5:1.2;x.shadowOffsetX=.6;x.shadowOffsetY=op.big?1:.8;
  x.fillStyle=op.color||th.ink;ft();
  x.shadowColor=th.hi;x.shadowBlur=0;x.shadowOffsetX=-.5;x.shadowOffsetY=-.5;ft();
  x.restore();x.textAlign='left';return x.measureText(t).width;
 }
 x.setTransform(S,0,0,S,0,0);x.clearRect(0,0,W,H);
 x.save();if(o.clip!==false){rr(x,0,0,W,H,R);x.clip();}
 x.fillStyle=th.base;x.fillRect(0,0,W,H);
 if(bg)x.drawImage(bg,0,0,W,H);
 if(logo){x.save();x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=14;x.shadowOffsetY=5;x.drawImage(logo,67,55,98,98);x.restore();}
 emb(T.cardGift,1127,67,F('520 19px GI'),{align:'right',ls:LS('9.5px'),alpha:.95,max:760});
 const w=emb(o.amount,53,257,'800 88px GT',{big:true,ls:'-3.5px',ltr:true});
 emb(T.cardCredits,53+w+18,257,F('580 38px GI'),{ls:LS('-0.76px'),alpha:.96,max:Math.max(200,1096-(53+w+18))});
 emb(o.name?T.cardFor.replace('{name}',o.name):T.cardForAnon,53,323,F('450 21px GI'),{alpha:.92,max:1040});
 x.save();x.shadowColor=th.boxSh;x.shadowBlur=18;x.shadowOffsetY=6;rr(x,53,415,1044,92,18);
 const gr=x.createLinearGradient(0,415,0,507);gr.addColorStop(0,th.box[0]);gr.addColorStop(1,th.box[1]);x.fillStyle=gr;x.fill();x.restore();
 if(th.boxLine){x.save();rr(x,57.5,419.5,1035,83,15);x.strokeStyle=th.boxLine;x.lineWidth=1;x.stroke();x.restore();}
 x.font='520 27px GJ';try{x.letterSpacing='2.7px'}catch(e){}
 x.textAlign='center';x.textBaseline='middle';
 x.save();x.fillStyle=th.codeHi;x.fillText(o.code||'••••',575,462.5);x.fillStyle=th.codeInk;x.fillText(o.code||'••••',575,462);x.restore();
 x.textAlign='left';x.textBaseline='alphabetic';
 // bottom row: tip (auto-shrinks) + bold white toapis.com bottom-right
 const tip=T.cardTap,url='toapis.com',urlFont=F('700 18px GI');
 x.save();x.font=urlFont;try{x.letterSpacing=LS('0.5px')}catch(e){}x.direction='ltr';const urlW=x.measureText(url).width+20;x.restore();
 const tipMax=Math.max(180,1127-53-urlW);let size=17;
 while(size>12){x.font=F('450 '+size+'px GI');try{x.letterSpacing='0px'}catch(e){}if(x.measureText(tip).width<=tipMax)break;size--}
 emb(tip,53,627,F('450 '+size+'px GI'),{alpha:.9,max:tipMax});
 emb(url,1127,627,urlFont,{align:'right',ls:LS('0.5px'),alpha:.95,ltr:true,color:'#ffffff'});
 x.restore();
}
const FONTS=['800 88px GT','580 38px GI','450 21px GI','450 17px GI','700 18px GI','520 27px GJ','520 19px GI'];
function loadFonts(T){return Promise.all(FONTS.map(f=>document.fonts.load(f,T.cardGift+T.cardCredits+T.cardTap+T.cardFor))).catch(()=>{})}
g.GiftFace={W,H,R,THEMES,THEME_ORDER,pickTheme,loadTheme,draw,loadFonts};
})(window);
