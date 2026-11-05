/* ToAPIs gift card face renderer — shared by make.html (maker) and index.html (customer page).
 * Card logical size 1149x672, corner radius 40 (matches CSS .face border-radius 3.5%/6%).
 * Rounding is done ONCE here with an anti-aliased canvas clip; backgrounds are fully opaque
 * (no alpha holes), so exported PNGs have clean transparent corners and no black notches.
 * Themes: default | halloween | christmas | halloween2 | christmas2 | gold | diamond  (URL param `t`, see README).
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
  box:['#ffffff','#faf3ed'],boxSh:'rgba(80,20,0,.14)',boxLine:null,codeInk:'#3a1d0e',codeHi:'rgba(255,255,255,.7)',
  glow:'214,120,48',page:['#2a1008','#150806','#070303'],accent:'#d9853a',accentSoft:'#e6b878',rim:'226,180,110'},
 halloween2:{label:'万圣节·实体',bg:'bg_halloween2.jpg?v=1',logo:true,base:'#2a0f12',
  ink:'#fbf1e2',shBig:'rgba(0,0,0,.48)',sh:'rgba(0,0,0,.58)',hi:'rgba(255,226,180,.22)',
  box:['#ffffff','#faf3ed'],boxSh:'rgba(80,20,0,.14)',boxLine:null,codeInk:'#3a1d0e',codeHi:'rgba(255,255,255,.7)',
  glow:'214,120,48',page:['#2a1008','#150806','#070303'],accent:'#d9853a',accentSoft:'#e6b878',rim:'226,180,110'},
 christmas:{label:'圣诞节',bg:'bg_christmas.jpg?v=2',logo:true,base:'#0a2e22',
  ink:'#f8f2e2',shBig:'rgba(0,0,0,.35)',sh:'rgba(0,0,0,.45)',hi:'rgba(255,240,200,.2)',
  box:['#ffffff','#faf3ed'],boxSh:'rgba(80,20,0,.14)',boxLine:null,codeInk:'#12382a',codeHi:'rgba(255,255,255,.7)',
  glow:'196,160,88',page:['#0e3326','#07201a','#030c09'],accent:'#c9a45a',accentSoft:'#e3cc8f',rim:'226,200,140'},
 christmas2:{label:'圣诞节·实体',bg:'bg_christmas2.jpg?v=1',logo:true,base:'#0a2e22',
  ink:'#fbf6ea',shBig:'rgba(0,0,0,.48)',sh:'rgba(0,0,0,.58)',hi:'rgba(255,240,200,.2)',
  box:['#ffffff','#faf3ed'],boxSh:'rgba(80,20,0,.14)',boxLine:null,codeInk:'#12382a',codeHi:'rgba(255,255,255,.7)',
  glow:'196,160,88',page:['#0e3326','#07201a','#030c09'],accent:'#c9a45a',accentSoft:'#e3cc8f',rim:'226,200,140'},
 gold:{label:'金卡',bg:'bg_gold.jpg?v=1',logo:true,base:'#3a2a08',
  ink:'#fffaf0',shBig:'rgba(40,25,0,.45)',sh:'rgba(40,25,0,.55)',hi:'rgba(255,240,200,.25)',
  box:['#ffffff','#faf3ed'],boxSh:'rgba(80,20,0,.14)',boxLine:null,codeInk:'#4a3305',codeHi:'rgba(255,255,255,.7)',
  glow:'230,180,60',page:['#2e2206','#171003','#080501'],accent:'#d4a72c',accentSoft:'#f0d58a',rim:'240,210,140'},
 diamond:{label:'钻石卡',bg:'bg_diamond.jpg?v=1',logo:true,base:'#0b0d12',
  ink:'#f4f8ff',shBig:'rgba(0,0,0,.45)',sh:'rgba(0,0,0,.55)',hi:'rgba(220,235,255,.22)',
  box:['#ffffff','#faf3ed'],boxSh:'rgba(80,20,0,.14)',boxLine:null,codeInk:'#1b2433',codeHi:'rgba(255,255,255,.8)',
  glow:'170,200,255',page:['#161c28','#0a0d14','#030406'],accent:'#9fb8e6',accentSoft:'#dbe6fb',rim:'210,225,250'}
};
const THEME_ORDER=['default','halloween','christmas','halloween2','christmas2','gold','diamond'];
function pickTheme(v){v=(v||'').trim().toLowerCase();if(v==='xmas')v='christmas';if(v==='hw')v='halloween';if(v==='diamonds')v='diamond';if(v==='hw2')v='halloween2';if(v==='xmas2')v='christmas2';return THEMES[v]?v:'default'}
const CJK_FB=',"Noto Sans CJK SC","Noto Sans SC","PingFang SC","Hiragino Sans","Microsoft YaHei","Malgun Gothic","Apple SD Gothic Neo","Noto Sans Arabic","Segoe UI",Tahoma,sans-serif';
const F=f=>f+CJK_FB;
const isLatin=T=>/^(en|es|pt-BR|fr|de|ru|uk)$/.test(T.code);
const imgCache={};
function loadImg(src){if(!imgCache[src]){const i=new Image();i.src=src;imgCache[src]=new Promise(r=>{if(i.complete&&i.naturalWidth)r(i);else{i.onload=()=>r(i);i.onerror=()=>r(null)}})}return imgCache[src]}
function loadTheme(t){const th=THEMES[pickTheme(t)];return Promise.all([loadImg(th.bg),th.logo?loadImg('logo_tile.png?v=1'):Promise.resolve(null)]).then(([bg,logo])=>({th,bg,logo}))}
/* physical-card finish: fine grain pattern (built once) */
let GRAIN=null;
function grainPat(x){if(GRAIN)return GRAIN;const g=document.createElement('canvas');g.width=g.height=256;const c=g.getContext('2d');const d=c.createImageData(256,256);let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<d.data.length;i+=4){const v=r()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}c.putImageData(d,0,0);GRAIN=x.createPattern(g,'repeat');return GRAIN}
function finishUnder(x){ /* drawn over the art, under the text */
 x.save();x.globalAlpha=.06;x.globalCompositeOperation='overlay';x.fillStyle=grainPat(x);x.fillRect(0,0,W,H);x.restore();
 x.save();const v=x.createLinearGradient(0,0,0,H);v.addColorStop(0,'rgba(255,255,255,.10)');v.addColorStop(.18,'rgba(255,255,255,0)');v.addColorStop(.78,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.16)');x.fillStyle=v;x.fillRect(0,0,W,H);x.restore();
}
function finishOver(x){ /* glossy laminate sweep + bevelled edge, over everything */
 x.save();x.globalCompositeOperation='screen';
 const s=x.createLinearGradient(W*.18,0,W*.62,H);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.42,'rgba(255,255,255,0)');s.addColorStop(.5,'rgba(255,255,255,.10)');s.addColorStop(.58,'rgba(255,255,255,0)');s.addColorStop(1,'rgba(255,255,255,0)');
 x.fillStyle=s;x.fillRect(0,0,W,H);
 const t=x.createRadialGradient(W*.12,-H*.1,0,W*.12,-H*.1,W*.55);t.addColorStop(0,'rgba(255,255,255,.12)');t.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=t;x.fillRect(0,0,W,H);
 x.restore();
 x.save();x.lineWidth=2.2;const e=x.createLinearGradient(0,0,W,H);e.addColorStop(0,'rgba(255,255,255,.55)');e.addColorStop(.45,'rgba(255,255,255,.12)');e.addColorStop(1,'rgba(0,0,0,.30)');x.strokeStyle=e;rr(x,1.1,1.1,W-2.2,H-2.2,R-1);x.stroke();
 x.lineWidth=1;x.strokeStyle='rgba(0,0,0,.18)';rr(x,3.6,3.6,W-7.2,H-7.2,R-3.5);x.stroke();x.restore();
}
function rr(x,X,Y,WW,HH,RR){x.beginPath();x.moveTo(X+RR,Y);x.arcTo(X+WW,Y,X+WW,Y+HH,RR);x.arcTo(X+WW,Y+HH,X,Y+HH,RR);x.arcTo(X,Y+HH,X,Y,RR);x.arcTo(X,Y,X+WW,Y,RR);x.closePath()}
/* draw(ctx, {T, theme:{th,bg,logo}, name, code, amount, from, scale, clip}) — clip:false when a CSS border-radius already rounds the canvas (index.html), to avoid a double anti-aliased edge */
/* gilded / 鎏金 foil stamp for the sender name */
/* sender name (送卡人): card's normal font, subtle gilded gold fill, name only */
function drawFrom(x,T,th,themeKey,from,px,py){
 const onGold=themeKey==='gold',onOrange=themeKey==='default'||th.base==='#f26a1b';let size=26;
 x.save();x.textAlign='left';x.textBaseline='alphabetic';try{x.direction='ltr';x.letterSpacing='0.3px'}catch(e){}
 const setF=()=>{x.font=F('660 '+size+'px GI')};setF();
 while(size>16&&x.measureText(from).width>700){size--;setF()}
 const top=py-size*.82,bot=py+size*.1;
 // light shadow; warm-brown on the orange card, firmer on the gold card so it separates
 x.shadowColor=onGold?'rgba(35,18,0,.7)':onOrange?'rgba(95,32,0,.6)':'rgba(0,0,0,.38)';
 x.shadowBlur=onGold?4:onOrange?3.5:3;x.shadowOffsetY=onGold?1.6:1.4;
 const gr=x.createLinearGradient(0,top,0,bot);
 if(onOrange){gr.addColorStop(0,'#fffbea');gr.addColorStop(.45,'#ffe7a3');gr.addColorStop(.78,'#f2c35a');gr.addColorStop(1,'#fff3cc')}
 else{gr.addColorStop(0,'#fff3c4');gr.addColorStop(.45,'#f0c75e');gr.addColorStop(.75,'#c9971f');gr.addColorStop(1,'#ffe9a8')}
 x.fillStyle=gr;x.fillText(from,px,py);
 x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetY=0;
 if(onGold||onOrange){x.lineWidth=.7;x.strokeStyle=onGold?'rgba(70,42,6,.55)':'rgba(130,60,0,.4)';x.strokeText(from,px,py)}
 x.restore();
}
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
 finishUnder(x);
 if(logo){x.save();x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=14;x.shadowOffsetY=5;x.drawImage(logo,67,55,98,98);x.restore();}
 emb(T.cardGift,1127,67,F('520 19px GI'),{align:'right',ls:LS('9.5px'),alpha:.95,max:760});
 const w=emb(o.amount,53,257,'800 88px GT',{big:true,ls:'-3.5px',ltr:true});
 emb(T.cardCredits,53+w+18,257,F('580 38px GI'),{ls:LS('-0.76px'),alpha:.96,max:Math.max(200,1096-(53+w+18))});
 emb(o.name?T.cardFor.replace('{name}',o.name):T.cardForAnon,53,323,F('450 21px GI'),{alpha:.92,max:1040});
 // sender name (white, card font) directly under the 致… line
 const from=(o.from||'').trim();
 if(from) emb(from,53,366,F('600 24px GI'),{alpha:.95,max:1040,ltr:!/[\u0600-\u06ff]/.test(from)?true:false});
 x.save();x.shadowColor=th.boxSh;x.shadowBlur=18;x.shadowOffsetY=6;rr(x,53,415,1044,92,18);
 const gr=x.createLinearGradient(0,415,0,507);gr.addColorStop(0,th.box[0]);gr.addColorStop(1,th.box[1]);x.fillStyle=gr;x.fill();x.restore();
 if(th.boxLine){x.save();rr(x,57.5,419.5,1035,83,15);x.strokeStyle=th.boxLine;x.lineWidth=1;x.stroke();x.restore();}
 // code strip: normal readable code, or frosted blur when o.blurCode / multi-code shared face
 x.save();x.textAlign='center';x.textBaseline='middle';
 if(o.blurCode || (o.codeCount|0)>1){
  /* frosted / obscured strip — keep white box, hide actual codes */
  const bx=53,by=415,bw=1044,bh=92;
  x.save();rr(x,bx+4,by+4,bw-8,bh-8,14);x.clip();
  // soft fake glyphs
  x.globalAlpha=.55;x.fillStyle=th.codeInk;
  const glyphs=['A7','K2','M9','Q4','X1','P8','R3','W5'];
  x.font='700 28px GJ';
  for(let i=0;i<8;i++){const gx=90+i*120+((i%3)-1)*6,gy=458+((i%2)?3:-2);x.filter='blur(7px)';x.fillText(glyphs[i],gx,gy)}
  try{x.filter='none'}catch(e){}
  // frost veil
  x.globalAlpha=1;const fr=x.createLinearGradient(0,by,0,by+bh);
  fr.addColorStop(0,'rgba(255,255,255,.55)');fr.addColorStop(.5,'rgba(255,250,245,.72)');fr.addColorStop(1,'rgba(250,243,237,.6)');
  x.fillStyle=fr;x.fillRect(bx,by,bw,bh);
  // noise speckles
  x.globalAlpha=.12;x.fillStyle='#4a2a14';
  for(let i=0;i<90;i++){const sx=bx+8+(Math.sin(i*12.9)*0.5+0.5)*(bw-16),sy=by+8+(Math.cos(i*7.3)*0.5+0.5)*(bh-16);x.fillRect(sx,sy,1.6,1.6)}
  x.restore();
  x.globalAlpha=1;
 }else{
  x.font='520 27px GJ';try{x.letterSpacing='2.7px'}catch(e){}
  x.fillStyle=th.codeHi;x.fillText(o.code||'••••',575,462.5);x.fillStyle=th.codeInk;x.fillText(o.code||'••••',575,462);
 }
 x.restore();
 x.textAlign='left';x.textBaseline='alphabetic';
 // bottom row: tip (auto-shrinks) + bold white toapis.com bottom-right
 const tip=T.cardTap,url='toapis.com',urlFont=F('700 18px GI');
 x.save();x.font=urlFont;try{x.letterSpacing=LS('0.5px')}catch(e){}x.direction='ltr';const urlW=x.measureText(url).width+20;x.restore();
 const tipMax=Math.max(180,1127-53-urlW);let size=17;
 while(size>12){x.font=F('450 '+size+'px GI');try{x.letterSpacing='0px'}catch(e){}if(x.measureText(tip).width<=tipMax)break;size--}
 emb(tip,53,627,F('450 '+size+'px GI'),{alpha:.9,max:tipMax});
 emb(url,1127,627,urlFont,{align:'right',ls:LS('0.5px'),alpha:.95,ltr:true,color:'#ffffff'});
 finishOver(x);
 x.restore();
}
const FONTS=['660 26px GI','800 88px GT','580 38px GI','450 21px GI','450 17px GI','700 18px GI','520 27px GJ','520 19px GI'];
function loadFonts(T){return Promise.all(FONTS.map(f=>document.fonts.load(f,T.cardGift+T.cardCredits+T.cardTap+T.cardFor))).catch(()=>{})}
g.GiftFace={W,H,R,THEMES,THEME_ORDER,pickTheme,loadTheme,draw,loadFonts};
})(window);
