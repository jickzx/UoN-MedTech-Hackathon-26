// ── Role switching ─────────────────────────────────────────────
function switchRole(r){
  document.getElementById('patient-view').classList.toggle('active',r==='patient');
  document.getElementById('clinician-view').classList.toggle('active',r==='clinician');
  document.querySelectorAll('.role-btn').forEach((b,i)=>b.classList.toggle('active',(i===0&&r==='patient')||(i===1&&r==='clinician')));
}

// ── Patient tabs ───────────────────────────────────────────────
function ptTab(id,el){
  document.querySelectorAll('.pp').forEach(p=>p.style.display='none');
  document.getElementById('pt-'+id).style.display='block';
  document.querySelectorAll('#patient-view .sb-item').forEach(s=>s.classList.remove('active'));
  if(el)el.classList.add('active');
}
// ── Clinician tabs ─────────────────────────────────────────────
function clTab(id,el){
  document.querySelectorAll('.cl-p').forEach(p=>p.style.display='none');
  document.getElementById('cl-'+id).style.display='block';
  document.querySelectorAll('#clinician-view .sb-item').forEach(s=>s.classList.remove('active'));
  if(el)el.classList.add('active');
}
// ── Mood ───────────────────────────────────────────────────────
let moodFeedbackTimer=null;
function selMood(b){
  document.querySelectorAll('.mood-btn').forEach(x=>x.classList.remove('sel'));
  b.classList.add('sel');
  const feedback=document.getElementById('mood-feedback');
  if(!feedback)return;
  feedback.classList.add('show');
  clearTimeout(moodFeedbackTimer);
  moodFeedbackTimer=setTimeout(()=>feedback.classList.remove('show'),3000);
}

// ── Checklist ──────────────────────────────────────────────────
const completedExercises=new Set();
let activeExerciseName='';

function setExerciseCardState(name,isComplete){
  document.querySelectorAll('.ex-card[data-exercise]').forEach(card=>{
    if(card.dataset.exercise!==name)return;
    card.classList.toggle('is-complete',isComplete);
    const state=card.querySelector('.ex-state');
    if(state)state.textContent=isComplete?'Completed':'Tap to play demo';
  });
}

function setChecklistState(name,isComplete){
  document.querySelectorAll('#pt-checklist .cl-item[data-exercise]').forEach(row=>{
    if(row.dataset.exercise!==name)return;
    const box=row.querySelector('.chk');
    const lbl=row.querySelector('.cl-lbl');
    const act=row.querySelector('.cl-act');
    if(!box||!lbl||!act)return;
    if(isComplete){
      box.classList.add('done');box.textContent='✓';
      lbl.classList.add('done');act.textContent='Done';act.style.color='var(--text-muted)';
    } else {
      box.classList.remove('done');box.textContent='\u200B';
      lbl.classList.remove('done');
      act.textContent=row.dataset.startLabel||'Mark done';
      act.style.color='var(--green-deeper)';
    }
  });
}

function updateExerciseCompletion(name,isComplete){
  if(!name)return;
  if(isComplete)completedExercises.add(name);
  else completedExercises.delete(name);
  setExerciseCardState(name,isComplete);
  setChecklistState(name,isComplete);
}

function syncExerciseCards(){
  document.querySelectorAll('#pt-checklist .cl-item[data-exercise]').forEach(row=>{
    const box=row.querySelector('.chk');
    if(box&&box.classList.contains('done'))completedExercises.add(row.dataset.exercise);
  });
  document.querySelectorAll('.ex-card[data-exercise]').forEach(card=>{
    setExerciseCardState(card.dataset.exercise,completedExercises.has(card.dataset.exercise));
  });
}

function getExerciseEmbedUrl(videoId){
  return 'https://www.youtube-nocookie.com/embed/'+videoId+'?rel=0&modestbranding=1&playsinline=1';
}

function renderExerciseMedia(name,videoId){
  const media=document.getElementById('ex-media');
  if(!media)return;
  media.innerHTML='';
  const frame=document.createElement('div');
  frame.className='ex-video-frame';
  frame.innerHTML='<iframe src="'+getExerciseEmbedUrl(videoId)+'" title="'+name+' exercise video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
  media.appendChild(frame);
}

function resetExerciseMedia(){
  const media=document.getElementById('ex-media');
  if(media)media.innerHTML='';
}

function syncCompleteButton(name){
  const btn=document.getElementById('ex-complete-btn');
  if(!btn)return;
  const isComplete=completedExercises.has(name);
  btn.textContent=isComplete?'✓ Marked as Complete':'✓ Mark Exercise as Complete';
  btn.style.background=isComplete?'var(--risk-green)':'';
}

function toggleCheck(row){
  const box=row.querySelector('.chk'),lbl=row.querySelector('.cl-lbl');
  const done=box.classList.contains('done');
  if(!done){box.classList.add('done');box.textContent='✓';lbl.classList.add('done');}
  else{box.classList.remove('done');box.textContent='\u200B';lbl.classList.remove('done');}
  const act=row.querySelector('.cl-act');
  if(act){
    act.textContent=!done?'Done':(row.dataset.startLabel||'Mark done');
    act.style.color=!done?'var(--text-muted)':'var(--green-deeper)';
  }
  if(row.dataset.exercise)updateExerciseCompletion(row.dataset.exercise,!done);
}

// ── Timer state ────────────────────────────────────────────────
let timerSecs=90, timerMax=90, timerInterval=null, timerRunning=false;

function updateTimerDisplay(s){
  const m=Math.floor(s/60),sec=s%60;
  const el=document.getElementById('timer-display');
  el.textContent=String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
  el.style.color=s===0?'var(--risk-green)':'var(--green-deeper)';
}

function toggleTimer(){
  if(timerRunning){
    clearInterval(timerInterval);timerRunning=false;
    document.getElementById('timer-btn').textContent='▶ Resume Timer';
  } else {
    if(timerSecs===0){timerSecs=timerMax;updateTimerDisplay(timerSecs);}
    timerRunning=true;
    document.getElementById('timer-btn').textContent='⏸ Pause Timer';
    timerInterval=setInterval(()=>{
      timerSecs--;updateTimerDisplay(timerSecs);
      if(timerSecs<=0){
        clearInterval(timerInterval);timerRunning=false;
        document.getElementById('timer-btn').textContent='✓ Rest Complete — Start Next Set';
        document.getElementById('timer-btn').style.background='var(--risk-green)';
      }
    },1000);
  }
}

function resetTimer(){
  clearInterval(timerInterval);timerRunning=false;
  timerSecs=timerMax;updateTimerDisplay(timerSecs);
  const btn=document.getElementById('timer-btn');
  btn.textContent='▶ Start Timer';btn.style.background='';
}

// ── Rep tracker ────────────────────────────────────────────────
let repCounts=[];
function buildRepGrid(sets,targetReps){
  repCounts=Array(sets).fill(0);
  const grid=document.getElementById('set-grid');
  grid.innerHTML='';
  for(let i=0;i<sets;i++){
    const row=document.createElement('div');row.className='set-row';
    row.innerHTML=`<div class="set-lbl">Set ${i+1}</div>
      <div class="rep-btns">
        <button class="rep-btn" onclick="changeRep(${i},-1)">−</button>
        <div class="rep-count" id="rc-${i}">0</div>
        <button class="rep-btn" onclick="changeRep(${i},1)">+</button>
      </div>
      <div class="rep-target">Target: ${targetReps}</div>
      <button class="set-done-btn pending" id="sd-${i}" onclick="markSetDone(${i},${targetReps})">Mark done</button>`;
    grid.appendChild(row);
  }
}

function changeRep(i,delta){
  repCounts[i]=Math.max(0,repCounts[i]+delta);
  document.getElementById('rc-'+i).textContent=repCounts[i];
}

function markSetDone(i,target){
  const btn=document.getElementById('sd-'+i);
  if(repCounts[i]===0)repCounts[i]=target;
  document.getElementById('rc-'+i).textContent=repCounts[i];
  btn.textContent='✓ Done ('+repCounts[i]+' reps)';
  btn.className='set-done-btn complete';
}

// ── Open exercise modal ────────────────────────────────────────
function openEx(name,videoId,meta,mode,restSecs,sets,reps,steps){
  activeExerciseName=name;
  document.getElementById('ex-title').textContent=name;
  document.getElementById('ex-meta-lbl').textContent=meta;
  renderExerciseMedia(name,videoId);
  syncCompleteButton(name);
  // steps
  const ul=document.getElementById('ex-steps');ul.innerHTML='';
  steps.forEach((s,i)=>{
    const li=document.createElement('li');li.className='step-item';
    li.innerHTML=`<span class="step-num">${i+1}</span><span>${s}</span>`;
    ul.appendChild(li);
  });
  // mode
  const timerSec=document.getElementById('timer-section');
  const repSec=document.getElementById('rep-section');
  if(mode==='timed'&&restSecs>0){
    timerSec.style.display='block';repSec.style.display='none';
    clearInterval(timerInterval);timerRunning=false;
    timerSecs=restSecs;timerMax=restSecs;
    updateTimerDisplay(timerSecs);
    const btn=document.getElementById('timer-btn');
    btn.textContent='▶ Start Timer';btn.style.background='';
  } else {
    timerSec.style.display='none';repSec.style.display='block';
    buildRepGrid(sets,reps);
  }
  document.getElementById('ex-modal').style.display='flex';
}

function markExDone(){
  updateExerciseCompletion(activeExerciseName,true);
  syncCompleteButton(activeExerciseName);
  closeModal('ex-modal');
}

// ── Patient detail modal ───────────────────────────────────────
function openPt(name,cond,adh,risk,last,status){
  document.getElementById('pm-name').textContent=name;
  document.getElementById('pm-cond').textContent=cond;
  document.getElementById('pm-adh').textContent=adh+'%';
  document.getElementById('pm-last').textContent=last;
  const rc=risk==='high'?'rag-r':risk==='amber'?'rag-a':'rag-g';
  const rl=risk==='high'?'High Risk':risk==='amber'?'Medium Risk':'Low Risk';
  document.getElementById('pm-badges').innerHTML=`<span class="rag ${rc}"><span class="rdot"></span>${rl}</span><span class="tag">${cond}</span><span class="tag">${status}</span>`;
  const msgs={high:`<div class="ai-head"><span class="ai-chip">AI Analysis</span></div><p><strong>${name}</strong> has a <strong style="color:var(--red)">65% risk of poor adherence</strong> based on early behaviour patterns. Immediate outreach within 48 hours is strongly recommended.</p>`,amber:`<div class="ai-head"><span class="ai-chip">AI Analysis</span></div><p><strong>${name}</strong> shows a <strong style="color:var(--amber)">declining adherence trend</strong>. A check-in this week is recommended to re-engage before the pattern worsens.</p>`,low:`<div class="ai-head"><span class="ai-chip">AI Analysis</span></div><p><strong>${name}</strong> is on track. <strong style="color:var(--risk-green)">Low risk of non-adherence</strong> with a positive recovery trajectory. No immediate intervention required.</p>`};
  document.getElementById('pm-ai').innerHTML=msgs[risk]||msgs.low;
  document.getElementById('pt-modal').style.display='flex';
}

// ── Modal helpers ──────────────────────────────────────────────
function closeModal(id){
  document.getElementById(id).style.display='none';
  if(id==='ex-modal'){
    clearInterval(timerInterval);timerRunning=false;
    resetExerciseMedia();
    activeExerciseName='';
    const btn=document.getElementById('ex-complete-btn');
    if(btn){btn.textContent='✓ Mark Exercise as Complete';btn.style.background='';}
  }
}
function closeBg(e,id){if(e.target.id===id)closeModal(id);}

syncExerciseCards();
