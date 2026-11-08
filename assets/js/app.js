(() => {
  const BASE = document.querySelector('base')?.href || location.origin + '/';
  const catalog = window.CMVIDEO_CATALOG || [];
  const app = document.getElementById('app');
  const path = decodeURI(location.pathname).replace(/\/+$/, '');
  const basePath = new URL(BASE).pathname.replace(/\/+$/, '');
  let route = path.startsWith(basePath) ? path.slice(basePath.length) : path.replace(/^\/+/, '');
  const asset = p => new URL(p, BASE).href;
  const url = id => asset(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categoryName = c => c === 'cartoons' ? 'Мультфильмы' : 'Фильмы';
  const card = item => `<a class="media-card" href="${esc(item.id)}"><div class="poster-wrap"><img src="${url(item.poster)}" alt="${esc(item.title)}" loading="lazy"><span class="play-hover">▶</span><span class="poster-type">${categoryName(item.category)}</span></div><div class="card-meta"><h3>${esc(item.title)}</h3><span>${esc(item.year || '')}</span></div></a>`;
  const empty = msg => `<div class="empty-state"><span>✳</span><h2>Пока ничего нет</h2><p>${esc(msg)}</p></div>`;
  const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();

  function renderHome() {
    const featured = catalog.filter(x => x.featured);
    const latest = [...catalog].sort((a,b) => (b.year||0)-(a.year||0));
    document.getElementById('featuredGrid').innerHTML = featured.length ? featured.map(card).join('') : empty('Добавь произведения в папку content.');
    document.getElementById('latestGrid').innerHTML = latest.length ? latest.map(card).join('') : empty('Добавь первый фильм или мультфильм.');
    const first = featured[0] || catalog[0];
    if (first) document.getElementById('heroButton').href = first.id;
  }
  function renderCategory(type) {
    const items = catalog.filter(x => x.category === type);
    document.title = categoryName(type) + ' — CMVideo';
    document.getElementById('catalogTitle').textContent = categoryName(type);
    document.getElementById('catalogDescription').textContent = type === 'movies' ? 'Полнометражные фильмы для твоего вечера.' : 'Мультфильмы и анимационные истории.';
    document.getElementById('resultCount').textContent = `${items.length} ${items.length === 1 ? 'произведение' : 'произведений'}`;
    document.getElementById('catalogGrid').innerHTML = items.length ? items.map(card).join('') : empty('В этой категории пока нет контента.');
  }
  function renderSearch(q) {
    const items = catalog.filter(x => (x.title + ' ' + (x.description||'') + ' ' + (x.tags||[]).join(' ')).toLowerCase().includes(q.toLowerCase()));
    document.getElementById('catalogTitle').textContent = `Поиск: «${q}»`;
    document.getElementById('catalogDescription').textContent = 'Результаты поиска по каталогу CMVideo.';
    document.getElementById('resultCount').textContent = `Найдено: ${items.length}`;
    document.getElementById('catalogGrid').innerHTML = items.length ? items.map(card).join('') : empty('Попробуй изменить запрос.');
  }
  function renderDetail(id) {
    const item = catalog.find(x => x.id === id);
    const target = document.getElementById('detailContent') || document.getElementById('routeFallback');
    if (!item) { target.innerHTML = `<div class="not-found"><span class="eyebrow">404 / НЕ НАЙДЕНО</span><h1>Такой страницы пока нет</h1><p>Проверь адрес или вернись в каталог.</p><a class="button button-primary" href="./">На главную ↗</a></div>`; return; }
    document.title = `${item.title} — CMVideo`;
    const related = catalog.filter(x => x.category === item.category && x.id !== item.id).slice(0,4);
    target.innerHTML = `<a class="back-link" href="categories/${item.category}">← ${categoryName(item.category)}</a>
      <section class="detail-layout"><div class="player-column"><div class="video-frame"><div class="video-container">
  <iframe
    src="https://vewo.io/embed/a98d4bb018e3"
    title="Шрек"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin">
  </iframe>
</div><div class="video-error" id="videoError" hidden>Видео пока не добавлено. Помести файл video.mp4 в папку этого произведения.</div></div><div class="player-caption"><span>CMVIDEO PLAYER</span><span>HTML5 · MP4</span></div></div>
      <aside class="detail-info"><span class="eyebrow">${categoryName(item.category).toUpperCase()} · ${esc(item.year || 'ГОД НЕ УКАЗАН')}</span><h1>${esc(item.title)}</h1><p class="detail-description">${esc(item.description || 'Описание скоро появится.')}</p><div class="tag-list">${(item.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div><a class="button button-outline" href="categories/${item.category}">Другие ${categoryName(item.category).toLowerCase()} <span>↗</span></a></aside></section>
      ${related.length ? `<section class="section-block related-block"><div class="section-heading"><div><span class="eyebrow">ПРОДОЛЖАЙ СМОТРЕТЬ</span><h2>Похожее</h2></div></div><div class="media-grid">${related.map(card).join('')}</div></section>` : ''}`;
    const video = document.getElementById('videoPlayer');
    video.addEventListener('error', () => { document.getElementById('videoError').hidden = false; });
  }
  function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) location.href = asset('search') + '?q=' + encodeURIComponent(input.value.trim());
    });
  }
  setupSearch();
  if (route === '' || route === 'index.html') renderHome();
  else if (route === 'categories/movies') renderCategory('movies');
  else if (route === 'categories/cartoons') renderCategory('cartoons');
  else if (route === 'search') {
    const shell = document.getElementById('app');
    shell.innerHTML = `<section class="catalog-head"><span class="eyebrow">ПОИСК CMVIDEO</span><h1 id="catalogTitle">Поиск</h1><p id="catalogDescription"></p></section><div class="filter-row"><span id="resultCount"></span><a href="./">← На главную</a></div><div class="media-grid catalog-grid" id="catalogGrid"></div>` + shell.innerHTML;
    renderSearch(new URLSearchParams(location.search).get('q') || '');
  } else renderDetail(route.split('/').filter(Boolean).pop());
})();