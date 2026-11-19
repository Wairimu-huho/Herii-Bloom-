
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Flower2,
  Heart,
  Leaf,
  Sparkles,
  Package,
  ShieldCheck,
} from "lucide-react";

import api from "../api/client";

import heroBox from "../assets/products/home-hero.png";
import cardBox from "../assets/products/box-card.webp";

import Navbar from "../components/Navbar";

// --------------------------------------------------
// BRAND FEATURES
// --------------------------------------------------

const features = [
  {
    icon: Leaf,
    label: "Thoughtful",
    sub: "essentials",
  },
  {
    icon: Heart,
    label: "Real",
    sub: "menstrual support",
  },
  {
    icon: Sparkles,
    label: "Beautiful",
    sub: "comfort rituals",
  },
  {
    icon: Flower2,
    label: "Made for",
    sub: "your wellbeing",
  },
];

// --------------------------------------------------
// PRODUCT CATEGORY LABELS
// --------------------------------------------------

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

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getBoxHighlights(box) {
  const definitions = (box.categoryDefinitions || [])
    .slice()
    .sort((a, b) => {
      const aRank = categoryOrder.indexOf(a.key);
      const bRank = categoryOrder.indexOf(b.key);

      return (
        (aRank < 0 ? 999 : aRank) -
        (bRank < 0 ? 999 : bRank)
      );
    });

  const labels = definitions
    .map(
      (definition) =>
        categoryLabels[definition.key] || definition.name
    )
    .filter(Boolean);

  return [...new Set(labels)].slice(0, 5);
}

const formatKsh = (value) =>
  `KSh ${Number(value || 0).toLocaleString()}`;

// --------------------------------------------------
// REUSABLE ANIMATION COMPONENTS
// --------------------------------------------------

function Reveal({
  children,
  delay = 0,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <p
      className={`mb-4 flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[.24em] ${
        light ? "text-[#F6B6C8]" : "text-[#C2185B]"
      }`}
    >
      <Sparkles size={13} />
      {children}
    </p>
  );
}

// --------------------------------------------------
// PRODUCT CARD
// --------------------------------------------------

function BoxCard({ box, index }) {
  const highlights = getBoxHighlights(box);

  const image =
    box.photos?.find((photo) => photo.active !== false)?.url ||
    cardBox;

  return (
    <Reveal
      delay={index * 0.1}
      className="group h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[26px] border border-[#4B0D32]/10 bg-[#FBF7F2] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_-35px_rgba(75,13,50,0.4)]">

        {/* PRODUCT IMAGE */}
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <img
            src={image}
            alt={`${box.name} - Heri Bloom ritual box`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

          {box.mostPopular && (
            <span className="absolute left-5 top-5 rounded-full bg-[#4B0D32] px-4 py-2 font-body text-[9px] font-bold tracking-[.12em] text-[#FBF7F2] shadow-lg">
              MOST POPULAR
            </span>
          )}

          <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/60 bg-[#FBF7F2]/90 px-3 py-2 font-body text-[9px] font-semibold text-[#4B0D32] backdrop-blur-md">
            <Sparkles size={12} className="text-[#C2185B]" />
            The Ritual Box
          </span>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="flex flex-1 flex-col p-6 md:p-8">

          <p className="font-body text-[9px] font-bold uppercase tracking-[.22em] text-[#C2185B]">
            Thoughtfully curated for you
          </p>

          <h3 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-.035em] text-[#4B0D32]">
            {box.name}
          </h3>

          <p className="mt-3 font-body text-sm leading-7 text-[#4B0D32]/65">
            {box.tagline ||
              box.description ||
              "A thoughtful collection of essentials and little luxuries for your comfort and wellbeing."}
          </p>

          {/* HIGHLIGHTS */}
          {highlights.length > 0 && (
            <div className="mt-6 border-t border-[#4B0D32]/10 pt-5">
              <p className="mb-3 font-body text-[9px] font-bold uppercase tracking-[.18em] text-[#4B0D32]/55">
                What's inside
              </p>

              <ul className="grid grid-cols-2 gap-x-3 gap-y-3">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 font-body text-xs text-[#4B0D32]/75"
                  >
                    <Check
                      size={14}
                      className="shrink-0 text-[#C2185B]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PRICE AND ACTION */}
          <div className="mt-auto pt-7">

            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-body text-[9px] font-semibold uppercase tracking-[.15em] text-[#4B0D32]/50">
                  Your ritual starts at
                </p>

                <p className="mt-1 font-display text-2xl font-bold text-[#4B0D32]">
                  {formatKsh(box.price)}
                </p>
              </div>

              <span className="mb-1 text-[10px] text-[#4B0D32]/50">
                / box
              </span>
            </div>

            <Link
              to={`/shop?box=${box._id}`}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#4B0D32] px-5 py-4 font-body text-xs font-bold text-[#FBF7F2] transition duration-300 hover:bg-[#C2185B]"
            >
              Build this box
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

// --------------------------------------------------
// HOMEPAGE
// --------------------------------------------------

export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/boxes")
      .then((res) => setBoxes(res.data || []))
      .catch(() => setBoxes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="hb min-h-screen overflow-hidden bg-[#F3D5E0] text-[#4B0D32]">

      <style>{`
        .hb-home-grain {
          background-image: radial-gradient(
            rgba(75,13,50,.055) .7px,
            transparent .7px
          );
          background-size: 12px 12px;
        }

        .hb-home-shadow {
          box-shadow: 0 30px 80px -42px rgba(75,13,50,.35);
        }

        .hb-home-soft {
          box-shadow: 0 22px 55px -34px rgba(75,13,50,.28);
        }

        .hb-editorial-heading {
          text-wrap: balance;
        }

        .hb-home-section {
          scroll-margin-top: 90px;
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-home-motion {
            transition: none !important;
          }
        }
      `}</style>

      <Navbar />

      <main>

        {/* ==========================================
            1. HERO SECTION
        ========================================== */}

        <section className="relative min-h-[720px] overflow-hidden bg-[#DDBFC5] md:min-h-screen">

          {/* HERO IMAGE */}
          <motion.img
            src={heroBox}
            alt="Heri Bloom thoughtfully curated menstrual and self-care ritual box"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
          />

          {/* IMAGE OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4B0D32]/75 via-[#4B0D32]/35 to-transparent md:via-[#4B0D32]/15" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#4B0D32]/35 via-transparent to-[#4B0D32]/10" />

          {/* A gentle lift beneath the logo; the rest of the hero image stays untouched. */}
          <div className="pointer-events-none absolute left-0 top-16 h-[38%] w-[58%] bg-[radial-gradient(ellipse_at_18%_18%,rgba(248,232,237,0.16),transparent_68%)]" />

          <div className="hb-home-grain absolute inset-0 opacity-20" />

          {/* HERO CONTENT */}
          <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1440px] items-center px-6 pb-20 pt-36 sm:px-10 md:min-h-screen md:px-16 lg:px-20">

            <div className="max-w-[650px] text-[#FBF7F2]">

              <Reveal>
                <p className="mb-6 flex items-center gap-3 font-body text-[10px] font-bold uppercase tracking-[.28em] text-[#FBF7F2]">
                  <Sparkles size={15} />
                  The Heri Bloom ritual
                </p>

                <h1 className="hb-editorial-heading font-display text-5xl font-bold leading-[1.02] tracking-[-.05em] sm:text-6xl md:text-7xl lg:text-[86px]">
                  Your cycle.
                  <br />
                  Your comfort.
                  <br />
                  <em className="font-normal text-[#F6B6C8]">
                    Your ritual.
                  </em>
                </h1>

                <p className="mt-7 max-w-lg font-body text-sm leading-7 text-[#FBF7F2]/90 md:text-base md:leading-8">
                  Thoughtfully curated period essentials and little
                  luxuries to make every cycle feel a little more
                  comfortable, supported and cared for.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">

                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 rounded-full bg-[#FBF7F2] px-7 py-4 font-body text-sm font-bold text-[#4B0D32] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#F8E8ED]"
                  >
                    Explore the boxes
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 rounded-full border border-[#FBF7F2]/75 bg-[#4B0D32]/20 px-7 py-4 font-body text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#4B0D32]/50"
                  >
                    Our story
                  </Link>

                </div>
              </Reveal>

              <div className="mt-14 flex items-center gap-3">
                <span className="h-px w-10 bg-[#F6B6C8]" />
                <p className="font-body text-[9px] font-bold uppercase tracking-[.22em] text-[#FBF7F2]/80">
                  A softer way to care
                </p>
              </div>
            </div>
          </div>

          {/* HERO DECORATIVE DETAIL */}
          <div className="absolute bottom-8 right-8 z-10 hidden items-center gap-3 text-[#FBF7F2]/80 md:flex">
            <Flower2 size={19} />
            <span className="font-body text-[9px] font-semibold uppercase tracking-[.2em]">
              Thoughtfully made for you
            </span>
          </div>
        </section>


        {/* ==========================================
            2. BENEFITS STRIP
        ========================================== */}

        <section className="border-b border-[#4B0D32]/10 bg-[#F3D5E0]">

          <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-7 md:grid-cols-4 md:px-8 md:py-9">

            {features.map(({ icon: Icon, label, sub }, index) => (
              <Reveal
                key={label}
                delay={index * 0.07}
                className={`flex items-center justify-center gap-3 px-3 py-4 ${
                  index < features.length - 1
                    ? "md:border-r md:border-[#4B0D32]/10"
                    : ""
                }`}
              >
                <Icon
                  size={23}
                  strokeWidth={1.5}
                  className="shrink-0 text-[#C2185B]"
                />

                <div>
                  <p className="font-body text-xs font-bold text-[#4B0D32] md:text-sm">
                    {label}
                  </p>

                  <p className="font-body text-[10px] text-[#4B0D32]/60 md:text-xs">
                    {sub}
                  </p>
                </div>
              </Reveal>
            ))}

          </div>
        </section>


        {/* ==========================================
            3. BRAND INTRODUCTION
        ========================================== */}

        <section className="hb-home-section mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">

          <div className="grid items-center gap-12 md:grid-cols-[.85fr_1.15fr] md:gap-20">

            {/* BRAND STORY */}
            <Reveal>

              <Eyebrow>
                Your comfort comes first
              </Eyebrow>

              <h2 className="hb-editorial-heading max-w-lg font-display text-4xl font-bold leading-[1.06] tracking-[-.04em] md:text-6xl">
                A little more care for every kind of day.
              </h2>

              <p className="mt-6 max-w-md font-body text-sm leading-8 text-[#4B0D32]/70 md:text-base">
                Heri Bloom brings practical menstrual essentials
                and feel-good extras together, so looking after
                yourself feels considered rather than complicated.
              </p>

              <p className="mt-4 max-w-md font-body text-sm leading-7 text-[#4B0D32]/60">
                From the things you need to the little luxuries
                that brighten your day, every detail is chosen
                with comfort and wellbeing in mind.
              </p>

              <Link
                to="/self-care"
                className="mt-8 inline-flex items-center gap-2 border-b border-[#C2185B] pb-2 font-body text-sm font-bold text-[#C2185B] transition hover:gap-4"
              >
                Explore self-care
                <ArrowRight size={16} />
              </Link>

            </Reveal>

            {/* EDITORIAL IMAGE COMPOSITION */}
            <Reveal delay={0.12} className="relative">

              <div className="relative grid grid-cols-2 items-center gap-3 md:gap-5">

                <div className="relative mt-12 overflow-hidden rounded-t-full rounded-b-[28px] bg-[#F8E8ED]">

                  <img
                    src={cardBox}
                    alt="Heri Bloom curated ritual box"
                    loading="lazy"
                    className="aspect-[3/4] h-full w-full object-cover transition duration-700 hover:scale-105"
                  />

                </div>

                <div className="relative -mt-8 overflow-hidden rounded-[28px] bg-[#F8E8ED]">

                  <img
                    src={heroBox}
                    alt="Heri Bloom self-care experience"
                    loading="lazy"
                    className="aspect-[3/4] h-full w-full object-cover transition duration-700 hover:scale-105"
                  />

                </div>

                <div className="absolute -bottom-5 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#FBF7F2] bg-[#4B0D32] shadow-xl md:h-24 md:w-24">
                  <Flower2
                    size={34}
                    strokeWidth={1.2}
                    className="text-[#F6B6C8]"
                  />
                </div>

              </div>

              <p className="mt-10 text-center font-body text-[9px] font-bold uppercase tracking-[.22em] text-[#C2185B]">
                Little details. Thoughtful care.
              </p>

            </Reveal>

          </div>
        </section>


        {/* ==========================================
            4. BRAND VALUES
        ========================================== */}

        <section className="bg-[#F8E8ED] px-5 py-20 md:px-8 md:py-24">

          <div className="mx-auto max-w-7xl">

            <Reveal className="mb-12 max-w-xl">

              <Eyebrow>
                The Heri Bloom difference
              </Eyebrow>

              <h2 className="font-display text-4xl font-bold leading-tight tracking-[-.04em] md:text-5xl">
                Care that goes beyond the essentials.
              </h2>

            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <Reveal>
                <div className="h-full rounded-[24px] bg-[#FBF7F2] p-7 md:p-9">

                  <Leaf
                    size={27}
                    strokeWidth={1.4}
                    className="text-[#C2185B]"
                  />

                  <h3 className="mt-8 font-display text-2xl font-bold text-[#4B0D32]">
                    Comfort first
                  </h3>

                  <p className="mt-3 font-body text-sm leading-7 text-[#4B0D32]/65">
                    Thoughtful essentials chosen to help you feel
                    prepared, comfortable and at ease.
                  </p>

                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="h-full rounded-[24px] bg-[#4B0D32] p-7 text-[#FBF7F2] md:p-9">

                  <Heart
                    size={27}
                    strokeWidth={1.4}
                    className="text-[#F6B6C8]"
                  />

                  <h3 className="mt-8 font-display text-2xl font-bold">
                    Care with dignity
                  </h3>

                  <p className="mt-3 font-body text-sm leading-7 text-[#FBF7F2]/70">
                    A period-care experience that treats your needs
                    as important, never as an afterthought.
                  </p>

                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="h-full rounded-[24px] bg-[#FBF7F2] p-7 md:p-9 sm:col-span-2 lg:col-span-1">

                  <Sparkles
                    size={27}
                    strokeWidth={1.4}
                    className="text-[#C2185B]"
                  />

                  <h3 className="mt-8 font-display text-2xl font-bold text-[#4B0D32]">
                    Small joys
                  </h3>

                  <p className="mt-3 font-body text-sm leading-7 text-[#4B0D32]/65">
                    Comforting extras that turn an everyday routine
                    into a gentler, more beautiful ritual.
                  </p>

                </div>
              </Reveal>

            </div>
          </div>
        </section>


        {/* ==========================================
            5. PRODUCT COLLECTION
        ========================================== */}

        <section
          id="ritual-boxes"
          className="hb-home-section bg-[#FBF7F2] px-0 py-20 md:py-28"
        >

          <div className="w-full">

            {/* SECTION HEADING */}
            <Reveal className="flex flex-col justify-between gap-6 px-5 md:flex-row md:items-end md:px-8">

              <div className="max-w-2xl">

                <Eyebrow>
                  Choose your ritual
                </Eyebrow>

                <h2 className="hb-editorial-heading font-display text-4xl font-bold leading-[1.05] tracking-[-.04em] md:text-6xl">
                  Find your perfect box.
                </h2>

                <p className="mt-5 max-w-lg font-body text-sm leading-7 text-[#4B0D32]/65">
                  Thoughtfully selected essentials and little
                  luxuries, brought together in a box made to
                  make your cycle feel more cared for.
                </p>

              </div>

              <Link
                to="/shop"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4B0D32]/25 px-6 py-3.5 font-body text-xs font-bold text-[#4B0D32] transition hover:border-[#C2185B] hover:bg-[#F8E8ED] hover:text-[#C2185B]"
              >
                Explore all boxes
                <ArrowUpRight size={15} />
              </Link>

            </Reveal>

            {/* LOADING */}
            {loading && (
              <div className="mt-14 grid gap-6 md:grid-cols-2">

                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[26px] border border-[#4B0D32]/10 bg-[#F8E8ED] animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-[#EEDCE2]" />

                    <div className="space-y-4 p-7">
                      <div className="h-3 w-28 rounded-full bg-[#E5CDD5]" />
                      <div className="h-7 w-2/3 rounded-full bg-[#E5CDD5]" />
                      <div className="h-4 w-full rounded-full bg-[#E5CDD5]" />
                      <div className="h-4 w-3/4 rounded-full bg-[#E5CDD5]" />
                      <div className="h-12 rounded-full bg-[#E5CDD5]" />
                    </div>
                  </div>
                ))}

              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && boxes.length === 0 && (
              <div className="mt-14 rounded-[26px] border border-[#4B0D32]/10 bg-[#F8E8ED] px-6 py-16 text-center">

                <Package
                  size={34}
                  className="mx-auto text-[#C2185B]"
                />

                <h3 className="mt-5 font-display text-2xl font-bold text-[#4B0D32]">
                  Your rituals are on their way.
                </h3>

                <p className="mt-3 font-body text-sm text-[#4B0D32]/65">
                  Our boxes are being prepared. Check back soon.
                </p>

                <Link
                  to="/shop"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4B0D32] px-6 py-3 font-body text-xs font-bold text-[#FBF7F2]"
                >
                  Visit the shop
                  <ArrowRight size={14} />
                </Link>

              </div>
            )}

            {/* DYNAMIC PRODUCT CARDS */}
            {!loading && boxes.length > 0 && (
              <div className="mt-14 grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-stretch gap-6 px-0">
                {boxes.map((box, index) => (
                  <BoxCard
                    key={box._id}
                    box={box}
                    index={index}
                  />
                ))}
              </div>
            )}

          </div>
        </section>


        {/* ==========================================
            6. LIFESTYLE / SELF-CARE STORY
        ========================================== */}

        <section className="overflow-hidden bg-[#F8E8ED]">

          <div className="mx-auto grid max-w-[1440px] md:min-h-[600px] md:grid-cols-2">

            {/* IMAGE */}
            <Reveal className="relative min-h-[350px] overflow-hidden md:min-h-[600px]">

              <img
                src={heroBox}
                alt="The Heri Bloom self-care ritual"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#4B0D32]/30 to-transparent" />

              <div className="absolute bottom-7 left-7 flex items-center gap-2 rounded-full border border-white/40 bg-[#FBF7F2]/90 px-4 py-3 backdrop-blur-md">
                <Flower2
                  size={16}
                  className="text-[#C2185B]"
                />

                <span className="font-body text-[9px] font-bold uppercase tracking-[.15em] text-[#4B0D32]">
                  Your moment of care
                </span>
              </div>

            </Reveal>

            {/* STORY */}
            <div className="flex items-center px-7 py-16 md:px-14 lg:px-20">

              <Reveal>

                <Eyebrow>
                  Beyond the everyday
                </Eyebrow>

                <h2 className="hb-editorial-heading font-display text-4xl font-bold leading-[1.05] tracking-[-.04em] text-[#4B0D32] md:text-6xl">
                  A little ritual.
                  <br />
                  <em className="font-normal text-[#C2185B]">
                    A lot of love.
                  </em>
                </h2>

                <p className="mt-7 max-w-lg font-body text-sm leading-8 text-[#4B0D32]/70">
                  We believe taking care of yourself should
                  feel special. That's why we bring together
                  practical period essentials and comforting
                  little luxuries to make room for the things
                  that make you feel good.
                </p>

                <div className="mt-8 space-y-4">

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBF7F2]">
                      <Check size={16} className="text-[#C2185B]" />
                    </span>

                    <span className="font-body text-sm font-semibold text-[#4B0D32]">
                      Essentials for your cycle
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBF7F2]">
                      <Heart size={16} className="text-[#C2185B]" />
                    </span>

                    <span className="font-body text-sm font-semibold text-[#4B0D32]">
                      Little luxuries for your wellbeing
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBF7F2]">
                      <Sparkles size={16} className="text-[#C2185B]" />
                    </span>

                    <span className="font-body text-sm font-semibold text-[#4B0D32]">
                      Thoughtful details in every box
                    </span>
                  </div>

                </div>

                <Link
                  to="/self-care"
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#4B0D32] px-7 py-4 font-body text-sm font-bold text-[#FBF7F2] transition hover:bg-[#C2185B]"
                >
                  Discover self-care
                  <ArrowRight size={16} />
                </Link>

              </Reveal>
            </div>

          </div>
        </section>


        {/* ==========================================
            7. FINAL CALL TO ACTION
        ========================================== */}

        <section className="bg-[#F3D5E0] px-5 py-20 md:px-8 md:py-28">

          <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#4B0D32] px-7 py-16 text-[#FBF7F2] md:px-14 md:py-20">

            {/* DECORATIVE BACKGROUND */}
            <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-[#F6B6C8]/15" />

            <div className="absolute -right-8 -top-12 h-64 w-64 rounded-full border border-[#F6B6C8]/15" />

            <Flower2
              size={150}
              strokeWidth={0.6}
              className="absolute -bottom-12 right-5 rotate-12 text-[#F6B6C8]/10 md:right-24"
            />

            <div className="relative z-10 grid items-end gap-10 md:grid-cols-[1fr_auto]">

              <div className="max-w-2xl">

                <Eyebrow light>
                  A ritual worth returning to
                </Eyebrow>

                <h2 className="hb-editorial-heading font-display text-4xl font-bold leading-[1.05] tracking-[-.04em] md:text-6xl">
                  Make space for the version of you that needs care.
                </h2>

                <p className="mt-6 max-w-lg font-body text-sm leading-7 text-[#FBF7F2]/75">
                  Because you deserve comfort, thoughtful essentials
                  and little moments that make you feel good.
                </p>

              </div>

              <Link
                to="/shop"
                className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[#FBF7F2] px-7 py-4 font-body text-sm font-bold text-[#4B0D32] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#F8E8ED]"
              >
                Start your ritual
                <ArrowRight size={16} />
              </Link>

            </div>

          </Reveal>
        </section>


        {/* ==========================================
            8. TRUST / BRAND PROMISE
        ========================================== */}

        <section className="border-t border-[#4B0D32]/10 bg-[#FBF7F2] px-5 py-10 md:px-8">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={19}
                className="text-[#C2185B]"
              />

              <span className="font-body text-xs font-semibold text-[#4B0D32]">
                Thoughtful care
              </span>
            </div>

            <span className="hidden h-4 w-px bg-[#4B0D32]/15 sm:block" />

            <div className="flex items-center gap-2">
              <Heart
                size={18}
                className="text-[#C2185B]"
              />

              <span className="font-body text-xs font-semibold text-[#4B0D32]">
                Comfort in every detail
              </span>
            </div>

            <span className="hidden h-4 w-px bg-[#4B0D32]/15 sm:block" />

            <div className="flex items-center gap-2">
              <Flower2
                size={19}
                className="text-[#C2185B]"
              />

              <span className="font-body text-xs font-semibold text-[#4B0D32]">
                Made with care
              </span>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
