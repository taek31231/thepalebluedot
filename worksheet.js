/* =========================================================
   worksheet.js — 학습기록 활동지 모듈 (공용)

   화면용 레이아웃(100vh · overflow:hidden · 탭 전환)은 그대로 두고,
   출력할 때만 별도의 A4 문서를 만들어 그것만 내보낸다.

   내보내는 방법 세 가지
     ① 인쇄 / PDF 저장 — 브라우저 내장 기능. 글자가 벡터로 들어가 가장 깨끗하다.
     ② HTML 파일 저장  — 어디서나 열리는 단독 문서. 모바일에서 가장 확실하다.
     ③ 텍스트 파일 저장 — 가장 가볍다.

   사용법
     Worksheet.mount('ws-actions', blank => wsConfig(blank), () => '파일이름');
   또는
     Worksheet.print(cfg) / Worksheet.saveHTML(cfg, name) / Worksheet.download(cfg, name)
   ========================================================= */
window.Worksheet = (function () {

  const esc = s => String(s ?? '').replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 활동지 본문 스타일 (인쇄와 HTML 저장이 함께 쓴다) ---------- */
  const SHEET_CSS = `
#ws-print{font-size:9pt;line-height:1.55;color:#000;}
#ws-print *{font-family:'Pretendard',-apple-system,'Malgun Gothic',sans-serif;color:#000;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;box-shadow:none;}

#ws-print .ws-head{border-bottom:2pt solid #000;padding-bottom:6pt;margin-bottom:10pt;}
#ws-print .ws-head h1{font-size:12.5pt;font-weight:800;letter-spacing:-.02em;margin-bottom:2pt;}
#ws-print .ws-head .ws-sub{font-size:8.2pt;color:#333;margin-bottom:5pt;}
#ws-print .ws-head .ws-std{font-size:7.8pt;color:#444;border:.6pt solid #999;
  border-radius:2pt;padding:3pt 6pt;display:inline-block;line-height:1.45;white-space:pre-line;}

#ws-print table.ws-id{width:100%;border-collapse:collapse;margin-top:6pt;font-size:9pt;
  table-layout:fixed;word-break:break-word;}
#ws-print table.ws-id th,#ws-print table.ws-id td{border:.6pt solid #666;padding:1pt 5pt;height:13pt;}
#ws-print table.ws-id th{background:#eee;font-weight:700;text-align:center;
  font-size:8.2pt;white-space:nowrap;width:42pt;}

#ws-print .ws-sec{margin-top:12pt;}
#ws-print .ws-sec>h2{font-size:10.5pt;font-weight:800;border-left:3pt solid #000;
  padding-left:6pt;margin-bottom:6pt;page-break-after:avoid;}
#ws-print .ws-sec>h3{font-size:9.2pt;font-weight:700;margin:7pt 0 3pt;page-break-after:avoid;}

#ws-print table.ws-t{width:100%;table-layout:fixed;word-break:break-word;
  border-collapse:collapse;font-size:8.8pt;margin-bottom:6pt;}
#ws-print table.ws-t th,#ws-print table.ws-t td{border:.6pt solid #777;padding:1pt 5pt;
  height:13pt;vertical-align:middle;line-height:1.45;}
#ws-print table.ws-t th{background:#eee;font-weight:700;font-size:8.2pt;text-align:left;}
#ws-print table.ws-t td.k{background:#f5f5f5;font-weight:600;width:96pt;}
#ws-print table.ws-t tr{page-break-inside:avoid;}

#ws-print .ws-note{font-size:9pt;line-height:1.55;margin-bottom:5pt;white-space:pre-line;}

#ws-print .ws-qa{page-break-inside:avoid;margin-bottom:8pt;}
#ws-print .ws-q{font-size:9pt;font-weight:700;margin-bottom:3pt;line-height:1.5;}
#ws-print .ws-q .n{display:inline-block;min-width:22pt;}
#ws-print .ws-a{font-size:9pt;line-height:1.6;white-space:pre-wrap;word-break:break-word;
  border:.6pt solid #aaa;border-radius:2pt;padding:4pt 6pt;min-height:22pt;}
#ws-print .ws-lines{border:.6pt solid #aaa;border-radius:2pt;padding:3pt 7pt 0;}
#ws-print .ws-lines span{display:block;border-bottom:.5pt solid #bbb;height:15pt;}

#ws-print .ws-chk{list-style:none;font-size:9pt;padding:0;}
#ws-print .ws-chk li{padding:2.5pt 0;border-bottom:.4pt dotted #bbb;
  page-break-inside:avoid;line-height:1.5;}
#ws-print .ws-chk li b{font-size:10pt;margin-right:5pt;}

#ws-print .ws-ref{margin-top:13pt;padding-top:8pt;border-top:.8pt solid #999;}
#ws-print .ws-ref h3{font-size:9.2pt;font-weight:800;margin:7pt 0 2pt;page-break-after:avoid;}
#ws-print .ws-ref p{font-size:8.6pt;line-height:1.55;margin-bottom:2pt;}
#ws-print .ws-ref .lk{font-size:8pt;color:#333;border-left:2pt solid #999;
  padding-left:6pt;margin:2pt 0 4pt;}
#ws-print .ws-ref .blk{page-break-inside:avoid;margin-bottom:6pt;}

#ws-print .ws-foot{margin-top:11pt;padding-top:4pt;border-top:.6pt solid #999;
  font-size:7.6pt;color:#555;display:flex;justify-content:space-between;}`;

  /* ---------- 인쇄용 스타일 (1회 주입) ---------- */
  function injectCSS() {
    if (document.getElementById('ws-style')) return;
    const st = document.createElement('style');
    st.id = 'ws-style';
    st.textContent = `
#ws-print{display:none;}
@media print{
  /* 인쇄 폭은 @page 여백만으로 정하고, 활동지는 mm 값을 일절 갖지 않는다.
     mm를 박아 두면 브라우저·프린터의 여백 계산과 1mm라도 어긋나는 순간 오른쪽이 잘린다.
     width:auto + max-width:100% 는 "종이가 주는 만큼만 쓴다"는 뜻이라 잘릴 수가 없다.
     A4 210 − 12 − 12 = 글 폭 186mm 로, 화면 미리보기와 같다. */
  @page{ size:A4; margin:13mm 12mm 14mm; }
  html,body{height:auto!important;overflow:visible!important;
    width:auto!important;max-width:100%!important;min-width:0!important;
    background:#fff!important;color:#000!important;display:block!important;
    margin:0!important;padding:0!important;}
  body>*{display:none!important;}
  body>#ws-print{display:block!important;box-sizing:border-box!important;
    width:auto!important;max-width:100%!important;min-width:0!important;
    padding:0!important;margin:0!important;overflow:visible!important;
    transform:none!important;zoom:1!important;float:none!important;position:static!important;}
  #ws-print *{background:transparent!important;}
  #ws-print table.ws-id th,#ws-print table.ws-t th{background:#eee!important;}
  #ws-print table.ws-t td.k{background:#f5f5f5!important;}
  #ws-print table{table-layout:fixed!important;width:100%!important;max-width:100%!important;
    word-break:break-word;}
  #ws-print .ws-a,#ws-print .ws-ref .lk{word-break:break-word;overflow-wrap:anywhere;}
  ${SHEET_CSS}
}`;
    document.head.appendChild(st);
  }

  const host = () => {
    let h = document.getElementById('ws-print');
    if (!h) { h = document.createElement('div'); h.id = 'ws-print'; document.body.appendChild(h); }
    return h;
  };
  const ruled = n => `<div class="ws-lines">${'<span></span>'.repeat(n || 4)}</div>`;

  /* ---------- 활동지 본문 만들기 ---------- */
  function build(cfg) {
    const blank = !!cfg.blank;
    const now = new Date();
    const date = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}.`;
    let H = '';

    H += `<div class="ws-head">
      <h1>${esc(cfg.title)}</h1>
      ${cfg.subtitle ? `<div class="ws-sub">${esc(cfg.subtitle)}</div>` : ''}
      ${cfg.standard ? `<div class="ws-std">${esc(cfg.standard)}</div>` : ''}
      <table class="ws-id"><tr>
        <th>학번</th><td></td>
        <th>이름</th><td>${blank ? '' : esc(cfg.who || '')}</td>
        <th>날짜</th><td>${blank ? '' : date}</td>
      </tr></table></div>`;

    let sn = 0;

    if (cfg.records && cfg.records.length) {
      H += `<div class="ws-sec"><h2>${++sn}. 관찰 · 측정 기록</h2>`;
      cfg.records.forEach(r => {
        if (r.h) H += `<h3>${esc(r.h)}</h3>`;
        if (r.type === 'kv') {
          H += `<table class="ws-t">${r.rows.map(([k, v]) =>
            `<tr><td class="k">${esc(k)}</td><td>${blank ? '' : esc(v || '')}</td></tr>`).join('')}</table>`;
        } else if (r.type === 'table') {
          H += `<table class="ws-t"><tr>${r.head.map(x => `<th>${esc(x)}</th>`).join('')}</tr>`;
          if (blank || !r.rows.length) {
            for (let i = 0; i < (r.blankRows || 5); i++)
              H += `<tr>${r.head.map(() => '<td>&nbsp;</td>').join('')}</tr>`;
          } else {
            H += r.rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
          }
          H += `</table>`;
        } else {
          H += `<div class="ws-note">${blank ? '' : esc(r.text || '')}</div>`;
        }
      });
      H += `</div>`;
    }

    if (cfg.answers && cfg.answers.length) {
      H += `<div class="ws-sec"><h2>${++sn}. 탐구 문항</h2>`;
      cfg.answers.forEach((x, i) => {
        const a = (x.a || '').trim();
        H += `<div class="ws-qa">
          <div class="ws-q"><span class="n">Q${i + 1}.</span>${esc(x.q)}</div>
          ${(blank || !a) ? ruled(x.lines || 4) : `<div class="ws-a">${esc(a)}</div>`}
        </div>`;
      });
      H += `</div>`;
    }

    if (cfg.checks && cfg.checks.length) {
      H += `<div class="ws-sec"><h2>${++sn}. 스스로 점검</h2><ul class="ws-chk">`;
      cfg.checks.forEach(c => H += `<li><b>${(!blank && c.ok) ? '☑' : '☐'}</b>${esc(c.t)}</li>`);
      H += `</ul></div>`;
    }

    if (cfg.summary && cfg.summary.length) {
      H += `<div class="ws-sec ws-ref"><h2>${++sn}. 핵심 정리</h2>`;
      cfg.summary.forEach(s => {
        H += `<div class="blk"><h3>${esc(s.h)}</h3>`;
        (s.body || []).forEach(p => H += `<p>${esc(p)}</p>`);
        if (s.table && s.table.length) {
          H += `<table class="ws-t">${s.table.map((row, ri) =>
            `<tr>${row.map(c => ri === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`
          ).join('')}</table>`;
        }
        if (s.link) H += `<div class="lk">▶ ${esc(s.link)}</div>`;
        H += `</div>`;
      });
      H += `</div>`;
    }

    H += `<div class="ws-foot"><span>The Pale Blue Dot · 지구과학 탐구 활동</span>
      <span>${blank ? '활동지' : '출력 ' + date}</span></div>`;
    return H;
  }

  function render(cfg) { injectCSS(); host().innerHTML = build(cfg); }

  /* ---------- ① 인쇄 / PDF ---------- */

  /* ---------- 실행 위치 판별 (허브 안이면 iframe) ---------- */
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  /* ---------- 활동지를 새 창에 띄운다 ----------
     iframe 안에서 window.print()를 부르면 브라우저에 따라 바깥 페이지가 인쇄되거나
     아예 무시된다(사파리·크로미움 모두 알려진 문제). 그래서 허브 안에서 실행 중이면
     완성된 활동지만 담은 독립 문서를 새 창에 띄우고 거기서 인쇄한다.          */
  function openSheetWindow(cfg, autoPrint) {
    let w = null;
    try { w = window.open('', '_blank'); } catch (e) { w = null; }
    if (!w) return null;
    try {
      w.document.open();
      w.document.write(standaloneHTML(cfg));
      w.document.close();
    } catch (e) {
      try { w.close(); } catch (e2) {}
      return null;
    }
    if (autoPrint) {
      const go = () => { try { w.focus(); w.print(); } catch (e) {} };
      /* iOS는 인쇄 시트가 뜨기 전에 렌더가 끝나야 해서 여유를 둔다 */
      setTimeout(go, isIOS() ? 900 : 450);
    }
    return w;
  }

  function print(cfg) {
    if (!cfg.blank && cfg.answers) {
      const miss = cfg.answers.filter(x => !(x.a || '').trim()).length;
      if (miss && !confirm(
        `아직 답을 쓰지 않은 문항이 ${miss}개 있습니다.\n` +
        `빈칸은 손으로 쓸 수 있게 줄로 인쇄됩니다.\n\n이대로 진행할까요?`)) return;
    }
    if (inFrame) {
      if (openSheetWindow(cfg, true)) return;
      if (!confirm('새 창이 열리지 않았습니다. 브라우저가 팝업을 막았을 수 있습니다.\n\n' +
        '이대로 인쇄를 시도할까요? (기기에 따라 활동지 대신 바깥 화면이 인쇄될 수 있습니다)\n' +
        '취소를 누르고 [HTML 파일로 저장]을 쓰면 확실합니다.')) return;
    }
    render(cfg);
    setTimeout(() => window.print(), 60);
  }

  /* ---------- ② HTML 파일 (어디서나 열리는 단독 문서) ---------- */
  function standaloneHTML(cfg) {
    return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(cfg.title)} 활동지</title>
<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
*{box-sizing:border-box;}
body{margin:0;background:#5b6068;padding:14px 10px 90px;
  -webkit-text-size-adjust:100%;text-size-adjust:100%;}
/* ── 종이 하나, 계산 하나 ───────────────────────────────
   활동지는 화면에서도 인쇄에서도 언제나 "210mm 상자 + 12mm 안쪽 여백"이다.
   따라서 글이 담기는 폭은 항상 186mm로 고정 — 창 크기가 바뀌어도 변하지 않는다.
   창이 좁으면 폭을 줄이는 대신 종이 전체를 scale 로 축소한다.
   (폭만 줄이면 종이는 좁아지는데 글자는 pt 고정이라 그대로 커 보인다) */
.ws-stage{max-width:100%;overflow-x:auto;overflow-y:hidden;}
.ws-stage.fitted{overflow:hidden;}
#ws-print{box-sizing:border-box;
  width:210mm!important;min-width:210mm!important;max-width:210mm!important;
  margin:0 auto;background:#fff;padding:13mm 12mm 14mm;
  transform-origin:top left;transform:scale(var(--ws-s,1));
  box-shadow:0 6px 24px rgba(0,0,0,.35);border-radius:2px;}
${SHEET_CSS}
.ws-bar{position:fixed;left:0;right:0;bottom:0;background:#0b1420;color:#ffffff;
  padding:11px 14px;display:flex;gap:9px;align-items:center;justify-content:center;
  flex-wrap:wrap;font-family:'Pretendard',sans-serif;font-size:13px;
  box-shadow:0 -3px 14px rgba(0,0,0,.4);}
.ws-bar button{font:inherit;font-weight:700;cursor:pointer;border:none;border-radius:7px;
  padding:10px 20px;background:#0ea5e9;color:#ffffff;}
.ws-bar span{color:#cbd5e1;font-size:12px;}
@media print{
  /* 인쇄 폭은 @page 여백만으로 정하고, 활동지는 mm 값을 일절 갖지 않는다.
     mm를 박아 두면 브라우저·프린터의 여백 계산과 1mm라도 어긋나는 순간 오른쪽이 잘린다.
     width:auto + max-width:100% 는 "종이가 주는 만큼만 쓴다"는 뜻이라 잘릴 수가 없다.
     A4 210 − 12 − 12 = 글 폭 186mm 로, 화면 미리보기와 같다. */
  @page{size:A4;margin:13mm 12mm 14mm;}
  html,body{background:#fff;padding:0!important;margin:0!important;
    width:auto!important;max-width:100%!important;min-width:0!important;
    overflow:visible!important;}
  .ws-stage{overflow:visible!important;height:auto!important;
    width:auto!important;max-width:100%!important;min-width:0!important;}
  #ws-print{width:auto!important;max-width:100%!important;min-width:0!important;
    margin:0!important;padding:0!important;
    transform:none!important;zoom:1!important;position:static!important;
    box-shadow:none;border-radius:0;overflow:visible!important;}
  /* 표·긴 링크가 종이 밖으로 삐져나가 잘리는 것을 막는다 */
  #ws-print table{table-layout:fixed!important;width:100%!important;max-width:100%!important;
    word-break:break-word;}
  #ws-print .ws-a,#ws-print .ws-ref .lk{word-break:break-word;overflow-wrap:anywhere;}
  .ws-bar{display:none;}
}
</style></head>
<body>
<div class="ws-stage"><div id="ws-print">${build(cfg)}</div></div>
<div class="ws-bar">
  <button onclick="window.print()">인쇄 / PDF로 저장</button>
  <button id="ws-fitbtn" style="background:#334155;">실제 크기로 보기</button>
  <span id="ws-zoom">A4 실제 비율</span>
  <span style="opacity:.55;font-size:11px;">v7</span>
</div>
<script>
(function(){
  var stage=document.querySelector('.ws-stage'),
      sheet=document.getElementById('ws-print'),
      zoom =document.getElementById('ws-zoom'),
      btn  =document.getElementById('ws-fitbtn'),
      auto =true;
  function apply(s){
    /* transform 은 레이아웃 상자를 바꾸지 않으므로 offsetWidth/Height 는 늘 실제 A4 값 */
    sheet.style.setProperty('--ws-s', s);
    stage.classList.toggle('fitted', s<1);
    stage.style.height = s<1 ? Math.ceil(sheet.offsetHeight*s)+'px' : 'auto';
    if(zoom) zoom.textContent =
      (s<1 ? '화면 맞춤 '+Math.round(s*100)+'% · ' : '') + 'A4 실제 비율 · 글 폭 186mm';
    if(btn) btn.textContent = auto ? '실제 크기로 보기' : '화면에 맞추기';
  }
  function fit(){
    if(!stage||!sheet) return;
    if(!auto){ apply(1); return; }
    var w=sheet.offsetWidth; if(!w) return;
    apply(Math.min(1, stage.clientWidth/w));
  }
  if(btn) btn.addEventListener('click',function(){ auto=!auto; fit(); });
  window.addEventListener('resize',fit);
  window.addEventListener('load',fit);
  document.addEventListener('DOMContentLoaded',fit);
  window.addEventListener('beforeprint',function(){ sheet.style.setProperty('--ws-s',1); stage.style.height='auto'; });
  window.addEventListener('afterprint',fit);
  if(window.ResizeObserver){ try{ new ResizeObserver(fit).observe(stage); }catch(e){} }
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fit);
  setTimeout(fit,60); setTimeout(fit,400); setTimeout(fit,1200); fit();
})();
</script>
</body></html>`;
  }

  function saveHTML(cfg, name) {
    dl(new Blob(['﻿' + standaloneHTML(cfg)], { type: 'text/html;charset=utf-8' }),
      (name || '활동지') + '.html');
  }

  /* ---------- ③ 텍스트 ---------- */
  function toText(cfg) {
    const bar = '='.repeat(52);
    let o = `${cfg.title}\n`;
    if (cfg.subtitle) o += `${cfg.subtitle}\n`;
    o += `작성: ${cfg.who || '이름없음'} / ${new Date().toLocaleString('ko-KR')}\n`;
    if (cfg.standard) o += `${cfg.standard}\n`;
    let n = 0;
    (cfg.records || []).forEach(r => {
      if (!n++) o += `\n${bar}\n관찰 · 측정 기록\n${bar}\n`;
      if (r.h) o += `\n[${r.h}]\n`;
      if (r.type === 'kv') r.rows.forEach(([k, v]) => o += `· ${k}: ${v || '(미기록)'}\n`);
      else if (r.type === 'table') {
        o += r.head.join(' | ') + '\n';
        r.rows.length ? r.rows.forEach(row => o += row.join(' | ') + '\n') : o += '(기록 없음)\n';
      } else o += (r.text || '(기록 없음)') + '\n';
    });
    if (cfg.answers?.length) {
      o += `\n${bar}\n탐구 문항\n${bar}\n`;
      cfg.answers.forEach((x, i) => o += `\nQ${i + 1}. ${x.q}\n→ ${(x.a || '').trim() || '(미작성)'}\n`);
    }
    if (cfg.checks?.length) {
      o += `\n${bar}\n스스로 점검\n${bar}\n`;
      cfg.checks.forEach(c => o += `[${c.ok ? 'O' : ' '}] ${c.t}\n`);
    }
    if (cfg.summary?.length) {
      o += `\n${bar}\n핵심 정리\n${bar}\n`;
      cfg.summary.forEach(s => {
        o += `\n■ ${s.h}\n`;
        (s.body || []).forEach(p => o += `  ${p}\n`);
        (s.table || []).forEach(r => o += '  ' + r.join(' | ') + '\n');
        if (s.link) o += `  ▶ ${s.link}\n`;
      });
    }
    return o;
  }
  const download = (cfg, name) =>
    dl(new Blob([toText(cfg)], { type: 'text/plain;charset=utf-8' }), (name || '활동지') + '.txt');

  function dl(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- 기기별 PDF 저장 안내 ---------- */
  function deviceGuide() {
    const ua = navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const android = /Android/.test(ua);
    if (iOS) return {
      os: 'iPad · iPhone',
      steps: ['<b>내 기록 인쇄 / PDF 저장</b>을 누릅니다. 활동지만 담긴 <b>새 창</b>이 열리고 인쇄 시트가 뜹니다.',
        '미리보기 그림을 <b>두 손가락으로 벌려</b> 크게 엽니다.',
        '왼쪽 아래 <b>공유 아이콘</b>(↑) → <b>"파일에 저장"</b>을 고르면 PDF가 됩니다.'],
      tip: '인쇄 시트가 안 뜨면 새 창 아래쪽의 <b>인쇄 / PDF로 저장</b> 버튼을 다시 누르세요. ' +
           '공유 시트에서 제목 아래 <b>옵션</b>을 눌러 <b>PDF</b>를 고르는 방법도 있습니다.'
    };
    if (android) return {
      os: '갤럭시 탭 · Android',
      steps: ['<b>내 기록 인쇄 / PDF 저장</b>을 누릅니다. 활동지만 담긴 <b>새 창</b>이 열립니다.',
        '맨 위 <b>대상(프린터 선택)</b>에서 <b>"PDF로 저장"</b>을 고릅니다.',
        '오른쪽 <b>저장 아이콘</b>을 누르고 위치를 정합니다.'],
      tip: '기기에 따라 "PDF로 내보내기"로 표시되기도 합니다. 새 창이 안 열리면 팝업 차단을 풀어 주세요.'
    };
    return {
      os: '컴퓨터',
      steps: ['<b>내 기록 인쇄 / PDF 저장</b>을 누릅니다.',
        '인쇄 대화상자의 <b>대상</b>에서 <b>"PDF로 저장"</b>을 고릅니다.',
        '<b>저장</b>을 누르고 위치를 정합니다.'],
      tip: '컬러 잉크를 아끼려면 "흑백"으로 두어도 잘 읽히도록 만들었습니다.'
    };
  }

  /* ---------- 화면에서 답안 모으기 ---------- */
  const collect = {
    answers(sel) {
      return [...document.querySelectorAll(sel)].map(el => ({
        q: el.dataset.q || el.getAttribute('aria-label') || '',
        a: (el.value || '').trim(),
        lines: +(el.dataset.lines || 4)
      }));
    },
    checks(sel) {
      return [...document.querySelectorAll(sel)].map(el => ({
        t: (el.dataset.t || (el.nextElementSibling && el.nextElementSibling.textContent) || '').trim(),
        ok: !!el.checked
      }));
    },
    summary(sel) {
      return [...document.querySelectorAll(sel)].map(el => ({
        h: (el.dataset.h || '').trim(),
        body: (el.dataset.body || '').split('|').filter(Boolean)
      }));
    }
  };

  /* ---------- 버튼 묶음 붙이기 ---------- */
  function mount(hostId, makeCfg, makeName) {
    const el = typeof hostId === 'string' ? document.getElementById(hostId) : hostId;
    if (!el) return;
    const g = deviceGuide();
    const nm = () => (typeof makeName === 'function' ? makeName() : makeName || '활동지')
      .replace(/[\\/:*?"<>|]/g, '').trim() || '활동지';

    el.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <button class="btn primary" data-ws="print">내 기록 인쇄 / PDF 저장</button>
        <button class="btn" data-ws="open">새 창에서 활동지 열기</button>
        <button class="btn" data-ws="html">HTML 파일로 저장</button>
        <button class="btn" data-ws="blank">빈 활동지 인쇄</button>
        <button class="btn" data-ws="txt">텍스트로 저장</button>
        <button class="btn" data-ws="help" style="padding:8px 12px;">PDF 저장 방법 ?</button>
      </div>
      <div data-ws-help hidden style="margin-top:12px;padding:14px 16px;border-radius:10px;
        background:rgba(2,132,199,.07);border:1px solid rgba(2,132,199,.28);">
        <div style="font-size:.82rem;font-weight:800;color:#0369a1;margin-bottom:9px;">
          ${g.os}에서 PDF로 저장하기</div>
        <ol style="margin:0 0 10px 18px;font-size:.81rem;line-height:1.85;color:#243141;">
          ${g.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        <div style="font-size:.76rem;color:#4a5a6b;line-height:1.7;margin-bottom:10px;">${g.tip}</div>
        <div style="font-size:.78rem;line-height:1.8;color:#243141;padding-top:9px;
          border-top:1px solid rgba(18,33,47,.10);">
          <b style="color:#0b1420;">태블릿에서 주의</b> — 인쇄를 누르면 활동지만 담긴 <b>새 창</b>이 열립니다.
          창이 안 열리면 브라우저의 <b>팝업 차단</b> 때문이니 허용해 주세요.<br><br>
          <b style="color:#0b1420;">잘 안 될 때</b> — <b style="color:#0b1420;">HTML 파일로 저장</b>을 쓰세요.
          내려받은 파일을 열면 종이 모양 그대로 나오고, 아래쪽 버튼으로 다시 PDF로 저장할 수 있습니다.
          인터넷 없이도 열리고, 그대로 제출해도 됩니다.
        </div>
      </div>`;

    el.querySelectorAll('[data-ws]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.ws;
      if (k === 'help') {
        const h = el.querySelector('[data-ws-help]');
        h.hidden = !h.hidden; return;
      }
      if (k === 'open') {
        if (!openSheetWindow(makeCfg(false), false))
          alert('새 창이 열리지 않았습니다. 브라우저의 팝업 차단을 풀거나 [HTML 파일로 저장]을 써 주세요.');
        return;
      }
      if (k === 'print') return print(makeCfg(false));
      if (k === 'blank') return print(makeCfg(true));
      if (k === 'html')  return saveHTML(makeCfg(false), nm() + '_활동지');
      if (k === 'txt')   return download(makeCfg(false), nm() + '_활동지');
    }));
  }

  return { render, print, saveHTML, download, toText, mount, collect,
           deviceGuide, openSheetWindow, esc };
})();
