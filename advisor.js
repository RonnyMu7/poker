(()=> {
const parse=c=>{if(!c)return null;const m=c.match(/^(10|[2-9TJQKA])([shdc])$/);if(!m)return null;return {r:({'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'T':10,'J':11,'Q':12,'K':13,'A':14})[m[1]],s:m[2],id:c}};
const cmp=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d}return 0};
function five(cs){const v=cs.map(c=>c.r).sort((a,b)=>b-a),cnt={};cs.forEach(c=>cnt[c.r]=(cnt[c.r]||0)+1);const g=Object.keys(cnt).map(r=>[+r,cnt[r]]).sort((a,b)=>b[1]-a[1]||b[0]-a[0]),u=[...new Set(v)].sort((a,b)=>b-a),flush=cs.every(c=>c.s===cs[0].s);let st=0;for(let i=0;i+4<u.length;i++)if(u[i]-u[i+4]===4)st=u[i];if([14,5,4,3,2].every(x=>u.includes(x)))st=5;if(flush&&st)return[8,st];if(g[0][1]===4)return[7,g[0][0],g[1][0]];if(g[0][1]===3&&g[1][1]===2)return[6,g[0][0],g[1][0]];if(flush)return[5,...v];if(st)return[4,st];if(g[0][1]===3)return[3,g[0][0],...g.filter(x=>x[1]===1).map(x=>x[0]).sort((a,b)=>b-a)];if(g[0][1]===2&&g[1][1]===2)return[2,Math.max(g[0][0],g[1][0]),Math.min(g[0][0],g[1][0]),g[2][0]];if(g[0][1]===2)return[1,g[0][0],...g.filter(x=>x[1]===1).map(x=>x[0]).sort((a,b)=>b-a)];return[0,...v]}
function best(cs){let z=[-1];for(let a=0;a<cs.length-4;a++)for(let b=a+1;b<cs.length-3;b++)for(let c=b+1;c<cs.length-2;c++)for(let d=c+1;d<cs.length-1;d++)for(let e=d+1;e<cs.length;e++){const q=five([cs[a],cs[b],cs[c],cs[d],cs[e]]);if(cmp(q,z)>0)z=q}return z}
function calc(s,$){let hero=s.players.findIndex(p=>p.hero);if(hero<0){$('equity').textContent='—';$('potodds').textContent='—';$('equityedge').textContent='—';$('recommendedAction').textContent='Отметь место';$('recommendedSize').textContent='—';$('callAmount').textContent='—';$('advice').textContent='Нажмите «Моё место»: рекомендации будут показываться только для отмеченного вами игрока.';return}const hp=s.players[hero].cards||['',''];const out=$('equity'),potodds=$('potodds'),edge=$('equityedge'),advice=$('advice');if(!hp[0]||!hp[1]){out.textContent='—';potodds.textContent='—';edge.textContent='—';$('recommendedAction').textContent='—';$('recommendedSize').textContent='—';$('callAmount').textContent='—';advice.textContent='Выберите своё место и задайте две карманные карты. Отметьте активных соперников именем; без их карт модель предполагает случайные руки.';return}
const deck=[];for(let r=2;r<=14;r++)for(const su of ['s','h','d','c'])deck.push((r===14?'A':r===13?'K':r===12?'Q':r===11?'J':r===10?'10':String(r))+su);
const known=[...s.board,...s.players.flatMap(p=>p.cards||[])].filter(Boolean);if(new Set(known).size!==known.length){out.textContent='Ошибка';potodds.textContent='—';edge.textContent='—';$('recommendedAction').textContent='Проверь карты';$('recommendedSize').textContent='—';$('callAmount').textContent='—';advice.textContent='Обнаружены повторяющиеся карты. Выберите уникальную карту в каждом поле.';return}
const active=s.players.map((p,i)=>({p,i})).filter(x=>x.i!==hero&&!x.p.folded&&(x.p.name||(x.p.cards||[]).some(Boolean)));if(!active.length)active.push({p:{name:'Случайный соперник',cards:['','']},i:-1});
const board=s.board.filter(Boolean).map(parse),hole=hp.map(parse),villains=active.map(x=>(x.p.cards||['','']).map(parse)),base=deck.filter(c=>!known.includes(c)).map(parse);let share=0,outright=0;const N=220;
for(let n=0;n<N;n++){const d=base.slice();for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}let ptr=0,b=board.slice();while(b.length<5)b.push(d[ptr++]);const opp=villains.map(v=>v.map(c=>c||d[ptr++]));const hs=best([...hole,...b]),scores=opp.map(v=>best([...v,...b])),top=scores.reduce((a,x)=>cmp(x,a)>0?x:a,hs);if(cmp(hs,top)>0){share++;outright++}else if(cmp(hs,top)===0){const ties=scores.filter(x=>cmp(x,top)===0).length;share+=1/(ties+1)}}
const eq=share/N*100,pot=Math.max(0,+s.pot||0),streetActions=s.actions.filter(a=>a.hand===s.hand&&a.street===s.street),contrib=Array(10).fill(0);streetActions.forEach(a=>{if(a.seat>=1&&a.seat<=10&&['Колл','Бет','Рейз','Олл-ин'].includes(a.action))contrib[a.seat-1]+=Math.max(0,+a.amount||0)});const trackedCall=Math.max(0,Math.max(0,...contrib)-contrib[hero]),call=trackedCall||Math.max(0,+$('amount').value||0),odds=call?call/(pot+call)*100:0;out.textContent=eq.toFixed(1)+'%';potodds.textContent=call?odds.toFixed(1)+'%':'—';edge.textContent=call?(eq-odds>=0?'+':'')+(eq-odds).toFixed(1)+' п.п.':'—';let move='Чек',reason='Можно чекнуть бесплатно и контролировать размер банка.';if(call>0){if(eq<odds-3){move='Фолд';reason='Расчётное эквити ниже цены колла.'}else if(eq>=odds+12){move='Рейз';reason='Есть запас эквити относительно цены колла; рассмотрите рейз ради вэлью или защиты.'}else{move='Колл';reason='Эквити близко к цене продолжения; колл выглядит приемлемым по упрощённой модели.'}}else if(eq>=62){move='Бет / рейз';reason='Высокое расчётное эквити — можно ставить на вэлью, если диапазоны соперников это позволяют.'}else if(eq>=45){move='Чек';reason='Рука средней силы: чаще контролируйте банк и учитывайте позицию.'}else{move='Чек';reason='Не раздувайте банк без сильной руки или подходящего блеф-сценария.'}const bb=Math.max(1,+(($('blinds').value.split('/')[1]||'2').trim())||2),size=call>0?Math.max(call+bb*2,Math.round((pot+call)*0.65)):Math.max(bb*2,Math.round(pot*0.6));$('recommendedAction').textContent=move;$('recommendedSize').textContent=(move==='Рейз'||move==='Бет / рейз')?size+' фишек':'—';$('callAmount').textContent=call?call+' фишек':'0';
const pos=hero===s.button?'BTN':hero===(s.button+1)%10?'SB':hero===(s.button+2)%10?'BB':((hero-s.button+10)%10)>=6?'поздняя':'ранняя/средняя';let msg='Рекомендация: '+move+'. '+reason+' ';if(move==='Рейз'||move==='Бет / рейз')msg+='Ориентир размера — '+size+' фишек общего размера ставки; это не гарантированно оптимальный сайзинг. ';msg+='Позиция '+pos+'. Эквити Монте-Карло: '+eq.toFixed(1)+'% против '+active.length+' соперника(ов), '+N+' случайных раздач. ';if(call)msg+='Цена колла: '+odds.toFixed(1)+'% банка после колла. ';else msg+='Для оценки колла укажите сумму доплаты в поле размера действия и текущий банк. ';if(s.street==='Префлоп')msg+=' До флопа учитывайте диапазоны и позицию: даже сильная рука не гарантирует прибыль.';else msg+=' На постфлопе учитывайте текстуру борда, размер ставки и возможные дро.';advice.textContent=msg;renderEquityMatrix(s,$,hero,board,active.length);
let live=s.players.map((p,i)=>({p,i})).filter(x=>!x.p.folded&&(x.p.name||(x.p.cards||[]).some(Boolean)||x.p.hero)),first=null,start=s.street==='Префлоп'?3:1;for(let k=0;k<10;k++){const i=(s.button+start+k)%10;if(live.some(x=>x.i===i)){first=i;break}}$('firstActor').textContent=first===null?'—':(s.players[first].name||'Место '+(first+1));$('heroPosition').textContent=pos;
}

let matrixSignature='';
function renderEquityMatrix(s,$,hero,board,opponentCount){
 const sig=JSON.stringify([hero,board,opponentCount,s.players[hero].cards,s.street]);
 if(sig===matrixSignature)return;matrixSignature=sig;
 const grid=$('matrix');if(!grid)return;
 const rr=['A','K','Q','J','10','9','8','7','6','5','4','3','2'],ss=['s','h','d','c'],blocked=new Set(board);
 function combosFor(label){
   let r1='',r2='',suited=false;
   if(label.endsWith('s')||label.endsWith('o')){suited=label.endsWith('s');const z=label.slice(0,-1);r1=rr.find(r=>z.startsWith(r))||'';r2=z.slice(r1.length)}
   else {r1=label.slice(0,label.length/2);r2=r1}
   if(!r1||!r2||!rr.includes(r1)||!rr.includes(r2))return [];
   const out=[];for(const a of ss)for(const b of ss){
     if(r1===r2&&ss.indexOf(a)>=ss.indexOf(b))continue;
     if(r1!==r2&&suited&&a!==b)continue;
     if(r1!==r2&&!suited&&a===b)continue;
     const h=[r1+a,r2+b];if(!h.some(c=>blocked.has(c)))out.push(h);
   }return out;
 }
 function estimate(hole,trials){
   const known=[...hole,...board];if(new Set(known).size!==known.length)return null;
   const base=[];for(let r=2;r<=14;r++)for(const su of ss){const c=(r===14?'A':r===13?'K':r===12?'Q':r===11?'J':r===10?'10':String(r))+su;if(!known.includes(c))base.push(parse(c))}
   const ph=hole.map(parse),pb=board.map(parse);let share=0;
   for(let t=0;t<trials;t++){
     const d=base.slice();for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}
     let ptr=0,b=pb.slice();while(b.length<5)b.push(d[ptr++]);const hs=best([...ph,...b]);let scores=[];
     for(let o=0;o<Math.max(1,Math.min(5,opponentCount));o++){const os=[d[ptr++],d[ptr++]];scores.push(best([...os,...b]))}
     let top=hs;for(const sc of scores)if(cmp(sc,top)>0)top=sc;
     if(cmp(hs,top)>0)share++;else if(cmp(hs,top)===0)share+=1/(1+scores.filter(sc=>cmp(sc,top)===0).length);
   }return Math.round(share/trials*100);
 }
 grid.querySelectorAll('.handcell').forEach(cell=>{
   const label=cell.textContent.trim().split(/\s+/)[0],cs=combosFor(label),chosen=cs[0];
   if(!chosen){cell.innerHTML=label+'<small>—</small>';return}
   const pct=estimate(chosen,24);cell.innerHTML=label+'<small>'+(pct===null?'—':pct+'%')+'</small>';
   cell.title=label+' · примерное эквити на текущем борде против '+Math.max(1,opponentCount)+' случайных соперников';
 });
 $('matrixmode').textContent='Эквити на текущем борде';
}

window.RiverLabAdvisor=calc;
if(window.RiverLabState&&window.RiverLabDollar)calc(window.RiverLabState,window.RiverLabDollar);
})();