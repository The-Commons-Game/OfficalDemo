
"use strict";
const PM_LIST=["Winston Churchill","Anthony Eden","Harold Macmillan","Alec Douglas-Home","Harold Wilson","Edward Heath","James Callaghan","Margaret Thatcher","John Major","Tony Blair","Gordon Brown","David Cameron","Theresa May","Boris Johnson","Liz Truss","Rishi Sunak","Sir Keir Starmer"];
const PARTIES=["Labour","Conservative","Liberal Democrats","Green","Reform","Independent"];
const ROLES={pm:"Prime Minister",mp:"Member of Parliament",chancellor:"Chancellor",electioneer:"Electioneer",voter:"Voter",reporter:"News Reporter",lord:"House of Lords"};
const HIST_CAB={"Winston Churchill":["Anthony Eden","R. A. Butler","Harold Macmillan","Lord Cherwell"],"Harold Wilson":["James Callaghan","Roy Jenkins","Barbara Castle","Denis Healey"],"Margaret Thatcher":["Geoffrey Howe","Nigel Lawson","Michael Heseltine","Kenneth Baker"],"Tony Blair":["Gordon Brown","Jack Straw","John Prescott","David Blunkett"],"David Cameron":["George Osborne","Theresa May","William Hague","Michael Gove"],"Theresa May":["Philip Hammond","Amber Rudd","David Davis","Boris Johnson"],"Boris Johnson":["Rishi Sunak","Dominic Raab","Michael Gove","Priti Patel"],"Rishi Sunak":["Jeremy Hunt","James Cleverly","Suella Braverman","Oliver Dowden"],"Sir Keir Starmer":["Rachel Reeves","David Lammy","Yvette Cooper","John Healey"]};
const DEFAULT={theme:"light",role:null,name:"",party:"Labour",side:"Government",leader:"",day:1,month:1,year:2026,approval:50,trust:50,influence:20,local:50,media:50,treasury:50,majority:0,cabinet:[],cabinetMode:"custom",events:[],history:[],reports:[],voterLikes:[],poll:50,election:{weeks:0,active:false,snap:false},lostLeadership:false,seat:"Northbridge Central",achievements:[],billProgress:0};
let state=load(); applyTheme();

/* ===== Expanded Westminster Career Engine ===== */
const CAREER_JOBS = [
  ["pm","Prime Minister","Run the government, survive PMQs, manage Cabinet and lead elections."],
  ["mp","MP","Choose Government or Opposition, represent a constituency and question the PM."],
  ["lord","House of Lords","Sit in the Lords, take part in debates, scrutiny and State Opening."],
  ["chancellor","Chancellor","Run the Treasury, prepare budgets and defend economic decisions."],
  ["electioneer","Election Campaigner","Build a campaign over a four-week general-election race."],
  ["voter","Voter","Choose a party, react to its policies and switch parties when your views change."],
  ["reporter","Political Reporter","Follow each day's events, write reports and see the public reaction."],
  ["blackrod","Black Rod","Manage ceremonial duties, State Opening and parliamentary logistics."],
  ["soop","State Opening Planner","Plan the ceremonial timetable and coordinate the State Opening."]
];

const DAILY_EVENTS = [
 ["Cabinet pressure","A minister wants a policy softened before Cabinet meets.",["Compromise","Hold firm","Delay the decision"]],
 ["PMQs queue","Five MPs are waiting to ask questions at PMQs.",["Answer carefully","Go on the attack","Keep answers short"]],
 ["Constituency surprise","A local issue suddenly appears on the evening news.",["Visit","Issue a statement","Ask the whip to handle it"]],
 ["Press briefing","A reporter says there is disagreement inside government.",["Brief honestly","Deny it","Say no comment"]],
 ["Policy launch","Your policy is trending on the fictional Commons Twitter feed.",["Promote it","Explain the detail","Let ministers promote it"]],
 ["Backbench meeting","Your own MPs have concerns about the latest announcement.",["Listen","Reassure them","Demand discipline"]],
 ["Royal audience","The King/Queen requests an audience.",["Attend immediately","Ask for a briefing first","Reschedule"]],
 ["Opposition motion","The opposition has tabled a motion that could embarrass the government.",["Debate it","Whip against it","Offer a compromise"]],
 ["Local paper","A constituency newspaper asks for an interview.",["Accept","Send a written answer","Decline"]],
 ["Unexpected poll","A new fictional poll moves your approval sharply.",["React","Stay the course","Ask Cabinet for advice"]]
];

function careerDayTick(){
  if(!state.day) state.day=1;
  state.day++;
  if(state.role==="pm"){
    state.governmentWeeks=(state.governmentWeeks||0)+1/7;
    state.cabinetPressure=Math.max(0,state.cabinetPressure||0);
    if(state.day%7===0 && state.governmentWeeks>=4) state.electionUnlocked=true;
  }
  save();
}

function requireFourWeeks(actionName){
  if((state.governmentWeeks||0)<4){
    toast(`${actionName} unlocks after 4 weeks in government.`);
    return false;
  }
  return true;
}

function startGeneralElection(){
  if(!requireFourWeeks("An election")) return;
  state.election={active:true,week:1,stage:"campaign",weeksTotal:4};
  addEvent("General election called","The four-week campaign has begun.");
  save();
  campaignHQ();
}

function campaignHQ(){
  choose("Four-week campaign HQ","You must campaign before polling day.",[
    ["Make a campaign sign","Design a slogan and sign for your campaign.",()=>signMaker()],
    ["Write your speech","Prepare the speech you will give before entering Parliament.",()=>campaignSpeech()],
    ["Knock doors","Run a constituency canvass.",()=>effect(4,3,2,7,1,"Canvassing")],
    ["Hold a rally","Give a public address.",()=>effect(6,2,4,2,7,"Campaign rally")]
  ]);
}

function signMaker(){
  const slogans=["A fresh start","Strong local voice","A plan for tomorrow","Putting people first","Your voice in Parliament"];
  const slogan=slogans[Math.floor(Math.random()*slogans.length)];
  choose("Campaign sign maker",`Pick a design for the sign. Suggested slogan: “${slogan}”`,[
    ["Classic","Clean party colours and a bold name.",()=>effect(3,2,1,4,2,"Campaign sign")],
    ["Local","Feature the constituency prominently.",()=>effect(2,4,1,7,1,"Campaign sign")],
    ["Bold","A huge headline and simple message.",()=>effect(5,-1,2,2,7,"Campaign sign")]
  ]);
}

function campaignSpeech(){
  choose("Your election speech","Before you enter Parliament, you must give your campaign speech.",[
    ["Hopeful","Talk about the future.",()=>effect(5,5,3,4,6,"Election speech")],
    ["Local","Focus on the constituency.",()=>effect(3,6,2,8,3,"Election speech")],
    ["Hard-hitting","Attack your opponent's record.",()=>effect(4,-2,5,2,8,"Election speech")]
  ]);
  state.speechDelivered=true;
  save();
}

function formGovernmentAudience(){
  choose("Royal audience","The King/Queen has invited you to form a government.",[
    ["Accept the invitation","Begin the formal process of forming a government.",()=>downingStreetArrival()],
    ["Ask for a short briefing","Take a moment to confirm the parliamentary numbers.",()=>downingStreetArrival()]
  ]);
}

function downingStreetArrival(){
  state.inGovernment=true;
  state.governmentWeeks=0;
  addEvent("Downing Street","You have arrived to form your government.");
  choose("Steps of Downing Street","The cameras are waiting. You need to make your own speech.",[
    ["Give your speech","Deliver your first address as Prime Minister.",()=>firstPMspeech()],
    ["Keep it brief","Thank voters and promise to get to work.",()=>firstPMspeech()]
  ]);
}

function firstPMspeech(){
  state.firstSpeech=true;
  effect(5,5,3,0,7,"First speech outside Downing Street");
  addEvent("First speech","Your first Downing Street speech has been delivered.");
  save();
  pmqSession();
}

function pmqSession(){
  const questions=[
    "How will you fund your flagship promise?",
    "Why should voters trust your government?",
    "What is your answer to the opposition's latest criticism?",
    "What will you do about a problem in a constituency outside your own?",
    "Which policy will you prioritise first?"
  ];
  let i=0;
  function ask(){
    if(i>=questions.length){
      addEvent("PMQs complete","You answered at least five questions in the Commons.");
      save(); dashboard(); return;
    }
    choose(`PMQs — Question ${i+1}/5`,questions[i],[
      ["Give a detailed answer","Explain the policy and its trade-offs.",()=>{effect(2,3,2,0,2,"PMQs");i++;ask();}],
      ["Answer directly","Keep the answer clear and short.",()=>{effect(3,1,3,0,3,"PMQs");i++;ask();}],
      ["Challenge the premise","Turn the question back on the opposition.",()=>{effect(4,-2,4,0,7,"PMQs");i++;ask();}]
    ]);
  }
  ask();
}

function twitterCreate(){
  choose("Commons Twitter — Create account","Set up your fictional political account.",[
    ["Create as Prime Minister","Use your office identity.",()=>{state.twitter={created:true,handle:"@"+(state.name||"PM").replace(/\s+/g,""),followers:100};addEvent("Commons Twitter","Your account is live.");save();dashboard();}],
    ["Create a personal account","Use your own political identity.",()=>{state.twitter={created:true,handle:"@"+(state.name||"MP").replace(/\s+/g,""),followers:50};addEvent("Commons Twitter","Your account is live.");save();dashboard();}]
  ]);
}

function twitterPost(){
  if(!state.twitter?.created){twitterCreate();return;}
  const base=state.approval||50;
  const reaction=base-50+Math.floor(Math.random()*15)-7;
  choose("Post on Commons Twitter",`Current fictional public reaction: ${reaction>=0?"+":""}${reaction}%`,[
    ["Promote a policy","Post a short policy announcement.",()=>effect(reaction>=0?5:1,reaction>=0?3:-2,2,0,8,"Commons Twitter post")],
    ["Explain a decision","Give voters more context.",()=>effect(2,5,1,0,4,"Commons Twitter post")],
    ["Do not post","Avoid making the story bigger.",()=>effect(0,2,0,0,0,"Commons Twitter")]
  ]);
}

function leadershipContest(){
  if(!requireFourWeeks("A leadership contest")) return;
  state.leadership={stage:"resignationSpeech"};
  choose("Announce your resignation","Write and deliver your resignation speech.",[
    ["Deliver a gracious speech","Thank colleagues and the public.",()=>setLeadershipContestDate()],
    ["Deliver a determined speech","Explain why it is time for a new leader.",()=>setLeadershipContestDate()]
  ]);
}

function setLeadershipContestDate(){
  state.leadership.stage="contestDate";
  choose("Set the leadership contest day","Choose when the contest will take place.",[
    ["In 7 days","Give candidates a week to campaign.",()=>cabinetContest()],
    ["In 14 days","Give candidates two weeks.",()=>cabinetContest()]
  ]);
}

function cabinetContest(){
  state.leadership.stage="candidates";
  choose("Cabinet leadership contest","Two AI Cabinet ministers go head-to-head.",[
    ["Candidate A wins","The first Cabinet candidate wins.",()=>leadershipWinner("Candidate A")],
    ["Candidate B wins","The second Cabinet candidate wins.",()=>leadershipWinner("Candidate B")]
  ]);
}

function leadershipWinner(winner){
  state.leadership.winner=winner;
  state.name=winner;
  state.leadership.stage="resignationDate";
  choose(`${winner} wins`,`The party has selected ${winner}. Set the day of your resignation.`,[
    ["Tomorrow","Arrange the final handover.",()=>finalGoodbye()],
    ["In 7 days","Allow a final week in office.",()=>finalGoodbye()]
  ]);
}

function finalGoodbye(){
  state.leadership.stage="finalGoodbye";
  choose("Final goodbye","Make your final speech as Prime Minister.",[
    ["Give a full farewell","Reflect on your premiership.",()=>seeKing()],
    ["Give a short farewell","Thank the country and leave office.",()=>seeKing()]
  ]);
}

function seeKing(){
  state.leadership.stage="royalAudience";
  choose("Final royal audience","You have a final audience with the King/Queen.",[
    ["Attend","Complete the constitutional handover.",()=>continueOrEndPremiership()],
    ["Attend and thank the Monarch","Complete the handover respectfully.",()=>continueOrEndPremiership()]
  ]);
}

function continueOrEndPremiership(){
  choose("Your premiership has ended","Do you want to continue as the new leader or end your premiership?",[
    ["Become the next leader","Continue the game as the new leader. Your name is locked.",()=>newLeaderAfterContest()],
    ["End premiership","Finish the career.",()=>endCareer()]
  ]);
}

function newLeaderAfterContest(){
  state.name=state.leadership.winner;
  state.leader=state.name;
  state.inGovernment=false;
  state.leadership=null;
  formGovernmentAudience();
}

function endCareer(){
  addEvent("Career ended","Your premiership has concluded.");
  toast("Premiership ended.");
  save();
  dashboard();
}

function stateOpening(){
  choose("State Opening","Choose your ceremonial career task.",[
    ["Plan the State Opening","Coordinate the ceremony and timetable.",()=>addEvent("State Opening Planner","The ceremony plan is complete.")],
    ["Play Black Rod","Carry out the ceremonial duties.",()=>addEvent("Black Rod","You completed your Black Rod duties.")],
    ["Attend as a Lord","Take your place in the Lords.",()=>addEvent("State Opening","You attended the State Opening.")]
  ]);
  save();
}

function triggerMonthlyBugs(){
  if(!state.month) state.month=1;
  if(state.month!==Math.ceil((state.day||1)/30)){
    state.month=Math.ceil((state.day||1)/30);
    state.bugsThisMonth=0;
  }
  if((state.bugsThisMonth||0)<2 && Math.random()<0.08){
    const bugs=[
      "A fictional poll briefly displays an outdated number.",
      "The newspaper feed refreshes twice before settling."
    ];
    state.bugsThisMonth=(state.bugsThisMonth||0)+1;
    addEvent("Minor game bug","A harmless fictional UI glitch occurred: "+bugs[state.bugsThisMonth-1]);
  }
}


function load(){try{let x=JSON.parse(localStorage.getItem("commons_deluxe"));return x?Object.assign({},DEFAULT,x):structuredClone(DEFAULT)}catch(e){return structuredClone(DEFAULT)}}
let cloudSaveTimer=null;
function save(){
  triggerMonthlyBugs();
  localStorage.setItem("commons_deluxe",JSON.stringify(state));
  if(window.commonsAuth?.user && window.commonsSupabase){
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer=setTimeout(syncSaveToCloud,900);
  }
}
async function syncSaveToCloud(){
  if(!window.commonsAuth?.user || !window.commonsSupabase) return;
  const payload={user_id:window.commonsAuth.user.id,save_key:"main",game_state:state,updated_at:new Date().toISOString()};
  const {error}=await window.commonsSupabase.from("game_saves").upsert(payload,{onConflict:"user_id,save_key"});
  if(error) console.warn("Cloud save:",error.message);
}
async function loadCloudSave(){
  if(!window.commonsAuth?.user || !window.commonsSupabase) return false;
  const {data,error}=await window.commonsSupabase.from("game_saves").select("game_state").eq("user_id",window.commonsAuth.user.id).eq("save_key","main").maybeSingle();
  if(error){console.warn("Cloud load:",error.message);return false}
  if(data?.game_state){
    state=Object.assign({},DEFAULT,data.game_state);
    localStorage.setItem("commons_deluxe",JSON.stringify(state));
    applyTheme();
    dashboard();
    toast("Cloud save loaded.");
    return true;
  }
  return false;
}
async function loginDiscord(){
  try{await window.commonsAuth.signInDiscord()}catch(e){toast("Discord login failed.");console.error(e)}
}
async function logoutDiscord(){
  try{await window.commonsAuth.signOut();toast("Signed out.");settings()}catch(e){toast("Sign out failed.")}
}
async function accountPanel(){
  const user=window.commonsAuth?.user;
  if(!window.commonsAuth?.ready) return `<div class="auth-status">Cloud login is not configured. The game still works locally.</div>`;
  if(!user) return `<div class="auth-status">Not signed in. Sign in to keep your career save in Supabase.</div><div class="auth-row"><button class="primary discord" onclick="loginDiscord()">Continue with Discord</button></div>`;
  const label=user.user_metadata?.full_name||user.user_metadata?.name||user.email||"Discord player";
  return `<div class="auth-status">Signed in as <b>${esc(label)}</b>. Your main career can sync to the database.</div><div class="auth-row"><button class="primary" onclick="syncSaveToCloud();toast('Save synced.')">Sync save now</button><button class="secondary" onclick="loadCloudSave()">Load cloud save</button><button class="secondary" onclick="logoutDiscord()">Sign out</button></div>`;
}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function clamp(x){return Math.max(0,Math.min(100,Math.round(x)))}
function toast(t){let e=document.getElementById("toast");e.textContent=t;e.style.display="block";setTimeout(()=>e.style.display="none",2200)}
function applyTheme(){document.body.classList.toggle("dark",state.theme==="dark")}
function stat(a,b){return `<div class="kpi"><span class="muted">${a}</span><b>${b}</b></div>`}
function card(t,b,cls=""){return `<article class="card ${cls}"><h2>${t}</h2>${b}</article>`}
function careerCard(role,title,desc){return `<article class="card career"><span class="pill">${ROLES[role]}</span><h3 style="margin-top:10px">${title}</h3><p class="muted">${desc}</p><button class="primary" onclick="newCareer('${role}')">Start / New Game</button></article>`}
function home(){
document.getElementById("app").innerHTML=`<section class="hero"><div class="hero-main"><div class="eyebrow">A Westminster career simulator</div><h1>Politics is never<br>just one decision.</h1><p>Run a premiership, survive PMQs, win an election, report the story, switch parties, build a Cabinet or enter the Lords. The country reacts to what you do.</p><div class="row"><button class="primary" onclick="careers()">Choose a career</button><button class="ghost" style="color:white" onclick="hub()">Enter Westminster</button></div></div></section>
<section class="section grid4">${stat("Current role",state.role?ROLES[state.role]:"None")}${stat("Approval",state.approval+"%")}${stat("Trust",state.trust+"%")}${stat("Day",state.day)}</section>
<section class="section grid">${careerCard("pm","Prime Minister","Lead government, face the Monarch, appoint a Cabinet and fight elections.")}${careerCard("mp","MP Career","Government or Opposition, PMQs, constituency visits and surprises.")}${careerCard("chancellor","Chancellor","Budgets, tax, investment, growth and fiscal pressure.")}${careerCard("electioneer","Electioneer","Campaign in marginal seats, handle polling and fight elections.")}${careerCard("voter","Voter Career","Hear policies, like or dislike them and switch parties.")}${careerCard("reporter","News Reporter","Choose an angle, publish a report and watch public reaction.")}${careerCard("lord","House of Lords","Scrutinise Bills, table amendments and negotiate cross-party.")}</section>`;
}
function careers(){document.getElementById("app").innerHTML=`<div class="page-title"><div><div class="eyebrow">Career room</div><h1>Choose your route</h1></div><p class="muted">Every route has a fresh save and its own decisions.</p></div><section class="grid">${careerCard("pm","Prime Minister","Win the country four weeks before polling day, govern and survive leadership pressure.")}${careerCard("mp","Member of Parliament","Choose Government or Opposition and build a constituency reputation.")}${careerCard("chancellor","Chancellor","Make Treasury decisions with political consequences.")}${careerCard("electioneer","Electioneer","Run the campaign machine and read the numbers.")}${careerCard("voter","Voter","Choose a party, react to policy and change your mind.")}${careerCard("reporter","News Reporter","Run a newsroom and decide how you frame political events.")}${careerCard("lord","House of Lords","Play the revising chamber with amendments and negotiations.")}</section>`}
function newCareer(role){
state=structuredClone(DEFAULT);state.role=role;state.name="Alex Morgan";state.party="Labour";state.side=role==="mp"?"Government":"Government";
if(role==="pm")open(`<h2>Start Prime Minister Career</h2><p class="muted">Choose your own PM or step into a historical premiership.</p><div class="field"><label>Name</label><input id="name" value="Alex Morgan"></div><div class="field"><label>Party</label><select id="party">${PARTIES.map(p=>`<option>${p}</option>`).join("")}</select></div><div class="field"><label>Premiership</label><select id="leader" onchange="historicalLock()"><option value="own">My own Prime Minister</option>${PM_LIST.map(p=>`<option>${p}</option>`).join("")}</select></div><div id="historyNote" class="notice" style="display:none"></div><div class="field"><label>Cabinet</label><select id="cab"><option value="custom">Build my own</option><option value="historical">Use historical Cabinet</option></select></div><button class="primary" onclick="beginPM()">Begin</button> <button class="secondary" onclick="closeModal()">Cancel</button>`);
else if(role==="mp")open(`<h2>Start MP Career</h2><div class="field"><label>Name</label><input id="name" value="Alex Morgan"></div><div class="field"><label>Party</label><select id="party">${PARTIES.map(p=>`<option>${p}</option>`).join("")}</select></div><div class="field"><label>Benches</label><select id="side"><option>Government</option><option>Opposition</option></select></div><button class="primary" onclick="beginSimple('mp')">Enter the Commons</button>`);
else open(`<h2>Start ${ROLES[role]} Career</h2><div class="field"><label>Name</label><input id="name" value="Alex Morgan"></div><div class="field"><label>Party</label><select id="party">${PARTIES.map(p=>`<option>${p}</option>`).join("")}</select></div><button class="primary" onclick="beginSimple('${role}')">Begin career</button>`);
}
function historicalParty(name){
  if(["Margaret Thatcher","John Major","David Cameron","Theresa May","Boris Johnson","Rishi Sunak"].includes(name)) return "Conservative";
  if(["Tony Blair","Gordon Brown","Harold Wilson","James Callaghan","Sir Keir Starmer"].includes(name)) return "Labour";
  return "Conservative";
}
function historicalLock(){
  const leader=document.getElementById("leader");
  const name=document.getElementById("name");
  const party=document.getElementById("party");
  const note=document.getElementById("historyNote");
  const chosen=leader.value;
  if(chosen==="own"){
    name.disabled=false; party.disabled=false;
    name.value="Alex Morgan";
    note.style.display="none";
  } else {
    name.disabled=true; party.disabled=true;
    name.value=chosen;
    party.value=historicalParty(chosen);
    note.style.display="block";
    note.innerHTML=`<b>Historical mode locked.</b><br>You are playing <b>${esc(chosen)}</b> as they were. Their name and party cannot be changed. You can still choose how you govern.`;
  }
}
function beginPM(){let l=document.getElementById("leader").value;
state.name=l==="own"?(document.getElementById("name").value.trim()||"Alex Morgan"):l;
state.party=l==="own"?document.getElementById("party").value:historicalParty(l);
state.leader=l==="own"?state.name:l;state.cabinetMode=document.getElementById("cab").value;if(state.cabinetMode==="historical")state.cabinet=HIST_CAB[state.leader]||HIST_CAB["Sir Keir Starmer"];closeModal();addEvent("Premiership begins",`${state.leader} takes office. The election clock is set four weeks before polling day.`);save();dashboard()}
function beginSimple(role){state.name=document.getElementById("name").value.trim()||"Alex Morgan";state.party=document.getElementById("party").value;if(role==="mp")state.side=document.getElementById("side").value;closeModal();addEvent("Career begins",`You begin as ${ROLES[role]}.`);save();dashboard()}
function dashboard(){
if(!state.role){home();return}let c={pm:pm,mp:mp,chancellor:chancellor,electioneer:electioneer,voter:voter,reporter:reporter,lord:lord}[state.role]();
document.getElementById("app").innerHTML=`<div class="row"><span class="pill">${ROLES[state.role]}</span><span class="pill">${esc(state.party)}</span><span class="pill">Day ${state.day} · Month ${state.month}</span><button class="secondary" onclick="restartCareer()">Restart</button><button class="secondary" onclick="sharePage()">Share</button></div><div class="page-title"><div><h1>${esc(state.name)}</h1><p class="muted">${esc(state.seat)} · ${esc(state.side)}</p></div><div style="min-width:240px"><div class="scoreline"><span>Public approval</span><b>${state.approval}%</b></div><div class="progress"><i style="width:${state.approval}%"></i></div></div></div><div class="grid4">${stat("Approval",state.approval+"%")}${stat("Trust",state.trust+"%")}${stat("Influence",state.influence)}${stat("Local",state.local+"%")}</div><section class="section">${c}</section>`}
function diary(){return card("Political diary",`<div class="log">${state.events.slice().reverse().map(e=>`<div><b>${esc(e.title)}</b><br><span class="muted">${esc(e.text)}</span></div>`).join("")||"<div>No events yet.</div>"}</div>`)}
function pm(){let old=PM_LIST.indexOf(state.leader)>=0&&PM_LIST.indexOf(state.leader)<PM_LIST.indexOf("Tony Blair");return `<div class="split">${card("10 Downing Street",`<p><b>${esc(state.leader||state.name)}</b> · ${esc(state.party)}</p><div class="notice">The government needs to win the general election with a four-week campaign. A snap election can be called at any time.</div><div class="row" style="margin-top:13px"><button class="primary" onclick="pmCrisis()">Decision room</button><button class="secondary" onclick="monarch()">Monarch audience</button><button class="secondary" onclick="startElection(true)">Prepare election</button></div>`)}${card("Cabinet Office",`<p>${state.cabinet.length?state.cabinet.map(x=>`<span class="pill">${esc(x)}</span>`).join(" "):"No Cabinet appointed."}</p><button class="primary" onclick="cabinetBuilder()">Build Cabinet</button> <button class="secondary" onclick="historicalCabinet()">Historical Cabinet</button>`)}${card(old?"Historical feedback":"Public feedback",`<p>${old?"This era receives newspapers, letters and political correspondence rather than modern social feeds.":"Modern feedback mixes newspapers, broadcasters and public online reaction."}</p><button class="primary" onclick="feedback()">Open feedback</button>`)}${card("Leadership & elections",`<p>Lose a leadership election and you can continue as the new leader.</p><button class="secondary" onclick="leadership()">Leadership election</button> <button class="secondary" onclick="snap()">Snap election</button>`)}</div>${card("Make politics feel alive",`<div class="list"><button class="choice" onclick="pressConference()"><strong>Hold a press conference</strong><span>Take questions and risk an unexpected headline.</span></button><button class="choice" onclick="backbenchers()"><strong>Meet the backbenchers</strong><span>Keep your own side on board.</span></button><button class="choice" onclick="pollingRoom()"><strong>Open the polling room</strong><span>See a fictional constituency snapshot and choose your response.</span></button></div>`)}${diary()}`}
function mp(){return `<div class="split">${card("Commons chamber",`<h3>${esc(state.side)}</h3><p>PMQs, speeches, committees and rebellions all change your influence.</p><button class="primary" onclick="pmqs()">Go to PMQs</button>`)}${card("Constituency office",`<p><b>${esc(state.seat)}</b> · Local reputation ${state.local}%</p><button class="primary" onclick="constituency()">Visit constituency</button><p class="muted">A surprise event is selected randomly.</p>`)}</div><section class="section">${card("Parliamentary moves",`<div class="list"><button class="choice" onclick="effect(3,1,5,0,2,'Commons speech')"><strong>Make a Commons speech</strong><span>Put your argument on the record.</span></button><button class="choice" onclick="effect(1,5,5,1,0,'Committee work')"><strong>Join a committee</strong><span>Build influence through detailed scrutiny.</span></button><button class="choice" onclick="effect(-2,4,7,0,3,'Rebel against the whip')"><strong>Test the whip</strong><span>Take a difficult position against your party.</span></button></div>`)}</section>${card("Outside Parliament",`<div class="list"><button class="choice" onclick="localRadio()"><strong>Local radio interview</strong><span>A caller puts you on the spot.</span></button><button class="choice" onclick="surpriseLetter()"><strong>Open the postbag</strong><span>Read a surprising constituent letter.</span></button></div>`)}${diary()}`}
function chancellor(){return `<div class="split">${card("Treasury dashboard",`<div class="grid4">${stat("Fiscal headroom",state.treasury)}${stat("Approval",state.approval+"%")}${stat("Trust",state.trust+"%")}${stat("Influence",state.influence)}</div><div class="list" style="margin-top:12px"><button class="choice" onclick="budget('spend')"><strong>Increase public investment</strong><span>Services improve, but headroom falls.</span></button><button class="choice" onclick="budget('tax')"><strong>Raise revenue</strong><span>The books improve, but voters may object.</span></button><button class="choice" onclick="budget('growth')"><strong>Launch growth package</strong><span>Bet on investment and business confidence.</span></button></div>`)}${card("Treasury briefing",`<p>Markets are watching your next move.</p><button class="primary" onclick="treasuryBrief()">Face the briefing</button>`)}</div>${diary()}`}
function electioneer(){return `<div class="split">${card("Campaign HQ",`<p>Polling estimate: <b>${state.poll}%</b></p><div class="progress"><i style="width:${state.poll}%"></i></div><div class="list" style="margin-top:12px"><button class="choice" onclick="campaign('ground')"><strong>Ground campaign</strong><span>Visit marginal seats.</span></button><button class="choice" onclick="campaign('media')"><strong>Media campaign</strong><span>Own the national message.</span></button><button class="choice" onclick="campaign('policy')"><strong>Major policy launch</strong><span>Take a bold offer to the country.</span></button></div>`)}${card("Election calendar",`<p>${state.election.active?`Campaign week ${state.election.weeks} of 4`:"No election underway."}</p><button class="primary" onclick="startElection(false)">Start campaign</button> <button class="secondary" onclick="runElection()">Count votes</button>`)}</div>${diary()}`}
function voter(){return `<div class="split">${card("Your politics",`<p>Current party: <b>${esc(state.party)}</b></p><p>Policies liked: ${state.voterLikes.length}</p><button class="primary" onclick="policy()">Hear a new policy</button>`)}${card("Switch parties",`<div class="list">${PARTIES.map(p=>`<button class="choice" onclick="switchParty('${p}')"><strong>${p}</strong><span>See what this party offers next.</span></button>`).join("")}</div>`)}</div>${diary()}`}
function reporter(){return `<div class="split">${card("News desk",`<p>Reader trust: <b>${state.media}%</b></p><button class="primary" onclick="writeReport()">Write today's report</button> <button class="secondary" onclick="realReport()">Open briefing</button>`)}${card("Archive",`${state.reports.length?`<div class="log">${state.reports.slice().reverse().map(x=>`<div>${esc(x)}</div>`).join("")}</div>`:"<p class='muted'>No reports filed yet.</p>"}`)}</div>${diary()}`}
function lord(){return `<div class="split">${card("Lords chamber",`<div class="list"><button class="choice" onclick="lordAction('scrutiny')"><strong>Scrutinise a Bill</strong><span>Question the government's case.</span></button><button class="choice" onclick="lordAction('amend')"><strong>Table an amendment</strong><span>Try to change the legislation.</span></button><button class="choice" onclick="lordAction('committee')"><strong>Launch committee inquiry</strong><span>Build evidence and cross-party support.</span></button></div>`)}${card("Cross-party diplomacy",`<p>Trust ${state.trust}% · Influence ${state.influence}</p><button class="primary" onclick="negotiate()">Negotiate compromise</button>`)}</div>${diary()}`}
function addEvent(title,text){state.events.push({title,text});if(state.events.length>50)state.events.shift();state.history.push(title+": "+text);save()}
function advance(days=1){for(let i=0;i<days;i++){state.day++;if(state.day>28){state.day=1;state.month++;addEvent("Monthly political incident",monthlyIncident());addEvent("Second monthly incident",monthlyIncident())}}save()}
function monthlyIncident(){let x=[["Hospital pressure","A hospital asks for urgent help and the story reaches the national press."],["By-election shock","A safe seat suddenly looks competitive."],["Cabinet disagreement","Two senior figures disagree publicly over the government's direction."],["Community breakthrough","A local project succeeds beyond expectations."],["Economic warning","Forecasters issue a cautious warning."],["Front-page splash","A major newspaper turns a routine policy into a national story."],["Unexpected endorsement","A respected community figure publicly backs your approach."],["Transport disruption","A major transport problem creates pressure on ministers."]];return x[Math.floor(Math.random()*x.length)][1]}
function effect(a,t,i,l,m,title){state.approval=clamp(state.approval+a);state.trust=clamp(state.trust+t);state.influence=Math.max(0,state.influence+i);state.local=clamp(state.local+l);state.media=clamp(state.media+m);state.poll=clamp(state.poll+a+Math.round(t/2));addEvent(title||"Decision",`Approval ${a>=0?"+":""}${a}, trust ${t>=0?"+":""}${t}, influence ${i>=0?"+":""}${i}.`);advance();dashboard()}
function open(h){document.getElementById("modalbox").innerHTML=h;document.getElementById("modal").classList.add("open")}
function closeModal(){document.getElementById("modal").classList.remove("open")}
function choose(title,text,items){open(`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="list">${items.map((x,i)=>`<button class="choice" onclick="closeModal();choiceFns[${i}]()"><strong>${esc(x[0])}</strong><span>${esc(x[1]||"")}</span></button>`).join("")}</div>`);window.choiceFns=items.map(x=>x[2])}
function pmCrisis(){choose("Decision room","A fast-moving story needs an answer.",[["Announce a firm plan","Strong and immediate.",()=>effect(5,3,4,0,2,"PM crisis: firm plan")],["Consult Cabinet","Slower, but builds internal trust.",()=>effect(2,7,2,1,1,"PM crisis: Cabinet consultation")],["Ask for more time","Avoids an immediate mistake, but looks hesitant.",()=>effect(-2,1,0,0,-1,"PM crisis: delay")]])}
function monarch(){choose("Audience with the Monarch","You give a formal update on government business.",[["Present the government's plan","Confident and clear.",()=>effect(3,3,3,0,1,"Monarch audience")],["Ask for private counsel","Seek constitutional perspective.",()=>effect(1,6,2,0,0,"Monarch audience")],["Admit uncertainty","Honest, but politically risky.",()=>effect(-1,7,0,0,0,"Monarch audience")]])}
function feedback(){let modern=PM_LIST.indexOf(state.leader)>=PM_LIST.indexOf("Tony Blair");choose(modern?"Modern public feedback":"Historical public feedback",modern?"Newspapers, broadcasters and modern public reaction are arriving.":"This era receives newspapers, letters and Westminster correspondence.",modern?[["Read public reaction","Social, broadcast and newspaper reaction.",()=>effect(2,1,1,0,3,"Modern feedback")],["Read supportive letters","Positive correspondence.",()=>effect(3,3,1,2,1,"Modern feedback")],["Read hostile coverage","A difficult press cycle.",()=>effect(-3,-2,0,0,-2,"Modern feedback")]]:[["Read newspapers","Front pages and editorials.",()=>effect(2,1,1,0,2,"Newspaper feedback")],["Open letters","Correspondence from voters.",()=>effect(3,4,1,3,0,"Letter feedback")],["Read Westminster correspondence","Private political reactions.",()=>effect(0,5,3,0,0,"Political correspondence")]])}
function pmqs(){choose("Prime Minister's Questions","The Speaker calls the chamber to order.",[["Press on policy","Put the government under pressure.",()=>effect(3,1,4,1,2,"PMQs")],["Ask a constituency question","Make it local.",()=>effect(2,2,2,5,0,"PMQs")],["Make a point of order","Use parliamentary procedure.",()=>effect(-1,0,1,0,0,"PMQs")]])}
function constituency(){let a=[["Hospital crisis","The local hospital needs urgent support.",4,7],["School success","A school wins a national award.",5,6],["Factory closure","Workers ask what you will do.",-4,-7],["Community surprise","A grassroots group presents a successful project.",6,5],["Flooding","Residents need practical help.",3,8]];let x=a[Math.floor(Math.random()*a.length)];choose("Constituency surprise",x[0],[[x[1],"Stay and act.",()=>effect(x[2],2,2,x[3],1,"Constituency visit")],["Listen and report back","Take the issue to Parliament.",()=>effect(1,4,2,Math.max(1,x[3]-1),0,"Constituency visit")],["Leave for Westminster","Prioritise parliamentary business.",()=>effect(-2,-1,0,0,0,"Constituency visit")]])}
function pressConference(){
 choose("Press conference","Three reporters raise their hands. Your answer will become tomorrow's headline.",[
 ["Give a confident answer","Stick to the government's line.",()=>effect(4,1,4,0,7,"Press conference")],
 ["Admit the policy needs work","Honesty can calm a bad story.",()=>effect(2,6,2,0,3,"Press conference")],
 ["Turn the question back","Attack the opposition's record.",()=>effect(5,-3,5,0,8,"Press conference")]
 ]);
}
function backbenchers(){
 choose("Backbenchers' meeting","Your own MPs want reassurance.",[
 ["Listen to concerns","Keep the parliamentary party together.",()=>effect(2,7,3,1,1,"Backbenchers' meeting")],
 ["Lay down the line","Demand discipline.",()=>effect(1,-2,6,0,2,"Backbenchers' meeting")],
 ["Offer a compromise","Trade a little policy for stability.",()=>effect(3,5,4,1,2,"Backbenchers' meeting")]
 ]);
}
function pollingRoom(){
 let seats=["Northbridge Central","East Mercia","Riverside","Westford","South Trent","Harrow Vale"];
 let seat=seats[Math.floor(Math.random()*seats.length)];
 let n=Math.floor(Math.random()*21)-10;
 choose("Private polling snapshot",`${seat} is currently ${n>=0?"moving toward you":"moving away from you"} by ${Math.abs(n)} points.`,[
 ["Visit the seat","Put boots on the ground.",()=>effect(n>=0?4:-1,2,3,6,1,"Polling response")],
 ["Change the message","Try a sharper national line.",()=>effect(n>=0?3:4,n>=0?1:-2,4,0,6,"Polling response")],
 ["Ignore the poll","Stay focused on the long term.",()=>effect(0,4,1,0,0,"Polling response")]
 ]);
}
function localRadio(){
 choose("Local radio","A caller asks why your constituency should trust you.",[
 ["Answer directly","Give a clear local example.",()=>effect(3,4,2,6,2,"Local radio")],
 ["Attack the government's record","Turn the interview national.",()=>effect(2,-2,3,1,5,"Local radio")],
 ["Take callers' questions","Let residents set the agenda.",()=>effect(4,6,2,7,1,"Local radio")]
 ]);
}
function surpriseLetter(){
 let letters=["A student asks for more apprenticeships.","A pensioner asks about local buses.","A shop owner says footfall is falling.","A community group asks for a meeting.","A constituent praises your recent work."];
 let l=letters[Math.floor(Math.random()*letters.length)];
 choose("The postbag",l,[
 ["Reply personally","Take the issue seriously.",()=>effect(3,5,1,6,1,"Constituency postbag")],
 ["Pass it to the team","Delegate and keep working in Parliament.",()=>effect(1,2,2,2,0,"Constituency postbag")],
 ["Invite them in","Turn the letter into a local meeting.",()=>effect(4,6,3,8,2,"Constituency postbag")]
 ]);
}
function budget(x){if(x==="spend"){state.treasury=Math.max(0,state.treasury-10);effect(6,1,4,2,1,"Budget: public investment")}if(x==="tax"){state.treasury+=10;effect(-4,5,3,0,1,"Budget: revenue")}if(x==="growth"){state.treasury=Math.max(0,state.treasury-3);effect(5,2,5,0,4,"Budget: growth")}}
function treasuryBrief(){choose("Treasury briefing","The forecast changes your room for manoeuvre.",[["Act cautiously","Protect fiscal credibility.",()=>effect(2,6,2,0,0,"Treasury briefing")],["Take a growth gamble","Risk more for potential growth.",()=>effect(5,-2,6,0,3,"Treasury briefing")],["Delay","Wait for more information.",()=>effect(-3,-3,-1,0,-2,"Treasury briefing")]])}
function campaign(x){
 if(!state.election.active){toast("Start the campaign first.");return}
 if(x==="ground"){state.poll=clamp(state.poll+5);effect(4,3,5,6,0,"Campaign: ground operation")}
 if(x==="media"){state.poll=clamp(state.poll+4);effect(3,0,3,0,7,"Campaign: media")}
 if(x==="policy"){state.poll=clamp(state.poll+6);effect(6,-2,6,0,5,"Campaign: policy launch")}
 state.election.weeks=Math.min(4,state.election.weeks+1);
 addEvent("Campaign week advanced",`You are now in week ${state.election.weeks} of 4.`);
 save();
}
function startElection(){state.election={active:true,weeks:1,snap:false};addEvent("Election campaign begins","The four-week campaign is underway. Polling day is four weeks away.");save();dashboard()}
function runElection(){if(!state.election.active){toast("Start a campaign first.");return}let score=state.approval+state.trust+state.influence+state.poll+Math.floor(Math.random()*20)+(state.election.weeks>=4?15:0);let win=score>=155;state.election.active=false;if(win){state.majority=Math.max(1,Math.floor((score-120)/4));state.approval=clamp(state.approval+5);state.trust=clamp(state.trust+4);addEvent("Election result","You won enough support to form a government.");award("Mandate secured")}else{state.majority=0;state.approval=clamp(state.approval-6);addEvent("Election result","You lost the election. Continue in opposition or enter a leadership contest.");}advance(2);dashboard()}
function snap(){choose("Snap election","Polling can move quickly.",[["Call it","Take the country to the polls.",()=>{state.election={active:true,weeks:1,snap:true};effect(-2,1,5,0,3,"Snap election called")}],["Wait","Continue governing.",()=>effect(1,3,0,0,0,"Snap election avoided")]])}
function leadership(){let winner=Math.random()<.48?state.name:(Math.random()<.5?"The New Leader":"The Unity Candidate");if(winner===state.name){addEvent("Leadership election","You retained the leadership.");effect(3,4,4,0,1,"Leadership election")}else{state.lostLeadership=true;state.leader=winner;state.name=winner;state.cabinet=[];state.approval=48;state.trust=45;state.influence+=3;addEvent("Leadership election",`${winner} won. You continue as the new leader.`);save();dashboard()}}
function cabinetBuilder(){open(`<h2>Build your Cabinet</h2>${["Treasury","Foreign Affairs","Home Affairs","Health","Education","Transport"].map((x,i)=>`<div class="field"><label>${x}</label><input id="cab${i}" placeholder="Minister name"></div>`).join("")}<button class="primary" onclick="saveCabinet()">Appoint Cabinet</button> <button class="secondary" onclick="closeModal()">Cancel</button>`)}
function saveCabinet(){state.cabinet=[0,1,2,3,4,5].map(i=>document.getElementById("cab"+i).value.trim()).filter(Boolean);state.cabinetMode="custom";addEvent("Cabinet appointed",`${state.cabinet.length} ministers appointed.`);save();closeModal();dashboard()}
function historicalCabinet(){state.cabinet=HIST_CAB[state.leader]||HIST_CAB["Sir Keir Starmer"];state.cabinetMode="historical";addEvent("Historical Cabinet selected",`A ${state.leader} era Cabinet has been loaded.`);save();dashboard()}
function policy(){let p=["Increase NHS investment","Cut taxes for working households","Build more homes","Tighten migration rules","Invest heavily in green energy","Give councils more powers","Expand apprenticeships"][Math.floor(Math.random()*7)];choose("New party policy",`${state.party} proposes: ${p}.`,[["Like it","Add it to your preferred policies.",()=>{state.voterLikes.push(p);effect(5,3,2,0,1,"Policy liked")}],["Dislike it","This pushes you away.",()=>effect(-5,-1,-1,0,1,"Policy disliked")],["Unsure","Wait for more detail.",()=>effect(0,1,0,0,0,"Policy undecided")]])}
function switchParty(p){let old=state.party;state.party=p;addEvent("Party switch",`You switched from ${old} to ${p}.`);effect(0,-2,2,0,0,"Party switch")}
function writeReport(){let angles=["government pressure","a constituency dispute","an economic warning","a surprise Commons result","a Cabinet disagreement"];let a=angles[Math.floor(Math.random()*angles.length)];let r=`Day ${state.day}: I reported on ${a}, separating verified facts from political claims.`;state.reports.push(r);state.media=clamp(state.media+4);addEvent("Report filed",r);advance();dashboard()}
function realReport(){choose("Daily newsroom briefing","A fictionalised Westminster briefing: ministers are under pressure, opposition MPs are testing the government and voters are watching whether politicians follow through.",[["Report cautiously","Separate facts from claims.",()=>effect(2,5,2,0,6,"News report")],["Lead with conflict","Make the political clash the headline.",()=>effect(4,-2,3,0,7,"News report")],["Focus on voters","Put constituency voices first.",()=>effect(5,3,2,3,4,"News report")]])}
function lordAction(x){if(x==="scrutiny")effect(2,5,5,0,1,"Lords scrutiny");if(x==="amend")effect(3,4,6,0,2,"Lords amendment");if(x==="committee")effect(1,7,5,1,0,"Lords committee")}
function negotiate(){choose("Cross-party negotiation","A Bill is close to passing.",[["Accept compromise","Bring more peers with you.",()=>effect(3,8,5,0,0,"Lords negotiation")],["Hold your ground","Protect your position.",()=>effect(1,-2,7,0,1,"Lords negotiation")],["Broker wider deal","Build a broader agreement.",()=>effect(5,5,8,0,3,"Lords negotiation")]])}
function award(a){if(!state.achievements.includes(a)){state.achievements.push(a);toast("Achievement unlocked: "+a)}}
function restartCareer(){if(confirm("Start a completely new game for this career?"))newCareer(state.role)}
function hub(){document.getElementById("app").innerHTML=`<div class="page-title"><div><div class="eyebrow">Westminster</div><h1>The political day</h1></div><span class="pill">${state.role?ROLES[state.role]:"Spectator"}</span></div><section class="grid4">${stat("Approval",state.approval+"%")}${stat("Trust",state.trust+"%")}${stat("Influence",state.influence)}${stat("Polling",state.poll+"%")}</section><section class="section grid">${card("Commons","<p>PMQs, votes, committees and speeches.</p><button class='primary' onclick='state.role?dashboard():careers()'>Enter Commons</button>")} ${card("No. 10","<p>Decision room, Cabinet and leadership.</p><button class='primary' onclick='state.role=\"pm\";dashboard()'>Open Downing Street</button>")} ${card("Campaign HQ","<p>Marginal seats, polling and election strategy.</p><button class='primary' onclick='state.role=\"electioneer\";dashboard()'>Open campaign</button>")} ${card("Newsroom","<p>Write today's political story.</p><button class='primary' onclick='state.role=\"reporter\";dashboard()'>Open newsroom</button>")} ${card("Lords","<p>Scrutinise Bills and negotiate amendments.</p><button class='primary' onclick='state.role=\"lord\";dashboard()'>Enter Lords</button>")} ${card("Public Square","<p>See what voters are thinking and switch parties.</p><button class='primary' onclick='state.role=\"voter\";dashboard()'>Enter public square</button>")}</section>`;save()}
function surpriseOfDay(){
 let events=[
 ["Royal audience request","The Monarch asks for a private update before a major announcement.",()=>effect(3,6,2,0,1,"Surprise: royal audience")],
 ["Backbench revolt","A group of MPs threatens to vote against the government.",()=>effect(-3,-3,5,0,2,"Surprise: backbench revolt")],
 ["Front-page exclusive","A newspaper has obtained a leaked briefing.",()=>effect(-2,-1,2,0,8,"Surprise: newspaper leak")],
 ["Unexpected good news","A policy announcement receives a warmer response than expected.",()=>effect(6,4,4,1,5,"Surprise: good news")],
 ["Constituency hero","A local volunteer puts your area in the national spotlight.",()=>effect(4,5,2,8,3,"Surprise: constituency hero")],
 ["Opposition mistake","The opposition lands itself in trouble.",()=>effect(5,1,5,0,6,"Surprise: opposition mistake")]
 ];
 let e=events[Math.floor(Math.random()*events.length)];
 choose(e[0],"Politics has handed you an unexpected moment.",[["Handle it","Make the call.",e[2]],["Wait","Let the story develop.",()=>effect(-1,2,0,0,1,"Surprise: wait")],["Ask for advice","Bring trusted people into the room.",()=>effect(1,5,2,0,0,"Surprise: advice")]]);
}
function daily(){document.getElementById("app").innerHTML=`<div class="page-title"><div><div class="eyebrow">Daily brief</div><h1>What would you do today?</h1></div><span class="pill">Day ${state.day} · Month ${state.month}</span></div><div class="split">${card("Westminster briefing",`<div class="notice"><b>Morning briefing</b><br>Parliament is preparing for a difficult sitting. Ministers, opposition MPs, journalists and voters are watching the next move.</div><div class="list" style="margin-top:14px"><button class="choice" onclick="dailyChoice('decisive')"><strong>Act decisively</strong><span>Move before the story moves you.</span></button><button class="choice" onclick="dailyChoice('consult')"><strong>Consult first</strong><span>Build support before deciding.</span></button><button class="choice" onclick="dailyChoice('wait')"><strong>Wait</strong><span>See what develops.</span></button></div>`)}${card("Career timeline",`<div class="timeline">${state.history.slice(-10).reverse().map(x=>`<div>${esc(x)}</div>`).join("")||"<div>No career timeline yet.</div>"}</div>`)}</div>`}
function dailyChoice(x){let d={decisive:[5,0,4],consult:[2,5,2],wait:[-2,2,-1]}[x];effect(d[0],d[1],d[2],0,1,"Daily decision")}
function newspaper(){let headlines=["Government faces pressure over public services","Opposition demands answers in Commons","Backbenchers test party discipline","New polling puts marginal seats under spotlight","Treasury statement attracts mixed reaction","Lords prepare major amendments"];let h=headlines[Math.floor(Math.random()*headlines.length)];document.getElementById("app").innerHTML=`<div class="page-title"><div><div class="eyebrow">The Westminster Chronicle</div><h1>Today's front page</h1></div><span class="pill">Special edition</span></div><section class="card blue"><div class="eyebrow">Lead story</div><h2 style="font-size:38px">${h}</h2><p>Politics moves quickly. Your choices can turn a briefing into a headline, a headline into a crisis, or a crisis into a political comeback.</p><button class="primary" onclick="daily()">Read the briefing</button></section><section class="section grid">${card("Parliament","<p>Questions, votes and committee battles.</p>")} ${card("Country","<p>Constituencies and public opinion shape the next story.</p>")} ${card("Campaign","<p>Polling and messaging can move the numbers.</p>")}</section>`}
function dailyChoiceDummy(){}
function sharePage(){let text=state.role?`My career in The Commons: ${state.name} — ${ROLES[state.role]} — ${state.party}. Approval ${state.approval}%, Trust ${state.trust}%, Influence ${state.influence}.`:"Start a career in The Commons.";document.getElementById("app").innerHTML=`<div class="page-title"><div><div class="eyebrow">Share</div><h1>Your political story</h1></div></div>${card("Career card",`<h2>${esc(state.name||"The Commons")}</h2><p>${esc(text)}</p><div class="grid4">${stat("Approval",state.approval+"%")}${stat("Trust",state.trust+"%")}${stat("Influence",state.influence)}${stat("Achievements",state.achievements.length)}</div><div class="row" style="margin-top:15px"><button class="primary" onclick="share()">Share</button><button class="secondary" onclick="copyShare()">Copy text</button></div>`)}`}
function share(){let text=`My career in The Commons: ${state.name} — ${ROLES[state.role]} — ${state.party}. Approval ${state.approval}%, Trust ${state.trust}%, Influence ${state.influence}.`;if(navigator.share)navigator.share({title:"The Commons career",text}).catch(()=>{});else copyShare()}
function copyShare(){let text=`My career in The Commons: ${state.name} — ${ROLES[state.role]} — ${state.party}. Approval ${state.approval}%, Trust ${state.trust}%, Influence ${state.influence}.`;if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast("Career summary copied."));else toast(text)}
async function settings(){
  const appearance = "<p>Bold blue editorial mode, with a dark option.</p><button class='primary' onclick=\"setTheme('light')\">Light</button> <button class='secondary' onclick=\"setTheme('dark')\">Dark</button>";
  const saves = "<p>Your career autosaves in this browser. If Discord is connected, you can also sync it to Supabase.</p><button class='secondary' onclick='exportSave()'>Export save</button> <button class='secondary' onclick='importSave()'>Import save</button>";
  const achievements = `<p>${state.achievements.length ? state.achievements.map(a=>`<span class='pill'>${esc(a)}</span>`).join(" ") : "No achievements yet. Win an election or build influence."}</p>`;
  const resetBox = `<p>This deletes the local career save. Your cloud save is not deleted.</p><button class="danger" onclick="reset()">Delete local save</button>`;
  document.getElementById("app").innerHTML =
    `<div class="page-title"><div><div class="eyebrow">Settings</div><h1>Game settings</h1></div></div>
     <section class="grid">
       ${card("Appearance",appearance)}
       ${card("Save",saves)}
       ${card("Achievements",achievements)}
       ${card("Discord & Cloud",await accountPanel())}
     </section>
     <section class="section">${card("Reset",resetBox)}</section>`;
}
function setTheme(t){state.theme=t;save();applyTheme();settings()}
function exportSave(){let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="the-commons-save.json";a.click();URL.revokeObjectURL(a.href)}
function importSave(){let i=document.createElement("input");i.type="file";i.accept=".json";i.onchange=()=>{let r=new FileReader();r.onload=()=>{try{state=Object.assign({},DEFAULT,JSON.parse(r.result));save();applyTheme();dashboard();toast("Save imported.")}catch(e){toast("Invalid save file.")}};r.readAsText(i.files[0])};i.click()}
function reset(){localStorage.removeItem("commons_deluxe");state=structuredClone(DEFAULT);applyTheme();home()}
window.addEventListener("commons-auth-changed",async e=>{
  if(e.detail?.user){
    await syncSaveToCloud();
    if(document.getElementById("app") && document.getElementById("app").innerHTML.includes("Game settings")) settings();
  }
});
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
if(state.role)dashboard();else home();

function nextDay(){careerDayTick();toast('A new day begins.');dashboard();}

function careerAction(action){
  if(action==="election") return startGeneralElection();
  if(action==="leadership") return leadershipContest();
  if(action==="pmqs") return pmqSession();
  if(action==="twitter") return twitterPost();
  if(action==="royal") return formGovernmentAudience();
  if(action==="stateopening") return stateOpening();
  if(action==="day") return nextDay();
}
