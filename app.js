/* ===== إعدادات احتياطية (تُستخدم فقط لو شغّلت الموقع بدون السيرفر) ===== */
const RECITERS_CONFIG=[
 {id:'minshawi', name:'محمد صديق المنشاوي', img:'uploads/img/minshawi.jpg', base:'uploads/audio/minshawi/'},
 {id:'ebada',    name:'محمد عبادة',          img:'uploads/img/ebada.jpg',    base:'uploads/audio/ebada/'},
];
const ADHAN_FILE='uploads/adhan.mp3';
/* ======================================================================= */

const $=s=>document.querySelector(s), app=$('#app');
const ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const qt=x=>esc(x).replace(/"/g,'&quot;');
const fetchJSON=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(r.status);return r.json()};
const fail=()=>app.innerHTML='<p class="msg">تعذّر تحميل المحتوى. اتصل بالإنترنت مرة واحدة واضغط «تجهيز أوفلاين» في أعلى الصفحة، وبعدها يعمل الموقع بدون إنترنت.<br><br><button class="cnt" onclick="route()">إعادة المحاولة</button></p>';
const avatar=r=>`<span class="av">${r.img?`<img src="${qt(r.img)}" alt="" onerror="this.remove()">`:'♪'}</span>`;

/* الوضع الليلي */
const root=document.documentElement;
root.dataset.theme=store.get('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
$('#th').onclick=()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';store.set('theme',root.dataset.theme)};
$('#bm').onclick=()=>{const b=store.get('bm');if(b)location.hash='#/quran/'+b;else alert('لم تحفظ موضعاً بعد. اضغط على أي آية لحفظها.')};

/* ===== الاتصال بالسيرفر ===== */
const API={
 async req(url,opt={}){
  opt.headers=Object.assign({'x-admin-key':store.get('adminKey')||''},opt.headers||{});
  const r=await fetch(url,opt);
  if(r.status===401){const k=prompt('أدخل مفتاح الإدارة (ADMIN_KEY)');if(k){store.set('adminKey',k);return this.req(url,opt)}throw new Error('غير مصرّح')}
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||r.status);
  return j;
 }
};
let serverMode=null;
async function detectServer(){
 if(serverMode!==null)return serverMode;
 try{const r=await fetch('/api/reciters');serverMode=r.ok&&(r.headers.get('content-type')||'').includes('json')}catch(e){serverMode=false}
 return serverMode;
}

/* الأذكار */
const ADHKAR={
 'الصباح':[
  {t:'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',c:1,s:'آية الكرسي — البقرة ٢٥٥'},
  {t:'قُلْ هُوَ اللَّهُ أَحَدٌ ... وقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... وقُلْ أَعُوذُ بِرَبِّ النَّاسِ',c:3,s:'سور الإخلاص والفلق والناس — تُقرأ كل سورة ثلاث مرات'},
  {t:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',c:1,s:'رواه مسلم'},
  {t:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',c:1,s:'سيد الاستغفار — رواه البخاري'},
  {t:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',c:3,s:'رواه أبو داود والترمذي'},
  {t:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',c:100,s:'متفق عليه'}],
 'المساء':[
  {t:'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ ... (آية الكرسي)',c:1,s:'البقرة ٢٥٥'},
  {t:'قُلْ هُوَ اللَّهُ أَحَدٌ ... وقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... وقُلْ أَعُوذُ بِرَبِّ النَّاسِ',c:3,s:'تُقرأ كل سورة ثلاث مرات'},
  {t:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',c:1,s:'رواه مسلم'},
  {t:'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',c:1,s:'رواه الترمذي'},
  {t:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',c:3,s:'رواه مسلم'},
  {t:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',c:100,s:'متفق عليه'}],
 'بعد الصلاة':[
  {t:'أَسْتَغْفِرُ اللَّهَ',c:3,s:'رواه مسلم'},
  {t:'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',c:1,s:'رواه مسلم'},
  {t:'سُبْحَانَ اللَّهِ',c:33,s:'رواه مسلم'},{t:'الْحَمْدُ لِلَّهِ',c:33,s:'رواه مسلم'},{t:'اللَّهُ أَكْبَرُ',c:33,s:'رواه مسلم'},
  {t:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',c:1,s:'تمام المائة — رواه مسلم'}],
 'النوم':[
  {t:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',c:1,s:'رواه البخاري'},
  {t:'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',c:3,s:'رواه أبو داود والترمذي'}]
};
function adhkar(){
  const tabs=Object.keys(ADHKAR);let cur=tabs[0];
  const draw=()=>{
    app.innerHTML='<div class="sub">'+tabs.map(k=>`<button class="${k===cur?'on':''}" data-k="${k}">${k}</button>`).join('')+'</div>'+
    ADHKAR[cur].map(d=>`<div class="z"><p>${esc(d.t).replace(/\n/g,'<br>')}</p><div class="src">${esc(d.s)}</div><button class="cnt" data-c="${d.c}" aria-label="عداد">التكرار: <b>${ar(d.c)}</b></button></div>`).join('');
    app.querySelectorAll('.sub button').forEach(b=>b.onclick=()=>{cur=b.dataset.k;draw()});
    app.querySelectorAll('.cnt').forEach(b=>b.onclick=()=>{let n=+b.dataset.c;if(n>0){b.dataset.c=--n;b.querySelector('b').textContent=n?ar(n):'تم ✓';if(!n)b.classList.add('done')}});
  };draw();
}

/* القرآن */
let surahs=null;
const idb={open(){return new Promise((ok,no)=>{const r=indexedDB.open('noor',1);r.onupgradeneeded=()=>r.result.createObjectStore('d');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})},
 async get(k){const db=await this.open();return new Promise(ok=>{const q=db.transaction('d').objectStore('d').get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>ok(null)})},
 async set(k,v){const db=await this.open();return new Promise((ok,no)=>{const t=db.transaction('d','readwrite');t.objectStore('d').put(v,k);t.oncomplete=ok;t.onerror=()=>no(t.error)})}};
async function getData(k,local,remote){
  try{const c=await idb.get(k);if(c)return c}catch(e){}
  let d;try{d=await fetchJSON(local)}catch(e){d=await fetchJSON(remote)}
  try{await idb.set(k,d)}catch(e){}
  return d;
}
const loadHadith=()=>getData('hadith','data/hadith.json','https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.json');
async function loadQuran(){
  if(surahs)return surahs;
  surahs=(await getData('quran','data/quran.json','https://api.alquran.cloud/v1/quran/quran-uthmani')).data.surahs;
  return surahs;
}
async function listSurahs(){
  app.innerHTML='<p class="msg">جارٍ التحميل…</p>';
  try{await loadQuran()}catch(e){return fail()}
  app.innerHTML='<input type="search" id="q" placeholder="ابحث باسم السورة أو رقمها" aria-label="بحث"><div class="grid" id="g"></div>';
  const g=$('#g'),draw=q=>g.innerHTML=surahs.filter(s=>!q||s.name.includes(q)||String(s.number)===q).map(s=>`<a class="s" href="#/quran/${s.number}"><span class="n">${ar(s.number)}</span><span><b>${s.name}</b><small>${s.revelationType==='Meccan'?'مكية':'مدنية'} — ${ar(s.numberOfAyahs||s.ayahs.length)} آية</small></span></a>`).join('')||'<p class="msg">لا توجد نتائج</p>';
  draw();$('#q').oninput=e=>draw(e.target.value.trim());
}
async function surah(n){
  app.innerHTML='<p class="msg">جارٍ التحميل…</p>';
  let d;try{d=(await loadQuran()).find(x=>x.number==n);if(!d.ayahs)d=(await fetchJSON(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`)).data}catch(e){return fail()}
  const fs=+store.get('fs')||1.9, mark=+(store.get('bm')||'').split('/')[1]||0, same=(store.get('bm')||'').split('/')[0]==n;
  const body=d.ayahs.map(a=>{let t=a.text;if(a.numberInSurah===1&&n!=1)t=t.split(' ').slice(4).join(' ');
    return `<span class="a ${same&&mark===a.numberInSurah?'mark':''}" data-n="${a.numberInSurah}">${t}<span class="end">﴿${ar(a.numberInSurah)}﴾</span></span>`}).join(' ');
  app.innerHTML=`<div class="bar"><a href="#/quran">كل السور</a><b style="font-family:'Amiri Quran';font-size:1.5rem">${d.name}</b><span><button id="m">أ−</button> <button id="p">أ+</button></span></div>
  <div class="page">${n!=1&&n!=9?'<div class="bsm">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>':''}<div class="mushaf" style="--fs:${fs}rem">${body}</div></div>
  <div class="bar" style="margin-top:14px">${n>1?`<a href="#/quran/${n-1}">السورة السابقة</a>`:'<span></span>'}${n<114?`<a href="#/quran/${+n+1}">السورة التالية</a>`:'<span></span>'}</div>`;
  const m=$('.mushaf');
  m.onclick=e=>{const a=e.target.closest('.a');if(!a)return;m.querySelectorAll('.mark').forEach(x=>x.classList.remove('mark'));a.classList.add('mark');store.set('bm',n+'/'+a.dataset.n)};
  const size=x=>{const v=Math.min(3.4,Math.max(1.2,(+store.get('fs')||1.9)+x));store.set('fs',v);m.style.setProperty('--fs',v+'rem')};
  $('#m').onclick=()=>size(-.2);$('#p').onclick=()=>size(.2);scrollTo(0,0);
}

/* الأحاديث: الأربعون النووية */
async function hadith(){
  app.innerHTML='<p class="msg">جارٍ التحميل…</p>';
  let d;try{d=await loadHadith()}catch(e){return fail()}
  app.innerHTML='<input type="search" id="q" placeholder="ابحث في الأحاديث" aria-label="بحث"><div id="l"></div>';
  const l=$('#l'),draw=q=>l.innerHTML=d.hadiths.filter(h=>!q||h.text.includes(q)).map(h=>`<div class="z h"><span class="num">الحديث ${ar(h.hadithnumber)} — الأربعون النووية</span><p>${esc(h.text)}</p></div>`).join('')||'<p class="msg">لا توجد نتائج</p>';
  draw();$('#q').oninput=e=>draw(e.target.value.trim());
}

/* مواقيت الصلاة (حساب محلي بدون إنترنت — طريقة الهيئة المصرية: فجر 19.5° وعشاء 17.5°) */
const R=Math.PI/180,sin=x=>Math.sin(x*R),cos=x=>Math.cos(x*R),h24=x=>((x%24)+24)%24;
function jdate(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sun(jd){const d=jd-2451545,g=(357.529+.98560028*d)%360,q=(280.459+.98564736*d)%360,L=(q+1.915*sin(g)+.02*sin(2*g))%360,e=23.439-3.6e-7*d,RA=Math.atan2(cos(e)*sin(L),cos(L))/R/15;return{dec:Math.asin(sin(e)*sin(L))/R,eq:q/15-h24(RA)}}
function times(date,loc){
  const tz=-date.getTimezoneOffset()/60,jd=jdate(date.getFullYear(),date.getMonth()+1,date.getDate())-loc.lng/360,sn=sun(jd+.5),dec=sn.dec,lat=loc.lat;
  const noon=h24(12+tz-loc.lng/15-sn.eq);
  const a=alt=>Math.acos(Math.max(-1,Math.min(1,(sin(alt)-sin(lat)*sin(dec))/(cos(lat)*cos(dec)))))/R/15;
  const asrAlt=Math.atan(1/(1+Math.tan(Math.abs(lat-dec)*R)))/R;
  return{fajr:noon-a(-19.5),sunrise:noon-a(-.833),dhuhr:noon+.0333,asr:noon+a(asrAlt),maghrib:noon+a(-.833),isha:noon+a(-17.5)};
}
const CITIES={'القاهرة':[30.04,31.24],'الإسكندرية':[31.2,29.92],'المنصورة':[31.04,31.38],'طنطا':[30.79,31.0],'أسيوط':[27.18,31.18],'الأقصر':[25.7,32.64],'أسوان':[24.09,32.9],'مكة المكرمة':[21.42,39.83],'المدينة المنورة':[24.47,39.61],'الرياض':[24.71,46.68],'دبي':[25.2,55.27],'عمّان':[31.95,35.93]};
const NAMES=[['fajr','الفجر'],['sunrise','الشروق'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
const getLoc=()=>{try{const l=JSON.parse(store.get('loc'));if(l&&l.lat!=null)return l}catch(e){}return{n:'القاهرة',lat:30.04,lng:31.24}};
const fmt=h=>{const m=Math.round(h*60)%1440,H=Math.floor(m/60);return ar(H%12||12)+':'+ar(String(m%60).padStart(2,'0'))+(H<12?' ص':' م')};
let tick;
let played='',aud;
async function playAdhan(test){
  try{const b=await idb.get('adhan');aud=new Audio(b?URL.createObjectURL(b):ADHAN_FILE);await aud.play()}
  catch(e){if(test)alert('تعذّر التشغيل: ارفع ملف الأذان من صفحة «الأذان»، ثم اضغط في الصفحة وأعد المحاولة')}
}
setInterval(()=>{if(store.get('adhan')!=='1')return;const n=new Date(),t=times(n,getLoc()),c=n.getHours()*60+n.getMinutes();
  for(const [id] of NAMES){if(id!=='sunrise'&&Math.round(t[id]*60)===c&&played!==n.toDateString()+id){played=n.toDateString()+id;playAdhan()}}},15000);
function prayer(){
  clearInterval(tick);
  const loc=getLoc(),opts=Object.keys(CITIES).map(c=>`<option ${c===loc.n?'selected':''}>${c}</option>`).join('')+(CITIES[loc.n]?'':`<option selected>${loc.n}</option>`);
  app.innerHTML=`<div class="bar"><select id="c" aria-label="المدينة">${opts}</select><button id="g">استخدم موقعي</button></div><div id="nx"></div>
  <div class="page" id="pt" style="padding:0">${NAMES.map(([id,nm])=>`<div class="pr" id="r-${id}"><span>${nm}</span><span></span></div>`).join('')}</div>
  <p class="src" style="margin-top:12px">الحساب بطريقة الهيئة المصرية العامة للمساحة، بتوقيت جهازك. قد يختلف عن التقويم الرسمي بدقائق. إعدادات الأذان في قسم «الأذان».</p>`;
  $('#c').onchange=e=>{const c=e.target.value;store.set('loc',JSON.stringify({n:c,lat:CITIES[c][0],lng:CITIES[c][1]}));prayer()};
  $('#g').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{store.set('loc',JSON.stringify({n:'موقعي',lat:p.coords.latitude,lng:p.coords.longitude}));prayer()},()=>alert('تعذّر تحديد الموقع')):alert('المتصفح لا يدعم تحديد الموقع');
  const draw=()=>{const n=new Date(),t=times(n,loc),c=n.getHours()*3600+n.getMinutes()*60+n.getSeconds();
    let nx=NAMES.findIndex(([id])=>t[id]*3600>c),left;
    if(nx<0){nx=0;left=t.fajr*3600+86400-c}else left=t[NAMES[nx][0]]*3600-c;
    const L=Math.max(0,Math.floor(left)),hh=String(Math.floor(L/3600)).padStart(2,'0'),mm=String(Math.floor(L%3600/60)).padStart(2,'0'),ss=String(L%60).padStart(2,'0');
    $('#nx').innerHTML=`${NAMES[nx][1]} بعد <span dir="ltr">${ar(hh+':'+mm+':'+ss)}</span>`;
    NAMES.forEach(([id],i)=>{const r=$('#r-'+id);r.lastChild.textContent=fmt(t[id]);r.classList.toggle('nx',i===nx)})};
  draw();tick=setInterval(draw,1000);
}

/* الأذان */
function adhanPage(){
  app.innerHTML=`<div class="z"><p><b>الأذان</b></p>
  <label><input type="checkbox" id="ad" ${store.get('adhan')==='1'?'checked':''}> تشغيل الأذان تلقائياً عند دخول كل صلاة (ما عدا الشروق)</label><br><br>
  <label>ملف أذان لهذا الجهاز فقط: <input type="file" id="f" accept="audio/*"></label><div class="src" id="fs"></div><br>
  <button class="cnt" id="t">تجربة الأذان</button> <button class="cnt" id="s">إيقاف</button></div>
  <p class="src">يعمل الأذان والصفحة مفتوحة فقط، وبعد الضغط في أي مكان بالصفحة (المتصفح يمنع الصوت التلقائي قبل ذلك). الملف الافتراضي: ${esc(ADHAN_FILE)}</p>`;
  $('#ad').onchange=e=>store.set('adhan',e.target.checked?'1':'0');
  $('#t').onclick=()=>playAdhan(true);
  $('#s').onclick=()=>{if(aud)aud.pause()};
  idb.get('adhan').then(b=>$('#fs').textContent=b?'تم حفظ ملف أذان على الجهاز (له أولوية على ملف السيرفر).':'سيُستخدم الملف: '+ADHAN_FILE).catch(()=>{});
  $('#f').onchange=async e=>{const f=e.target.files[0];if(f){await idb.set('adhan',f);$('#fs').textContent='تم حفظ: '+f.name}};
  detectServer().then(s=>{
    if(!s)return;
    const d=document.createElement('div');d.className='z';
    d.innerHTML='<p><b>رفع ملف الأذان للسيرفر</b></p><label>اختر ملف: <input type="file" id="sf" accept="audio/*"></label><div class="src" id="sst"></div>';
    app.appendChild(d);
    $('#sf').onchange=async e=>{const f=e.target.files[0];if(!f)return;const st=$('#sst');st.textContent='جارٍ الرفع…';
      const fd=new FormData();fd.append('file',f);
      try{await API.req('/api/adhan',{method:'POST',body:fd});st.textContent='تم رفع الأذان للسيرفر'}catch(x){st.textContent='فشل: '+x.message}};
  });
}
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
$('#off').onclick=async e=>{const b=e.target;b.textContent='جارٍ التنزيل…';try{await loadQuran();await loadHadith();b.textContent='جاهز أوفلاين ✓'}catch(x){b.textContent='فشل — تأكد من الإنترنت'}};

/* ===== القرّاء ===== */
const reciters=async id=>(await detectServer())?recitersServer(id):recitersLocal(id);
const surahNames=async()=>{let sl=null;try{sl=await loadQuran()}catch(e){}return Array.from({length:114},(_,i)=>sl?sl[i].name:'سورة '+ar(i+1))};

/* وضع السيرفر: الصور والملفات تُخزَّن في uploads/ على السيرفر، وزرار التنزيل ينقلها لجهاز المستمع (IndexedDB) */
async function recitersServer(id){
  let L;try{L=await API.req('/api/reciters')}catch(e){return fail()}
  if(!id){
    app.innerHTML=`<div class="grid">${L.map(r=>`<a class="s" href="#/reciters/${r.id}">${avatar(r)}<span><b>${esc(r.name)}</b><small>${ar(r.files.length)} سورة مرفوعة</small></span></a>`).join('')}</div>
    <div class="z" style="margin-top:14px"><b>إضافة قارئ</b><br><br><input type="search" id="nm" placeholder="اسم القارئ"><label>صورة القارئ: <input type="file" id="im" accept="image/*"></label><br><button class="cnt" id="add">إضافة</button><div class="src" id="st"></div></div>`;
    $('#add').onclick=async()=>{const v=$('#nm').value.trim();if(!v)return;const st=$('#st');st.textContent='جارٍ الإضافة…';
      try{const r=await API.req('/api/reciters',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:v})});
        const f=$('#im').files[0];
        if(f){const fd=new FormData();fd.append('image',f);await API.req(`/api/reciters/${r.id}/image`,{method:'POST',body:fd})}
        reciters()}catch(e){st.textContent='فشل: '+e.message}};
    return;
  }
  const r=L.find(x=>x.id===id);if(!r){location.hash='#/reciters';return}
  const names=await surahNames(),has=new Set(r.files);
  const off=await Promise.all(names.map((_,i)=>idb.get('aud:'+id+':'+(i+1)).then(Boolean).catch(()=>false)));
  const pad=n=>String(n).padStart(3,'0'),url=n=>`uploads/audio/${id}/${pad(n)}.mp3`;
  app.innerHTML=`<div class="bar"><a href="#/reciters">كل القرّاء</a><span style="display:flex;align-items:center;gap:10px">${avatar(r)}<b>${esc(r.name)}</b></span><button id="del">حذف القارئ</button></div>
  <audio id="pl" controls style="width:100%;margin-bottom:12px"></audio>
  <div class="z"><button class="cnt" id="dlall">تنزيل كل السور للأوفلاين</button>
  <div class="src">بيتحفظ على جهازك، وبعدها الاستماع يشتغل من غير إنترنت.</div><br>
  <label>تغيير الصورة: <input type="file" id="ci" accept="image/*"></label><br><br>
  <label>رفع ملفات السور (اسم الملف فيه رقم السورة مثل 001.mp3): <input type="file" id="fl" multiple accept="audio/*"></label><div class="src" id="st"></div></div>
  <div class="grid">${names.map((nm,i)=>`<button class="s" data-n="${i+1}"><span class="n">${ar(i+1)}</span><span><b>${nm}</b><small>${off[i]?'⬇ محفوظ أوفلاين':has.has(i+1)?'مرفوع':''}</small></span></button>`).join('')}</div>`;
  const pl=$('#pl'),st=$('#st');
  const play=async n=>{
    let b;try{b=await idb.get('aud:'+id+':'+n)}catch(e){}
    if(b)pl.src=URL.createObjectURL(b);
    else if(has.has(n))pl.src=url(n);
    else return alert('ملف هذه السورة غير مرفوع بعد');
    pl.dataset.n=n;pl.play().catch(()=>{});
  };
  pl.onended=()=>{const n=+pl.dataset.n;if(n<114)play(n+1)};
  app.querySelectorAll('button.s').forEach(b=>b.onclick=()=>play(+b.dataset.n));

  $('#dlall').onclick=async()=>{
    try{await navigator.storage?.persist?.()}catch(e){}
    const todo=r.files.filter(n=>!off[n-1]);let i=0;
    if(!todo.length){st.textContent='كل السور المرفوعة محفوظة عندك بالفعل';return}
    for(const n of todo){
      st.textContent=`جارٍ تنزيل ${ar(++i)} من ${ar(todo.length)} (سورة ${names[n-1]})`;
      try{
        const res=await fetch(url(n));if(!res.ok)throw new Error(res.status);
        await idb.set('aud:'+id+':'+n,await res.blob());off[n-1]=true;
      }catch(x){st.textContent='توقف عند سورة '+names[n-1]+': '+x.message;return}
    }
    st.textContent='تم التنزيل، الصوت يعمل الآن بدون إنترنت';setTimeout(()=>reciters(id),800);
  };
  $('#ci').onchange=async e=>{const f=e.target.files[0];if(!f)return;st.textContent='جارٍ رفع الصورة…';
    const fd=new FormData();fd.append('image',f);
    try{await API.req(`/api/reciters/${id}/image`,{method:'POST',body:fd});reciters(id)}catch(x){st.textContent='فشل: '+x.message}};
  $('#fl').onchange=async e=>{const files=[...e.target.files];let ok=0;
    for(let i=0;i<files.length;i++){
      st.textContent=`جارٍ رفع ${ar(i+1)} من ${ar(files.length)}: ${files[i].name}`;
      const fd=new FormData();fd.append('files',files[i]);
      try{await API.req(`/api/reciters/${id}/audio`,{method:'POST',body:fd});ok++}catch(x){st.textContent='فشل رفع '+files[i].name+': '+x.message}
    }
    st.textContent='تم رفع '+ar(ok)+' ملف';setTimeout(()=>reciters(id),700)};
  $('#del').onclick=async()=>{if(!confirm('حذف القارئ وكل ملفاته من السيرفر؟'))return;
    try{await API.req(`/api/reciters/${id}`,{method:'DELETE'});location.hash='#/reciters'}catch(x){st.textContent='فشل: '+x.message}};
}

/* وضع بدون سيرفر: الإعدادات من RECITERS_CONFIG والرفع على الجهاز فقط (IndexedDB) */
async function recitersLocal(id){
  let L=[];try{L=JSON.parse(store.get('reciters'))||[]}catch(e){}
  RECITERS_CONFIG.forEach(c=>{const o=L.find(x=>x.id===c.id);if(o)Object.assign(o,c);else L.push({...c})});
  const isCfg=x=>RECITERS_CONFIG.some(c=>c.id===x);
  const save=()=>store.set('reciters',JSON.stringify(L));
  if(!id){
    app.innerHTML=`<div class="grid">${L.map(r=>`<a class="s" href="#/reciters/${r.id}">${avatar(r)}<span><b>${esc(r.name)}</b></span></a>`).join('')}</div>
    <div class="z" style="margin-top:14px"><b>إضافة قارئ</b><br><br><input type="search" id="nm" placeholder="اسم القارئ"><button class="cnt" id="add">إضافة</button></div>`;
    $('#add').onclick=()=>{const v=$('#nm').value.trim();if(v){L.push({id:'r'+Date.now(),name:v,base:'',img:''});save();reciters()}};
    return;
  }
  const r=L.find(x=>x.id===id);if(!r){location.hash='#/reciters';return}
  const names=await surahNames();
  const has=await Promise.all(names.map((_,i)=>idb.get('aud:'+id+':'+(i+1)).then(Boolean).catch(()=>false)));
  app.innerHTML=`<div class="bar"><a href="#/reciters">كل القرّاء</a><span style="display:flex;align-items:center;gap:10px">${avatar(r)}<b>${esc(r.name)}</b></span>${isCfg(id)?'<span></span>':'<button id="del">حذف القارئ</button>'}</div>
  <audio id="pl" controls style="width:100%;margin-bottom:12px"></audio>
  <div class="z"><div class="src">ملفات السور تُقرأ من المجلد: ${esc(r.base||'—')} (أسماء الملفات 001.mp3 ... 114.mp3)</div><br>
  <label>رفع ملفات للاستخدام بدون إنترنت (اسم الملف يبدأ برقم السورة مثل 001.mp3): <input type="file" id="fl" multiple accept="audio/*"></label><div class="src" id="st"></div></div>
  <div class="grid">${names.map((nm,i)=>`<button class="s" data-n="${i+1}"><span class="n">${ar(i+1)}</span><span><b>${nm}</b><small>${has[i]?'محفوظ على الجهاز':''}</small></span></button>`).join('')}</div>`;
  const pl=$('#pl');
  const play=async n=>{let b;try{b=await idb.get('aud:'+id+':'+n)}catch(e){}
    const src=b?URL.createObjectURL(b):(r.base?r.base.replace(/\/?$/,'/')+String(n).padStart(3,'0')+'.mp3':'');
    if(!src)return alert('أضف الملف في المجلد أو ارفع ملف هذه السورة أولاً');
    pl.src=src;pl.dataset.n=n;pl.play().catch(()=>{})};
  pl.onended=()=>{const n=+pl.dataset.n;if(n<114)play(n+1)};
  app.querySelectorAll('button.s').forEach(b=>b.onclick=()=>play(+b.dataset.n));
  $('#fl').onchange=async e=>{let c=0;for(const f of e.target.files){const m=f.name.match(/\d+/),n=m&&+m[0];if(n>=1&&n<=114){await idb.set('aud:'+id+':'+n,f);c++}}
    $('#st').textContent='تم حفظ '+ar(c)+' ملف';setTimeout(()=>reciters(id),700)};
  const del=$('#del');
  if(del)del.onclick=async()=>{if(!confirm('حذف القارئ وملفاته من الجهاز؟'))return;
    await Promise.all(names.map((_,i)=>idb.set('aud:'+id+':'+(i+1),undefined).catch(()=>{})));
    L.splice(L.indexOf(r),1);save();location.hash='#/reciters'};
}

/* التوجيه */
function route(){
  const [,t='quran',n]=location.hash.split('/');
  document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.t===t));
  clearInterval(tick);if(t==='prayer')prayer();else if(t==='adhan')adhanPage();else if(t==='reciters')reciters(n);else if(t==='adhkar')adhkar();else if(t==='hadith')hadith();else if(n&&+n>=1&&+n<=114)surah(+n);else listSurahs();
}
addEventListener('hashchange',route);route();
