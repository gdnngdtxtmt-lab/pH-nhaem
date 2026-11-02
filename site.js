/* Khung chung: menu, khung nhúng tự giãn chiều cao, nội dung động từ data/content.json */
(function(){
  'use strict';
  var page = document.body.getAttribute('data-page');
  var $ = function(id){ return document.getElementById(id); };

  /* ---------- Đánh dấu trang hiện tại ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('a[data-slug]'), function(a){
    if (a.getAttribute('data-slug') === page) a.setAttribute('aria-current', 'page');
  });

  /* ---------- Menu: mục thừa dồn vào "Thêm ▾" ---------- */
  var list = $('menuList'), moreItem = $('moreItem'), moreList = $('moreList'), moreBtn = $('moreBtn');
  var originals = Array.prototype.slice.call(list.querySelectorAll(':scope > li:not(.more)'));
  function layoutMenu(){
    originals.forEach(function(li){ list.insertBefore(li, moreItem); });
    moreItem.hidden = true;
    var nav = list.parentElement;
    if (!nav.offsetWidth) return;
    var i = originals.length - 1;
    while (list.scrollWidth > nav.clientWidth && i > 0){
      moreItem.hidden = false;
      moreList.insertBefore(originals[i], moreList.firstChild);
      i--;
    }
    var cur = moreList.querySelector('a[aria-current="page"]');
    moreBtn.textContent = cur ? cur.textContent + ' ▾' : 'Thêm ▾';
    moreBtn.style.boxShadow = cur ? 'inset 0 -3px 0 var(--c-purple)' : '';
  }
  moreBtn.onclick = function(e){ e.stopPropagation(); var o = moreItem.classList.toggle('open'); moreBtn.setAttribute('aria-expanded', o); };
  document.addEventListener('click', function(){ moreItem.classList.remove('open'); moreBtn.setAttribute('aria-expanded', 'false'); });
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(layoutMenu, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutMenu);
  layoutMenu();

  var burger = $('burger'), drawer = $('drawer');
  burger.onclick = function(){ var open = drawer.hidden; drawer.hidden = !open; burger.setAttribute('aria-expanded', open); burger.textContent = open ? '✕' : '☰'; };

  /* ---------- Khung nhúng: tự giãn theo nội dung, mở liên kết nội bộ ở cửa sổ chính ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('iframe.embed'), function(fr){
    function fit(){
      try {
        var d = fr.contentDocument; if (!d || !d.body) return;
        var h = Math.max(d.documentElement.scrollHeight, d.body.scrollHeight);
        if (h && Math.abs(h - fr.offsetHeight) > 2) fr.style.height = h + 'px';
      } catch(e){}
    }
    fr.addEventListener('load', function(){
      var d; try { d = fr.contentDocument; } catch(e){ return; }
      if (!d) return;
      try { var st = d.createElement('style'); st.textContent = 'html,body{background:transparent !important;} body{padding-top:6px !important; padding-bottom:6px !important;} body > footer, .wrap > footer{display:none !important;}'; d.head.appendChild(st); } catch(e){}
      fit();
      try { new ResizeObserver(fit).observe(d.body); } catch(e){}
      var n = 0, t = setInterval(function(){ fit(); if (++n > 20) clearInterval(t); }, 500);
      Array.prototype.forEach.call(d.querySelectorAll('a[href]'), function(a){
        var h = a.getAttribute('href');
        if (/^\/(?!\/)/.test(h)) a.setAttribute('target', '_top');
      });
      d.addEventListener('click', function(e){
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        var el = d.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
        if (!el) return;
        e.preventDefault();
        var top = fr.getBoundingClientRect().top + window.pageYOffset + el.getBoundingClientRect().top - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  });

  /* ---------- Nội dung động ---------- */
  var boxes = document.querySelectorAll('[data-list]');
  if (!boxes.length && !$('updated')) return;
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  var PREVIEW = /[?&]xem-truoc=1/.test(location.search), PV = null, HL = {};
  if (PREVIEW){ try { PV = JSON.parse(localStorage.getItem('phnhaem_preview') || 'null'); } catch(e){} (PV && PV.hl || []).forEach(function(id){ HL[id] = 1; }); }
  function safeUrl(u){ u = String(u || '').trim(); if (/^uploads\//.test(u)) return '/' + u; if (PREVIEW && /^data:image\//.test(u)) return u; if (PREVIEW && /^#/.test(u)) return u; return /^(https?:\/\/|\/uploads\/)/i.test(u) ? u : ''; }
  function hl(it){ return HL[it.id] ? ' hl' : ''; }
  function byDate(a, b){ return String(b.ngay || '').localeCompare(String(a.ngay || '')); }
  function fmt(d){ if (!d) return ''; var p = String(d).slice(0,10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : d; }
  var ICON = { pdf:'📕', doc:'📘', docx:'📘', ppt:'📙', pptx:'📙', xls:'📗', xlsx:'📗', video:'🎬', mp4:'🎬', link:'🔗', form:'📝', zip:'🗜️' };
  function kind(it){
    if (it.loai) return String(it.loai).toLowerCase();
    var u = String(it.url || '').toLowerCase();
    if (/forms\.gle|docs\.google\.com\/forms/.test(u)) return 'form';
    var m = u.split('?')[0].match(/\.([a-z0-9]{2,4})$/); return m ? m[1] : 'link';
  }
  var today = new Date().toISOString().slice(0,10);

  var R = {
    thong_bao: function(arr){
      arr.sort(function(a,b){ return (b.ghim?1:0) - (a.ghim?1:0) || byDate(a,b); });
      return '<div class="news">' + arr.map(function(t){
        var p = String(t.ngay || '').slice(0,10).split('-'), l = safeUrl(t.url);
        return '<article class="news-item' + (t.ghim ? ' pin' : '') + hl(t) + '"><div class="news-date"><b>' + esc(p[2] || '') + '</b>' + esc((p[1] || '') + '/' + (p[0] || '')) + '</div>' +
          '<div><h4>' + esc(t.tieu_de) + (t.ghim ? '<span class="tag">GHIM</span>' : '') + '</h4><p>' + esc(t.noi_dung) + '</p>' +
          (l ? '<a class="lnk" href="' + esc(l) + '" target="_blank" rel="noopener">Xem chi tiết →</a>' : '') + '</div></article>';
      }).join('') + '</div>';
    },
    bai_tap: function(arr){
      arr.sort(byDate);
      return '<div class="list">' + arr.map(function(b){
        var l = safeUrl(b.url), k = kind(b);
        var due = b.han ? '<span class="chip ' + (b.han < today ? 'over' : 'due') + '">' + (b.han < today ? 'Đã hết hạn ' : 'Hạn nộp ') + esc(fmt(b.han)) + '</span>' : '';
        return '<div class="item' + hl(b) + '"><div class="ic">' + (k === 'form' ? '📝' : (ICON[k] || '✍️')) + '</div><div class="bd"><h4>' + esc(b.tieu_de) + '</h4>' +
          (b.mo_ta ? '<p>' + esc(b.mo_ta) + '</p>' : '') + '<div class="meta">' + due + (b.ngay ? '<span class="chip">Đăng ' + esc(fmt(b.ngay)) + '</span>' : '') +
          (l ? '<a class="open" href="' + esc(l) + '" target="_blank" rel="noopener">Làm bài →</a>' : '') + '</div></div></div>';
      }).join('') + '</div>';
    },
    tai_lieu: function(arr){
      arr.sort(byDate);
      return '<div class="list">' + arr.map(function(t){
        var l = safeUrl(t.url), k = kind(t);
        return '<div class="item' + hl(t) + '"><div class="ic">' + (ICON[k] || '📄') + '</div><div class="bd"><h4>' + esc(t.tieu_de) + '</h4>' +
          (t.mo_ta ? '<p>' + esc(t.mo_ta) + '</p>' : '') + '<div class="meta"><span class="chip">' + esc(k.toUpperCase()) + '</span>' +
          (t.ngay ? '<span class="chip">' + esc(fmt(t.ngay)) + '</span>' : '') +
          (l ? '<a class="open" href="' + esc(l) + '" target="_blank" rel="noopener">Mở tài liệu →</a>' : '') + '</div></div></div>';
      }).join('') + '</div>';
    },
    anh: function(arr){
      arr = arr.filter(function(a){ return safeUrl(a.src); }).sort(byDate);
      var base = photos.length; photos = photos.concat(arr);
      return '<div class="gallery">' + arr.map(function(a, i){
        return '<button class="ph' + hl(a) + '" data-i="' + (base + i) + '" aria-label="Xem ảnh: ' + esc(a.tieu_de) + '"><img loading="lazy" src="' + esc(safeUrl(a.src)) + '" alt="' + esc(a.tieu_de) + '"><span>' + esc(a.tieu_de) + '</span></button>';
      }).join('') + '</div>';
    }
  };
  var EMPTY = { thong_bao:'Chưa có thông báo mới.', bai_tap:'Chưa có bài tập.', tai_lieu:'Chưa có tài liệu.', anh:'Chưa có ảnh.' };

  var photos = [], cur = 0, lb = $('lb');
  function show(){ var a = photos[cur]; $('lbImg').src = safeUrl(a.src); $('lbImg').alt = a.tieu_de || ''; $('lbCap').innerHTML = '<b>' + esc(a.tieu_de) + '</b>' + esc(a.mo_ta || ''); }
  document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('.ph'); if (b){ cur = +b.getAttribute('data-i'); show(); lb.hidden = false; } });
  $('lbClose').onclick = function(){ lb.hidden = true; };
  $('lbPrev').onclick = function(){ cur = (cur - 1 + photos.length) % photos.length; show(); };
  $('lbNext').onclick = function(){ cur = (cur + 1) % photos.length; show(); };
  lb.addEventListener('click', function(e){ if (e.target === lb) lb.hidden = true; });
  document.addEventListener('keydown', function(e){ if (lb.hidden) return; if (e.key === 'Escape') lb.hidden = true; if (e.key === 'ArrowLeft') $('lbPrev').click(); if (e.key === 'ArrowRight') $('lbNext').click(); });

  if (PREVIEW){
    var bar = document.createElement('div'); bar.className = 'pv-bar';
    bar.textContent = PV ? '👁️ BẢN XEM TRƯỚC – chưa xuất bản. Bài mới được viền vàng.' : '👁️ Không có dữ liệu xem trước.';
    document.body.insertBefore(bar, document.body.firstChild);
  }
  /* Hồ sơ giáo viên (admin → Hồ sơ): chân trang + dòng lớp/năm học trên banner */
  function hoSo(h){
    var fi = document.querySelector('.foot-in'), lop = h.lop ? 'Lớp ' + h.lop : '', nam = h.nam_hoc ? 'Năm học ' + h.nam_hoc : '';
    if (fi){
      var src = safeUrl(h.anh), line = [lop, h.ten && 'Giáo viên: ' + h.ten, h.truong, nam].filter(Boolean).join(' · ');
      var sub = [h.chuc_danh, h.email].filter(Boolean).map(esc).join(' · ');
      var upd = $('updated');
      fi.innerHTML = (src ? '<img class="foot-av" src="' + esc(src) + '" alt="Ảnh đại diện giáo viên">' : '') + '<b>🥬 DỰ ÁN STEM KHTN8 · pH NHÀ EM</b>' +
        (line ? '<span>' + esc(line) + '</span>' : '') + (sub ? '<span>' + sub + '</span>' : '') + (h.gioi_thieu ? '<span class="foot-gt">' + esc(h.gioi_thieu) + '</span>' : '');
      if (upd) fi.appendChild(upd);
    }
    var bk = document.querySelector('.banner-k');
    if (bk && (lop || nam)) bk.textContent = ['Khoa học tự nhiên 8', lop, nam].filter(Boolean).join(' · ');
  }
  (PREVIEW && PV ? Promise.resolve(PV.data) : fetch('/data/content.json?t=' + Date.now(), { cache:'no-store' }).then(function(r){ if (!r.ok) throw 0; return r.json(); }))
    .then(function(d){
      ['thong_bao','anh','bai_tap','tai_lieu'].forEach(function(k){ d[k] = (d[k] || []).filter(function(x){ return !x.nhap; }); });
      Array.prototype.forEach.call(boxes, function(box){
        var key = box.getAttribute('data-list'), lim = +box.getAttribute('data-limit') || 0;
        var arr = (d[key] || []).slice();
        if (lim){ if (key === 'thong_bao') arr.sort(function(a,b){ return (b.ghim?1:0) - (a.ghim?1:0) || byDate(a,b); }); else arr.sort(byDate);
          var keepHl = arr.filter(function(x){ return HL[x.id]; }); arr = arr.slice(0, lim); keepHl.forEach(function(x){ if (arr.indexOf(x) < 0) arr.unshift(x); }); }
        box.innerHTML = arr.length ? R[key](arr) : '<div class="empty">' + EMPTY[key] + '</div>';
      });
      if (PREVIEW){ var first = document.querySelector('.hl'); if (first) setTimeout(function(){ first.scrollIntoView({ block:'center' }); }, 300); }
      if (d.ho_so) hoSo(d.ho_so);
      if (d.cap_nhat && $('updated')){ var t = new Date(d.cap_nhat); if (!isNaN(t)) $('updated').textContent = 'Cập nhật lần cuối: ' + t.toLocaleString('vi-VN'); }
    })
    .catch(function(){ Array.prototype.forEach.call(boxes, function(b){ b.innerHTML = '<div class="empty">Chưa tải được nội dung. Vui lòng tải lại trang.</div>'; }); });
})();

/* ---------- Đăng nhập ngay trên trang (khung nhỏ) ---------- */
(function(){
  'use strict';
  var KEY = 'phnhaem_admin_session', CONF = '/data/admin-config.json';
  var btn = document.querySelector('.login-btn'); if (!btn) return;
  function readSession(){ var r = null; try { r = sessionStorage.getItem(KEY) || localStorage.getItem(KEY); } catch(e){} try { return JSON.parse(r || 'null'); } catch(e){ return null; } }
  var s = readSession();
  if (s && s.cfg){ btn.querySelector('.lb-t').textContent = 'Quản trị'; btn.firstElementChild.textContent = '⚙️'; btn.title = 'Vào trang quản trị (' + (s.user || 'admin') + ')'; return; }

  var css = document.createElement('style');
  css.textContent = '.lg-mask{position:fixed;inset:0;z-index:120;background:rgba(20,12,40,.55);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.lg-box{width:100%;max-width:380px;background:#fff;border-radius:22px;box-shadow:0 20px 50px rgba(20,12,40,.35);padding:24px 22px 20px;position:relative;font-family:var(--fb)}' +
    '.lg-box h3{font-family:var(--fd);font-size:22px;margin:0 0 4px;color:var(--c-purple-dark)} .lg-box p.s{margin:0 0 12px;color:var(--ink-soft);font-size:13.5px}' +
    '.lg-box label{display:block;font-weight:600;font-size:13.5px;margin:10px 0 5px} .lg-box input[type=text],.lg-box input[type=password]{width:100%;font:inherit;border:2px solid var(--line);border-radius:12px;padding:10px 12px}' +
    '.lg-box input:focus{outline:none;border-color:var(--c-purple)} .lg-x{position:absolute;top:10px;right:12px;border:0;background:none;font-size:20px;cursor:pointer;color:var(--ink-soft)}' +
    '.lg-ck{display:flex;align-items:center;gap:8px;font-size:13px !important;font-weight:500 !important;margin-top:12px !important} .lg-ck input{width:17px;height:17px}' +
    '.lg-go{width:100%;margin-top:16px;font-family:var(--fd);font-weight:800;font-size:16px;color:#fff;border:0;border-radius:14px;padding:11px;cursor:pointer;background:linear-gradient(90deg,var(--c-purple),var(--c-blue))}' +
    '.lg-go:disabled{opacity:.6;cursor:wait} .lg-err{display:none;margin-top:12px;background:#FFF4F4;border-left:4px solid var(--c-red);border-radius:0 10px 10px 0;padding:8px 12px;font-size:13.5px;color:#9B1C2E}';
  document.head.appendChild(css);

  var mask = document.createElement('div'); mask.className = 'lg-mask'; mask.hidden = true;
  mask.innerHTML = '<form class="lg-box" autocomplete="on" role="dialog" aria-modal="true" aria-label="Đăng nhập quản trị">' +
    '<button type="button" class="lg-x" aria-label="Đóng">✕</button><h3>🔐 Đăng nhập quản trị</h3><p class="s">Dành cho giáo viên quản lý website.</p>' +
    '<label for="lgU">Tên đăng nhập</label><input type="text" id="lgU" autocomplete="username" required>' +
    '<label for="lgP">Mật khẩu</label><input type="password" id="lgP" autocomplete="current-password" required>' +
    '<label class="lg-ck"><input type="checkbox" id="lgR" checked> Ghi nhớ trên máy này</label>' +
    '<button class="lg-go" type="submit">Đăng nhập</button><div class="lg-err" id="lgE"></div></form>';
  document.body.appendChild(mask);
  var form = mask.querySelector('form'), err = mask.querySelector('#lgE'), go = mask.querySelector('.lg-go');
  function open(){ mask.hidden = false; err.style.display = 'none'; setTimeout(function(){ mask.querySelector('#lgU').focus(); }, 30); }
  function close(){ mask.hidden = true; }
  function fail(t){ err.textContent = t; err.style.display = 'block'; go.disabled = false; go.textContent = 'Đăng nhập'; }
  btn.addEventListener('click', function(e){ e.preventDefault(); open(); });
  mask.querySelector('.lg-x').onclick = close;
  mask.addEventListener('click', function(e){ if (e.target === mask) close(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !mask.hidden) close(); });

  function b64(b){ var s = atob(b), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var u = mask.querySelector('#lgU').value.trim(), p = mask.querySelector('#lgP').value;
    if (!u || !p) return fail('Nhập tên đăng nhập và mật khẩu.');
    if (!window.crypto || !crypto.subtle) { location.href = '/admin'; return; }
    go.disabled = true; go.textContent = 'Đang kiểm tra…'; err.style.display = 'none';
    fetch(CONF + '?t=' + Date.now(), { cache:'no-store' }).then(function(r){ return r.ok ? r.json() : null; }).then(function(c){
      if (!c || !c.data){ location.href = '/admin'; return; }   // chưa thiết lập lần đầu -> sang trang admin
      return crypto.subtle.importKey('raw', new TextEncoder().encode(u.toLowerCase() + '\u0000' + p), 'PBKDF2', false, ['deriveKey'])
        .then(function(k){ return crypto.subtle.deriveKey({ name:'PBKDF2', salt: b64(c.salt), iterations: c.iter || 600000, hash:'SHA-256' }, k, { name:'AES-GCM', length:256 }, false, ['decrypt']); })
        .then(function(key){ return crypto.subtle.decrypt({ name:'AES-GCM', iv: b64(c.iv) }, key, b64(c.data)); })
        .then(function(pt){
          var cfg = JSON.parse(new TextDecoder().decode(pt)), store;
          try { store = mask.querySelector('#lgR').checked ? localStorage : sessionStorage; sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); store.setItem(KEY, JSON.stringify({ user: u, cfg: cfg })); } catch(x){}
          go.textContent = '✓ Đang vào trang quản trị…'; location.href = '/admin';
        }, function(){ setTimeout(function(){ fail('Sai tên đăng nhập hoặc mật khẩu.'); }, 500); });
    }).catch(function(){ fail('Không kết nối được. Kiểm tra mạng rồi thử lại.'); });
  });
})();
