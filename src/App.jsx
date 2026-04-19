import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
//  DATA LAYER
// ═══════════════════════════════════════════════════════════════
// 현재 개통역: 구미(0), 사곡(1), 북삼(2), 왜관(3), 서대구(4), 대구(5), 동대구(6), 경산(7)
const STATIONS = ["구미","사곡","북삼","왜관","서대구","대구","동대구","경산"];
const TRANSFERS = {
  4: [{name:"KTX", color:"#C0392B"}],
  5: [{name:"지하철 1호선", color:"#D4700A"}],
  6: [{name:"KTX", color:"#C0392B"},{name:"SRT", color:"#6B21A8"},{name:"지하철 1호선", color:"#D4700A"}],
};
const FARES = [
  [10,1500],[15,1600],[20,1700],[25,1800],[30,1900],
  [35,2000],[40,2100],[45,2200],[50,2300],[55,2400],[62,2800],
];
// 구미~사곡~북삼~왜관~서대구~대구~동대구~경산
const DIST_FROM_GUMI = [0, 7, 14, 19, 35, 40, 44, 55];

function calcFare(stFrom, stTo) {
  const km = Math.abs(DIST_FROM_GUMI[stTo] - DIST_FROM_GUMI[stFrom]);
  const base = FARES.find(([d]) => km <= d)?.[1] ?? 2800;
  const inDaegu = (i) => i >= 4 && i <= 6; // 서대구(4), 대구(5), 동대구(6)
  const cross = inDaegu(stFrom) !== inDaegu(stTo);
  return base + (cross ? 200 : 0);
}

const p = (hhmm) => { const [h,m]=hhmm.split(':').map(Number); return h*60+m; };
const fmt = (mins) => {
  if (mins == null) return null;
  const h = Math.floor(mins/60)%24, m = mins%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

// 구미↔경산 전체 구간 오프셋 (분)
// 역 순서: 구미(0), 사곡(1), 북삼(2), 왜관(3), 서대구(4), 대구(5), 동대구(6), 경산(7)
// UP: 경산(7)→구미(0)
const UP_OFF  = [59, 53, 47, 40, 23, 17, 12, 0];
// DOWN: 구미(0)→경산(7)
const DN_OFF  = [0,  6,  12, 19, 36, 42, 47, 59];

// ──────────────────────────────────────────────────────────────
//  왜관역 시간표 기준 (사진 정확 반영)
//  왜관역 index = 2
//  구미행(상행): 왜관 출발 시각 기준
//  경산·동대구행(하행): 왜관 출발 시각 기준
// ──────────────────────────────────────────────────────────────

// 왜관역 기준 구미행 평일 출발 시각
const WAEGWAN_UP_WEEKDAY = [
  "05:53",
  "06:10","06:23","06:37","06:47",
  "07:16","07:25","07:50",
  "08:14","08:36","08:48",
  "09:07","09:22","09:38",
  "10:18","10:46",
  "11:00","11:18",
  "12:00","12:32",
  "13:09","13:47",
  "14:14","14:30","14:50",
  "15:21","15:52",
  "16:12","16:37","16:57",
  "17:01","17:27","17:53",
  "18:15","18:41",
  "19:25","19:45",
  "20:11","20:31","20:54","20:50",
  "21:17","21:41",
  "22:24","22:50",
  "23:17","23:35","23:59",
];

// 왜관역 기준 구미행 주말/공휴일 출발 시각
const WAEGWAN_UP_WEEKEND = [
  "05:53",
  "06:10","06:37","06:47",
  "07:16","07:25","07:50",
  "08:14","08:36",
  "09:07","09:47",
  "10:14","10:30","10:50",
  "11:21","11:52",
  "12:12","12:37","12:57",
  "13:01","13:27","13:53",
  "14:15","14:41",
  "15:25","15:45",
  "16:11","16:31","16:54","16:50",
  "17:17","17:41",
  "18:24","18:50",
  "19:17","19:35","19:59",
  "20:18","20:35","20:59",
  "21:18","21:41",
  "22:17","22:35",
  "23:18",
];

// 왜관역 기준 경산·동대구행 평일 출발 시각
const WAEGWAN_DN_WEEKDAY = [
  "05:51",
  "06:00","06:25","06:47",
  "07:10","07:23","07:42","07:51",
  "08:11","08:26","08:41",
  "09:05","09:33","09:47",
  "10:01","10:25","10:46",
  "11:17","11:36",
  "12:03","12:24",
  "13:46","13:59",
  "14:24",
  "15:17","15:45",
  "16:06","16:26","16:48",
  "17:21","17:52",
  "18:19","18:37","18:55",
  "19:11","19:40",
  "20:07","20:28","20:55",
  "21:17","21:41",
  "22:11","22:34","22:54",
  "23:15","23:42",
  "00:10",
];

// 왜관역 기준 경산·동대구행 주말/공휴일 출발 시각
const WAEGWAN_DN_WEEKEND = [
  "05:51",
  "06:00","06:25","06:47",
  "07:10","07:42","07:51",
  "08:11","08:26","08:41",
  "09:05","09:33",
  "10:01","10:25","10:46",
  "11:17","11:36",
  "12:03","12:24",
  "13:21","13:46","13:59",
  "14:24",
  "15:17","15:45",
  "16:06","16:26","16:48",
  "17:21","17:52",
  "18:19","18:37","18:55",
  "19:11","19:40",
  "20:07","20:28","20:55",
  "21:17","21:41",
  "22:11","22:34","22:54",
  "23:15","23:42",
  "00:10",
];

// 왜관역 기준으로 전체 열차 생성
function buildTrains(waegwanTimes, dir, prefix) {
  return waegwanTimes.map((t, i) => {
    const waegwanMins = p(t);
    const off = dir === 'up' ? UP_OFF : DN_OFF;
    const waegwanOff = off[3]; // 왜관 = index 3
    const from = dir === 'up' ? 0 : 7; // 구미방향이면 출발은 경산쪽, 경산방향이면 구미쪽
    const dep = waegwanMins - waegwanOff + off[from];
    const id = `${prefix}${String(i*2+1).padStart(4,'0')}`;
    return { id, from, dep };
  });
}

function stTime(train, si, dir) {
  const off = dir==='up' ? UP_OFF : DN_OFF;
  return train.dep + (off[si] - off[train.from]);
}

function isWeekend(date) {
  const d = date || new Date();
  const day = d.getDay(); // 0=일, 6=토
  return day === 0 || day === 6;
}

function getNextTrains(si, dir, nowMins, isWknd, count=4) {
  // 종착역에서는 해당 방향 열차 없음
  // 상행(구미행) 종착역 = 구미(0), 하행(경산행) 종착역 = 경산(7)
  if (dir === 'up'   && si === 0) return [];
  if (dir === 'down' && si === 7) return [];

  const upTimes   = isWknd ? WAEGWAN_UP_WEEKEND   : WAEGWAN_UP_WEEKDAY;
  const dnTimes   = isWknd ? WAEGWAN_DN_WEEKEND   : WAEGWAN_DN_WEEKDAY;
  const trains = dir==='up'
    ? buildTrains(upTimes, 'up', 'K')
    : buildTrains(dnTimes, 'down', 'K');

  return trains
    .map(t => ({ ...t, arrTime: stTime(t, si, dir) }))
    .filter(t => t.arrTime !== null && t.arrTime >= nowMins)
    .sort((a,b) => a.arrTime - b.arrTime)
    .slice(0, count);
}

function findRouteTrains(fromSi, toSi, nowMins, isWknd) {
  const dir = fromSi > toSi ? 'up' : 'down';
  const upTimes = isWknd ? WAEGWAN_UP_WEEKEND : WAEGWAN_UP_WEEKDAY;
  const dnTimes = isWknd ? WAEGWAN_DN_WEEKEND : WAEGWAN_DN_WEEKDAY;
  const trains = dir==='up'
    ? buildTrains(upTimes, 'up', 'K')
    : buildTrains(dnTimes, 'down', 'K');

  return trains
    .map(t => ({
      ...t,
      depTime: stTime(t, fromSi, dir),
      arrTime: stTime(t, toSi, dir),
    }))
    .filter(t => t.depTime !== null && t.arrTime !== null && t.depTime >= nowMins)
    .sort((a,b) => a.depTime - b.depTime)
    .slice(0, 6);
}

// ═══════════════════════════════════════════════════════════════
//  DELAY STORE (전역)
// ═══════════════════════════════════════════════════════════════
// trainId -> delayMins
const delayStore = {};

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════
const C = {
  bg:       '#080C12',
  surface:  '#111823',
  card:     '#151E2D',
  border:   '#1E2A3A',
  accent:   '#FF7A00',
  accentDim:'#7A3A00',
  blue:     '#3B82F6',
  green:    '#22C55E',
  red:      '#EF4444',
  yellow:   '#FBBF24',
  text:     '#E2EBF5',
  muted:    '#6B7E99',
  tabBg:    '#0D1420',
};
const S = {
  app: {
    fontFamily:"'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    background:C.bg, color:C.text,
    height:'100dvh', maxWidth:430, margin:'0 auto',
    display:'flex', flexDirection:'column',
    position:'relative', overflow:'hidden',
  },
  header: {
    background:C.surface,
    borderBottom:`1px solid ${C.border}`,
    padding:'12px 16px 10px',
    flexShrink:0,
  },
  scroll: {
    flex:1, overflowY:'auto', padding:'12px 14px',
    paddingBottom: 80,
  },
  tabBar: {
    position:'absolute', bottom:0, left:0, right:0,
    background:C.tabBg,
    borderTop:`1px solid ${C.border}`,
    display:'flex', height:60,
  },
  tabBtn: (active) => ({
    flex:1, border:'none', background:'transparent',
    display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', gap:3, cursor:'pointer',
    color: active ? C.accent : C.muted,
    fontSize:10, fontWeight: active ? 600 : 400,
    transition:'color .2s',
  }),
  card: {
    background:C.card, borderRadius:12,
    border:`1px solid ${C.border}`,
    marginBottom:10, overflow:'hidden',
  },
  badge: (color) => ({
    background: color+'22', color, border:`1px solid ${color}44`,
    borderRadius:4, padding:'1px 5px', fontSize:10, fontWeight:700,
  }),
  select: {
    background:C.surface, color:C.text,
    border:`1px solid ${C.border}`, borderRadius:8,
    padding:'8px 10px', fontSize:14, width:'100%',
    outline:'none', cursor:'pointer',
  },
  pill: (active, accent=C.accent) => ({
    background: active ? accent : C.surface,
    color: active ? '#fff' : C.muted,
    border: `1px solid ${active ? accent : C.border}`,
    borderRadius:20, padding:'5px 14px',
    fontSize:13, fontWeight: active?700:400,
    cursor:'pointer', transition:'all .15s',
  }),
};

// ═══════════════════════════════════════════════════════════════
//  TOAST / 알림 컴포넌트
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//  전역 출발 배너 (실시간 카운트다운)
// ═══════════════════════════════════════════════════════════════
function DepartureBanner({ departures, onDismiss }) {
  // 실시간 초 카운터 — Date 객체 자체를 저장해 분/초를 정확히 계산
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!departures || departures.length === 0) return null;

  return (
    <div style={{
      position:'fixed', top:16, left:'50%', transform:'translateX(-50%)',
      zIndex:9999, width:'92%', maxWidth:420,
      display:'flex', flexDirection:'column', gap:8,
      pointerEvents:'none',
    }}>
      {departures.map((dep, idx) => {
        const dirLabel = dep.dir === 'up' ? '구미행' : '경산행';
        const dirColor = dep.dir === 'up' ? C.accent : C.blue;
        // dep.arrivalMs = 목표 도착 시각 (밀리초 타임스탬프)
        const diffMs = dep.arrivalMs - now.getTime();
        const diffSec = Math.max(0, Math.floor(diffMs / 1000));
        const mm = Math.floor(diffSec / 60);
        const ss = diffSec % 60;
        return (
          <div key={dep.key} style={{
            background: '#0D1829EE',
            border:`1.5px solid ${dirColor}`,
            borderRadius:14,
            padding:'11px 14px',
            display:'flex', alignItems:'center', gap:10,
            boxShadow:`0 4px 24px #00000099`,
            pointerEvents:'auto',
          }}>
            <span style={{fontSize:22, flexShrink:0}}>🚆</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:12, color:dirColor, fontWeight:800, marginBottom:2}}>
                {dirLabel} 전역 출발
              </div>
              <div style={{
                fontFamily:"'Space Mono',monospace",
                fontSize:16, fontWeight:700, color:C.text, letterSpacing:0.5,
              }}>
                {diffSec <= 0 ? '지금 도착!' : `${mm}분 ${String(ss).padStart(2,'0')}초 후 도착`}
              </div>
              {dep.delayMins > 0 && (
                <div style={{fontSize:10, color:C.yellow, marginTop:2}}>⚠️ {dep.delayMins}분 연착 반영</div>
              )}
            </div>
            <button onClick={() => onDismiss(idx)} style={{
              background:'none', border:'none', color:C.muted,
              fontSize:20, cursor:'pointer', flexShrink:0, lineHeight:1,
              padding:'4px',
            }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════
function MinuteBadge({ mins, now, delayMins=0 }) {
  const actualMins = mins + delayMins;
  const diff = actualMins - now;
  if (delayMins > 0) {
    return (
      <span style={{...S.badge(C.yellow), fontSize:12, display:'flex', alignItems:'center', gap:3}}>
        ⚠️ {delayMins}분 연착
      </span>
    );
  }
  if (diff <= 0) return <span style={{...S.badge(C.red),fontSize:12}}>출발</span>;
  if (diff <= 3) return <span style={{...S.badge(C.red),fontSize:12}}>곧 출발</span>;
  if (diff <= 10) return <span style={{...S.badge(C.green),fontSize:12,animation:'pulse 1.5s infinite'}}>{diff}분 후</span>;
  return <span style={{...S.badge(C.muted),fontSize:12}}>{diff}분 후</span>;
}

function StationSelect({ value, onChange, label }) {
  return (
    <div style={{marginBottom:8}}>
      {label && <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>{label}</div>}
      <select style={S.select} value={value} onChange={e=>onChange(Number(e.target.value))}>
        {STATIONS.map((s,i)=>(
          <option key={i} value={i}>{s}역{TRANSFERS[i]?.length ? ' 🔗' : ''}</option>
        ))}
      </select>
    </div>
  );
}

// 연착 입력 모달
function DelayModal({ train, onClose, onSave }) {
  const [delay, setDelay] = useState(0);
  return (
    <div style={{
      position:'fixed', inset:0, background:'#000000BB',
      zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        background:C.card, borderRadius:16, padding:'20px 24px',
        border:`1px solid ${C.border}`, width:280,
        boxShadow:'0 8px 32px #00000088',
      }} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:700, fontSize:15, marginBottom:4}}>연착 정보 입력</div>
        <div style={{fontSize:12, color:C.muted, marginBottom:16}}>{train.id} 열차</div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:20}}>
          <span style={{fontSize:13, color:C.text}}>연착</span>
          <input
            type="number" min={0} max={60} value={delay}
            onChange={e=>setDelay(Number(e.target.value))}
            style={{
              ...S.select, width:80, textAlign:'center',
              fontSize:18, fontWeight:700,
            }}
          />
          <span style={{fontSize:13, color:C.text}}>분</span>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={onClose} style={{
            flex:1, padding:'10px', background:C.surface,
            border:`1px solid ${C.border}`, borderRadius:8,
            color:C.muted, cursor:'pointer', fontSize:13,
          }}>취소</button>
          <button onClick={()=>onSave(delay)} style={{
            flex:1, padding:'10px', background: delay>0 ? C.yellow : C.accent,
            border:'none', borderRadius:8,
            color:'#000', cursor:'pointer', fontSize:13, fontWeight:700,
          }}>{delay===0?'연착 없음':'저장'}</button>
        </div>
      </div>
    </div>
  );
}

function TrainCard({ train, si, dir, now, delays, onDelayEdit }) {
  const arrT = stTime(train, si, dir);
  const endSi = dir==='up' ? 0 : 7;
  const endT = stTime(train, endSi, dir);
  const delayMins = delays[train.id] || 0;
  const actualArr = arrT + delayMins;
  const diff = actualArr - now;
  const urgent = diff <= 3 && diff >= 0;

  const step = dir==='up' ? -1 : 1;
  const remaining = [];
  let _cur = si + step;
  while (_cur >= 0 && _cur < STATIONS.length) { remaining.push(_cur); _cur += step; }

  // 최대 4개: 다음역/그다음역/그그다음역/종착역 — 남은 역 수에 맞게 자동 조정
  const stopPips = [];
  const midCount = Math.min(remaining.length - 1, 3); // 종착역 제외 중간역 최대 3개
  for (let i = 0; i < midCount; i++) {
    stopPips.push({ si: remaining[i], label: STATIONS[remaining[i]], t: stTime(train, remaining[i], dir) + delayMins, isEnd: false });
  }
  // 종착역 (중복 방지: 마지막 중간역이 종착역과 같으면 추가 안 함)
  if (remaining.length > 0) {
    stopPips.push({ si: endSi, label: STATIONS[endSi], t: endT + delayMins, isEnd: true });
  }

  // 전역 출발 감지
  const prevSi = dir==='up' ? si+1 : si-1;
  const prevArrT = (prevSi >= 0 && prevSi < STATIONS.length) ? stTime(train, prevSi, dir) + delayMins : null;
  const isPrevDeparted = prevArrT !== null && now >= prevArrT && now < actualArr;
  const remainMins = actualArr - now;

  return (
    <div style={{
      padding:'12px 14px',
      borderBottom:`1px solid ${C.border}`,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      background: isPrevDeparted ? '#3B82F615' : urgent ? '#FF7A0010' : 'transparent',
      transition:'background .3s',
      gap: 10,
    }}>
      {/* 왼쪽: 시간 + 정차역 흐름 */}
      <div style={{display:'flex', flexDirection:'column', gap:5, minWidth:0, flex:1}}>
        {/* 도착 시간 + 상태 */}
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:700,
            color: delayMins>0 ? C.yellow : C.text, letterSpacing:-1}}>
            {fmt(actualArr)}
          </span>
          {delayMins > 0 && (
            <span style={{fontSize:11, color:C.muted, textDecoration:'line-through'}}>{fmt(arrT)}</span>
          )}
        </div>

        {/* 정차역 흐름: 다음역 → 그다음역 → 종착역 */}
        <div style={{display:'flex', alignItems:'center', gap:0, flexWrap:'nowrap', overflow:'hidden'}}>
          {stopPips.map((pip, idx) => (
            <div key={pip.si} style={{display:'flex', alignItems:'center', gap:0, minWidth:0}}>
              {/* 화살표 (첫번째 제외) */}
              {idx > 0 && (
                <span style={{color:C.border, fontSize:10, flexShrink:0, margin:'0 2px'}}>▶</span>
              )}
              <div style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                background: pip.isEnd ? C.accent+'1A' : C.surface,
                border:`1px solid ${pip.isEnd ? C.accent+'55' : C.border}`,
                borderRadius:6, padding:'3px 6px',
                flexShrink: pip.isEnd ? 0 : 1,
                minWidth: 0,
                maxWidth: pip.isEnd ? 'none' : 56,
              }}>
                <span style={{
                  fontSize:10, fontWeight: pip.isEnd ? 700 : 500,
                  color: pip.isEnd ? C.accent : C.text,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  maxWidth: '100%',
                }}>
                  {pip.label}
                </span>
                <span style={{
                  fontSize:9, color: pip.isEnd ? C.accent+'BB' : C.muted,
                  fontFamily:"'Space Mono',monospace", whiteSpace:'nowrap',
                }}>
                  {fmt(pip.t)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 열차 ID + 뱃지 */}
        <div style={{fontSize:11, color:C.muted, display:'flex', gap:6, alignItems:'center'}}>
          <span>{train.id}</span>
          {isPrevDeparted && (
            <span style={{
              background:'#3B82F622', color:C.blue,
              border:`1px solid #3B82F644`,
              borderRadius:4, padding:'1px 5px', fontSize:10, fontWeight:700,
              animation:'pulse 1.5s infinite',
            }}>🚆 전역 출발</span>
          )}
          {delayMins > 0 && (
            <span style={{...S.badge(C.yellow), fontSize:10}}>⚠️ {delayMins}분 연착</span>
          )}
        </div>
      </div>

      {/* 오른쪽: 분 후 + 연착 입력 */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0}}>
        <MinuteBadge mins={arrT} now={now} delayMins={delayMins}/>
        <button onClick={()=>onDelayEdit && onDelayEdit(train)} style={{
          background:'none', border:`1px solid ${C.border}`,
          borderRadius:4, padding:'2px 6px',
          fontSize:10, color:C.muted, cursor:'pointer',
        }}>연착 입력</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  방향 팝업 모달 (상행/하행 클릭 시)
// ═══════════════════════════════════════════════════════════════
function DirectionPopup({ si, dir, now, wknd, delays, onClose }) {
  const trains = getNextTrains(si, dir, now, wknd, 1);
  const train = trains[0];
  const endSi = dir === 'up' ? 0 : 7;
  const dirLabel = dir === 'up' ? '구미행 (상행)' : '경산행 (하행)';
  const dirColor = dir === 'up' ? C.accent : C.blue;

  // 전역 출발 여부 확인
  const step = dir === 'up' ? -1 : 1;
  const prevSi = si + step * (-1); // 이전역 = 반대방향 1칸 (=전역)
  // "전역" = 현재역 기준 출발쪽 방향의 바로 이전역
  // 상행(구미행)이면 현재보다 index가 큰 쪽이 전역
  // 하행(경산행)이면 현재보다 index가 작은 쪽이 전역
  const prevStation = dir === 'up' ? si + 1 : si - 1;

  if (!train) {
    return (
      <div style={{
        position:'fixed', inset:0, background:'#000000CC',
        zIndex:9500, display:'flex', alignItems:'flex-end', justifyContent:'center',
      }} onClick={onClose}>
        <div style={{
          background:C.card, borderRadius:'20px 20px 0 0',
          padding:'24px 20px 36px', width:'100%', maxWidth:430,
          border:`1px solid ${C.border}`,
        }} onClick={e=>e.stopPropagation()}>
          <div style={{fontWeight:700, fontSize:15, marginBottom:12, color:dirColor}}>{dirLabel}</div>
          <div style={{color:C.muted, fontSize:13, textAlign:'center', padding:'20px 0'}}>운행 종료</div>
          <button onClick={onClose} style={{width:'100%', padding:'12px', background:C.surface,
            border:`1px solid ${C.border}`, borderRadius:10, color:C.muted, cursor:'pointer', fontSize:14}}>닫기</button>
        </div>
      </div>
    );
  }

  const delayMins = delays[train.id] || 0;
  const arrT = stTime(train, si, dir);
  const actualArr = arrT + delayMins;
  const diff = actualArr - now;

  // 다음역, 그다음역, 그그다음역, 종착역 (최대 4개, 남은 역 수에 맞게 자동 조정)
  const remaining = [];
  let _cur = si + step;
  while (_cur >= 0 && _cur < STATIONS.length) { remaining.push(_cur); _cur += step; }

  const stopLabels = ['다음역', '그다음역', '그그다음역'];
  const stops = [];
  const midCount = Math.min(remaining.length - 1, 3);
  for (let i = 0; i < midCount; i++) {
    stops.push({ si: remaining[i], label: stopLabels[i] || `+${i+1}역`, isEnd: false });
  }
  if (remaining.length > 0) {
    stops.push({ si: endSi, label: '종착역', isEnd: true });
  }

  // 전역 출발 확인
  const prevSiIndex = dir === 'up' ? si + 1 : si - 1;
  const prevArrT = (prevSiIndex >= 0 && prevSiIndex < STATIONS.length)
    ? stTime(train, prevSiIndex, dir) + delayMins
    : null;
  const isPrevDeparted = prevArrT !== null && now >= prevArrT && now < actualArr;

  return (
    <div style={{
      position:'fixed', inset:0, background:'#000000CC',
      zIndex:9500, display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        background:C.card, borderRadius:'20px 20px 0 0',
        padding:'20px 20px 36px', width:'100%', maxWidth:430,
        border:`1px solid ${C.border}`,
        boxShadow:`0 -8px 40px #00000099`,
      }} onClick={e=>e.stopPropagation()}>

        {/* 헤더 */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div>
            <div style={{fontWeight:800, fontSize:16, color:dirColor}}>
              {dir==='up' ? '←' : '→'} {dirLabel}
            </div>
            <div style={{fontSize:11, color:C.muted, marginTop:2}}>다음 열차 정차역 도착 예정</div>
          </div>
          <button onClick={onClose} style={{
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:8, padding:'6px 10px', color:C.muted,
            cursor:'pointer', fontSize:14,
          }}>✕</button>
        </div>

        {/* 현재역 도착 */}
        <div style={{
          background: isPrevDeparted ? '#3B82F615' : dirColor+'12',
          border:`1px solid ${dirColor}44`,
          borderRadius:12, padding:'12px 16px', marginBottom:14,
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontSize:11, color:C.muted, marginBottom:2}}>
                {isPrevDeparted ? '🚆 전역 출발 — 이 역 도착까지' : '이 역 도착까지'}
              </div>
              <div style={{fontWeight:800, fontSize:13, color:C.text}}>
                {STATIONS[si]}역
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{
                fontFamily:"'Space Mono',monospace", fontSize:22, fontWeight:700,
                color: delayMins>0 ? C.yellow : dirColor,
              }}>{fmt(actualArr)}</div>
              <div style={{fontSize:12, color: diff<=0?C.red:diff<=3?C.red:C.muted}}>
                {diff<=0 ? '지금 도착' : diff<=1 ? '곧 도착' : `${diff}분 후`}
              </div>
            </div>
          </div>
          {delayMins > 0 && (
            <div style={{fontSize:11, color:C.yellow, marginTop:6}}>⚠️ {delayMins}분 연착 반영됨</div>
          )}
        </div>

        {/* 다음역/그다음역/종착역 3개 */}
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {stops.map((stop) => {
            const t = stTime(train, stop.si, dir) + delayMins;
            const diffStop = t - now;
            return (
              <div key={stop.si} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background: stop.isEnd ? C.accent+'15' : C.surface,
                border:`1px solid ${stop.isEnd ? C.accent+'55' : C.border}`,
                borderRadius:10, padding:'10px 14px',
              }}>
                <div>
                  <div style={{fontSize:10, color: stop.isEnd ? C.accent : C.muted, fontWeight:600, marginBottom:2}}>
                    {stop.label} {stop.isEnd ? '🏁' : ''}
                  </div>
                  <div style={{fontWeight:700, fontSize:14, color: stop.isEnd ? C.accent : C.text}}>
                    {STATIONS[stop.si]}역
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{
                    fontFamily:"'Space Mono',monospace", fontSize:18, fontWeight:700,
                    color: stop.isEnd ? C.accent : C.text,
                  }}>{fmt(t)}</div>
                  <div style={{fontSize:11, color:C.muted}}>
                    {diffStop <= 0 ? '도착' : `${diffStop}분 후`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 전역 출발 안내 */}
        {isPrevDeparted && (
          <div style={{
            marginTop:12, background:'#3B82F622', border:`1px solid #3B82F644`,
            borderRadius:8, padding:'8px 12px',
            fontSize:12, color:C.blue, textAlign:'center', fontWeight:600,
          }}>
            🚆 전역({STATIONS[prevSiIndex]}역) 출발 · {diff}분 후 이 역 도착 예정
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: 다음 열차
// ═══════════════════════════════════════════════════════════════
function NextTrainTab({ now, wknd, delays, setDelays }) {
  const [si, setSi] = useState(3); // 기본: 왜관역 (index 3)
  const [delayModal, setDelayModal] = useState(null);
  const [dirPopup, setDirPopup] = useState(null); // 'up' | 'down' | null
  // 전역 출발 배너: { dir, arrivalMins, delayMins }[] (dismissed 제거)
  const [departures, setDepartures] = useState([]);
  const [dismissed, setDismissed] = useState([]); // dismissed train ids per dir

  const upNext = getNextTrains(si, 'up', now, wknd, 4);
  const dnNext = getNextTrains(si, 'down', now, wknd, 4);

  // 전역 출발 감지 — now(분) 또는 역/방향 변경 시 재계산
  useEffect(() => {
    const today = new Date();
    // 오늘 자정 기준 ms
    const midnightMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const newDeps = [];
    for (const [trains, dir] of [[upNext, 'up'], [dnNext, 'down']]) {
      const first = trains[0];
      if (!first) continue;
      const delayMins = delays[first.id] || 0;
      const arrT = (first.arrTime !== undefined ? first.arrTime : stTime(first, si, dir)) + delayMins;
      const prevSi = dir === 'up' ? si + 1 : si - 1;
      if (prevSi < 0 || prevSi >= STATIONS.length) continue;
      const prevArrT = stTime(first, prevSi, dir) + delayMins;
      const isPrev = now >= prevArrT && now < arrT;
      if (isPrev) {
        const key = `${first.id}-${dir}`;
        if (!dismissed.includes(key)) {
          // arrivalMs: 오늘 자정 + 도착 분을 ms로 변환
          const arrivalMs = midnightMs + arrT * 60 * 1000;
          newDeps.push({ dir, arrivalMs, delayMins, key });
        }
      }
    }
    setDepartures(newDeps);
  }, [now, si, wknd, upNext.length, dnNext.length]);

  function handleDismiss(idx) {
    setDepartures(prev => {
      const copy = [...prev];
      const dep = copy[idx];
      if (dep) setDismissed(d => [...d, dep.key]);
      copy.splice(idx, 1);
      return copy;
    });
  }

  function handleDelaySave(delay) {
    if (delayModal) {
      setDelays(prev => ({ ...prev, [delayModal.id]: delay }));
    }
    setDelayModal(null);
  }

  return (
    <>
      <DepartureBanner departures={departures} onDismiss={handleDismiss}/>
    <div style={S.scroll}>
      <StationSelect value={si} onChange={setSi} label="현재 역 선택"/>

      {TRANSFERS[si] && (
        <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
          {TRANSFERS[si].map(t=>(
            <span key={t.name} style={S.badge(t.color)}>🔗 {t.name} 환승</span>
          ))}
        </div>
      )}

      {/* 요일 배너 */}
      <div style={{
        background: wknd ? '#6B21A822' : '#1E3A5F22',
        border:`1px solid ${wknd ? '#6B21A844' : '#3B82F644'}`,
        borderRadius:8, padding:'6px 12px',
        fontSize:12, color: wknd ? '#A78BFA' : C.blue,
        marginBottom:10, display:'flex', alignItems:'center', gap:6,
      }}>
        {wknd ? '🗓️ 토·일·공휴일 시간표' : '📅 평일 시간표'}
        <span style={{fontSize:11, color:C.muted}}>적용 중</span>
      </div>

      {/* 구미행 — 헤더 클릭 시 팝업 */}
      <div style={S.card}>
        <button
          onClick={() => setDirPopup('up')}
          style={{
            width:'100%', padding:'10px 14px', background:C.surface,
            borderBottom:`1px solid ${C.border}`, border:'none',
            display:'flex', alignItems:'center', gap:8, cursor:'pointer',
            borderRadius:'12px 12px 0 0',
          }}
        >
          <span style={{fontSize:16}}>🚄</span>
          <span style={{fontWeight:700,fontSize:14,color:C.text}}>구미행</span>
          <span style={{fontSize:11,color:C.muted}}>상행</span>
          <span style={{marginLeft:'auto', fontSize:11, color:C.accent, fontWeight:600}}>정차역 보기 ›</span>
        </button>
        {upNext.length===0
          ? <div style={{padding:'18px',color:C.muted,textAlign:'center',fontSize:13}}>운행 종료</div>
          : upNext.map(t=>(
            <TrainCard key={t.id} train={t} si={si} dir='up' now={now}
              delays={delays}
              onDelayEdit={setDelayModal}/>
          ))
        }
      </div>

      {/* 경산행 — 헤더 클릭 시 팝업 */}
      <div style={S.card}>
        <button
          onClick={() => setDirPopup('down')}
          style={{
            width:'100%', padding:'10px 14px', background:C.surface,
            borderBottom:`1px solid ${C.border}`, border:'none',
            display:'flex', alignItems:'center', gap:8, cursor:'pointer',
            borderRadius:'12px 12px 0 0',
          }}
        >
          <span style={{fontSize:16}}>🚄</span>
          <span style={{fontWeight:700,fontSize:14,color:C.text}}>경산·동대구행</span>
          <span style={{fontSize:11,color:C.muted}}>하행</span>
          <span style={{marginLeft:'auto', fontSize:11, color:C.blue, fontWeight:600}}>정차역 보기 ›</span>
        </button>
        {dnNext.length===0
          ? <div style={{padding:'18px',color:C.muted,textAlign:'center',fontSize:13}}>운행 종료</div>
          : dnNext.map(t=>(
            <TrainCard key={t.id} train={t} si={si} dir='down' now={now}
              delays={delays}
              onDelayEdit={setDelayModal}/>
          ))
        }
      </div>

      {delayModal && (
        <DelayModal
          train={delayModal}
          onClose={()=>setDelayModal(null)}
          onSave={handleDelaySave}
        />
      )}

      {dirPopup && (
        <DirectionPopup
          si={si}
          dir={dirPopup}
          now={now}
          wknd={wknd}
          delays={delays}
          onClose={() => setDirPopup(null)}
        />
      )}
    </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: 시간표 (왜관역 시간표 원본 형식 포함)
// ═══════════════════════════════════════════════════════════════
function TimetableTab({ now, wknd }) {
  const [si, setSi] = useState(3); // 왜관역 index=3
  const [dir, setDir] = useState('up');
  const [view, setView] = useState('list'); // 'list' | 'waegwan'
  const pastRef = useRef(null);

  const upTimes = wknd ? WAEGWAN_UP_WEEKEND : WAEGWAN_UP_WEEKDAY;
  const dnTimes = wknd ? WAEGWAN_DN_WEEKEND : WAEGWAN_DN_WEEKDAY;
  const trains = dir==='up'
    ? buildTrains(upTimes, 'up', 'K')
    : buildTrains(dnTimes, 'down', 'K');

  const rows = trains
    .map(t=>({ ...t, arrTime: stTime(t, si, dir) }))
    .filter(t=>t.arrTime!==null)
    .sort((a,b)=>a.arrTime-b.arrTime);

  const nextIdx = rows.findIndex(r=>r.arrTime>=now);

  useEffect(()=>{
    if(pastRef.current) {
      pastRef.current.scrollIntoView({block:'center', behavior:'smooth'});
    }
  },[si, dir, wknd]);

  // 왜관역 시간표 원본 형식 렌더
  function renderWaegwanTable() {
    const upW = WAEGWAN_UP_WEEKDAY;
    const upWe = WAEGWAN_UP_WEEKEND;
    const dnW = WAEGWAN_DN_WEEKDAY;
    const dnWe = WAEGWAN_DN_WEEKEND;

    const hours = Array.from({length:19}, (_,i)=>i+5); // 5~23시 + 00시

    function getMinutes(times, hour) {
      return times
        .filter(t => {
          const h = parseInt(t.split(':')[0]);
          return h === (hour === 24 ? 0 : hour);
        })
        .map(t => t.split(':')[1]);
    }

    return (
      <div style={{...S.card, overflow:'hidden'}}>
        <div style={{padding:'10px 14px', background:C.surface, borderBottom:`1px solid ${C.border}`,
          fontWeight:700, fontSize:13}}>
          왜관역 시간표 (북삼역 개통 반영)
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:11, minWidth:340}}>
            <thead>
              <tr style={{background:'#1A2640'}}>
                <th colSpan={3} style={{padding:'6px 8px', color:C.text, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`}}>
                  ← 구미 방면
                </th>
                <th style={{padding:'6px 8px', color:C.muted, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`, fontSize:10}}>시</th>
                <th colSpan={3} style={{padding:'6px 8px', color:C.text, borderBottom:`1px solid ${C.border}`}}>
                  경산·동대구 방면 →
                </th>
              </tr>
              <tr style={{background:'#131C2A', fontSize:10}}>
                <th style={{padding:'4px 6px', color:C.muted, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`}}>평일</th>
                <th style={{padding:'4px 6px', color:'#A78BFA', borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`}}>주말</th>
                <th style={{padding:'4px 2px', color:C.muted, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`}}></th>
                <th style={{padding:'4px 6px', color:C.muted, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`}}></th>
                <th style={{padding:'4px 6px', color:C.muted, borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`}}>평일</th>
                <th style={{padding:'4px 6px', color:'#A78BFA', borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`}}>주말</th>
                <th style={{padding:'4px 2px', color:C.muted, borderBottom:`1px solid ${C.border}`}}></th>
              </tr>
            </thead>
            <tbody>
              {[...hours, 0].map((h, idx) => {
                const upWMins   = getMinutes(upW,   h);
                const upWeMins  = getMinutes(upWe,  h);
                const dnWMins   = getMinutes(dnW,   h);
                const dnWeMins  = getMinutes(dnWe,  h);
                if (!upWMins.length && !upWeMins.length && !dnWMins.length && !dnWeMins.length) return null;
                const isNowHour = Math.floor(now/60) === h;
                return (
                  <tr key={h} style={{
                    background: isNowHour ? '#FF7A0008' : idx%2===0?'transparent':'#0D141E',
                    borderBottom:`1px solid ${C.border}`,
                  }}>
                    <td style={{padding:'5px 8px', color:C.text, borderRight:`1px solid ${C.border}`, verticalAlign:'top', minWidth:60}}>
                      {upWMins.join(' ')}
                    </td>
                    <td style={{padding:'5px 8px', color:'#A78BFA', borderRight:`1px solid ${C.border}`, verticalAlign:'top', minWidth:60}}>
                      {upWeMins.join(' ')}
                    </td>
                    <td style={{padding:'5px 4px', borderRight:`1px solid ${C.border}`}}></td>
                    <td style={{padding:'5px 8px', fontFamily:"'Space Mono',monospace",
                      fontWeight:700, color: isNowHour ? C.accent : C.muted,
                      textAlign:'center', borderRight:`1px solid ${C.border}`, fontSize:13}}>
                      {String(h).padStart(2,'0')}
                    </td>
                    <td style={{padding:'5px 8px', color:C.text, borderRight:`1px solid ${C.border}`, verticalAlign:'top', minWidth:60}}>
                      {dnWMins.join(' ')}
                    </td>
                    <td style={{padding:'5px 8px', color:'#A78BFA', borderRight:`1px solid ${C.border}`, verticalAlign:'top', minWidth:60}}>
                      {dnWeMins.join(' ')}
                    </td>
                    <td style={{padding:'5px 4px'}}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:'8px 12px', background:C.surface, fontSize:10, color:C.muted}}>
          ※ 실지 시간은 열차운행 사정에 의해 변경될 수 있습니다.
        </div>
      </div>
    );
  }

  return (
    <div style={S.scroll}>
      {/* 뷰 전환 */}
      <div style={{display:'flex', gap:8, marginBottom:10}}>
        <button style={S.pill(view==='list')} onClick={()=>setView('list')}>📋 목록형</button>
        <button style={S.pill(view==='waegwan')} onClick={()=>setView('waegwan')}>🗒️ 왜관역 시간표</button>
      </div>

      {view==='waegwan' ? renderWaegwanTable() : (
        <>
          <StationSelect value={si} onChange={setSi} label="역 선택"/>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button style={S.pill(dir==='up')} onClick={()=>setDir('up')}>← 구미행 (상행)</button>
            <button style={S.pill(dir==='down')} onClick={()=>setDir('down')}>경산·동대구행 → (하행)</button>
          </div>

          <div style={{
            background: wknd ? '#6B21A822' : '#1E3A5F22',
            border:`1px solid ${wknd?'#6B21A844':'#3B82F644'}`,
            borderRadius:8, padding:'5px 12px',
            fontSize:11, color: wknd?'#A78BFA':C.blue,
            marginBottom:10,
          }}>
            {wknd ? '🗓️ 토·일·공휴일 시간표' : '📅 평일 시간표'} 적용 중
          </div>

          <div style={S.card}>
            <div style={{padding:'10px 14px',background:C.surface,borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontWeight:700,fontSize:14}}>{STATIONS[si]}역 전체 시간표</span>
              <span style={{fontSize:11,color:C.muted}}>총 {rows.length}편</span>
            </div>

            {rows.map((r, i) => {
              const isPast = r.arrTime < now;
              const isNext = i === nextIdx;
              return (
                <div
                  key={r.id}
                  ref={isNext ? pastRef : null}
                  style={{
                    padding:'10px 14px',
                    borderBottom:`1px solid ${C.border}`,
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    opacity: isPast ? 0.35 : 1,
                    background: isNext ? '#FF7A0015' : 'transparent',
                  }}
                >
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {isNext && <span style={{width:6,height:6,borderRadius:3,background:C.accent,flexShrink:0,animation:'pulse 1.5s infinite'}}/>}
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,letterSpacing:-0.5,color: isNext ? C.accent : C.text}}>
                      {fmt(r.arrTime)}
                    </span>
                    <span style={{fontSize:11,color:C.muted}}>{r.id}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    {isNext && <MinuteBadge mins={r.arrTime} now={now}/>}
                    {!isNext && !isPast && <span style={{fontSize:11,color:C.muted}}>{r.arrTime-now}분 후</span>}
                    {isPast && <span style={{fontSize:11,color:C.muted}}>통과</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: 경로 검색
// ═══════════════════════════════════════════════════════════════
function RouteTab({ now, wknd, delays }) {
  const [fromSi, setFromSi] = useState(7); // 경산
  const [toSi, setToSi] = useState(3);    // 왜관
  const [searched, setSearched] = useState(false);

  const results = searched ? findRouteTrains(fromSi, toSi, now, wknd) : [];
  const dir = fromSi > toSi ? 'up' : 'down';
  const travelMins = Math.abs(
    (dir==='up' ? UP_OFF : DN_OFF)[toSi] - (dir==='up' ? UP_OFF : DN_OFF)[fromSi]
  );
  const fare = calcFare(fromSi, toSi);
  const stationsBetween = fromSi > toSi
    ? STATIONS.slice(toSi, fromSi+1).reverse()
    : STATIONS.slice(fromSi, toSi+1);

  function swap() {
    const tmp = fromSi;
    setFromSi(toSi); setToSi(tmp);
    setSearched(false);
  }

  return (
    <div style={S.scroll}>
      <div style={S.card}>
        <div style={{padding:'12px 14px'}}>
          <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
            <div style={{flex:1}}>
              <StationSelect value={fromSi} onChange={v=>{setFromSi(v);setSearched(false)}} label="출발역"/>
            </div>
            <button onClick={swap} style={{
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:8, padding:'8px 10px', cursor:'pointer', color:C.accent,
              fontSize:18, marginBottom:8, flexShrink:0,
            }}>⇅</button>
            <div style={{flex:1}}>
              <StationSelect value={toSi} onChange={v=>{setToSi(v);setSearched(false)}} label="도착역"/>
            </div>
          </div>

          {fromSi !== toSi && (
            <div style={{
              background:C.surface, borderRadius:8, padding:'8px 12px',
              display:'flex', gap:16, marginBottom:10,
              border:`1px solid ${C.border}`,
            }}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:10,color:C.muted}}>소요시간</div>
                <div style={{fontSize:16,fontWeight:700,color:C.accent}}>{travelMins}분</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:10,color:C.muted}}>정차역</div>
                <div style={{fontSize:16,fontWeight:700,color:C.text}}>{stationsBetween.length-1}개</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:10,color:C.muted}}>운임</div>
                <div style={{fontSize:16,fontWeight:700,color:C.text}}>{fare.toLocaleString()}원~</div>
              </div>
            </div>
          )}

          {/* 요일 표시 */}
          <div style={{
            background: wknd ? '#6B21A822' : '#1E3A5F22',
            border:`1px solid ${wknd?'#6B21A844':'#3B82F644'}`,
            borderRadius:6, padding:'4px 10px',
            fontSize:11, color: wknd?'#A78BFA':C.blue,
            marginBottom:10, textAlign:'center',
          }}>
            {wknd ? '🗓️ 토·일·공휴일 시간표' : '📅 평일 시간표'}
          </div>

          <button
            onClick={()=>setSearched(true)}
            disabled={fromSi===toSi}
            style={{
              width:'100%', padding:'11px',
              background: fromSi===toSi ? C.surface : C.accent,
              color: fromSi===toSi ? C.muted : '#fff',
              border:'none', borderRadius:8, fontSize:14,
              fontWeight:700, cursor: fromSi===toSi?'not-allowed':'pointer',
            }}
          >
            🔍 열차 검색
          </button>
        </div>
      </div>

      {fromSi !== toSi && (
        <div style={{...S.card, padding:'12px 14px', marginBottom:10}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>노선 경로</div>
          <div style={{display:'flex',alignItems:'center',gap:0,flexWrap:'wrap',rowGap:4}}>
            {stationsBetween.map((s,i)=>(
              <div key={s} style={{display:'flex',alignItems:'center'}}>
                <div style={{
                  padding:'4px 8px', borderRadius:12,
                  background: i===0||i===stationsBetween.length-1 ? C.accent+'33' : C.surface,
                  border:`1px solid ${i===0||i===stationsBetween.length-1 ? C.accent : C.border}`,
                  color: i===0||i===stationsBetween.length-1 ? C.accent : C.text,
                  fontSize:12, fontWeight:600,
                }}>
                  {s}
                </div>
                {i < stationsBetween.length-1 && (
                  <span style={{color:C.muted,fontSize:10,padding:'0 2px'}}>─▶</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && (
        <div style={S.card}>
          <div style={{
            padding:'10px 14px',background:C.surface,
            borderBottom:`1px solid ${C.border}`,
            display:'flex',justifyContent:'space-between',alignItems:'center',
          }}>
            <span style={{fontWeight:700,fontSize:14}}>
              {STATIONS[fromSi]} → {STATIONS[toSi]}
            </span>
            <span style={{fontSize:11,color:C.muted}}>{results.length}편</span>
          </div>

          {results.length===0
            ? <div style={{padding:20,textAlign:'center',color:C.muted,fontSize:13}}>오늘 운행 종료</div>
            : results.map((r,i)=>{
              const depT = stTime(r, fromSi, dir);
              const arrT = stTime(r, toSi, dir);
              const delayMins = delays[r.id] || 0;
              return (
                <div key={r.id} style={{
                  padding:'12px 14px',
                  borderBottom:`1px solid ${C.border}`,
                  background: i===0 ? '#FF7A0010' : 'transparent',
                }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,
                        color: delayMins>0 ? C.yellow : i===0 ? C.accent : C.text}}>
                        {fmt(depT + delayMins)}
                      </span>
                      <span style={{color:C.muted,fontSize:13}}>→</span>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,color:C.text}}>
                        {fmt(arrT + delayMins)}
                      </span>
                    </div>
                    {i===0
                      ? <MinuteBadge mins={depT} now={now} delayMins={delayMins}/>
                      : <span style={{fontSize:11,color:C.muted}}>{depT+delayMins-now}분 후</span>
                    }
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:11,color:C.muted}}>{r.id}</span>
                    <span style={{fontSize:11,color:C.muted}}>·</span>
                    <span style={{fontSize:11,color:C.muted}}>{travelMins}분 소요</span>
                    <span style={{fontSize:11,color:C.muted}}>·</span>
                    <span style={{fontSize:11,color:C.blue}}>{fare.toLocaleString()}원~</span>
                    {delayMins > 0 && (
                      <>
                        <span style={{fontSize:11,color:C.muted}}>·</span>
                        <span style={{...S.badge(C.yellow), fontSize:10}}>⚠️ {delayMins}분 연착</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: 노선도 (인터랙티브 수평 노선도 + 다음 열차 표시)
// ═══════════════════════════════════════════════════════════════
function MapTab({ now, wknd, delays }) {
  const [selectedSi, setSelectedSi] = useState(3); // 기본: 왜관

  // 선택 역 기준 다음 열차 2개씩
  const upNext2 = getNextTrains(selectedSi, 'up',   now, wknd, 2);
  const dnNext2 = getNextTrains(selectedSi, 'down', now, wknd, 2);

  const n = STATIONS.length; // 8 (개통역)

  return (
    <div style={S.scroll}>
      {/* ── 노선도 카드 ── */}
      <div style={{...S.card, padding:'18px 10px 14px'}}>
        <div style={{fontWeight:700, fontSize:13, color:C.text, marginBottom:16, paddingLeft:6}}>
          대경선 노선도 · 역 선택
        </div>

        {/* 수평 노선 */}
        <div style={{
          position:'relative',
          display:'flex', alignItems:'center',
          justifyContent:'space-between',
          paddingBottom: 0,
        }}>
          {/* 선로 라인 */}
          <div style={{
            position:'absolute',
            top:'50%', left:18, right:18,
            height:4,
            background:`linear-gradient(to right, ${C.accent}, ${C.blue})`,
            borderRadius:2,
            transform:'translateY(-50%)',
            zIndex:0,
          }}/>

          {STATIONS.map((s, i) => {
            const isSelected = i === selectedSi;
            const hasTransfer = !!TRANSFERS[i];
            // 역 위치: 짝수 인덱스는 위, 홀수는 아래 (label 위치용)
            const labelUp = i % 2 === 0;

            return (
              <button
                key={s}
                onClick={() => setSelectedSi(i)}
                style={{
                  background:'none', border:'none', padding:0,
                  display:'flex', flexDirection:'column', alignItems:'center',
                  position:'relative', zIndex:2, cursor:'pointer',
                  flexShrink:0,
                  width: `${100/n}%`,
                }}
              >
                {/* 위 레이블 */}
                <div style={{
                  height:38,
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent: labelUp ? 'flex-end' : 'flex-start',
                  paddingBottom: labelUp ? 6 : 0,
                  paddingTop: labelUp ? 0 : 6,
                  visibility: labelUp ? 'visible' : 'hidden',
                }}>
                  <span style={{
                    fontSize: isSelected ? 11 : 9.5,
                    fontWeight: isSelected ? 800 : hasTransfer ? 600 : 400,
                    color: isSelected ? C.accent : hasTransfer ? '#FBBF24' : C.text,
                    letterSpacing:-0.3,
                    textAlign:'center',
                    transition:'all .15s',
                    lineHeight:1.2,
                    whiteSpace:'nowrap',
                  }}>
                    {s}
                  </span>
                </div>

                {/* 역 점 */}
                <div style={{
                  width:  isSelected ? 18 : hasTransfer ? 13 : 10,
                  height: isSelected ? 18 : hasTransfer ? 13 : 10,
                  borderRadius:'50%',
                  background: isSelected ? C.accent : hasTransfer ? '#FBBF24' : C.surface,
                  border: `2.5px solid ${isSelected ? C.accent : hasTransfer ? '#FBBF24' : C.muted}`,
                  boxShadow: isSelected
                    ? `0 0 12px ${C.accent}99`
                    : hasTransfer ? `0 0 6px #FBBF2466` : 'none',
                  transition:'all .15s',
                  zIndex:3,
                  flexShrink:0,
                }}/>

                {/* 아래 레이블 */}
                <div style={{
                  height:38,
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent: !labelUp ? 'flex-start' : 'flex-end',
                  paddingTop: !labelUp ? 6 : 0,
                  paddingBottom: !labelUp ? 0 : 6,
                  visibility: !labelUp ? 'visible' : 'hidden',
                }}>
                  <span style={{
                    fontSize: isSelected ? 11 : 9.5,
                    fontWeight: isSelected ? 800 : hasTransfer ? 600 : 400,
                    color: isSelected ? C.accent : hasTransfer ? '#FBBF24' : C.text,
                    letterSpacing:-0.3,
                    textAlign:'center',
                    transition:'all .15s',
                    lineHeight:1.2,
                    whiteSpace:'nowrap',
                  }}>
                    {s}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 방향 라벨 */}
        <div style={{display:'flex', justifyContent:'space-between', marginTop:4, paddingLeft:2, paddingRight:2}}>
          <span style={{fontSize:10, color:C.muted}}>← 구미</span>
          <span style={{fontSize:10, color:C.muted}}>경산 →</span>
        </div>
      </div>

      {/* ── 선택 역 표시 ── */}
      <div style={{
        background:'#FF7A0012', border:`1px solid ${C.accent}44`,
        borderRadius:10, padding:'10px 14px', marginBottom:10,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{fontSize:10, color:C.muted, marginBottom:2}}>선택된 역</div>
          <div style={{fontWeight:800, fontSize:17, color:C.accent}}>
            {STATIONS[selectedSi]}역
          </div>
          {TRANSFERS[selectedSi] && (
            <div style={{display:'flex', gap:4, marginTop:4, flexWrap:'wrap'}}>
              {TRANSFERS[selectedSi].map(t=>(
                <span key={t.name} style={{...S.badge(t.color), fontSize:10}}>🔗 {t.name}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:10, color:C.muted}}>구미까지</div>
          <div style={{fontSize:14, fontWeight:700, color:C.text}}>{DIST_FROM_GUMI[selectedSi]}km</div>
        </div>
      </div>

      {/* ── 다음 열차 2개씩 ── */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10}}>

        {/* 구미행 */}
        <div style={{...S.card, marginBottom:0}}>
          <div style={{
            padding:'8px 10px', background:C.surface,
            borderBottom:`1px solid ${C.border}`,
            display:'flex', alignItems:'center', gap:5,
          }}>
            <span style={{fontSize:13}}>←</span>
            <span style={{fontWeight:700, fontSize:12, color:C.text}}>구미행</span>
          </div>
          {upNext2.length === 0
            ? <div style={{padding:'12px 10px', color:C.muted, fontSize:11, textAlign:'center'}}>운행 종료</div>
            : upNext2.map((t, idx) => {
              const arrT = stTime(t, selectedSi, 'up');
              const delayMins = delays[t.id] || 0;
              const actualArr = arrT + delayMins;
              const diff = actualArr - now;
              return (
                <div key={t.id} style={{
                  padding:'10px 10px',
                  borderBottom: idx < upNext2.length-1 ? `1px solid ${C.border}` : 'none',
                  background: idx===0 ? '#FF7A0008' : 'transparent',
                }}>
                  <div style={{
                    fontFamily:"'Space Mono',monospace",
                    fontSize:16, fontWeight:700,
                    color: delayMins>0 ? C.yellow : idx===0 ? C.accent : C.text,
                  }}>
                    {fmt(actualArr)}
                  </div>
                  {delayMins > 0 && (
                    <div style={{fontSize:9, color:C.yellow}}>⚠️ {delayMins}분 연착</div>
                  )}
                  <div style={{fontSize:10, color:C.muted, marginTop:2}}>
                    {diff <= 0 ? '출발' : diff <= 1 ? '곧 출발' : `${diff}분 후`}
                  </div>
                  {idx === 1 && (
                    <div style={{fontSize:9, color:C.muted, marginTop:1}}>다음 열차</div>
                  )}
                </div>
              );
            })
          }
        </div>

        {/* 경산행 */}
        <div style={{...S.card, marginBottom:0}}>
          <div style={{
            padding:'8px 10px', background:C.surface,
            borderBottom:`1px solid ${C.border}`,
            display:'flex', alignItems:'center', gap:5,
          }}>
            <span style={{fontWeight:700, fontSize:12, color:C.text}}>경산행</span>
            <span style={{fontSize:13}}>→</span>
          </div>
          {dnNext2.length === 0
            ? <div style={{padding:'12px 10px', color:C.muted, fontSize:11, textAlign:'center'}}>운행 종료</div>
            : dnNext2.map((t, idx) => {
              const arrT = stTime(t, selectedSi, 'down');
              const delayMins = delays[t.id] || 0;
              const actualArr = arrT + delayMins;
              const diff = actualArr - now;
              return (
                <div key={t.id} style={{
                  padding:'10px 10px',
                  borderBottom: idx < dnNext2.length-1 ? `1px solid ${C.border}` : 'none',
                  background: idx===0 ? '#3B82F608' : 'transparent',
                }}>
                  <div style={{
                    fontFamily:"'Space Mono',monospace",
                    fontSize:16, fontWeight:700,
                    color: delayMins>0 ? C.yellow : idx===0 ? C.blue : C.text,
                  }}>
                    {fmt(actualArr)}
                  </div>
                  {delayMins > 0 && (
                    <div style={{fontSize:9, color:C.yellow}}>⚠️ {delayMins}분 연착</div>
                  )}
                  <div style={{fontSize:10, color:C.muted, marginTop:2}}>
                    {diff <= 0 ? '출발' : diff <= 1 ? '곧 출발' : `${diff}분 후`}
                  </div>
                  {idx === 1 && (
                    <div style={{fontSize:9, color:C.muted, marginTop:1}}>다음 열차</div>
                  )}
                </div>
              );
            })
          }
        </div>
      </div>

      {/* ── 요일 안내 ── */}
      <div style={{
        background: wknd ? '#6B21A818' : '#1E3A5F18',
        border:`1px solid ${wknd?'#6B21A844':'#3B82F633'}`,
        borderRadius:8, padding:'6px 12px',
        fontSize:11, color: wknd?'#A78BFA':C.blue, marginBottom:10,
        textAlign:'center',
      }}>
        {wknd ? '🗓️ 토·일·공휴일 시간표 적용 중' : '📅 평일 시간표 적용 중'}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════
const TABS = [
  { icon:'🚆', label:'다음열차' },
  { icon:'📋', label:'시간표' },
  { icon:'🔍', label:'경로검색' },
  { icon:'🗺️', label:'노선도' },
];

export default function App() {
  const [tab, setTab] = useState(0);
  const [nowMins, setNowMins] = useState(()=>{
    const d=new Date(); return d.getHours()*60+d.getMinutes();
  });
  const [displayTime, setDisplayTime] = useState(()=>new Date());
  const [wknd, setWknd] = useState(()=>isWeekend(new Date()));
  const [delays, setDelays] = useState({});

  useEffect(()=>{
    const t = setInterval(()=>{
      const d=new Date();
      setNowMins(d.getHours()*60+d.getMinutes());
      setDisplayTime(d);
      setWknd(isWeekend(d));
    }, 15000);
    return ()=>clearInterval(t);
  },[]);

  const timeStr = `${String(displayTime.getHours()).padStart(2,'0')}:${String(displayTime.getMinutes()).padStart(2,'0')}`;
  const dateStr = displayTime.toLocaleDateString('ko-KR',{month:'short',day:'numeric',weekday:'short'});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Space+Mono:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080C12; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 3px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideIn { from { transform:translateX(-50%) translateY(-20px); opacity:0; } to { transform:translateX(-50%) translateY(0); opacity:1; } }
      `}</style>

      <div style={S.app}>
        {/* Header */}
        <div style={S.header}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{
                background:C.accent,borderRadius:6,
                width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:14,fontWeight:900,color:'#fff',
              }}>대</div>
              <div>
                <div style={{fontWeight:800,fontSize:15,letterSpacing:-0.3}}>대경선</div>
                <div style={{fontSize:10,color:C.muted,marginTop:-1}}>
                  {wknd
                    ? <span style={{color:'#A78BFA'}}>토·일·공휴일 운행</span>
                    : <span style={{color:C.blue}}>평일 운행</span>
                  } · 구미↔경산
                </div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,color:C.accent}}>
                {timeStr}
              </div>
              <div style={{fontSize:10,color:C.muted}}>{dateStr}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        {tab===0 && <NextTrainTab now={nowMins} wknd={wknd} delays={delays} setDelays={setDelays}/>}
        {tab===1 && <TimetableTab now={nowMins} wknd={wknd}/>}
        {tab===2 && <RouteTab now={nowMins} wknd={wknd} delays={delays}/>}
        {tab===3 && <MapTab now={nowMins} wknd={wknd} delays={delays}/>}

        {/* Tab bar */}
        <div style={S.tabBar}>
          {TABS.map(({icon,label},i)=>(
            <button key={i} style={S.tabBtn(tab===i)} onClick={()=>setTab(i)}>
              <span style={{fontSize:tab===i?20:18,transition:'font-size .15s'}}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
