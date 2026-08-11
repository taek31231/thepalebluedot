/* =========================================================
   The Pale Blue Dot — 허브 스크립트

   ▣ 활동을 추가하려면 아래 ACTIVITIES 배열에 객체 하나만 넣으면 됩니다.
     file   : 활동 HTML 파일 이름
     track  : 'mid3' | 'int1' | 'int2'   (필터 및 배지 색상)
     glyph  : 카드 우측 상단 아이콘
     title  : 활동 이름
     unit   : 교육과정 영역 · 단원
     goal   : 학습 목표 한 줄 (학생이 카드를 고르는 기준)
     time   : 예상 소요 시간
     type   : 활동 유형
   ========================================================= */

const TRACK_LABEL = {
    mid3: '중3 과학',
    int1: '통합과학 1',
    int2: '통합과학 2'
};

const ACTIVITIES = [
    {
        file:  'cloud_experiment.html',
        track: 'mid3',
        glyph: '☁️',
        title: '단열 팽창과 구름 발생',
        unit:  '기권과 날씨 · 구름의 생성',
        goal:  '페트병을 쥐었다 놓으며 압력을 실측하고, 압력이 저절로 회복되는 폭으로 공기가 몇 도까지 차가워졌는지 계산합니다.',
        time:  '2차시',
        type:  '실측 데이터 분석 · Vernier'
    },
    {
        file:  'extratropical_cyclone.html',
        track: 'mid3',
        glyph: '🌀',
        title: '중위도 저기압과 전선',
        unit:  '날씨와 기후변화 · 저기압과 날씨 [9과17-04]',
        goal:  '실제 관측 자료를 불러와 저기압이 지나간 날의 기압·기온·풍향 변화를 지점별로 비교하고, 전선이 언제 지나갔는지 찾아냅니다.',
        time:  '2차시',
        type:  '실관측 데이터 해석 · 토론'
    },
    {
        file:  'element_origin.html',
        track: 'int1',
        glyph: '⚛️',
        title: '원소의 기원',
        unit:  '물질과 규칙성 · 원소 형성 [10통과1-02-01·02]',
        goal:  'CD 분광기로 스펙트럼을 관찰해 원소의 지문을 읽고, 우주·지구·내 몸의 원소 구성을 비교해 내 몸을 이루는 원소의 출생지를 추적합니다.',
        time:  '2차시',
        type:  '분광 관찰 · 데이터 비교'
    },
    {
        file:  'star_factory.html',
        track: 'int1',
        glyph: '🔥',
        title: '우주의 원소 공장',
        unit:  '물질과 규칙성 · 원소 형성과 별의 진화 [10통과1-02-01·02]',
        goal:  '헬륨 존재비 자료로 빅뱅의 증거를 직접 판별하고, 중심 온도가 어디까지 원소를 만들 수 있는지 확인해 별의 질량이 운명을 가르는 까닭을 설명합니다.',
        time:  '2차시',
        type:  '자료 해석 · 가설 판별'
    },
    {
        file:  'earthsystem.html',
        track: 'int1',
        glyph: '🌍',
        title: '지구 시스템의 상호작용',
        unit:  '시스템과 상호작용 · 지구 시스템 [10통과1-03-01]',
        goal:  '권역의 층 구조와 에너지 흐름을 확인한 뒤, 피나투보 화산·동일본 지진 같은 실제 사건이 어떤 고리를 거쳐 지구 전체로 번지는지 직접 추적해 논증합니다.',
        time:  '2차시',
        type:  '자료 해석 · 사건 논증'
    },
    {
        file:  'matter_cycle.html',
        track: 'int1',
        glyph: '♻️',
        title: '물질의 순환',
        unit:  '시스템과 상호작용 · 물의 순환과 탄소의 순환 [10통과1-03-01]',
        goal:  '저장소와 흐름의 수지를 직접 맞춰 체류 시간을 구하고, 탄소의 흐름 중 짝이 없는 하나가 왜 균형을 무너뜨리는지 논증합니다.',
        time:  '2차시',
        type:  '수지 계산 · 자료 해석'
    },
    {
        file:  'plate_tectonics.html',
        track: 'int1',
        glyph: '🌋',
        title: '판구조론',
        unit:  '시스템과 상호작용 · 판구조론과 지각 변동 [10통과1-03-02]',
        goal:  'USGS 실시간 지진 자료에서 판 경계를 스스로 찾아내고, 진원 깊이와 판의 이동 두 증거로 경계의 종류를 판정한 뒤 모의실험으로 지형이 만들어지는 과정을 확인합니다.',
        time:  '2~3차시',
        type:  '실시간 데이터 · 모의실험'
    },
    {
        file:  'geoperiod.html',
        track: 'int2',
        glyph: '🦴',
        title: '화석과 지질 시대',
        unit:  '변화와 다양성 · 지질시대의 생물과 화석 [10통과2-01-01]',
        goal:  '화석의 종류와 화석이 되는 조건을 분류로 익히고, 세계 고생물 데이터베이스에서 실제 생존 기간과 발견 장소를 불러와 표준화석과 시상화석을 갈라냅니다. 시대별 환경과 생물은 복원도·실물 사진으로 확인합니다.',
        time:  '2차시',
        type:  '분류 · 실데이터 지도 · PBDB'
    },
    {
        file:  'exodus.html',
        track: 'int2',
        glyph: '💥',
        title: '대멸종과 생물 다양성',
        unit:  '변화와 다양성 · 지질시대 환경 변화와 대멸종 [10통과2-01-01]',
        goal:  '다양성 곡선에서 다섯 번의 대멸종을 직접 찾아내고, 백악기 말과 페름기 말의 원인을 두고 경쟁하는 가설들을 증거로 하나씩 판정해 타당성을 평가합니다.',
        time:  '2차시',
        type:  '가설 평가 · 증거 판정'
    },
    {
        file:  'radiation_balance.html',
        track: 'int2',
        glyph: '🌡️',
        title: '복사 평형과 지구 온난화',
        unit:  '환경과 에너지 · 온실기체와 지구 온난화 [10통과2-02-03]',
        goal:  '태양 복사를 100으로 둔 지구 열수지의 빈칸을 수지 원리만으로 직접 계산해 채우고, 온실기체가 늘 때 왜 더 높은 온도에서 새 평형이 생기는지 단계별로 추적합니다.',
        time:  '2차시',
        type:  '수지 계산 · 단계 추론'
    },
    {
        file:  'elnino.html',
        track: 'int2',
        glyph: '🌀',
        title: '사막화와 엘니뇨',
        unit:  '환경과 에너지 · 대기와 해양의 상호작용 [10통과2-02-03]',
        goal:  '입자 2,600개가 흐르는 3D 지구에서 대기 대순환을 눈으로 따라가고, earth 사이트로 지금 이 순간의 바람을 확인합니다. 위성 사진으로 사막의 위도를 확인한 뒤, 실제 해수면 온도를 불러와 NINO 3.4 구역으로 직접 엘니뇨를 판정하고 기상청 발표와 맞춰 봅니다.',
        time:  '3차시',
        type:  '3D 입자 · 실시간 관측 · 시뮬레이션'
    }
];

/* 준비 중인 활동 — 센서 기반 탐구로 개발 예정 */
const UPCOMING = [
    {
        glyph: '📈',
        title: '지진파 주시 곡선 분석',
        goal:  '마이크로비트 가속도 센서로 진동을 측정하고, P파와 S파의 도달 시간 차로 진원 거리를 구합니다.',
        note:  '마이크로비트 · 가속도 센서'
    },
    {
        glyph: '🔆',
        title: '태양 고도와 일사량',
        goal:  '조도 센서를 각도별로 기울여 측정하고, 계절 변화가 기온에 미치는 영향을 데이터로 설명합니다.',
        note:  '마이크로비트 · 조도 센서'
    },
    {
        glyph: '🧭',
        title: '지구 자기장 측정',
        goal:  '스마트폰 자기 센서로 편각과 복각을 측정하고, 위도에 따른 자기장 변화를 지도에 기록합니다.',
        note:  '스마트폰 · 자기 센서'
    },
    {
        glyph: '🌊',
        title: '엘니뇨와 라니냐',
        goal:  '실제 해수면 온도 관측 자료를 불러와 평년과 비교하고, 무역풍 변화와의 관계를 분석합니다.',
        note:  '기상 관측 실데이터'
    }
];

/* ========================= 과목 정의 ========================= */
const TRACKS = [
  {id:'mid3', n:'중학교 3학년 과학', short:'중3 과학', glyph:'🌦️', color:'var(--mid3)',
   d:'기권과 날씨, 저기압과 전선을 실제 관측 자료로 다룹니다. 센서와 실측 데이터를 쓰는 활동이 중심입니다.'},
  {id:'int1', n:'통합과학 1', short:'통합과학 1', glyph:'🌌', color:'var(--int1)',
   d:'물질과 규칙성, 시스템과 상호작용. 원소의 기원부터 판구조론까지 지구와 우주를 관통합니다.'},
  {id:'int2', n:'통합과학 2', short:'통합과학 2', glyph:'🌏', color:'var(--int2)',
   d:'변화와 다양성, 환경과 에너지. 화석과 지질 시대, 대멸종, 지구 온난화와 엘니뇨를 다룹니다.'}
];
const TRACK_OF = id => TRACKS.find(t=>t.id===id);

/* ========================= 상태 ========================= */
let curTrack  = null;    // 목록 화면에서 보고 있는 과목
let sideTrack = null;    // 사이드바에 펼쳐 둔 과목 (활동 실행 중에도 따로 바꿀 수 있음)
let curFile   = null;    // 실행 중인 활동 파일

/* ========================= 도우미 ========================= */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const countOf = id => ACTIVITIES.filter(a=>a.track===id).length;

/* ========================= 사이드바 ========================= */
function renderSidebar(){
  $('track-list').innerHTML = TRACKS.map(t=>
    '<button class="track-btn'+(sideTrack===t.id?' on':'')+'" data-track="'+t.id+'">'+
      '<span class="tdot" style="background:'+t.color+'"></span>'+
      '<span class="tn">'+t.short+'</span>'+
      '<span class="tc">'+countOf(t.id)+'</span>'+
    '</button>').join('');

  const host = $('side-scroll');
  if(!sideTrack){
    host.innerHTML = '<div class="side-empty">과목을 고르면 그 과목의 활동이 여기에 나옵니다. '+
      '활동을 하는 중에도 이 목록에서 바로 다른 활동으로 옮겨 갈 수 있습니다.</div>';
    return;
  }
  const list = ACTIVITIES.filter(a=>a.track===sideTrack);
  host.innerHTML =
    '<div class="side-title" style="padding:0 4px 8px">'+TRACK_OF(sideTrack).short+' · '+list.length+'개</div>'+
    list.map(a=>
      '<a class="side-item'+(curFile===a.file?' on':'')+'" href="#run/'+a.file+'">'+
        '<span class="sg">'+a.glyph+'</span>'+
        '<span class="sb"><span class="st">'+esc(a.title)+'</span>'+
        '<span class="su">'+esc(a.time)+' · '+esc(a.type)+'</span></span>'+
      '</a>').join('');
}

/* ========================= 홈 ========================= */
function renderHome(){
  $('track-cards').innerHTML = TRACKS.map(t=>
    '<a class="track-card" href="#track/'+t.id+'">'+
      '<span class="tcbar" style="background:'+t.color+'"></span>'+
      '<span class="tcg">'+t.glyph+'</span>'+
      '<h3>'+t.n+'</h3><p>'+t.d+'</p>'+
      '<span class="tcn" style="color:'+t.color+'">활동 '+countOf(t.id)+'개 보기 →</span>'+
    '</a>').join('');
  const types = new Set(ACTIVITIES.map(a=>a.type.split(' · ')[0]));
  $('stat-row').innerHTML =
    '<div><b>'+ACTIVITIES.length+'</b><span>전체 활동</span></div>'+
    '<div><b>'+TRACKS.length+'</b><span>과목</span></div>'+
    '<div><b>'+UPCOMING.length+'</b><span>준비 중</span></div>'+
    '<div><b>'+types.size+'</b><span>활동 유형</span></div>';
}

/* ========================= 과목별 목록 ========================= */
function renderTrack(id){
  const t = TRACK_OF(id); if(!t) { location.hash='home'; return; }
  const list = ACTIVITIES.filter(a=>a.track===id);
  $('track-title').textContent = t.n;
  $('track-count').textContent = '활동 '+list.length+'개';
  $('track-desc').textContent = t.d;
  $('card-grid').innerHTML = list.map(a=>
    '<a class="card" href="#run/'+a.file+'">'+
      '<div class="card-top">'+
        '<span class="badge badge-'+a.track+'">'+TRACK_LABEL[a.track]+'</span>'+
        '<span class="card-glyph" aria-hidden="true">'+a.glyph+'</span>'+
      '</div>'+
      '<h3 class="card-title">'+esc(a.title)+'</h3>'+
      '<p class="card-unit">'+esc(a.unit)+'</p>'+
      '<p class="card-goal">'+esc(a.goal)+'</p>'+
      '<div class="card-meta"><span>⏱ '+esc(a.time)+'</span><span>'+esc(a.type)+'</span></div>'+
    '</a>').join('');

  const soon = (id==='int1'||id==='mid3') ? UPCOMING : [];
  $('soon-wrap').style.display = soon.length ? 'block' : 'none';
  if(soon.length) $('soon-grid').innerHTML = soon.map(u=>
    '<div class="card is-soon">'+
      '<div class="card-top"><span class="badge-soon">준비 중</span>'+
      '<span class="card-glyph" aria-hidden="true">'+u.glyph+'</span></div>'+
      '<h3 class="card-title">'+esc(u.title)+'</h3>'+
      '<p class="card-goal">'+esc(u.goal)+'</p>'+
      '<div class="card-meta"><span>'+esc(u.note)+'</span></div>'+
    '</div>').join('');
}

/* ========================= 활동 실행 ========================= */
function openActivity(file){
  const meta = ACTIVITIES.find(a=>a.file===file);
  if(!meta){ location.hash='home'; return; }
  curTrack = meta.track; curFile = meta.file;
  if(!sideTrack) sideTrack = meta.track;
  $('run-title').textContent = meta.title;
  const badge = $('run-badge');
  badge.textContent = TRACK_LABEL[meta.track];
  badge.className = 'badge badge-'+meta.track;
  $('run-newtab').setAttribute('href', meta.file);
  $('run-back').setAttribute('href', '#track/'+meta.track);
  const frame = $('content-frame');
  if(frame.getAttribute('src') !== meta.file) frame.setAttribute('src', meta.file);
  show('run');
}

/* ========================= 패널 전환 ========================= */
function show(name){
  ['home','track','run','info'].forEach(p=>
    $('panel-'+p).classList.toggle('active', p===name));
  document.querySelectorAll('.nav-link').forEach(l=>
    l.classList.toggle('is-active',
      (l.dataset.nav==='info' && name==='info') ||
      (l.dataset.nav==='home' && name!=='info')));
  if(name!=='run'){
    const f=$('content-frame');
    if(f.getAttribute('src')) f.setAttribute('src','');
    curFile=null;
  }
  if(window.innerWidth<=900) closeSide();
}

/* ========================= 라우팅 ========================= */
function route(){
  const h = decodeURIComponent(location.hash.slice(1));
  if(h.startsWith('run/')){ openActivity(h.slice(4)); renderSidebar(); return; }
  if(h.startsWith('track/')){
    curTrack = h.slice(6); curFile=null; sideTrack = curTrack;
    if(!TRACK_OF(curTrack)){ location.hash='home'; return; }
    renderTrack(curTrack); show('track'); renderSidebar();
    $('panel-track').querySelector('.scrollpane').scrollTop=0; return;
  }
  if(h==='info'){ show('info'); renderSidebar();
    $('panel-info').querySelector('.scrollpane').scrollTop=0; return; }
  /* 이전 방식(#파일명)으로 들어온 링크 호환 */
  if(h && ACTIVITIES.some(a=>a.file===h)){ location.hash='run/'+h; return; }
  curTrack=null; curFile=null; sideTrack=null;
  renderHome(); show('home'); renderSidebar();
  $('panel-home').querySelector('.scrollpane').scrollTop=0;
}

/* ========================= 사이드바 열닫기 (모바일) ========================= */
function closeSide(){
  $('sidebar').classList.remove('open');
  $('side-mask').classList.remove('on');
}

/* ========================= 시작 ========================= */
document.addEventListener('DOMContentLoaded', ()=>{
  $('track-list').addEventListener('click', e=>{
    const b = e.target.closest('[data-track]'); if(!b) return;
    if($('panel-run').classList.contains('active')){
      /* 활동을 보는 중에는 사이드바 목록만 바꾸고 화면은 유지한다 */
      sideTrack = b.dataset.track;
      renderSidebar();
    } else {
      location.hash = 'track/'+b.dataset.track;
    }
  });
  $('side-toggle').addEventListener('click', ()=>{
    $('sidebar').classList.toggle('open');
    $('side-mask').classList.toggle('on');
  });
  $('side-mask').addEventListener('click', closeSide);
  $('side-scroll').addEventListener('click', ()=>{
    if(window.innerWidth<=900) closeSide();
  });
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && $('panel-run').classList.contains('active'))
      location.hash = 'track/'+(curTrack||'int2');
  });
  renderHome();
  route();
});
