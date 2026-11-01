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
  function safeUrl(u){ u = String(u || '').trim(); if (/^uploads\//.test(u)) return '/' + u; return /^(https?:\/\/|\/uploads\/)/i.test(u) ? u : ''; }
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
        return '<article class="news-item' + (t.ghim ? ' pin' : '') + '"><div class="news-date"><b>' + esc(p[2] || '') + '</b>' + esc((p[1] || '') + '/' + (p[0] || '')) + '</div>' +
          '<div><h4>' + esc(t.tieu_de) + (t.ghim ? '<span class="tag">GHIM</span>' : '') + '</h4><p>' + esc(t.noi_dung) + '</p>' +
          (l ? '<a class="lnk" href="' + esc(l) + '" target="_blank" rel="noopener">Xem chi tiết →</a>' : '') + '</div></article>';
      }).join('') + '</div>';
    },
    bai_tap: function(arr){
      arr.sort(byDate);
      return '<div class="list">' + arr.map(function(b){
        var l = safeUrl(b.url), k = kind(b);
        var due = b.han ? '<span class="chip ' + (b.han < today ? 'over' : 'due') + '">' + (b.han < today ? 'Đã hết hạn ' : 'Hạn nộp ') + esc(fmt(b.han)) + '</span>' : '';
        return '<div class="item"><div class="ic">' + (k === 'form' ? '📝' : (ICON[k] || '✍️')) + '</div><div class="bd"><h4>' + esc(b.tieu_de) + '</h4>' +
          (b.mo_ta ? '<p>' + esc(b.mo_ta) + '</p>' : '') + '<div class="meta">' + due + (b.ngay ? '<span class="chip">Đăng ' + esc(fmt(b.ngay)) + '</span>' : '') +
          (l ? '<a class="open" href="' + esc(l) + '" target="_blank" rel="noopener">Làm bài →</a>' : '') + '</div></div></div>';
      }).join('') + '</div>';
    },
    tai_lieu: function(arr){
      arr.sort(byDate);
      return '<div class="list">' + arr.map(function(t){
        var l = safeUrl(t.url), k = kind(t);
        return '<div class="item"><div class="ic">' + (ICON[k] || '📄') + '</div><div class="bd"><h4>' + esc(t.tieu_de) + '</h4>' +
          (t.mo_ta ? '<p>' + esc(t.mo_ta) + '</p>' : '') + '<div class="meta"><span class="chip">' + esc(k.toUpperCase()) + '</span>' +
          (t.ngay ? '<span class="chip">' + esc(fmt(t.ngay)) + '</span>' : '') +
          (l ? '<a class="open" href="' + esc(l) + '" target="_blank" rel="noopener">Mở tài liệu →</a>' : '') + '</div></div></div>';
      }).join('') + '</div>';
    },
    anh: function(arr){
      arr = arr.filter(function(a){ return safeUrl(a.src); }).sort(byDate);
      var base = photos.length; photos = photos.concat(arr);
      return '<div class="gallery">' + arr.map(function(a, i){
        return '<button class="ph" data-i="' + (base + i) + '" aria-label="Xem ảnh: ' + esc(a.tieu_de) + '"><img loading="lazy" src="' + esc(safeUrl(a.src)) + '" alt="' + esc(a.tieu_de) + '"><span>' + esc(a.tieu_de) + '</span></button>';
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

  fetch('/data/content.json?t=' + Date.now(), { cache:'no-store' })
    .then(function(r){ if (!r.ok) throw 0; return r.json(); })
    .then(function(d){
      Array.prototype.forEach.call(boxes, function(box){
        var key = box.getAttribute('data-list'), lim = +box.getAttribute('data-limit') || 0;
        var arr = (d[key] || []).slice();
        if (lim){ if (key === 'thong_bao') arr.sort(function(a,b){ return (b.ghim?1:0) - (a.ghim?1:0) || byDate(a,b); }); else arr.sort(byDate); arr = arr.slice(0, lim); }
        box.innerHTML = arr.length ? R[key](arr) : '<div class="empty">' + EMPTY[key] + '</div>';
      });
      if (d.cap_nhat && $('updated')){ var t = new Date(d.cap_nhat); if (!isNaN(t)) $('updated').textContent = 'Cập nhật lần cuối: ' + t.toLocaleString('vi-VN'); }
    })
    .catch(function(){ Array.prototype.forEach.call(boxes, function(b){ b.innerHTML = '<div class="empty">Chưa tải được nội dung. Vui lòng tải lại trang.</div>'; }); });
})();
