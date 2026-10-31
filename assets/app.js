'use strict';

// La Casa delle Meraviglie. Tutti i giochi si svolgono nel browser.
// Nessun dato viene inviato a un server o salvato in cookie/localStorage.
const home = document.querySelector('#homepage');
const screen = document.querySelector('#game-screen');
const content = document.querySelector('#game-content');
const games = new Set(['bottega', 'porta', 'laboratorio']);
const euro = cents => new Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR'}).format(cents / 100);
const htmlEscape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let activeGame = null;
let shopStep = 0;
let shopCoins = [];
let shopSolved = false;
let shopMessage = '';
let doorStep = 0;
let doorDigits = [];
let doorSolved = false;
let doorMessage = '';
let labStep = 0;
let labSolved = false;
let labMessage = '';

const shopCases = [
  {item:'Una matita che scrive messaggi segreti',icon:'✏️',price:350,paid:500},
  {item:'Un quaderno per inventare storie',icon:'📓',price:620,paid:1000},
  {item:'Tre piccoli segnalibri a forma di stella',icon:'⭐',price:270,paid:500},
  {item:'Un kit da esploratore',icon:'🧭',price:790,paid:1000}
];
const coins = [
  {value:200,label:'2 €',className:''},
  {value:100,label:'1 €',className:''},
  {value:50,label:'50 c',className:'silver'},
  {value:20,label:'20 c',className:'copper'},
  {value:10,label:'10 c',className:'copper'}
];
const clues = [
  {text:'Sul tappeto è scritta una sequenza: 2, 4, __, 8. Quale numero manca?',options:[5,6,7],correct:6,explain:'La sequenza aumenta di 2 ogni volta: 2, 4, 6, 8.'},
  {text:'Conta le lettere della parola LUCE. Quante sono?',options:[3,4,5],correct:4,explain:'L · U · C · E. Sono quattro lettere.'},
  {text:'Un ragno ha otto zampe. Qual è il numero che cerchiamo?',options:[6,8,10],correct:8,explain:'Le zampe del ragno sono otto.'}
];
const labCases = [
  {sequence:[3,6,9,12,'?'],correct:15,options:[14,15,16],explain:'Ogni numero aumenta di 3. Dopo 12 arriva 15.'},
  {sequence:[2,4,8,16,'?'],correct:32,options:[24,30,32],explain:'Ogni numero è il doppio del precedente. Il doppio di 16 è 32.'},
  {sequence:[1,4,9,16,'?'],correct:25,options:[20,24,25],explain:'Sono i quadrati: 1×1, 2×2, 3×3, 4×4 e infine 5×5 = 25.'}
];

function panel(type, label, title, intro, stage) {
  return `<article class="game-panel ${type}">
    <div class="game-label">${label}</div>
    <h1 id="game-title" tabindex="-1">${title}</h1>
    <p class="game-intro">${intro}</p>
    <div class="game-stage">${stage}</div>
  </article>`;
}
function message(text, success = false) {
  return `<div class="feedback ${success ? 'success':'warning'}" role="status" aria-live="polite">${htmlEscape(text)}</div>`;
}
function finish(type, label, title, intro, symbol, headline, explanation) {
  return panel(type,label,title,intro,`
    <div class="progress">Sfida completata ✦</div>
    <div class="success-art" aria-hidden="true">${symbol}</div>
    <h2 class="success-title">${headline}</h2>
    <p class="success-copy">${explanation}</p>
    <div class="game-toolbar"><button class="button button-primary" type="button" data-action="restart">Gioca di nuovo <span aria-hidden="true">↻</span></button><a class="button" href="#stanze">Scopri le altre stanze →</a></div>
  `);
}

function renderShop() {
  const title = 'La Bottega';
  const intro = 'Hai un piccolo negozio di oggetti curiosi. Aiuta a dare il resto giusto scegliendo le monete. Puoi usarne più di una dello stesso valore.';
  if (shopStep >= shopCases.length) {
    content.innerHTML = finish('shop','STANZA 01 · NUMERI',title,intro,'🪙','La bottega è in ordine!','Hai trovato il resto in ogni situazione. Con i numeri si possono risolvere problemi molto concreti.');
    return;
  }
  const current = shopCases[shopStep];
  const target = current.paid - current.price;
  const chosen = shopCoins.reduce((s,x)=>s+x,0);
  const solved = shopSolved;
  content.innerHTML = panel('shop','STANZA 01 · NUMERI',title,intro,`
    <div class="progress">Cliente ${shopStep+1} di ${shopCases.length}</div>
    <div class="stage-illustration" aria-hidden="true">${current.icon}</div>
    <h2>${htmlEscape(current.item)}</h2>
    <p>Questo oggetto costa <strong>${euro(current.price)}</strong>. Il cliente ti consegna <strong>${euro(current.paid)}</strong>. Quali monete gli restituisci?</p>
    <div class="wallet"><div><small>Monete che hai scelto</small><br><strong>${euro(chosen)}</strong></div><div><small>Resto da raggiungere</small><br><strong>${euro(target)}</strong></div></div>
    <div class="progress">${solved ? 'Bravo, resto esatto!' : 'Tocca le monete per aggiungerle'}</div>
    <div class="coin-row" aria-label="Monete disponibili">${coins.map(c=>`<button type="button" class="coin ${c.className}" data-coin="${c.value}" ${solved?'disabled':''} aria-label="Aggiungi una moneta da ${c.label}">${c.label}</button>`).join('')}</div>
    ${message(shopMessage,solved)}
    <div class="game-toolbar">${solved?'<button type="button" class="button button-primary" data-action="shop-next">'+(shopStep===shopCases.length-1?'Completa la sfida':'Prossimo cliente')+' →</button>':''}<button type="button" class="text-button" data-action="shop-undo" ${(!shopCoins.length||solved)?'disabled':''}>Annulla l’ultima moneta</button><button type="button" class="text-button" data-action="shop-clear" ${(!shopCoins.length||solved)?'disabled':''}>Ricomincia il resto</button></div>
    <p class="small-note">Suggerimento: il resto si trova sottraendo il prezzo dai soldi ricevuti.</p>
  `);
}

function renderDoor() {
  const title='La Porta Segreta';
  const intro='Una porta misteriosa è chiusa da un codice a tre cifre. Risolvi gli indizi nell’ordine in cui li incontri e scopri la combinazione.';
  if (doorStep >= clues.length && doorSolved) {
    content.innerHTML = finish('door','STANZA 02 · ENIGMI',title,intro,'🗝️','La porta si è aperta!','Hai collegato tre indizi e ricostruito il codice. I misteri diventano più semplici quando li affronti un pezzo alla volta.');
    return;
  }
  if (doorStep >= clues.length) {
    const digits = doorDigits.map(x=>`<span>${x}</span>`).join('');
    content.innerHTML = panel('door','STANZA 02 · ENIGMI',title,intro,`
      <div class="progress">L'ultimo passo</div><div class="stage-illustration" aria-hidden="true">🚪</div>
      <h2>La serratura aspetta.</h2><p>Hai trovato tre numeri. Inseriscili nell'ordine degli indizi per aprire la porta.</p>
      <div class="clue-digits" aria-label="Cifre raccolte">${digits}</div>
      <form id="door-form" class="code-form"><label class="sr-only" for="door-code">Codice di tre cifre</label><input id="door-code" name="code" type="text" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" autocomplete="off" placeholder="···" required aria-label="Scrivi il codice di tre cifre"><button type="submit" class="button button-primary">Apri la porta →</button></form>
      ${message(doorMessage)}
    `);
    return;
  }
  const clue = clues[doorStep];
  content.innerHTML = panel('door','STANZA 02 · ENIGMI',title,intro,`
    <div class="progress">Indizio ${doorStep+1} di ${clues.length}</div>
    <div class="stage-illustration" aria-hidden="true">${['🕯️','📜','🕸️'][doorStep]}</div>
    <h2>${htmlEscape(clue.text)}</h2><p>Scegli la risposta che ti convince. Puoi riprovare tutte le volte che vuoi.</p>
    <div class="answer-grid">${clue.options.map(x=>`<button type="button" class="answer ${doorSolved&&x===clue.correct?'correct':''}" data-door-answer="${x}" ${doorSolved?'disabled':''}>${x}</button>`).join('')}</div>
    ${message(doorMessage,doorSolved)}
    ${doorSolved?`<div class="game-toolbar"><button type="button" class="button button-primary" data-action="door-next">${doorStep===clues.length-1?'Vai alla serratura':'Prossimo indizio'} →</button></div>`:''}
    <p class="small-note">Cifre trovate: ${doorDigits.length?doorDigits.join(' · '):'nessuna, per ora'}</p>
  `);
}

function renderLab() {
  const title='Il Laboratorio';
  const intro='Nel laboratorio tutto segue una regola, anche i numeri. Osserva le sequenze e scopri il prossimo elemento.';
  if (labStep >= labCases.length) {
    content.innerHTML = finish('lab','STANZA 03 · LOGICA',title,intro,'🔭','Esperimento riuscito!','Hai riconosciuto tre regole differenti. La scienza comincia spesso così: osservando, facendo ipotesi e controllando se funzionano.');
    return;
  }
  const current=labCases[labStep];
  content.innerHTML=panel('lab','STANZA 03 · LOGICA',title,intro,`
    <div class="progress">Esperimento ${labStep+1} di ${labCases.length}</div>
    <div class="stage-illustration" aria-hidden="true">⚗️</div><h2>Qual è il prossimo numero?</h2><p>Guarda con attenzione: cosa cambia da un numero al successivo?</p>
    <div class="sequence" aria-label="Sequenza numerica">${current.sequence.map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="answer-grid">${current.options.map(x=>`<button type="button" class="answer ${labSolved&&x===current.correct?'correct':''}" data-lab-answer="${x}" ${labSolved?'disabled':''}>${x}</button>`).join('')}</div>
    ${message(labMessage,labSolved)}
    ${labSolved?`<div class="game-toolbar"><button type="button" class="button button-primary" data-action="lab-next">${labStep===labCases.length-1?'Completa il laboratorio':'Prossimo esperimento'} →</button></div>`:''}
  `);
}

function reset(game) {
  if (game==='bottega') {shopStep=0;shopCoins=[];shopSolved=false;shopMessage='';}
  if (game==='porta') {doorStep=0;doorDigits=[];doorSolved=false;doorMessage='';}
  if (game==='laboratorio') {labStep=0;labSolved=false;labMessage='';}
}
function render() {
  if(activeGame==='bottega') renderShop();
  if(activeGame==='porta') renderDoor();
  if(activeGame==='laboratorio') renderLab();
}
function route() {
  const hash=decodeURIComponent(location.hash.replace(/^#/,''));
  const game=games.has(hash)?hash:null;
  const switched=activeGame!==game;
  activeGame=game;
  if(game){home.hidden=true;screen.hidden=false;if(switched)reset(game);render();if(switched){window.scrollTo(0,0);document.querySelector('#game-title')?.focus({preventScroll:true});}}
  else{screen.hidden=true;home.hidden=false;if(hash==='stanze'||hash==='filosofia')requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView());else if(hash==='inizio')window.scrollTo(0,0);}
}

content.addEventListener('click',ev=>{
  const button=ev.target.closest('button'); if(!button||button.disabled)return;
  const coin=button.dataset.coin;
  const action=button.dataset.action;
  if(activeGame==='bottega'){
    if(coin!==undefined&&!shopSolved){
      shopCoins.push(Number(coin)); const target=shopCases[shopStep].paid-shopCases[shopStep].price;
      const sum=shopCoins.reduce((s,v)=>s+v,0);
      if(sum===target){shopSolved=true;shopMessage='Perfetto! Hai scelto proprio il resto giusto.';}
      else if(sum>target)shopMessage='Ops, hai dato troppo resto. Annulla una moneta e riprova.';
      else shopMessage='Ne manca ancora un po’: continua a scegliere le monete.';
      renderShop();(shopSolved?content.querySelector('[data-action="shop-next"]'):content.querySelector('[data-coin="'+coin+'"]'))?.focus({preventScroll:true});return;
    }
    if(action==='shop-undo'&&shopCoins.length){shopCoins.pop();shopMessage='Puoi riprovare: osserva quanto manca.';renderShop();return;}
    if(action==='shop-clear'){shopCoins=[];shopMessage='';renderShop();return;}
    if(action==='shop-next'&&shopSolved){shopStep++;shopSolved=false;shopCoins=[];shopMessage='';renderShop();return;}
  }
  if(activeGame==='porta'){
    if(button.dataset.doorAnswer!==undefined&&!doorSolved){
      const answer=Number(button.dataset.doorAnswer),clue=clues[doorStep];
      if(answer===clue.correct){doorSolved=true;doorDigits.push(answer);doorMessage=`Esatto! ${clue.explain}`;}
      else doorMessage='Non è questa. Prova a ragionare sull’indizio e scegli ancora.';
      renderDoor();(doorSolved?content.querySelector('[data-action="door-next"]'):content.querySelector('[data-door-answer="'+answer+'"]'))?.focus({preventScroll:true});return;
    }
    if(action==='door-next'&&doorSolved){doorStep++;doorSolved=false;doorMessage='';renderDoor();return;}
  }
  if(activeGame==='laboratorio'){
    if(button.dataset.labAnswer!==undefined&&!labSolved){
      const answer=Number(button.dataset.labAnswer),item=labCases[labStep];
      if(answer===item.correct){labSolved=true;labMessage=`Giusto! ${item.explain}`;}
      else labMessage='Quasi! Guarda i passaggi tra un numero e il successivo e riprova.';
      renderLab();(labSolved?content.querySelector('[data-action="lab-next"]'):content.querySelector('[data-lab-answer="'+answer+'"]'))?.focus({preventScroll:true});return;
    }
    if(action==='lab-next'&&labSolved){labStep++;labSolved=false;labMessage='';renderLab();return;}
  }
  if(action==='restart'){reset(activeGame);render();}
});
content.addEventListener('submit',ev=>{
  if(ev.target.id!=='door-form'||activeGame!=='porta')return;
  ev.preventDefault();
  const input=ev.target.querySelector('input[name="code"]');
  const code=input.value.trim();
  if(code===doorDigits.join('')) {doorSolved=true;doorMessage='';renderDoor();}
  else {doorMessage='La porta non si apre ancora. Controlla l’ordine delle cifre!';const feedback=ev.target.nextElementSibling;if(feedback)feedback.textContent=doorMessage;}
});

const dialog=document.getElementById('privacy-dialog');
document.getElementById('privacy-link').addEventListener('click',ev=>{ev.preventDefault();dialog.showModal();});
document.getElementById('close-privacy').addEventListener('click',()=>dialog.close());
document.getElementById('close-privacy-bottom').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close();});
window.addEventListener('hashchange',route);
route();
