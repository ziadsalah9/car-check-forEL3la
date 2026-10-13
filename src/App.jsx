import React, { useMemo, useState } from 'react';
import { Search, CarFront, Globe2, CalendarDays, Building2, ChevronLeft, X, SlidersHorizontal, Info, Star, ArrowUpRight } from 'lucide-react';
import { brands, cars } from './data.js';


function normalizeSearch(value = '') {
  return String(value)
    .toLocaleLowerCase('ar')
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // التشكيل والتطويل
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىيئ]/g, 'ي')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ة]/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

const imageCache = new Map();
function CarImage({ car, brand, className = '', loading = 'lazy' }) {
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);
  React.useEffect(() => {
    let alive = true;
    const title = car.wikiTitle;
    if (!title) { setFailed(true); return () => { alive = false; }; }
    if (imageCache.has(title)) { setSrc(imageCache.get(title)); return () => { alive = false; }; }
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then(r => { if (!r.ok) throw new Error('No image'); return r.json(); })
      .then(data => {
        const image = data?.thumbnail?.source || data?.originalimage?.source;
        if (!image) throw new Error('No image');
        imageCache.set(title, image);
        if (alive) setSrc(image);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [car.wikiTitle]);
  return failed || !src
    ? <div className={`car-image-fallback ${className}`} role="img" aria-label={`صورة ${brand.name} ${car.name}`}><CarFront size={44}/><strong>{brand.name}</strong><span>{car.name}</span><small>الصورة غير متاحة حاليًا</small></div>
    : <img className={className} src={src} alt={`${brand.name} ${car.name}`} loading={loading} onError={() => setFailed(true)} />;
}

function BrandMark({ brand, large = false }) {
  return <div className={`brand-mark ${large ? 'brand-mark-large' : ''}`} style={{ '--brand-color': brand.color }}>{brand.logo}</div>;
}

function App() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('الكل');
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('cars');
  const [favorites, setFavorites] = useState([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const countries = useMemo(() => ['الكل', ...new Set(brands.map(b => b.country))], []);
  const filteredCars = useMemo(() => cars.filter(car => {
    const brand = brands.find(b => b.id === car.brandId);
    const term = normalizeSearch(query);
    const matchesQuery = !term || [car.name, car.nameAr, brand.name, brand.nameAr, brand.country, `${brand.name} ${car.name}`, `${brand.nameAr} ${car.nameAr}`]
      .some(v => normalizeSearch(v).includes(term));
    const matchesCountry = country === 'الكل' || brand.country === country;
    const matchesFav = !onlyFavorites || favorites.includes(car.id);
    return matchesQuery && matchesCountry && matchesFav;
  }), [query, country, onlyFavorites, favorites]);

  const filteredBrands = useMemo(() => brands.filter(brand => {
    const term = normalizeSearch(query);
    return (!term || [brand.name, brand.nameAr, brand.country].some(v => normalizeSearch(v).includes(term))) &&
      (country === 'الكل' || brand.country === country);
  }), [query, country]);

  const toggleFavorite = (id) => setFavorites(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  const openCar = (car) => setSelected({ type: 'car', item: car });
  const openBrand = (brand) => setSelected({ type: 'brand', item: brand });

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setSelected(null); setTab('cars'); }}>
          <div className="brand-icon"><CarFront size={25} /></div>
          <div><strong>ندي مطاوع</strong><span className='ziad'> م/زياد صلاح </span>        <span className="brand-tagline">01032836581</span>
</div>
        </a>
        <nav className="top-nav">
          <button className={tab === 'cars' ? 'nav-active' : ''} onClick={() => setTab('cars')}>السيارات</button>
          <button className={tab === 'brands' ? 'nav-active' : ''} onClick={() => setTab('brands')}>الشركات</button>
          <button className={onlyFavorites ? 'nav-active' : ''} onClick={() => { setOnlyFavorites(!onlyFavorites); setTab('cars'); }}>
            <Star size={15} /> المفضلة <span className="fav-count">{favorites.length}</span>
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot"></span> اكتشف عالم السيارات</span>
            <h1>كل سيارة لها <em>حكاية.</em><br />اكتشف أصلها.</h1>
            <p>ابحث عن اسم السيارة واعرف الشركة المنتجة، جنسيتها، ومعلومات أساسية عن الموديل في مكان واحد.</p>
            <div className="hero-stats">
              <div><strong>{cars.length}+</strong><span>موديل تجريبي</span></div>
              <div><strong>{brands.length}</strong><span>شركة وماركة</span></div>
              <div><strong>{countries.length - 1}</strong><span>دول منشأ</span></div>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
            <div className="hero-label"><span>بحث ذكي</span><Search size={15}/></div>
            <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=90" alt="سيارة رياضية" />
            <div className="hero-image-shade"></div>
            <div className="hero-image-caption"><span>01 / EXPLORE</span><strong>اعرف أكثر من مجرد الاسم</strong></div>
          </div>
        </section>

        <section className="search-panel">
          <div className="search-heading"><div><h2>ابحث في الدليل</h2><p>اكتب اسم السيارة أو الشركة أو بلد المنشأ</p></div><span className="search-tip"><Info size={15}/> يدعم البحث بالعربية والإنجليزية</span></div>
          <div className="search-controls">
            <div className="search-input-wrap"><Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="مثال: Corolla، BMW، ألمانيا..." aria-label="ابحث عن سيارة أو شركة"/>{query && <button className="clear-search" onClick={() => setQuery('')} aria-label="مسح البحث"><X size={17}/></button>}</div>
            <div className="select-wrap"><SlidersHorizontal size={17}/><select value={country} onChange={e => setCountry(e.target.value)} aria-label="فلترة حسب الدولة">{countries.map(c => <option key={c}>{c}</option>)}</select></div>
            <button className="search-button" onClick={() => { setTab('cars'); setOnlyFavorites(false); }}>بحث <ArrowUpRight size={17}/></button>
          </div>
          <div className="quick-filters"><span>اقتراحات:</span>{['Toyota','BMW','الصين','ألمانيا','Hyundai'].map(term => <button key={term} onClick={() => {setQuery(term);setTab(term === 'الصين' || term === 'ألمانيا' ? 'brands' : 'cars');setOnlyFavorites(false);}}>{term}</button>)}</div>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <div><span className="section-kicker">{tab === 'cars' ? 'CAR MODELS' : 'MANUFACTURERS'}</span><h2>{tab === 'cars' ? (onlyFavorites ? 'السيارات المفضلة' : 'اكتشف الموديلات') : 'الشركات حسب بلد المنشأ'}</h2><p>{tab === 'cars' ? `عرض ${filteredCars.length} نتيجة من قاعدة البيانات المحلية` : `عرض ${filteredBrands.length} شركة حسب بحثك`}</p></div>
            <div className="view-switch"><button className={tab === 'cars' ? 'switch-active' : ''} onClick={() => setTab('cars')}><CarFront size={16}/> السيارات</button><button className={tab === 'brands' ? 'switch-active' : ''} onClick={() => setTab('brands')}><Building2 size={16}/> الشركات</button></div>
          </div>

          {tab === 'cars' ? (
            filteredCars.length ? <div className="car-grid">{filteredCars.map(car => {
              const brand = brands.find(b => b.id === car.brandId);
              return <article className="car-card" key={car.id}>
                <button className="car-image-button" onClick={() => openCar(car)} aria-label={`تفاصيل ${car.name}`}><CarImage car={car} brand={brand} /><span className="image-tag">{car.type}</span></button>
                <button className={`favorite-button ${favorites.includes(car.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(car.id)} aria-label="إضافة للمفضلة"><Star size={17} fill={favorites.includes(car.id) ? 'currentColor' : 'none'}/></button>
                <div className="car-card-content">
                  <div className="car-title-line"><div><h3>{brand.name} {car.name}</h3><p>{brand.nameAr} · {car.nameAr}</p></div><BrandMark brand={brand}/></div>
                  <button className="country-line" onClick={() => openBrand(brand)}><span className="flag">{brand.flag}</span><span>{brand.country}</span><span className="country-label">جنسية الشركة</span></button>
                  <div className="card-bottom"><span><CalendarDays size={14}/> {car.years}</span><button onClick={() => openCar(car)}>التفاصيل <ChevronLeft size={16}/></button></div>
                </div>
              </article>;
            })}</div> : <div className="empty-state"><Search size={32}/><h3>مفيش نتائج مطابقة</h3><p>جرّب اسمًا آخر أو غيّر بلد المنشأ.</p><button onClick={() => {setQuery('');setCountry('الكل');setOnlyFavorites(false);}}>عرض كل السيارات</button></div>
          ) : (
            filteredBrands.length ? <div className="brand-grid">{filteredBrands.map(brand => {
              const models = cars.filter(c => c.brandId === brand.id);
              return <button className="brand-card" key={brand.id} onClick={() => openBrand(brand)}><BrandMark brand={brand} large/><div className="brand-card-info"><h3>{brand.name}</h3><p>{brand.nameAr}</p><span className="brand-country"><span className="flag">{brand.flag}</span>{brand.country}</span></div><div className="model-count">{models.length}<span>موديل</span></div><ChevronLeft className="brand-chevron" size={18}/></button>;
            })}</div> : <div className="empty-state"><Search size={32}/><h3>لم يتم العثور على شركة</h3><p>جرّب البحث باسم الشركة أو الدولة.</p></div>
          )}
        </section>

        <section className="note-banner"><div className="note-icon"><Info size={20}/></div><div><strong>معلومة مهمة عن بلد المنشأ</strong><p>جنسية الشركة لا تعني بالضرورة أن السيارة صُنعت في البلد نفسه. قد يختلف مكان التصنيع حسب الموديل والسوق وسنة الإنتاج.</p></div></section>
      </main>

      <footer><div className="footer-brand"><div className="brand-icon"><CarFront size={21}/></div><strong>ندي مطاوع</strong></div><span>نسخة تجريبية قابلة للتطوير · البيانات التعريفية محلية</span ><span>© تم التطوير بواسطه البشمهندس زياد صلاح </span></footer>

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
        <section className="detail-modal" role="dialog" aria-modal="true" aria-label="تفاصيل" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="إغلاق"><X size={20}/></button>
          {selected.type === 'car' ? (() => {
            const car = selected.item; const brand = brands.find(b => b.id === car.brandId); const models = cars.filter(c => c.brandId === brand.id && c.id !== car.id);
            return <>
              <div className="modal-car-image"><CarImage car={car} brand={brand} loading="eager" /><span>{car.type}</span></div>
              <div className="modal-content"><div className="modal-title-row"><div><span className="section-kicker">CAR MODEL</span><h2>{brand.name} {car.name}</h2><p>{brand.nameAr} · {car.nameAr}</p></div><BrandMark brand={brand} large/></div>
                <div className="detail-facts"><div><span>الشركة المنتجة</span><strong>{brand.name} <small>({brand.nameAr})</small></strong></div><div><span>جنسية الشركة</span><strong><span className="flag">{brand.flag}</span> {brand.country}</strong></div><div><span>نوع السيارة</span><strong>{car.type}</strong></div><div><span>سنوات الإنتاج</span><strong>{car.years}</strong></div></div>
                <div className="detail-description"><h3>نبذة عن الموديل</h3><p>{car.description}</p><button className="text-link" onClick={() => openBrand(brand)}>معلومات الشركة والموديلات الأخرى <ChevronLeft size={16}/></button></div>
                {models.length > 0 && <div className="related-models"><h3>موديلات أخرى من {brand.name}</h3><div>{models.map(m => <button key={m.id} onClick={() => openCar(m)}>{m.nameAr}<span>{m.name}</span><ChevronLeft size={15}/></button>)}</div></div>}
              </div>
            </>;
          })() : (() => {
            const brand = selected.item; const models = cars.filter(c => c.brandId === brand.id);
            return <div className="modal-content brand-detail"><div className="brand-detail-header"><BrandMark brand={brand} large/><div><span className="section-kicker">MANUFACTURER</span><h2>{brand.name}</h2><p>{brand.nameAr}</p></div></div>
              <div className="country-hero"><span className="big-flag">{brand.flag}</span><div><span>جنسية الشركة</span><strong>{brand.country}</strong></div><Globe2 size={23}/></div>
              <div className="detail-facts"><div><span>سنة التأسيس</span><strong>{brand.founded}</strong></div><div><span>المنطقة</span><strong>{brand.region}</strong></div><div><span>الموديلات في الدليل</span><strong>{models.length}</strong></div></div>
              <div className="detail-description"><h3>عن الشركة</h3><p>{brand.about}</p></div>
              <div className="related-models"><h3>الموديلات المتاحة في الدليل</h3>{models.length ? <div>{models.map(m => <button key={m.id} onClick={() => openCar(m)}>{m.nameAr}<span>{m.name}</span><ChevronLeft size={15}/></button>)}</div> : <p className="muted">لم تتم إضافة موديلات لهذه الشركة بعد.</p>}</div>
            </div>;
          })()}
        </section>
      </div>}
    </div>
  );
}

export default App;