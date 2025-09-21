const { useEffect, useState } = React;
// Framer Motion fallback (CDN 실패해도 렌더는 되게)
const motion =
  (window.framerMotion && window.framerMotion.motion) ||
  new Proxy({}, { get: (_, tag) => (props) => React.createElement(tag, props) });

/**
 * 최종본(예쁜 버전):
 * - PC: 상단 네비게이션 바
 * - Mobile: 사이드 드로어(세로 텍스트 탭)
 * - Work: 9:16 그리드(각진, 간격 소폭), 카드 클릭 → #/p/:n
 * - Detail: Prev/Next, object-contain
 * - Main: Hero / About / Profile / Contact / Footer
 * - Instagram FAB
 */

// ==================== 데이터 ====================
const data = {
  brand: {
    name: "KIM SU RIN",
    email: "hello@example.com",
    instagram: "https://www.instagram.com/rinrin_soo/",
    location: "Seoul, KR",
  },
  navItems: [
    { key: "work", label: "Work", route: "#/work", anchor: null },
    { key: "profile", label: "Profile", route: "#/home", anchor: "#profile" },
    { key: "about", label: "About", route: "#/home", anchor: "#about" },
    { key: "contact", label: "Contact", route: "#/home", anchor: "#contact" },
  ],
  hero: {
    headline: ["BOUNDLESS", "PRESENCE"],
    sub: "Editorial • Commercial • Runway",
    poster:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop",
  },
  about: {
    body:
      "광고/룩북/런웨이 등 다양한 현장에서 경험을 쌓아온 모델입니다. 프레임 안에서 존재감을 극대화하고, 브랜드의 무드를 정확히 전달하는 데 강점이 있습니다.",
    stats: [
      { k: "Height", v: "175cm" },
      { k: "Bust", v: "84cm" },
      { k: "Waist", v: "63cm" },
      { k: "Hips", v: "88cm" },
      { k: "Shoes", v: "240mm" },
    ],
  },
  profile: {
    portrait:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1600&auto=format&fit=crop",
    note: "폴라로이드/테스트샷 제공 가능. 최신 컨디션 유지.",
  },
  works: Array.from({ length: 54 }, (_, i) => ({
    src: `/photos/${i + 1}.jpg`,
    title: `Work ${i + 1}`,
  })),
};

// ==================== 라우팅 유틸 ====================
function parseRoute() {
  const h = window.location.hash || "";
  if (/^#\/p\/(\d+)/.test(h)) {
    const m = h.match(/^#\/p\/(\d+)/);
    const n = Number(m?.[1] || 1);
    return { name: "detail", page: isNaN(n) ? 1 : n };
  }
  if (h.startsWith("#/work")) return { name: "work" };
  return { name: "home" };
}
function useHashRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}
function navigate(item) {
  if (item.route) window.location.hash = item.route;
  if (item.anchor) {
    setTimeout(() => {
      const el = document.querySelector(item.anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

// ==================== 공통 UI ====================
function InstaFAB({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed right-4 bottom-4 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg hover:opacity-90"
      title="Instagram"
      aria-label="Instagram"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a 5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
      </svg>
    </a>
  );
}
function DrawerTrigger({ onClick }) {
  return (
    <button
      onClick={onClick || (() => {})}
      className="fixed left-3 top-3 z-40 md:hidden w-10 h-10 rounded-full bg-white/85 backdrop-blur border border-neutral-200 flex items-center justify-center"
      aria-label="Open menu"
    >
      <div className="space-y-1.5">
        <span className="block w-5 h-0.5 bg-black"></span>
        <span className="block w-5 h-0.5 bg-black"></span>
        <span className="block w-5 h-0.5 bg-black"></span>
      </div>
    </button>
  );
}
function SideNav({ open, onClose, brand, items }) {
  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute left-0 top-0 bottom-0 w-64 bg-white transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b">
          <div className="text-lg font-bold tracking-tight">{brand.name}</div>
        </div>
        {/* 모바일: 세로 텍스트 탭 */}
        <nav className="p-2 space-y-1">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => {
                onClose && onClose();
                navigate(it);
              }}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100 rounded-md text-black"
            >
              {it.label}
            </button>
          ))}
          <a
            href={brand.instagram}
            target="_blank"
            rel="noreferrer"
            className="block px-3 py-2 text-left hover:bg-neutral-100 rounded-md"
          >
            Instagram ↗
          </a>
        </nav>
      </aside>
    </div>
  );
}
function TopNav({ brand, items }) {
  return (
    <header className="hidden md:block sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="font-bold tracking-tight">{brand.name}</div>
        <nav className="flex items-center gap-6">
          {items.map((it) => (
            <button key={it.key} className="hover:opacity-70" onClick={() => navigate(it)}>
              {it.label}
            </button>
          ))}
          <a className="hover:opacity-70" href={brand.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>
      </div>
    </header>
  );
}

// ==================== 메인 섹션들 ====================
function MainHero({ hero }) {
  return (
    <section className="relative h-[70vh] md:h-[78vh] flex items-center justify-center overflow-hidden">
      <img src={hero.poster} alt="poster" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative text-center text-white px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          {data.brand.name}
        </motion.h1>
        <div className="mt-3 text-lg md:text-2xl opacity-90">{hero.sub}</div>
      </div>
    </section>
  );
}
function MainAbout({ about }) {
  return (
    <section id="about" className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      <h2 className="text-2xl md:text-3xl font-bold">About</h2>
      <p className="mt-3 text-neutral-700">{about.body}</p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {about.stats.map((s, i) => (
          <div key={i} className="border rounded-lg px-3 py-3 text-sm">
            <div className="text-neutral-500">{s.k}</div>
            <div className="font-semibold">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
function MainProfile({ profile, about }) {
  return (
    <section id="profile" className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
      <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
        <img src={profile.portrait} alt="portrait" className="w-full h-full object-cover" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Profile</h3>
        <p className="text-neutral-700">{profile.note}</p>
        <ul className="mt-4 space-y-1 text-sm text-neutral-600">
          {about.stats.map((s, i) => (
            <li key={i}>
              {s.k}: <span className="text-black">{s.v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
function MainContact({ brand }) {
  return (
    <section id="contact" className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <h3 className="text-xl font-bold mb-2">Contact</h3>
      <div className="text-neutral-700">
        Email: <a className="underline" href={`mailto:${brand.email}`}>{brand.email}</a>
      </div>
      <div className="text-neutral-700">Location: {brand.location}</div>
    </section>
  );
}
function Footer({ brand }) {
  return (
    <footer className="border-t py-8 text-center text-sm text-neutral-500">
      © {new Date().getFullYear()} {brand.name}. All rights reserved.
    </footer>
  );
}

// ==================== WORK ====================
function WorkGallery({ works }) {
  return (
    <section id="work" className="px-3 md:px-8 py-8 md:py-12">
      <div className="mb-6">
        <h2 className="text-2xl md:text-4xl font-bold">Photography</h2>
      </div>
      {/* 모서리 각짐 + 간격 소폭 축소 */}
      <div className="columns-2 sm:columns-2 md:columns-3 xl:columns-4 gap-3 space-y-3">
        {works.map((w, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.03 }}
            className="overflow-hidden break-inside-avoid cursor-pointer group"
            onClick={() => {
              window.location.hash = `#/p/${i + 1}`;
            }}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              (window.location.hash = `#/p/${i + 1}`)
            }
            role="button"
            tabIndex={0}
          >
            <div className="w-full aspect-[9/16] bg-neutral-100">
              <img
                src={w.src}
                alt={w.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <figcaption className="px-1.5 py-2 text-sm text-neutral-600">
              {w.title}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
function WorkPage({ onOpenMenu }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <DrawerTrigger onClick={onOpenMenu} />
      <TopNav brand={data.brand} items={data.navItems} />
      <WorkGallery works={data.works} />
      <Footer brand={data.brand} />
    </div>
  );
}

// ==================== 상세 페이지 ====================
function PageDetail({ pageNo }) {
  const idx = Math.max(1, Math.min(pageNo, data.works.length)) - 1;
  const item = data.works[idx];
  const go = (n) => {
    window.location.hash = `#/p/${n}`;
  };
  if (!item)
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500">
        이미지 없음
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black">
      <DrawerTrigger onClick={() => {}} />
      <TopNav brand={data.brand} items={data.navItems} />
      <div className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50">
        <img
          src={item.src}
          alt={item.title}
          className="max-w-full max-h-[82vh] object-contain"
        />
      </div>
      <div className="px-4 pt-4 pb-8 flex items-center justify-between max-w-5xl mx-auto">
        <button
          onClick={() => go(Math.max(1, pageNo - 1))}
          disabled={pageNo <= 1}
          className="px-4 py-2 border rounded-md hover:bg-neutral-50"
        >
          ← Prev
        </button>
        <div className="text-sm text-neutral-600">
          {pageNo} / {data.works.length}
        </div>
        <button
          onClick={() => go(Math.min(data.works.length, pageNo + 1))}
          disabled={pageNo >= data.works.length}
          className="px-4 py-2 border rounded-md hover:bg-neutral-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ==================== 메인 ====================
function MainPage({ onOpenMenu }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <DrawerTrigger onClick={onOpenMenu} />
      <TopNav brand={data.brand} items={data.navItems} />
      <MainHero hero={data.hero} />
      <MainAbout about={data.about} />
      <MainProfile profile={data.profile} about={data.about} />
      <MainContact brand={data.brand} />
      <Footer brand={data.brand} />
    </div>
  );
}

// ==================== 라우팅 & 부트스트랩 ====================
function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const route = useHashRoute();

  // 간단 self-test
  useEffect(() => {
    try {
      console.assert(Array.isArray(data.navItems) && data.navItems.length === 4, "navItems length must be 4");
      console.assert(Array.isArray(data.works) && data.works.length > 0, "works should not be empty");
      console.assert(data.brand.name === "KIM SU RIN", "brand mismatch");
    } catch {}
  }, []);

  return (
    <div>
      <InstaFAB href={data.brand.instagram} />
      <SideNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        brand={data.brand}
        items={data.navItems}
      />
      {route.name === "work" ? (
        <WorkPage onOpenMenu={() => setMenuOpen(true)} />
      ) : route.name === "detail" ? (
        <PageDetail pageNo={route.page || 1} />
      ) : (
        <MainPage onOpenMenu={() => setMenuOpen(true)} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AppShell />);
