import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Heart, Sparkles, Flower2, ArrowRight } from "lucide-react";
import api from "../api/client";
import heroBox from "../assets/products/box-hero.webp";
import cardBox from "../assets/products/box-card.webp";

const features = [
  { icon: Leaf, label: "Thoughtful", sub: "Essentials" },
  { icon: Heart, label: "Supports", sub: "Menstrual Health" },
  { icon: Sparkles, label: "Luxurious", sub: "& Comfortable" },
  { icon: Flower2, label: "Self-Care", sub: "& Wellness" },
];

const categoryLabels = {
  pads: "Pads",
  tampons: "Tampons",
  "panty-liners": "Panty Liners",
  liners: "Panty Liners",
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

const categoryOrder = ["pads", "tampons", "panty-liners", "liners", "wipes", "tea", "teas", "chocolate", "chocolates", "candle", "candles", "bath-bombs", "bathbombs", "addon", "addons"];

function getBoxHighlights(box) {
  const isPremium = box.mostPopular || String(box.name || "").toLowerCase().includes("premium");
  if (isPremium) return ["Basic box items", "Candles", "Bath bombs"];

  const definitions = (box.categoryDefinitions || [])
    .slice()
    .sort((a, b) => {
      const aRank = categoryOrder.indexOf(a.key);
      const bRank = categoryOrder.indexOf(b.key);
      return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank);
    });
  const labels = definitions.map((definition) => categoryLabels[definition.key] || definition.name).filter(Boolean);
  return [...new Set(labels)].slice(0, 6);
}

export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/boxes")
      .then((res) => setBoxes(res.data))
      .catch(() => setBoxes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-blush-deep overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-24 relative z-10 grid md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="font-body text-xs font-medium tracking-[0.2em] text-brand mb-5">
              MONTHLY CARE + REAL SUPPORT + YOU
            </p>
            <h1 className="font-display font-bold text-5xl md:text-6xl leading-[0.95] mb-6">
              <span className="text-brand">Your</span>{" "}
              <span className="text-ink">Period.</span>
              <br />
              <span className="text-ink">Your Power.</span>
            </h1>
            <p className="font-body text-sm text-ink-soft max-w-md mb-8 leading-relaxed">
              The Ritual Box is a monthly subscription designed to support your
              menstrual health, comfort and well-being, because you deserve to
              feel good, inside and out.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark hover:-translate-y-0.5 text-cream font-body font-medium px-7 py-3.5 rounded-full transition-all shadow-lg shadow-brand/20"
            >
              Shop now <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Photo bleeds to the right edge on desktop and fades into the page color */}
        <motion.img
          src={heroBox}
          alt="Heri Bloom Ritual Box with pads, liners, menstrual cup, bottle and scrunchie"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="hero-fade w-full md:absolute md:right-0 md:top-0 md:h-full md:w-[56%] object-cover"
        />
      </section>

      {/* Feature row */}
      <section className="bg-blush-deep border-y border-hairline">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-6">
          {features.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-4 py-2 justify-center ${
                i < features.length - 1 ? "md:border-r md:border-hairline" : ""
              }`}
            >
              <Icon size={24} className="text-brand shrink-0" />
              <span className="font-body text-sm text-ink leading-tight">
                {label}
                <br />
                {sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Box preview */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="font-body text-xs font-medium tracking-[0.2em] text-brand mb-3">
            CHOOSE YOUR BOX
          </p>
          <h2 className="font-display font-bold text-4xl text-ink mb-4">
            Find Your Perfect Ritual
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className="w-10 h-px bg-hairline" />
            <Heart size={14} className="text-brand" fill="currentColor" />
            <span className="w-10 h-px bg-hairline" />
          </div>
        </div>

        {loading && (
          <p className="font-body text-ink-soft text-center">Loading boxes...</p>
        )}

        {!loading && boxes.length === 0 && (
          <p className="font-body text-ink-soft text-center">
            Boxes are on their way, check back soon.
          </p>
        )}

        {!loading && boxes.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {boxes.map((box) => {
              const highlights = getBoxHighlights(box);
              return (
              <div
                key={box._id}
                className="grid sm:grid-cols-[48%_52%] items-stretch bg-cream border border-hairline rounded-2xl overflow-hidden"
              >
                <div className="min-h-[280px] w-full overflow-hidden bg-blush-deep flex items-center justify-center">
                  <img
                    src={cardBox}
                    alt={`${box.name} contents`}
                    className="block w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 md:p-6 flex flex-col justify-center">
                  {box.mostPopular && (
                    <span className="inline-block w-fit bg-brand text-cream text-[10px] font-body font-semibold tracking-wide px-3 py-1 rounded-full mb-2">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="font-display font-bold text-[28px] leading-tight text-ink mb-1">
                    {box.name}
                  </h3>
                  <p className="font-body text-[13px] text-ink-soft mb-3">
                    {box.tagline}
                  </p>
                  <p className="font-body text-xl font-semibold text-brand mb-4">
                    KSh {box.price?.toLocaleString()}
                    <span className="font-body text-[11px] font-normal text-ink-soft">
                      {" "}
                      / month
                    </span>
                  </p>
                  <ul className="space-y-2 mb-5">
                    {highlights.map((item) => (
                      <li
                        key={item}
                        className="font-body text-xs text-ink flex items-center gap-2"
                      >
                        <span className="text-brand font-bold">&#10003;</span> {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/shop?box=${box._id}`}
                    className="mt-auto inline-flex items-center gap-2 w-fit bg-brand hover:bg-brand-dark text-cream font-body font-medium px-5 py-2.5 rounded-full transition-colors text-[13px]"
                  >
                    Get {box.name?.split(" ")[0]} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Closing tagline */}
      <section className="bg-blush-deep py-16 text-center">
        <p className="font-script text-3xl text-brand-dark mb-2">
          More than just a box
        </p>
        <p className="font-body text-sm text-ink-soft">
          It's a reminder that you matter.
        </p>
      </section>
    </div>
  );
}
