import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Flower2,
  Heart,
  Leaf,
  Menu,
  Sparkles,
  Star,
} from "lucide-react";
import api from "../api/client";
import heroBox from "../assets/products/home-hero.png";
import cardBox from "../assets/products/box-card.webp";

const features = [
  { icon: Leaf, label: "Thoughtful", sub: "essentials" },
  { icon: Heart, label: "Real", sub: "menstrual support" },
  { icon: Sparkles, label: "Beautiful", sub: "comfort rituals" },
  { icon: Flower2, label: "Made for", sub: "your wellbeing" },
];

const categoryLabels = {
  pads: "Pads",
  tampons: "Tampons",
  "panty-liners": "Panty liners",
  liners: "Panty liners",
  wipes: "Wipes",
  tea: "Teas",
  teas: "Teas",
  chocolate: "Chocolates",
  chocolates: "Chocolates",
  candle: "Candles",
  candles: "Candles",
  "bath-bombs": "Bath bombs",
  bathbombs: "Bath bombs",
  addon: "Add-ons",
  addons: "Add-ons",
};

const categoryOrder = [
  "pads",
  "tampons",
  "panty-liners",
  "liners",
  "wipes",
  "tea",
  "teas",
  "chocolate",
  "chocolates",
  "candle",
  "candles",
  "bath-bombs",
  "bathbombs",
  "addon",
  "addons",
];

function getBoxHighlights(box) {
  const definitions = (box.categoryDefinitions || [])
    .slice()
    .sort((a, b) => {
      const aRank = categoryOrder.indexOf(a.key);
      const bRank = categoryOrder.indexOf(b.key);
      return (aRank < 0 ? 999 : aRank) - (bRank < 0 ? 999 : bRank);
    });
  const labels = definitions
    .map((definition) => categoryLabels[definition.key] || definition.name)
    .filter(Boolean);
  return [...new Set(labels)].slice(0, 5);
}

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api
      .get("/api/boxes")
      .then((res) => setBoxes(res.data || []))
      .catch(() => setBoxes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="hb min-h-screen overflow-hidden bg-[#FBF7F2] text-[#4B0D32]">
      <style>{`
        .hb-home-grain{background-image:radial-gradient(rgba(75,13,50,.055) .7px,transparent .7px);background-size:12px 12px}
        .hb-home-shadow{box-shadow:0 30px 80px -42px rgba(75,13,50,.48)}
        .hb-home-soft{box-shadow:0 22px 55px -34px rgba(75,13,50,.34)}
      `}</style>

      <header className="relative z-40 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link to="/" className="font-display text-xl font-bold tracking-[-.04em] text-[#4B0D32]">
          Heri <span className="text-[#C2185B]">Bloom</span>
        </Link>
        <nav className="hidden items-center gap-8 font-body text-xs uppercase tracking-[.16em] text-[#4B0D32]/70 md:flex">
          <Link className="transition hover:text-[#C2185B]" to="/">Home</Link>
          <Link className="transition hover:text-[#C2185B]" to="/shop">Shop</Link>
          <Link className="transition hover:text-[#C2185B]" to="/self-care">Self-care</Link>
          <Link className="transition hover:text-[#C2185B]" to="/about">Our story</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/shop" className="hidden rounded-full bg-[#4B0D32] px-5 py-2.5 font-body text-xs font-semibold text-[#FBF7F2] transition hover:bg-[#C2185B] sm:inline-flex">
            Build your box
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-full border border-[#4B0D32]/10 p-2.5 md:hidden" aria-label="Open navigation">
            <Menu size={18} />
          </button>
        </div>
        {menuOpen && (
          <nav className="absolute right-5 top-16 flex w-48 flex-col gap-1 rounded-2xl border border-[#4B0D32]/10 bg-[#FBF7F2] p-3 font-body text-sm shadow-xl md:hidden">
            {[['Home', '/'], ['Shop', '/shop'], ['Self-care', '/self-care'], ['Our story', '/about']].map(([label, path]) => (
              <Link key={path} onClick={() => setMenuOpen(false)} to={path} className="rounded-xl px-3 py-2.5 hover:bg-[#F8E8ED]">{label}</Link>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-8 md:px-8 md:pb-12">
          <div className="relative min-h-[620px] overflow-hidden rounded-[32px] bg-[#EFD9DD] hb-home-shadow md:min-h-[650px]">
            <div className="hb-home-grain absolute inset-0 opacity-40" />
            <div className="absolute inset-y-0 left-0 z-10 w-full bg-gradient-to-r from-[#4B0D32]/65 via-[#4B0D32]/25 to-transparent md:w-[63%]" />
            <motion.img
              src={heroBox}
              alt="Heri Bloom luxury ritual box"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="relative z-20 flex min-h-[620px] max-w-xl flex-col justify-end px-7 pb-10 text-[#FBF7F2] md:min-h-[650px] md:px-14 md:pb-16">
              <p className="mb-5 flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[.28em] text-[#F8E8ED]"><Sparkles size={14} /> The Heri Bloom ritual</p>
              <h1 className="max-w-lg font-display text-5xl font-bold leading-[.98] tracking-[-.045em] md:text-7xl">Care that feels like a <em className="font-normal text-[#F6B6C8]">ritual.</em></h1>
              <p className="mt-6 max-w-md font-body text-sm font-light leading-7 text-[#FBF7F2]/85 md:text-[15px]">Thoughtful menstrual care and small luxuries, gathered into one beautiful moment made entirely for you.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-[#FBF7F2] px-6 py-3.5 font-body text-sm font-semibold text-[#4B0D32] transition hover:-translate-y-0.5 hover:bg-[#F8E8ED]">Find your ritual <ArrowRight size={16} /></Link>
                <Link to="/about" className="inline-flex items-center gap-2 rounded-full border border-[#FBF7F2]/60 px-6 py-3.5 font-body text-sm text-[#FBF7F2] transition hover:bg-[#FBF7F2]/10">Our story</Link>
              </div>
            </div>
            <div className="absolute bottom-6 right-7 z-20 hidden items-center gap-2 font-body text-[10px] uppercase tracking-[.2em] text-[#FBF7F2]/75 md:flex"><span className="h-px w-10 bg-[#FBF7F2]/60" /> A softer way to care</div>
          </div>
        </section>

        <section className="border-y border-[#4B0D32]/10 bg-[#FBF7F2]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-7 md:grid-cols-4 md:px-8 md:py-8">
            {features.map(({ icon: Icon, label, sub }, index) => (
              <div key={label} className={`flex items-center justify-center gap-3 px-3 py-2 ${index < features.length - 1 ? "md:border-r md:border-[#4B0D32]/10" : ""}`}>
                <Icon size={20} className="shrink-0 text-[#C2185B]" />
                <span className="font-body text-xs leading-5 text-[#4B0D32] md:text-sm"><strong className="block font-semibold">{label}</strong><span className="text-[#4B0D32]/60">{sub}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-20">
            <Reveal>
              <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[.24em] text-[#C2185B]">Your comfort comes first</p>
              <h2 className="max-w-md font-display text-4xl font-bold leading-[1.02] tracking-[-.035em] md:text-6xl">A little more care for every kind of day.</h2>
              <p className="mt-5 max-w-md font-body text-sm leading-7 text-[#4B0D32]/65">Heri Bloom brings practical essentials and feel-good extras together, so looking after yourself feels considered rather than complicated.</p>
              <Link to="/self-care" className="mt-7 inline-flex items-center gap-2 border-b border-[#C2185B] pb-2 font-body text-sm font-semibold text-[#C2185B]">Explore self-care <ArrowRight size={15} /></Link>
            </Reveal>
            <Reveal delay={0.12} className="grid grid-cols-2 gap-3 md:gap-5">
              <div className="relative mt-10 min-h-[240px] overflow-hidden rounded-[28px] bg-[#F8E8ED] p-5 md:min-h-[330px]"><div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#C2185B]/15" /><Flower2 className="relative z-10 text-[#C2185B]" size={24} /><h3 className="relative z-10 mt-20 max-w-[150px] font-display text-2xl font-bold md:mt-32">Comfort, thoughtfully gathered.</h3></div>
              <div className="min-h-[240px] rounded-[28px] bg-[#4B0D32] p-5 text-[#FBF7F2] md:min-h-[330px]"><Heart className="text-[#F6B6C8]" size={24} fill="currentColor" /><h3 className="mt-20 max-w-[170px] font-display text-2xl font-bold md:mt-32">Because you deserve to feel held.</h3><span className="mt-4 block font-body text-xs text-[#FBF7F2]/60">Every box is a reminder.</span></div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[#F8E8ED] px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-wrap items-end justify-between gap-5">
              <div><p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[.24em] text-[#C2185B]">Choose your ritual</p><h2 className="font-display text-4xl font-bold leading-none tracking-[-.035em] md:text-6xl">Find your perfect box.</h2></div>
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full border border-[#4B0D32]/20 px-5 py-3 font-body text-xs font-semibold text-[#4B0D32] transition hover:border-[#C2185B] hover:text-[#C2185B]">See all boxes <ArrowRight size={14} /></Link>
            </Reveal>
            {loading && <p className="mt-12 font-body text-sm text-[#4B0D32]/60">Loading your rituals...</p>}
            {!loading && boxes.length === 0 && <p className="mt-12 font-body text-sm text-[#4B0D32]/60">Boxes are on their way. Check back soon.</p>}
            {!loading && boxes.length > 0 && <div className="mt-12 grid gap-6 lg:grid-cols-2">{boxes.map((box, index) => {
              const highlights = getBoxHighlights(box);
              const image = box.photos?.find((photo) => photo.active !== false)?.url || cardBox;
              return <Reveal key={box._id} delay={index * 0.08} className="group overflow-hidden rounded-[28px] border border-[#4B0D32]/10 bg-[#FBF7F2] hb-home-soft"><div className="grid sm:grid-cols-[46%_54%]"><div className="relative min-h-[270px] overflow-hidden bg-white"><img src={image} alt={`${box.name} contents`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />{box.mostPopular && <span className="absolute left-4 top-4 rounded-full bg-[#4B0D32] px-3 py-1.5 font-body text-[10px] font-semibold tracking-wide text-[#FBF7F2]">MOST POPULAR</span>}</div><div className="flex flex-col justify-center p-6 md:p-8"><p className="font-body text-[10px] font-semibold uppercase tracking-[.2em] text-[#C2185B]">The ritual box</p><h3 className="mt-2 font-display text-3xl font-bold leading-none text-[#4B0D32]">{box.name}</h3><p className="mt-3 font-body text-sm leading-6 text-[#4B0D32]/65">{box.tagline || "A considered collection for your comfort and wellbeing."}</p><p className="mt-5 font-display text-2xl font-bold text-[#C2185B]">KSh {Number(box.price || 0).toLocaleString()} <span className="font-body text-[11px] font-normal text-[#4B0D32]/55">/ box</span></p><ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2">{highlights.map((item) => <li key={item} className="flex items-center gap-2 font-body text-xs text-[#4B0D32]/75"><Check size={13} className="text-[#C2185B]" />{item}</li>)}</ul><Link to={`/shop?box=${box._id}`} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#4B0D32] px-5 py-3 font-body text-xs font-semibold text-[#FBF7F2] transition hover:bg-[#C2185B]">Build this box <ArrowRight size={14} /></Link></div></div></Reveal>;
            })}</div>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="rounded-[30px] bg-[#4B0D32] p-8 text-[#FBF7F2] md:p-14">
            <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]"><div><p className="mb-4 font-body text-[10px] font-semibold uppercase tracking-[.24em] text-[#F6B6C8]">A ritual worth returning to</p><h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.02] md:text-6xl">Make space for the version of you that needs care.</h2></div><Link to="/shop" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FBF7F2] px-6 py-3.5 font-body text-sm font-semibold text-[#4B0D32] transition hover:bg-[#F8E8ED]">Start your ritual <ArrowRight size={16} /></Link></div>
          </Reveal>
        </section>

        <section className="border-t border-[#4B0D32]/10 px-5 py-12 md:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><Link to="/" className="font-display text-2xl font-bold">Heri <span className="text-[#C2185B]">Bloom</span></Link><p className="mt-3 max-w-xs font-body text-xs leading-6 text-[#4B0D32]/60">Thoughtful care, beautiful rituals, and real support for every kind of day.</p></div><div className="flex flex-wrap gap-x-7 gap-y-3 font-body text-xs text-[#4B0D32]/65"><Link to="/shop" className="hover:text-[#C2185B]">Shop</Link><Link to="/self-care" className="hover:text-[#C2185B]">Self-care</Link><Link to="/about" className="hover:text-[#C2185B]">Our story</Link><Link to="/contact" className="hover:text-[#C2185B]">Contact</Link></div><div className="flex items-center gap-1 text-[#C2185B]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill="currentColor" />)}<span className="ml-2 font-body text-[10px] text-[#4B0D32]/55">Made with care</span></div></div></section>
      </main>
    </div>
  );
}
