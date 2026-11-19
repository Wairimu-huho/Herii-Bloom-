import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Lock, Maximize2, Minus, Plus, ShoppingBag, X } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import cardBox from "../assets/products/box-card.webp";
import heroBox from "../assets/products/home-hero.png";

/* ------------------------------------------------------------------ */
/* Constants and helpers                                               */
/* ------------------------------------------------------------------ */
const DRAFT_KEY = "heribloom_shop_draft";
const VIEW_KEY = "heribloom_shop_view";
const CART_KEY = "heribloom_cart";
const PENDING_KEY = "heribloom_pending_cart";
const IMPACT_LINE = "Every box supports menstrual health education.";
const STEPS = ["Choose box", "Choose plan", "Your products", "Add ons", "Delivery and gift", "Review and pay"];
const CATEGORY_ORDER = ["pads", "tampons", "panty-liners", "liners", "wipes", "tea", "teas", "chocolate", "chocolates", "candle", "candles", "bath-bombs", "bathbombs", "addon", "addons"];
const CATEGORY_LABELS = { "panty-liners": "Panty Liners", liners: "Panty Liners", chocolate: "Chocolates", chocolates: "Chocolates", tea: "Teas", teas: "Teas", candle: "Candles", candles: "Candles", "bath-bombs": "Bath bombs", bathbombs: "Bath bombs", addon: "Add ons", addons: "Add ons" };
const COUNTIES = ["Nairobi", "Kiambu", "Kajiado", "Machakos", "Mombasa", "Nakuru", "Kisumu", "Uasin Gishu", "Kilifi", "Nyeri"];

const norm = (v) => String(v || "").toLowerCase().replace(/[^a-z]/g, "");
const categoryRank = (d) => {
  const n = norm(d.key || d.name);
  if (n.includes("bathbomb")) return 11;
  if (n === "addon" || n === "addons") return 12;
  const r = CATEGORY_ORDER.indexOf(d.key);
  return r === -1 ? 999 : r;
};
const labelOf = (d) => CATEGORY_LABELS[d.key] || d.name || d.key;
const formatKsh = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const readJSON = (store, key, fallback) => { try { return JSON.parse(store.getItem(key)) ?? fallback; } catch { return fallback; } };
const photosOf = (item) => [...(item?.photos || [])].filter((p) => p.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
const toISODate = (d) => new Date(d).toISOString().slice(0, 10);
const normalizePhone = (v) => {
  const s = String(v || "").replace(/[\s()-]/g, "");
  if (/^0[17]\d{8}$/.test(s)) return `+254${s.slice(1)}`;
  if (/^254[17]\d{8}$/.test(s)) return `+${s}`;
  return String(v || "").trim();
};
const ruleText = (d) => {
  if (d.optionalExtra) return "Optional paid extra.";
  const min = Number(d.minSelections || 0);
  const max = d.maxSelections;
  if (max != null && min === max) return `Choose ${min}.`;
  return `Choose ${min} to ${max ?? "as many as you like"}.`;
};
const progressText = (d, n) => {
  const min = Number(d.minSelections || 0);
  if (n < min) return `Choose ${min - n} more`;
  return n > 0 ? `${n} chosen` : "Optional";
};

/* ------------------------------------------------------------------ */
/* Styles: pink page, cream surfaces, plum text, magenta accents       */
/* ------------------------------------------------------------------ */
const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap");
.hb{--plum:#4B0D32;--magenta:#C2185B;--blush:#F8E8ED;--pink:#F3D5E0;--cream:#FBF7F2;--line:rgba(75,13,50,.12);font-family:"Poppins",system-ui,sans-serif;color:var(--plum);background:var(--pink);min-height:100vh}
.hb .font-display{font-family:"Playfair Display",Georgia,serif;font-weight:600;letter-spacing:-.025em}
.hb .font-body{font-family:"Poppins",system-ui,sans-serif}
.hb ::selection{background:var(--blush);color:var(--plum)}
.hb :focus-visible{outline:2px solid var(--magenta);outline-offset:3px}
.hb button{cursor:pointer}
.hb button:disabled{cursor:not-allowed}
.hb-muted{color:rgba(75,13,50,.74)}
.hb-panel{background:var(--cream);border:1px solid var(--line);border-radius:24px;box-shadow:0 30px 70px -48px rgba(75,13,50,.45)}
.hb-sheet{background:var(--cream);box-shadow:0 30px 80px -30px rgba(75,13,50,.5)}
.hb-card{background:#fff;border:1px solid var(--line);border-radius:16px;transition:border-color .25s,box-shadow .25s,background .25s}
.hb-card:hover{border-color:rgba(194,24,91,.45);box-shadow:0 18px 40px -30px rgba(75,13,50,.45)}
.hb-card[data-selected="true"]{border-color:var(--magenta);background:var(--blush);box-shadow:0 0 0 1px var(--magenta)}
.hb-input{width:100%;margin-top:.4rem;min-height:48px;border-radius:16px;border:1px solid var(--line);background:#fff;padding:.7rem 1rem;font-size:.9rem;font-weight:300;color:var(--plum);transition:border-color .2s,box-shadow .2s}
.hb-input::placeholder{color:rgba(75,13,50,.5)}
.hb-input:focus{outline:none;border-color:var(--magenta);box-shadow:0 0 0 4px rgba(194,24,91,.12)}
.hb-label{font-size:.8rem;font-weight:500;color:var(--plum)}
.hb-btn,.hb-btn-outline,.hb-btn-quiet{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:46px;border-radius:999px;padding:.7rem 1.4rem;font-size:.875rem;font-weight:500;transition:background .25s,color .25s,border-color .25s,transform .25s}
.hb-btn{background:var(--plum);color:var(--cream)}
.hb-btn:hover:not(:disabled){background:var(--magenta)}
.hb-btn:disabled{opacity:.4}
.hb-btn-outline{border:1px solid var(--magenta);color:var(--magenta);background:transparent}
.hb-btn-outline:hover:not(:disabled){background:var(--magenta);color:#fff}
.hb-btn-outline:disabled{opacity:.4}
.hb-btn-quiet{border:1px solid rgba(75,13,50,.22);color:var(--plum);background:transparent}
.hb-btn-quiet:hover:not(:disabled){border-color:var(--magenta);color:var(--magenta)}
.hb-btn-quiet:disabled{opacity:.35}
.hb-link{font-size:.8rem;font-weight:500;color:var(--magenta);text-decoration:underline;text-underline-offset:3px;min-height:44px;padding:0 .25rem}
.hb-icon-btn{display:flex;height:40px;width:40px;align-items:center;justify-content:center;border-radius:999px;background:rgba(251,247,242,.92);color:var(--plum);box-shadow:0 6px 16px -8px rgba(75,13,50,.5)}
.hb-close{position:absolute;right:1rem;top:1rem;z-index:5;display:flex;height:44px;width:44px;align-items:center;justify-content:center;border-radius:999px;background:var(--cream);color:var(--plum);box-shadow:0 6px 16px -8px rgba(75,13,50,.5)}
.hb-badge{display:flex;height:26px;width:26px;align-items:center;justify-content:center;border-radius:999px;background:var(--magenta);color:#fff}
.hb-ribbon{position:absolute;left:12px;top:12px;border-radius:999px;background:var(--plum);color:var(--cream);padding:.3rem .8rem;font-size:.75rem;font-weight:500}
.hb-qbtn{display:flex;height:40px;width:40px;align-items:center;justify-content:center;border-radius:999px;border:1px solid var(--magenta);color:var(--magenta);background:transparent}
.hb-qbtn:disabled{opacity:.35}
.hb-clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hb-steps{position:relative;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.4rem;margin:0;padding:0;list-style:none;isolation:isolate}
.hb-steps:before{content:"";position:absolute;z-index:-1;left:8.33%;right:8.33%;top:1.1rem;height:2px;background:rgba(75,13,50,.2)}
.hb-step{display:flex;width:100%;flex-direction:column;align-items:center;gap:.4rem;background:none;color:rgba(75,13,50,.78)}
.hb-step:disabled{opacity:.55}
.hb-step-dot{display:flex;height:2.2rem;width:2.2rem;align-items:center;justify-content:center;border-radius:999px;border:2px solid rgba(75,13,50,.3);background:var(--pink);font-size:.8rem;font-weight:500}
.hb-step[aria-current="step"] .hb-step-dot{background:var(--plum);border-color:var(--plum);color:var(--cream);box-shadow:0 0 0 4px rgba(251,247,242,.9)}
.hb-step[data-done="true"] .hb-step-dot{background:var(--magenta);border-color:var(--magenta);color:#fff}
.hb-step-label{display:none;font-size:.75rem;font-weight:500;text-align:center;line-height:1.25}
@media(min-width:768px){.hb-step-label{display:block}}
.hb-footer{position:fixed;left:0;right:0;bottom:0;z-index:60;background:rgba(251,247,242,.96);backdrop-filter:blur(8px);border-top:1px solid var(--line);box-shadow:0 -20px 50px -34px rgba(75,13,50,.55);padding-bottom:env(safe-area-inset-bottom,0px)}
.hb-giftcard{border-radius:16px;border:1px dashed rgba(194,24,91,.45);background:#fff;padding:1.25rem;text-align:center;color:var(--plum)}
.hb-giftcard p.msg{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:400;font-size:1.05rem;line-height:1.6;overflow-wrap:anywhere}
.hb-skel{background:linear-gradient(90deg,rgba(251,247,242,.5),rgba(251,247,242,.95),rgba(251,247,242,.5));background-size:200% 100%;animation:hbShimmer 1.6s linear infinite}
@keyframes hbShimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.hb *{animation:none!important;transition:none!important}}
`;

/* ------------------------------------------------------------------ */
/* Small shared components                                             */
/* ------------------------------------------------------------------ */
function Bloom({ size = 44, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx="24" cy="14" rx="5" ry="9" transform={`rotate(${a} 24 24)`} />)}
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}

const MODAL = {
  center: ["items-end justify-center sm:items-center sm:p-6", "w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px]"],
  right: ["justify-end", "flex h-full w-full max-w-md flex-col"],
  sheet: ["items-end justify-center", "w-full max-h-[85vh] overflow-y-auto rounded-t-[28px]"],
  lightbox: ["items-center justify-center p-4", "max-w-5xl rounded-2xl"],
};
const modalStack = [];

function Modal({ open, onClose, label, variant = "center", children }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const token = {};
    modalStack.push(token);
    const previous = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = ref.current;
    const focusables = () => (node ? Array.from(node.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter((el) => !el.disabled) : []);
    (focusables()[0] || node)?.focus();
    const onKey = (e) => {
      if (modalStack[modalStack.length - 1] !== token) return;
      if (e.key === "Escape") return closeRef.current();
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      modalStack.splice(modalStack.indexOf(token), 1);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  const [wrap, panel] = MODAL[variant];
  return (
    <div className={`fixed inset-0 z-[70] flex ${wrap}`}>
      <div className="absolute inset-0 bg-[#4B0D32]/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={`relative outline-none ${variant === "lightbox" ? "" : "hb-sheet"} ${panel}`}>
        {variant !== "right" && <button type="button" className="hb-close" onClick={onClose} aria-label="Close"><X size={20} /></button>}
        {children}
      </div>
    </div>
  );
}

function Stepper({ step, maxStep, onGo }) {
  return (
    <ol className="hb-steps" aria-label="Order progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        return (
          <li key={label}>
            <button type="button" className="hb-step" aria-current={step === n ? "step" : undefined} aria-label={`Step ${n}: ${label}`} data-done={done} disabled={n > maxStep} onClick={() => onGo(n)}>
              <span className="hb-step-dot">{done ? <Check size={14} /> : n}</span>
              <span className="hb-step-label">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

const StepHead = ({ title, hint }) => (
  <div className="mb-7">
    <h2 className="font-display text-2xl md:text-[2rem]">{title}</h2>
    {hint && <p className="hb-muted mt-1.5 max-w-xl text-sm leading-6">{hint}</p>}
  </div>
);
const BackBar = ({ onBack, children }) => (
  <div className="mb-6 flex items-center justify-between gap-3">
    <button type="button" className="hb-btn-quiet" onClick={onBack}><ArrowLeft size={16} /> Back</button>
    {children}
  </div>
);
const Field = ({ label, hint, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="hb-label">{label}</span>
    {children}
    {hint && <span className="hb-muted mt-1 block text-xs">{hint}</span>}
  </label>
);
const TotalRow = ({ label, value, strong, accent }) => (
  <div className={`flex items-baseline justify-between gap-3 ${strong ? "mt-4 border-t border-[#4B0D32]/10 pt-4" : "mt-2"}`}>
    <span className={`text-sm ${strong ? "" : "hb-muted"} ${accent ? "text-[#C2185B]" : ""}`}>{label}</span>
    <span className={strong ? "font-display text-2xl text-[#C2185B]" : `text-sm ${accent ? "text-[#C2185B]" : ""}`}>{value}</span>
  </div>
);
const ReviewRow = ({ title, onEdit, children }) => (
  <section className="border-t border-[#4B0D32]/10 py-5 first:border-0 first:pt-0">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">{title}</h3>
      {onEdit && <button type="button" className="hb-link" onClick={onEdit}>Edit</button>}
    </div>
    <div className="hb-muted mt-1 text-sm leading-6">{children}</div>
  </section>
);

function ProductCard({ product, count, repeat, onToggle, onAdd, onRemove, onZoom }) {
  const photo = photosOf(product)[0];
  const selected = count > 0;
  const soldOut = product.inventory != null && product.inventory < 1;
  const low = product.inventory != null && product.inventory > 0 && product.inventory <= 5;
  const atLimit = product.inventory != null && count >= product.inventory;
  return (
    <div className="hb-card flex flex-col overflow-hidden" data-selected={selected}>
      <div className="relative aspect-square bg-white">
        {photo ? <img src={photo.url} alt={photo.alt || product.name} loading="lazy" className="h-full w-full object-contain p-2" /> : <div className="flex h-full items-center justify-center text-[#C2185B]/50"><Bloom size={56} /></div>}
        {photo && <button type="button" className="hb-icon-btn absolute right-2 top-2" aria-label={`View ${product.name} larger`} onClick={() => onZoom(photo)}><Maximize2 size={15} /></button>}
        {selected && <span className="hb-badge absolute left-3 top-3" aria-hidden="true"><Check size={14} /></span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-medium">{product.name}</h3>
        {product.description && <p className="hb-muted hb-clamp text-xs leading-5">{product.description}</p>}
        <p className="text-xs font-medium text-[#C2185B]">{product.priceModifier > 0 ? `+ ${formatKsh(product.priceModifier)}` : "Included"}</p>
        {low && <p className="text-xs text-[#C2185B]">Only {product.inventory} left</p>}
        <div className="mt-auto pt-3">
          {soldOut ? <button type="button" disabled className="hb-btn-quiet w-full">Sold out</button>
            : repeat && selected ? (
              <div className="flex items-center justify-center gap-4">
                <button type="button" className="hb-qbtn" onClick={onRemove} aria-label={`Remove one ${product.name}`}><Minus size={16} /></button>
                <span className="min-w-6 text-center text-sm font-semibold" aria-live="polite">{count}</span>
                <button type="button" className="hb-qbtn" onClick={onAdd} disabled={atLimit} aria-label={`Add one more ${product.name}`}><Plus size={16} /></button>
              </div>
            ) : (
              <button type="button" aria-pressed={selected} onClick={repeat ? onAdd : onToggle} className={selected ? "hb-btn w-full" : "hb-btn-outline w-full"}>{selected ? "Selected" : "Choose"}</button>
            )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [draft] = useState(() => readJSON(sessionStorage, DRAFT_KEY, {}));
  const [view] = useState(() => readJSON(sessionStorage, VIEW_KEY, {}));

  const [boxes, setBoxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);

  const [wizardStep, setWizardStep] = useState(Number(view.wizardStep) || 1);
  const [maxStep, setMaxStep] = useState(Number(view.maxStep) || Number(view.wizardStep) || 1);
  const [mode, setMode] = useState("box");
  const [activeCategory, setActiveCategory] = useState(null);

  const [boxId, setBoxId] = useState(params.get("box") || draft.boxId || "");
  const [picks, setPicks] = useState(draft.picks || {});
  const [purchaseType, setPurchaseType] = useState(draft.purchaseType || "one_time");
  const [firstDeliveryDate, setFirstDeliveryDate] = useState(draft.firstDeliveryDate || "");
  const [phone, setPhone] = useState(draft.phone || "");
  const [address, setAddress] = useState(draft.address || { street: "", city: "", county: "", deliveryNotes: "" });
  const [discreet, setDiscreet] = useState(Boolean(draft.discreet));
  const [cardMessage, setCardMessage] = useState(draft.cardMessage || "");
  const [gift, setGift] = useState(draft.gift || { isGift: false, recipientName: "", recipientPhone: "" });
  const [notificationPreferences, setNotificationPreferences] = useState({ email: true, whatsapp: false });
  const [accept, setAccept] = useState(false);

  const [boxModal, setBoxModal] = useState(null);
  const [boxModalImage, setBoxModalImage] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [addonModal, setAddonModal] = useState(null);
  const [addonImage, setAddonImage] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [openPolicy, setOpenPolicy] = useState("");
  const [notice, setNotice] = useState(params.get("payment") === "cancelled" ? "Your payment was cancelled and nothing was charged. Your box is still here whenever you are ready." : "");
  const [submitting, setSubmitting] = useState(false);
  const [issues, setIssues] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  const [boxReviews, setBoxReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const [reviewOption, setReviewOption] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [cart, setCart] = useState(() => readJSON(localStorage, CART_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCartIds, setSelectedCartIds] = useState(() => new Set());

  const topRef = useRef(null);
  const firstRender = useRef(true);
  const categoryCardRefs = useRef({});
  const categoryReturnRef = useRef(null);

  /* ---------- data loading ---------- */
  useEffect(() => {
    setStatus("loading");
    Promise.all([api.get("/api/boxes"), api.get("/api/products"), api.get("/api/catalog/settings")])
      .then(([b, p, s]) => { setBoxes(b.data); setProducts(p.data); setSettings(s.data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, [reloadKey]);

  useEffect(() => {
    if (status !== "ready" || !user || params.get("payment") !== "paystack" || !params.get("order")) return;
    let active = true;
    let timer;
    const reference = params.get("reference") || params.get("trxref");
    const verify = async (attempt = 0) => {
      try {
        const { data } = await api.get(`/api/payments/verify/${params.get("order")}${reference ? `?reference=${encodeURIComponent(reference)}` : ""}`);
        if (!active) return;
        setConfirmation(data);
        if (data.paymentStatus === "paid") {
          const pending = readJSON(sessionStorage, PENDING_KEY, []);
          if (pending.length) setCart((c) => c.filter((item) => !pending.includes(item.cartId)));
          sessionStorage.removeItem(PENDING_KEY);
        } else if (attempt < 4) timer = window.setTimeout(() => verify(attempt + 1), 2500);
      } catch (error) {
        if (active && attempt < 4) timer = window.setTimeout(() => verify(attempt + 1), 2500);
        else if (active) toast.error(error.response?.data?.message || "We could not verify the Paystack payment");
      }
    };
    verify();
    return () => { active = false; window.clearTimeout(timer); };
  }, [status, user, params]);

  useEffect(() => {
    if (status !== "ready" || !user || params.get("payment") !== "cancelled" || !params.get("order")) return;
    api.post(`/api/payments/cancel/${params.get("order")}`).catch(() => {});
  }, [status, user, params]);

  useEffect(() => {
    if (!boxId) return;
    api.get(`/api/reviews?boxId=${boxId}`)
      .then(({ data }) => { setBoxReviews(data.reviews || []); setReviewSummary(data.summary || { average: 0, count: 0 }); })
      .catch(() => { setBoxReviews([]); setReviewSummary({ average: 0, count: 0 }); });
  }, [boxId]);

  useEffect(() => {
    if (!user) return;
    api.get("/api/reviews/eligible")
      .then(({ data }) => setReviewOption((data.options || []).find((o) => o.box && boxId && String(o.box._id) === String(boxId)) || null))
      .catch(() => setReviewOption(null));
  }, [user, boxId]);

  /* ---------- derived catalog data ---------- */
  const byCategory = useMemo(() => products.reduce((all, p) => { (all[p.category] ||= []).push(p); return all; }, {}), [products]);
  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p._id, p])), [products]);
  const box = boxes.find((b) => b._id === boxId);
  const definitions = box?.categoryDefinitions || [];
  const selectable = definitions.filter((d) => !d.includedAutomatically).sort((a, b) => categoryRank(a) - categoryRank(b));
  const addonDefinition = selectable.find((d) => norm(d.key || d.name) === "addon" || norm(d.key || d.name) === "addons");
  const regularSelectable = selectable.filter((d) => d !== addonDefinition);
  const addonProducts = addonDefinition ? byCategory[addonDefinition.key] || [] : [];
  const includedProducts = definitions.filter((d) => d.includedAutomatically).flatMap((d) => byCategory[d.key] || []);
  const activeDefinition = regularSelectable.find((d) => d.key === activeCategory) || null;

  useEffect(() => {
    if (status !== "ready") return;
    if (!box && boxes[0]) setBoxId((boxes.find((b) => b.mostPopular) || boxes[0])._id);
    if (!firstDeliveryDate && settings?.earliestBookableDate) setFirstDeliveryDate(toISODate(settings.earliestBookableDate));
  }, [status, box, boxes, settings, firstDeliveryDate]);

  /* ---------- persistence ---------- */
  useEffect(() => {
    if (confirmation) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ boxId, picks, purchaseType, firstDeliveryDate, phone, address, discreet, cardMessage, gift })); } catch {}
  }, [boxId, picks, purchaseType, firstDeliveryDate, phone, address, discreet, cardMessage, gift, confirmation]);
  useEffect(() => { try { sessionStorage.setItem(VIEW_KEY, JSON.stringify({ wizardStep, maxStep })); } catch {} }, [wizardStep, maxStep]);
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => {
    setSelectedCartIds((current) => {
      if (!current.size && cart.length) return new Set(cart.map((i) => i.cartId));
      const valid = new Set(cart.map((i) => i.cartId));
      return new Set([...current].filter((id) => valid.has(id)));
    });
  }, [cart]);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (wizardStep === 3 && !activeCategory && categoryReturnRef.current) {
      const key = categoryReturnRef.current;
      categoryReturnRef.current = null;
      window.setTimeout(() => categoryCardRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [wizardStep, activeCategory, mode]);

  /* ---------- pricing and validation ---------- */
  const selections = Object.entries(picks).flatMap(([category, ids]) => ids.map((productId) => ({ category, productId, quantity: 1 })));
  const extras = selections.reduce((sum, s) => sum + (byId[s.productId]?.priceModifier || 0), 0);
  const discountPercent = purchaseType === "three_month" ? Number(settings?.discountPercent || 0) : 0;
  const discount = Math.round(((box?.price || 0) + extras) * discountPercent / 100);
  const count = purchaseType === "three_month" ? 3 : 1;
  const perBox = (box?.price || 0) + extras - discount;
  const total = perBox * count;

  const selectionIssues = useMemo(() => {
    const list = selectable.flatMap((d) => {
      const selected = picks[d.key] || [];
      const min = Number(d.minSelections || 0);
      const max = d.maxSelections == null ? Infinity : Number(d.maxSelections);
      const out = [];
      if (selected.length < min) out.push(`${labelOf(d)} needs ${min === max ? `exactly ${min}` : `at least ${min}`}`);
      if (selected.length > max) out.push(`${labelOf(d)} allows up to ${max}`);
      if (!d.allowRepeat && new Set(selected).size !== selected.length) out.push(`${labelOf(d)} does not allow repeats`);
      return out;
    });
    const groups = selectable.filter((d) => d.atLeastOneGroup).reduce((g, d) => { (g[d.atLeastOneGroup] ||= []).push(d); return g; }, {});
    Object.values(groups).forEach((group) => {
      if (!group.some((d) => (picks[d.key] || []).length > 0)) list.push(`Please choose at least one from ${group.map(labelOf).join(" or ")}`);
    });
    return list;
  }, [selectable, picks]);
  const complete = selectionIssues.length === 0;

  const cartCount = cart.reduce((s, i) => s + Number(i.quantity || 1), 0);
  const selectedCartItems = cart.filter((i) => selectedCartIds.has(i.cartId));
  const selectedCartCount = selectedCartItems.reduce((s, i) => s + Number(i.quantity || 1), 0);
  const cartTotalAll = cart.reduce((s, i) => s + Number(i.unitPrice || 0) * Number(i.quantity || 1), 0);
  const selectedCartTotal = selectedCartItems.reduce((s, i) => s + Number(i.unitPrice || 0) * Number(i.quantity || 1), 0);
  const allCartSelected = cart.length > 0 && selectedCartItems.length === cart.length;
  const needsPolicy = mode === "cart" ? selectedCartItems.some((i) => i.purchaseType === "three_month") : purchaseType === "three_month";

  const getIssues = ({ withSelections = true, withPolicy = true } = {}) => {
    const out = withSelections && mode === "box" ? [...selectionIssues] : [];
    if (!phone.trim()) out.push("Phone number is required");
    if (!address.street.trim() || !address.city.trim()) out.push("Street and city are required");
    if (!firstDeliveryDate) out.push("Please choose a delivery date");
    if (gift.isGift && (!gift.recipientName.trim() || !gift.recipientPhone.trim())) out.push("Gift recipient name and phone are required");
    if (cardMessage.length > 240) out.push("Card message must be 240 characters or fewer");
    if (withPolicy && needsPolicy && !accept) out.push("Please accept the three month cancellation terms");
    return out;
  };
  const deliveryAddress = () => ({ ...address, deliveryNotes: [discreet ? "Please use discreet packaging." : "", address.deliveryNotes].filter(Boolean).join(" ") });

  /* ---------- navigation ---------- */
  const goTo = (target) => {
    const next = Math.max(1, Math.min(6, Number(target) || 1));
    if (next > wizardStep && mode === "box") {
      if (!boxId) return toast.error("Choose a box first");
      if (next > 3 && !complete) { toast.error(selectionIssues[0]); setActiveCategory(null); setWizardStep(3); return; }
      if (next > 5) {
        const d = getIssues({ withPolicy: false });
        if (d.length) { setIssues(d); toast.error(d[0]); setWizardStep(5); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      }
    }
    setIssues([]);
    setActiveCategory(null);
    setWizardStep(next);
    setMaxStep((m) => Math.max(m, next));
  };

  /* ---------- selection logic ---------- */
  const countOf = (def, id) => (picks[def.key] || []).filter((x) => x === id).length;
  const isRepeat = (def) => def.allowRepeat && def.maxSelections !== 1;
  const pick = (def, id) => {
    const selected = picks[def.key] || [];
    const same = selected.filter((x) => x === id).length;
    const product = byId[id];
    setIssues([]);
    if (def.maxSelections === 1) { setPicks((p) => ({ ...p, [def.key]: [id] })); return true; }
    if (!def.allowRepeat && same > 0) return false;
    if (product?.inventory != null && same >= product.inventory) { toast.error(`Only ${product.inventory} available`); return false; }
    if (def.maxSelections != null && selected.length >= def.maxSelections) { toast.error(`You can choose up to ${def.maxSelections} here`); return false; }
    setPicks((p) => ({ ...p, [def.key]: [...(p[def.key] || []), id] }));
    return true;
  };
  const unpick = (def, id) => {
    setIssues([]);
    setPicks((p) => { const list = [...(p[def.key] || [])]; const i = list.lastIndexOf(id); if (i >= 0) list.splice(i, 1); return { ...p, [def.key]: list }; });
  };
  const finishCategory = (def) => {
    categoryReturnRef.current = def.key;
    setActiveCategory(null);
  };
  const choose = (def, id) => {
    const selectedNow = (picks[def.key] || []).length;
    const ok = pick(def, id);
    const reachedMax = def.maxSelections != null && selectedNow + 1 >= def.maxSelections;
    if (ok && (def.maxSelections === 1 || reachedMax) && def === activeDefinition) window.setTimeout(() => finishCategory(def), 380);
  };
  const toggleChoice = (def, id) => (countOf(def, id) > 0 ? unpick(def, id) : choose(def, id));

  /* ---------- cart ---------- */
  const addBoxToCart = () => {
    if (!box || !complete) return toast.error("Complete your box selections before adding it to the cart");
    const photo = photosOf(box)[0];
    const item = { itemType: "box", cartId: `box-${box._id}-${Date.now()}`, boxId: box._id, name: box.name, quantity: 1, unitPrice: Number(total || box.price || 0), purchaseType, selections: selections.map((s) => ({ ...s, productName: byId[s.productId]?.name || "Selected item" })), image: photo?.url || cardBox, imageAlt: photo?.alt || box.name };
    setCart((c) => [...c, item]);
    setCartOpen(true);
    toast.success(`${box.name} added to your cart`);
  };
  const addStandaloneToCart = (product, quantity = 1) => {
    if (product.inventory != null && quantity > product.inventory) return toast.error(`Only ${product.inventory} available`);
    setCart((c) => {
      const existing = c.find((e) => e.itemType === "addon" && e.productId === product._id);
      if (existing) return c.map((e) => (e === existing ? { ...e, quantity: Math.min(product.inventory ?? 99, e.quantity + quantity) } : e));
      const photo = photosOf(product)[0];
      return [...c, { itemType: "addon", cartId: `addon-${product._id}`, productId: product._id, name: product.name, quantity, unitPrice: Number(product.standalonePrice || 0), image: photo?.url || cardBox, imageAlt: photo?.alt || product.name }];
    });
    toast.success(`${product.name} added to your cart`);
  };
  const updateCartQuantity = (id, q) => setCart((c) => c.map((i) => (i.cartId === id ? { ...i, quantity: Math.max(1, Number(q) || 1) } : i)));
  const removeCartItem = (id) => setCart((c) => c.filter((i) => i.cartId !== id));
  const toggleCartItem = (id) => setSelectedCartIds((cur) => { const n = new Set(cur); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const startCartCheckout = () => {
    if (!selectedCartItems.length) return toast.error("Select at least one item to check out");
    setCartOpen(false);
    setMode("cart");
    setWizardStep(5);
    setMaxStep((m) => Math.max(m, 5));
    toast("Add your delivery details to pay for your cart");
  };

  /* ---------- payment ---------- */
  const requireLogin = () => { navigate("/login", { state: { from: "/shop" } }); };
  const payBox = async () => {
    if (!user) return requireLogin();
    const found = getIssues();
    setIssues(found);
    if (found.length) { toast.error(found[0]); if (!complete) { setActiveCategory(null); setWizardStep(3); } else if (found.length) setWizardStep(needsPolicy && found.every((m) => m.includes("terms")) ? 6 : 5); return; }
    setSubmitting(true);
    try {
      const { data: order } = await api.post("/api/orders", { boxId, purchaseType, selections, firstDeliveryDate, phone: normalizePhone(phone), deliveryAddress: deliveryAddress(), gift, cardMessage, cancellationAccepted: accept, notificationPreferences });
      const { data: payment } = await api.post("/api/payments/initiate", { orderId: order._id });
      sessionStorage.removeItem(DRAFT_KEY);
      if (payment.checkoutUrl) return window.location.assign(payment.checkoutUrl);
      throw new Error("Paystack did not provide a checkout link");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Could not start Paystack checkout";
      setIssues([message]);
      toast.error(message);
      setSubmitting(false);
    }
  };
  const payCart = async () => {
    if (!user) return requireLogin();
    if (!selectedCartItems.length) return toast.error("Select at least one item to check out");
    const found = getIssues({ withSelections: false });
    setIssues(found);
    if (found.length) { toast.error(found[0]); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    setSubmitting(true);
    try {
      const { data: order } = await api.post("/api/orders/cart", { items: selectedCartItems, firstDeliveryDate, phone: normalizePhone(phone), deliveryAddress: deliveryAddress(), gift, cardMessage, cancellationAccepted: accept, notificationPreferences });
      const { data: payment } = await api.post("/api/payments/initiate", { orderId: order._id });
      if (payment.checkoutUrl) {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(selectedCartItems.map((i) => i.cartId)));
        return window.location.assign(payment.checkoutUrl);
      }
      throw new Error("Paystack did not provide a checkout link");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Could not start Paystack checkout";
      setIssues([message]);
      toast.error(message);
      setSubmitting(false);
    }
  };
  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewOption?.boxAvailable) return;
    try {
      await api.post("/api/reviews", { orderId: reviewOption.orderId, boxId: reviewOption.box?._id, productIds: [], rating: reviewRating, text: reviewText });
      toast.success("Thank you, your review is in");
      setReviewText("");
      const { data } = await api.get(`/api/reviews?boxId=${boxId}`);
      setBoxReviews(data.reviews || []);
      setReviewSummary(data.summary || { average: 0, count: 0 });
      setReviewOption(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit review");
    }
  };
  const reorder = async () => {
    try {
      const { data } = await api.get(`/api/orders/${confirmation._id}/reorder`);
      const next = data.selections.reduce((a, s) => { (a[s.category] ||= []).push(s.productId); return a; }, {});
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ boxId: data.boxId, picks: next, phone: data.phone, address: data.deliveryAddress, gift: data.gift, cardMessage: data.cardMessage }));
      sessionStorage.setItem(VIEW_KEY, JSON.stringify({ wizardStep: 3, maxStep: 3 }));
      window.location.assign("/shop");
    } catch { toast.error("Could not load this order"); }
  };

  /* ---------- loading, error, confirmation ---------- */
  if (status === "loading") return (
    <div className="hb"><style>{STYLES}</style>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-busy="true">
        <div className="hb-skel h-10 w-72 rounded-full" />
        <div className="hb-skel mt-8 h-14 rounded-full" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2"><div className="hb-skel h-80 rounded-3xl" /><div className="hb-skel h-80 rounded-3xl" /></div>
      </div>
    </div>
  );
  if (status === "error") return (
    <div className="hb"><style>{STYLES}</style>
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <Bloom size={56} className="mx-auto text-[#C2185B]" />
        <h1 className="font-display mt-5 text-3xl">We could not load the shop</h1>
        <p className="hb-muted mt-2 text-sm">Check your connection and try again.</p>
        <button type="button" className="hb-btn mt-6" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
      </div>
    </div>
  );
  if (confirmation) {
    const paid = confirmation.paymentStatus === "paid";
    const failed = confirmation.paymentStatus === "failed";
    const stageLabel = { awaiting_payment: "Awaiting payment", confirmed: "Confirmed", preparing: "Preparing", out_for_delivery: "Out for delivery", delivered: "Delivered", active: "Active", problem: "Problem" };
    return (
      <div className="hb"><style>{STYLES}</style>
        <div className="mx-auto max-w-2xl px-5 py-14">
          <div className="text-center">
            <Bloom size={64} className="mx-auto text-[#C2185B]" />
            <h1 className="font-display mt-4 text-4xl">{paid ? "Your order is confirmed" : failed ? "Payment was not completed" : "We are verifying your order"}</h1>
            <p className="hb-muted mx-auto mt-3 max-w-md text-sm leading-6">{paid ? "Thank you. Your payment was received and your ritual is on its way to being prepared." : failed ? "Nothing more will be charged. You can return to the shop and try again." : "Paystack is still confirming your payment. Please keep this page open for a moment."}</p>
          </div>
          <div className="hb-panel mt-8 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="hb-muted text-xs">Order number</p><p className="font-display mt-1 text-2xl">{confirmation.orderNumber || confirmation._id}</p></div>
              <span className="rounded-full bg-[#F8E8ED] px-3 py-2 text-xs font-semibold text-[#C2185B]">{stageLabel[confirmation.status] || confirmation.paymentStatus}</span>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-[#4B0D32]/10 pt-5 text-sm sm:grid-cols-2">
              <div><dt className="hb-muted">Box</dt><dd className="mt-1 font-semibold">{confirmation.boxName}</dd></div>
              <div><dt className="hb-muted">Total paid</dt><dd className="mt-1 font-semibold text-[#C2185B]">{formatKsh(confirmation.totalPrice)}</dd></div>
              <div><dt className="hb-muted">Payment</dt><dd className="mt-1 font-semibold">{paid ? "Paystack, paid" : confirmation.paymentStatus}</dd></div>
              <div><dt className="hb-muted">Reference</dt><dd className="mt-1 break-all font-semibold">{confirmation.paymentReference || "Not available yet"}</dd></div>
            </dl>
          </div>
          <div className="hb-panel mt-5 p-6">
            <h2 className="font-display text-2xl">Delivery tracking</h2>
            <p className="hb-muted mt-1 text-sm">Your progress updates here as your order is prepared.</p>
            <div className="mt-4 space-y-3">
              {(confirmation.deliveries || []).map((d) => (
                <div key={d._id || d.sequence} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4B0D32]/10 bg-white px-4 py-3">
                  <div><p className="text-sm font-semibold">Delivery {d.sequence || 1}</p><p className="hb-muted mt-0.5 text-xs">Scheduled for {d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : "a date to be confirmed"}</p></div>
                  <span className="rounded-full bg-[#F8E8ED] px-3 py-1 text-xs text-[#C2185B]">{stageLabel[d.status] || d.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/orders" className="hb-btn">Open order tracking</Link>
            <button type="button" onClick={reorder} className="hb-btn-outline">Reorder the same picks</button>
            <Link to="/" className="hb-btn-quiet">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- step renderers ---------- */
  const renderBoxStep = () => (
    <>
      <StepHead title="Choose your box" hint="Tap a box to see its photos and details, then choose the one that feels right." />
      <div className="grid gap-5 sm:grid-cols-2">
        {boxes.map((b) => {
          const photo = photosOf(b)[0];
          const on = b._id === boxId;
          return (
            <div key={b._id} className="hb-card overflow-hidden" data-selected={on}>
              <button type="button" aria-haspopup="dialog" onClick={() => { setBoxModal(b); setBoxModalImage(0); }} className="block w-full text-left">
                <div className="relative h-56 bg-white">
                  <img src={photo?.url || cardBox} alt={photo?.alt || b.name} loading="lazy" className="h-full w-full object-contain" />
                  {b.mostPopular && <span className="hb-ribbon">Most loved</span>}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl">{b.name}</h3>
                  <p className="hb-muted mt-1.5 text-sm leading-6">{b.tagline}</p>
                  <p className="mt-4 text-lg font-semibold text-[#C2185B]">{formatKsh(b.price)} <span className="hb-muted text-sm font-normal">per box</span></p>
                  {on && reviewSummary.count > 0 && <p className="hb-muted mt-1 text-xs">Rated {reviewSummary.average} out of 5 by {reviewSummary.count} customer{reviewSummary.count === 1 ? "" : "s"}</p>}
                </div>
              </button>
              <button type="button" aria-haspopup="dialog" onClick={() => { setBoxModal(b); setBoxModalImage(0); }} className="flex w-full items-center justify-between px-5 pb-5 text-left">
                <span className="text-xs font-medium text-[#C2185B]">View photos and details</span>
                {on && <span className="flex items-center gap-1 text-xs font-medium text-[#C2185B]"><Check size={14} /> Current choice</span>}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderPlanStep = () => {
    const base = box?.price || 0;
    const pct = Number(settings?.discountPercent || 0);
    const saving = Math.round(base * pct / 100);
    const options = [
      { key: "one_time", title: "One time purchase", price: formatKsh(base), line: "One box, no commitment." },
      { key: "three_month", title: "Three month plan", price: formatKsh(base - saving), line: pct > 0 ? `Three boxes at ${pct}% off each. Save from ${formatKsh(saving * 3)} in total.` : "Three boxes, paid together." },
    ];
    return (
      <>
        <BackBar onBack={() => goTo(1)} />
        <StepHead title="Choose your plan" hint="Pick a single ritual, or save when you commit to three boxes. Tap a plan to continue." />
        <div className="grid gap-5 sm:grid-cols-2">
          {options.map((o) => (
            <button type="button" key={o.key} aria-pressed={purchaseType === o.key} onClick={() => { setPurchaseType(o.key); goTo(3); }} className="hb-card p-6 text-left" data-selected={purchaseType === o.key}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl">{o.title}</h3>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${purchaseType === o.key ? "border-[#C2185B] bg-[#C2185B] text-white" : "border-[#4B0D32]/25"}`}>{purchaseType === o.key && <Check size={14} />}</span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-[#C2185B]">{o.price}<span className="hb-muted text-sm font-normal"> per box</span></p>
              <p className="hb-muted mt-2 text-sm leading-6">{o.line}</p>
            </button>
          ))}
        </div>
        {purchaseType === "three_month" && <p className="hb-muted mt-5 text-sm leading-6">You can change your choices for later boxes. Cancellation terms appear before you pay.</p>}
      </>
    );
  };

  const renderProductsStep = () => {
    if (activeDefinition) {
      const list = byCategory[activeDefinition.key] || [];
      const n = (picks[activeDefinition.key] || []).length;
      return (
        <>
          <button type="button" className="hb-link mb-3 -ml-1 inline-flex items-center gap-1" onClick={() => setActiveCategory(null)}><ArrowLeft size={14} /> All categories</button>
          <StepHead title={labelOf(activeDefinition)} hint={`${ruleText(activeDefinition)} ${progressText(activeDefinition, n)}.`} />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(11rem,1fr))]">
            {list.map((p) => (
              <ProductCard key={p._id} product={p} count={countOf(activeDefinition, p._id)} repeat={isRepeat(activeDefinition)} onZoom={setLightbox}
                onToggle={() => toggleChoice(activeDefinition, p._id)} onAdd={() => choose(activeDefinition, p._id)} onRemove={() => unpick(activeDefinition, p._id)} />
            ))}
          </div>
          {!list.length && <p className="hb-muted text-sm">Nothing is available in this category right now.</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" className="hb-btn-quiet" onClick={() => finishCategory(activeDefinition)}>Done with {labelOf(activeDefinition)}</button>
          {complete && <button type="button" className="hb-btn" onClick={() => goTo(4)}>Proceed to add ons <ArrowRight size={16} /></button>}
        </div>
        </>
      );
    }
    const ready = regularSelectable.filter((d) => (picks[d.key] || []).length >= Number(d.minSelections || 0)).length;
    return (
      <>
        <BackBar onBack={() => goTo(2)} />
        <StepHead title="Choose your products" hint="Open each category and pick your favourites. Your choices are saved as you go, and you can come back to any category." />
        <div className="grid gap-3 sm:grid-cols-2">
          {regularSelectable.map((d) => {
            const ids = picks[d.key] || [];
            const min = Number(d.minSelections || 0);
            const done = ids.length >= min && ids.length > 0;
            const thumbs = [...new Set(ids)].slice(0, 3);
            return (
              <button type="button" key={d.key} ref={(node) => { if (node) categoryCardRefs.current[d.key] = node; else delete categoryCardRefs.current[d.key]; }} onClick={() => setActiveCategory(d.key)} className="hb-card flex min-h-[92px] items-center gap-4 p-4 text-left" data-selected={done}>
                <span className="flex w-14 shrink-0 justify-center -space-x-3">
                  {thumbs.length ? thumbs.map((id) => { const ph = photosOf(byId[id])[0]; return <span key={id} className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-white">{ph ? <img src={ph.url} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}</span>; }) : <Bloom size={34} className="text-[#C2185B]/50" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{labelOf(d)}</span>
                  <span className={`mt-0.5 block text-xs ${ids.length < min ? "text-[#C2185B]" : "hb-muted"}`}>{progressText(d, ids.length)}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4B0D32]/15 text-[#C2185B]">{done ? <Check size={16} /> : <ArrowRight size={16} />}</span>
              </button>
            );
          })}
        </div>
        <p className="hb-muted mt-5 text-sm">{ready} of {regularSelectable.length} categories ready</p>
        {complete ? (
          <button type="button" className="hb-btn mt-6" onClick={() => goTo(4)}>Proceed to add ons <ArrowRight size={16} /></button>
        ) : (
          <p className="mt-2 text-sm text-[#C2185B]">{selectionIssues[0]}</p>
        )}
        {includedProducts.length > 0 && <p className="hb-muted mt-2 text-sm">Always included: {includedProducts.map((p) => p.name).join(", ")}.</p>}
      </>
    );
  };

  const renderAddonsStep = () => (
    <>
      <BackBar onBack={() => goTo(3)}>
        <button type="button" className={addonsPicked ? "hb-btn" : "hb-btn-outline"} onClick={() => goTo(5)}>{addonsPicked ? "Continue to delivery" : "Skip add ons"} <ArrowRight size={16} /></button>
      </BackBar>
      <StepHead title="Add ons" hint="A little extra for your ritual. Tap an add on to see its photos and details. Add it to your box, or buy it separately." />
      {!addonProducts.length && <p className="hb-muted text-sm">No add ons are available right now. You can continue.</p>}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))]">
        {addonProducts.map((p) => {
          const n = addonDefinition ? countOf(addonDefinition, p._id) : 0;
          const photo = photosOf(p)[0];
          const atLimit = p.inventory != null && n >= p.inventory;
          return (
            <div key={p._id} className="hb-card flex flex-col overflow-hidden" data-selected={n > 0}>
              <div className="relative aspect-square bg-white">
                <button type="button" aria-haspopup="dialog" aria-label={`View ${p.name} details`} className="block h-full w-full" onClick={() => { setAddonModal(p); setAddonImage(0); }}>
                  {photo ? <img src={photo.url} alt={photo.alt || p.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#C2185B]/50"><Bloom size={56} /></div>}
                </button>
                <span className="hb-icon-btn pointer-events-none absolute right-2 top-2" aria-hidden="true"><Maximize2 size={15} /></span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="text-sm font-medium">{p.name}</h3>
                {p.description && <p className="hb-muted hb-clamp text-xs leading-5">{p.description}</p>}
                <p className="text-xs font-medium text-[#C2185B]">{formatKsh(p.priceModifier)} in your box</p>
                {p.standalonePrice != null && <p className="hb-muted text-xs">{formatKsh(p.standalonePrice)} separately</p>}
                {p.inventory != null && p.inventory > 0 && p.inventory <= 5 && <p className="text-xs text-[#C2185B]">Only {p.inventory} left</p>}
                <div className="mt-auto space-y-2 pt-3">
                  <button type="button" className="hb-link w-full text-center" onClick={() => { setAddonModal(p); setAddonImage(0); }}>View details</button>
                  {n === 0 ? (
                    <button type="button" className="hb-btn-outline w-full" disabled={p.inventory != null && p.inventory < 1} onClick={() => pick(addonDefinition, p._id)}>{p.inventory != null && p.inventory < 1 ? "Sold out" : "Add to my box"}</button>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <button type="button" className="hb-qbtn" onClick={() => unpick(addonDefinition, p._id)} aria-label={`Remove one ${p.name}`}><Minus size={16} /></button>
                      <span className="min-w-6 text-center text-sm font-semibold" aria-live="polite">{n}</span>
                      <button type="button" className="hb-qbtn" disabled={atLimit} onClick={() => pick(addonDefinition, p._id)} aria-label={`Add one more ${p.name}`}><Plus size={16} /></button>
                    </div>
                  )}
                  {p.standalonePrice != null && <button type="button" className="hb-link w-full text-center" onClick={() => addStandaloneToCart(p, 1)}>Buy separately</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderIssues = () => issues.length > 0 && (
    <div role="alert" className="mb-6 rounded-2xl border border-[#C2185B]/30 bg-[#F8E8ED] p-4">
      <p className="text-sm font-semibold">A few details need your attention</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{issues.map((m, i) => <li key={`${i}-${m}`}>{m}</li>)}</ul>
    </div>
  );

  const renderPolicyCheck = () => needsPolicy && (
    <label className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C2185B]/25 bg-[#F8E8ED] p-4 text-sm leading-6">
      <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-1 h-5 w-5 accent-[#C2185B]" />
      <span>I understand that cancellation is only allowed inside the change window. Unshipped boxes are refunded, and delivered boxes are repriced at the normal one time price.</span>
    </label>
  );

  const renderDeliveryStep = () => (
    <>
      {mode === "cart" && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C2185B]/25 bg-[#F8E8ED] p-4">
          <p className="text-sm">You are checking out your cart ({selectedCartCount} item{selectedCartCount === 1 ? "" : "s"}).</p>
          <button type="button" className="hb-link" onClick={() => { setMode("box"); setIssues([]); }}>Back to my box</button>
        </div>
      )}
      {mode === "box" && <BackBar onBack={() => goTo(4)} />}
      <StepHead title="Delivery and gift" hint="Tell us where and when. We will keep you updated along the way." />
      {renderIssues()}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone number" className="sm:col-span-2" hint="We use this for delivery. Kenyan numbers are saved with +254.">
          <input className="hb-input" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => setPhone(normalizePhone(phone))} />
        </Field>
        <Field label="Street and building" className="sm:col-span-2">
          <input className="hb-input" autoComplete="street-address" placeholder="Street, building, apartment" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
        </Field>
        <Field label="City or town"><input className="hb-input" autoComplete="address-level2" placeholder="Nairobi" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></Field>
        <Field label="County">
          <input className="hb-input" list="hb-counties" placeholder="Choose or type" value={address.county} onChange={(e) => setAddress({ ...address, county: e.target.value })} />
          <datalist id="hb-counties">{COUNTIES.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Preferred delivery date" className="sm:col-span-2" hint={settings?.earliestBookableDate ? `Earliest available: ${new Date(settings.earliestBookableDate).toLocaleDateString()}` : undefined}>
          <input className="hb-input" type="date" min={settings?.earliestBookableDate ? toISODate(settings.earliestBookableDate) : undefined} value={firstDeliveryDate} onChange={(e) => setFirstDeliveryDate(e.target.value)} />
        </Field>
        <Field label="Notes for the courier (optional)" className="sm:col-span-2">
          <textarea className="hb-input min-h-[88px]" placeholder="Gate code, landmark, best time to call" value={address.deliveryNotes} onChange={(e) => setAddress({ ...address, deliveryNotes: e.target.value })} />
        </Field>
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C2185B]" checked={discreet} onChange={(e) => setDiscreet(e.target.checked)} /> Use discreet packaging</label>

      <fieldset className="mt-8 rounded-2xl border border-[#4B0D32]/10 bg-white p-5">
        <legend className="px-2 text-sm font-semibold">How should we send updates?</legend>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C2185B]" checked={notificationPreferences.email} onChange={(e) => setNotificationPreferences((c) => ({ ...c, email: e.target.checked }))} /> Email updates</label>
        <label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C2185B]" checked={notificationPreferences.whatsapp} onChange={(e) => setNotificationPreferences((c) => ({ ...c, whatsapp: e.target.checked }))} /> WhatsApp updates</label>
      </fieldset>

      <div className="mt-8 grid items-start gap-5 sm:grid-cols-2">
        <div>
          <Field label="Card message (optional)" hint={`${cardMessage.length} of 240 characters`}>
            <textarea className="hb-input min-h-[120px]" maxLength={240} placeholder="A few kind words for the card" value={cardMessage} onChange={(e) => setCardMessage(e.target.value)} />
          </Field>
          <label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C2185B]" checked={gift.isGift} onChange={(e) => setGift({ ...gift, isGift: e.target.checked })} /> This is a gift</label>
          {gift.isGift && (
            <div className="mt-3 grid gap-3">
              <Field label="Recipient name"><input className="hb-input" value={gift.recipientName} onChange={(e) => setGift({ ...gift, recipientName: e.target.value })} /></Field>
              <Field label="Recipient phone"><input className="hb-input" inputMode="tel" value={gift.recipientPhone} onChange={(e) => setGift({ ...gift, recipientPhone: e.target.value })} onBlur={() => setGift((g) => ({ ...g, recipientPhone: normalizePhone(g.recipientPhone) }))} /></Field>
            </div>
          )}
        </div>
        <div className="hb-giftcard" aria-label="Card preview">
          <Bloom size={32} className="mx-auto text-[#C2185B]" />
          <p className="msg mt-3">{cardMessage || "Your message will appear here."}</p>
          {gift.isGift && gift.recipientName && <p className="hb-muted mt-3 text-xs">For {gift.recipientName}</p>}
        </div>
      </div>
      {mode === "cart" && renderPolicyCheck()}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#4B0D32]/10 pt-6">
        <button type="button" className="hb-btn-quiet" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button type="button" className="hb-btn" disabled={submitting} onClick={onPrimary}>{mode === "cart" ? primaryLabel : "Continue to checkout"} {!submitting && <ArrowRight size={16} />}</button>
      </div>
    </>
  );

  const renderReviewStep = () => {
    const uniqueSelected = [...new Set(selections.map((s) => s.productId))];
    const groupedByCategory = regularSelectable.map((d) => ({ d, ids: picks[d.key] || [] })).filter((g) => g.ids.length);
    const addonIds = addonDefinition ? picks[addonDefinition.key] || [] : [];
    return (
      <>
        <BackBar onBack={() => goTo(5)} />
        <StepHead title="Review and pay" hint="One last look. Use Edit to change anything." />
        <div className="mb-6 grid gap-4 rounded-2xl bg-white p-4 sm:grid-cols-[minmax(150px,0.8fr)_minmax(0,1.2fr)] sm:items-start sm:gap-6 sm:p-5">
          <div className="flex items-center gap-4 sm:block">
            <img src={photosOf(box)[0]?.url || cardBox} alt={photosOf(box)[0]?.alt || box?.name || "Your box"} className="h-28 w-28 shrink-0 rounded-xl bg-[#F8E8ED] object-contain sm:h-48 sm:w-full" />
            <div className="min-w-0 sm:mt-3">
              <p className="hb-muted text-xs">Your ritual box</p>
              <h3 className="font-display text-2xl sm:text-3xl">{box?.name}</h3>
              <p className="hb-muted mt-1 text-sm">{purchaseType === "three_month" ? "Three month plan" : "One time purchase"}</p>
              <button type="button" className="hb-link mt-2" onClick={() => goTo(1)}>Edit box</button>
            </div>
          </div>
          <div className="min-w-0 sm:border-l sm:border-[#4B0D32]/10 sm:pl-6">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-display text-xl">Inside your box</h4>
              <button type="button" className="hb-link" onClick={() => { setWizardStep(3); setActiveCategory(null); }}>Edit products</button>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              {groupedByCategory.length ? groupedByCategory.map(({ d, ids }) => (
                <div key={d.key}>
                  <p className="font-medium text-[#4B0D32]">{labelOf(d)}</p>
                  <p className="hb-muted mt-0.5 leading-5">{[...new Set(ids)].map((id) => `${byId[id]?.name || "Item"}${ids.filter((x) => x === id).length > 1 ? ` x${ids.filter((x) => x === id).length}` : ""}`).join(", ")}</p>
                </div>
              )) : <p className="hb-muted">No products chosen yet.</p>}
              {includedProducts.length > 0 && <div><p className="font-medium text-[#4B0D32]">Always included</p><p className="hb-muted mt-0.5 leading-5">{includedProducts.map((p) => p.name).join(", ")}</p></div>}
              {addonIds.length > 0 && <div><p className="font-medium text-[#4B0D32]">Add ons</p><p className="hb-muted mt-0.5 leading-5">{[...new Set(addonIds)].map((id) => `${byId[id]?.name || "Item"}${addonIds.filter((x) => x === id).length > 1 ? ` x${addonIds.filter((x) => x === id).length}` : ""}`).join(", ")}</p></div>}
            </div>
          </div>
        </div>
        {renderIssues()}
        {addonIds.length > 0 && <ReviewRow title="Add ons" onEdit={() => goTo(4)}>{[...new Set(addonIds)].map((id) => `${byId[id]?.name}${addonIds.filter((x) => x === id).length > 1 ? ` x${addonIds.filter((x) => x === id).length}` : ""}`).join(", ")}</ReviewRow>}
        <ReviewRow title="Delivery" onEdit={() => goTo(5)}>
          <p>{normalizePhone(phone)}</p>
          <p>{[address.street, address.city, address.county].filter(Boolean).join(", ")}</p>
          <p>Preferred date: {firstDeliveryDate || "Not chosen"}</p>
          {discreet && <p>Discreet packaging</p>}
          {address.deliveryNotes && <p>Notes: {address.deliveryNotes}</p>}
        </ReviewRow>
        {(gift.isGift || cardMessage) && <ReviewRow title="Gift and card" onEdit={() => goTo(5)}>{gift.isGift && <p>For {gift.recipientName}, {gift.recipientPhone}</p>}{cardMessage && <p className="italic">{cardMessage}</p>}</ReviewRow>}
        <div className="rounded-2xl bg-white p-5">
          <TotalRow label={purchaseType === "three_month" ? "Three month plan, per box" : "Box"} value={formatKsh(box?.price)} />
          {extras > 0 && <TotalRow label="Paid extras" value={formatKsh(extras)} />}
          {discount > 0 && <TotalRow label={`Plan discount (${discountPercent}%)`} value={`${formatKsh(discount)} off`} accent />}
          <TotalRow label={`${count} box${count === 1 ? "" : "es"} total`} value={formatKsh(total)} strong />
        </div>
        {renderPolicyCheck()}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C2185B]/20 bg-[#F8E8ED] p-4">
          <Lock size={18} className="mt-0.5 shrink-0 text-[#C2185B]" />
          <div><p className="text-sm font-semibold">Pay securely with Paystack</p><p className="hb-muted mt-0.5 text-xs leading-5">Card, M Pesa or bank transfer. You will be taken to Paystack to complete your payment.</p></div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-[#C2185B]"><Heart size={15} fill="currentColor" /> {IMPACT_LINE}</p>
        <button type="button" className="hb-btn mt-5 min-h-[58px] w-full px-6 text-base font-semibold shadow-lg shadow-[#4B0D32]/20 sm:w-auto sm:min-w-[280px]" disabled={!box || !complete} onClick={addBoxToCart}>Add this box to my cart <ShoppingBag size={18} /></button>

        <section className="mt-10 border-t border-[#4B0D32]/10 pt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl">Reviews for {box?.name}</h3>
            {reviewSummary.count > 0 && <span className="text-sm text-[#C2185B]">{reviewSummary.average} out of 5 ({reviewSummary.count})</span>}
          </div>
          <div className="mt-4 space-y-3">
            {boxReviews.slice(0, 3).map((r) => (
              <article key={r._id} className="rounded-2xl border border-[#4B0D32]/10 bg-white p-4">
                <div className="flex justify-between gap-2"><span className="text-sm font-semibold">{r.user?.name || "Verified customer"}</span><span className="text-sm text-[#C2185B]" aria-label={`${r.rating} out of 5`}>{"\u2605".repeat(r.rating)}{"\u2606".repeat(5 - r.rating)}</span></div>
                <p className="hb-muted mt-2 text-sm leading-6">{r.text}</p>
              </article>
            ))}
            {!boxReviews.length && <p className="hb-muted text-sm">No reviews for this box yet.</p>}
          </div>
          {user && reviewOption?.boxAvailable && (
            <form onSubmit={submitReview} className="mt-5 rounded-2xl border border-[#4B0D32]/10 bg-white p-4">
              <p className="text-sm font-semibold">You received this box. Share your review.</p>
              <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map((s) => <button type="button" key={s} role="radio" aria-checked={s === reviewRating} aria-label={`${s} star${s === 1 ? "" : "s"}`} onClick={() => setReviewRating(s)} className={`h-11 w-11 text-2xl ${s <= reviewRating ? "text-[#C2185B]" : "text-[#4B0D32]/20"}`}>{"\u2605"}</button>)}</div>
              <textarea required maxLength={1000} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tell us about this box" className="hb-input min-h-[90px]" aria-label="Your review" />
              <button className="hb-btn mt-3">Submit review</button>
            </form>
          )}
        </section>

        <section className="mt-8 border-t border-[#4B0D32]/10 pt-4">
          <h3 className="font-display text-xl">Customer care</h3>
          {[["shipping", "Shipping and delivery", settings?.legal?.shipping], ["returns", "Returns, refunds and cancellations", settings?.legal?.returns]].map(([key, title, policy]) => (
            <div key={key} className="border-b border-[#4B0D32]/10 last:border-0">
              <button type="button" aria-expanded={openPolicy === key} onClick={() => setOpenPolicy((c) => (c === key ? "" : key))} className="flex min-h-[48px] w-full items-center justify-between gap-3 text-left text-sm font-semibold">
                {title}<ChevronDown size={16} className={`shrink-0 transition-transform ${openPolicy === key ? "rotate-180 text-[#C2185B]" : ""}`} />
              </button>
              {openPolicy === key && (
                <div className="pb-4">
                  <p className="hb-muted text-sm leading-6">{policy?.summary}</p>
                  <p className="hb-muted mt-2 whitespace-pre-line text-sm leading-6">{policy?.body}</p>
                  <Link to={`/policies/${key}`} className="hb-link mt-1 inline-flex items-center gap-1">Read the full policy <ArrowRight size={13} /></Link>
                </div>
              )}
            </div>
          ))}
        </section>
      </>
    );
  };

  const renderStep = () => {
    if (mode === "cart") return renderDeliveryStep();
    return [renderBoxStep, renderPlanStep, renderProductsStep, renderAddonsStep, renderDeliveryStep, renderReviewStep][wizardStep - 1]();
  };

  /* ---------- summary (sidebar on desktop, sheet on mobile) ---------- */
  const renderSummary = () => {
    if (mode === "cart") return (
      <div>
        <h2 className="font-display text-2xl">Your cart</h2>
        <ul className="mt-4 space-y-3">
          {selectedCartItems.map((item) => (
            <li key={item.cartId} className="flex items-center gap-3">
              <img src={item.image || cardBox} alt="" loading="lazy" className="h-12 w-12 rounded-xl bg-white object-contain" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.name}</p><p className="hb-muted text-xs">Qty {item.quantity}</p></div>
              <span className="text-sm">{formatKsh(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        {!selectedCartItems.length && <p className="hb-muted mt-4 text-sm">No items selected.</p>}
        <TotalRow strong label={`${selectedCartCount} item${selectedCartCount === 1 ? "" : "s"}`} value={formatKsh(selectedCartTotal)} />
      </div>
    );
    const photo = photosOf(box)[0];
    const addonIds = addonDefinition ? picks[addonDefinition.key] || [] : [];
    return (
      <div>
        <div className="flex items-center gap-4">
          <img src={photo?.url || cardBox} alt="" loading="lazy" className="h-16 w-16 rounded-2xl bg-white object-contain" />
          <div><p className="hb-muted text-xs">Your ritual box</p><h2 className="font-display text-2xl leading-tight">{box?.name || "Choose a box"}</h2><p className="hb-muted text-xs">{purchaseType === "three_month" ? "Three month plan" : "One time purchase"}</p></div>
        </div>
        <ul className="mt-5 space-y-2.5">
          {regularSelectable.map((d) => {
            const ids = picks[d.key] || [];
            const min = Number(d.minSelections || 0);
            const filled = ids.length >= min && ids.length > 0;
            return (
              <li key={d.key}>
                <button type="button" onClick={() => { if (wizardStep !== 3 || mode !== "box") { setWizardStep(3); setMaxStep((m) => Math.max(m, 3)); } setActiveCategory(d.key); setSummaryOpen(false); }} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left ${filled ? "border-[#C2185B]/40 bg-white" : "border-dashed border-[#4B0D32]/25"}`}>
                  <span><span className="block text-sm font-medium">{labelOf(d)}</span><span className={`block text-xs ${ids.length < min ? "text-[#C2185B]" : "hb-muted"}`}>{ids.length ? ids.length >= min ? `${ids.length} chosen` : `${ids.length} of ${min} chosen` : min ? `0 of ${min} chosen` : "Optional"}</span></span>
                  <span className="flex -space-x-2">{[...new Set(ids)].slice(0, 3).map((id) => { const ph = photosOf(byId[id])[0]; return <span key={id} className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-white">{ph && <img src={ph.url} alt={byId[id]?.name || ""} className="h-full w-full object-cover" />}</span>; })}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {addonIds.length > 0 && <p className="hb-muted mt-3 text-xs leading-5">Add ons: {[...new Set(addonIds)].map((id) => byId[id]?.name).filter(Boolean).join(", ")}</p>}
        {includedProducts.length > 0 && <p className="hb-muted mt-2 text-xs leading-5">Always included: {includedProducts.map((p) => p.name).join(", ")}</p>}
        <div className="mt-5 border-t border-[#4B0D32]/10 pt-3">
          <TotalRow label="Box" value={formatKsh(box?.price)} />
          {extras > 0 && <TotalRow label="Paid extras" value={formatKsh(extras)} />}
          {discount > 0 && <TotalRow label={`Plan discount (${discountPercent}%)`} value={`${formatKsh(discount)} off`} accent />}
          <TotalRow strong label={`${count} box${count === 1 ? "" : "es"} total`} value={formatKsh(total)} />
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#C2185B]"><Heart size={13} fill="currentColor" className="mt-0.5 shrink-0" /> {IMPACT_LINE}</p>
      </div>
    );
  };

  /* ---------- footer actions ---------- */
  const onBack = () => {
    if (mode === "cart") { setMode("box"); return; }
    if (wizardStep === 3 && activeCategory) return setActiveCategory(null);
    goTo(wizardStep - 1);
  };
  const onPrimary = () => {
    if (mode === "cart") return payCart();
    if (wizardStep === 3 && activeCategory) return setActiveCategory(null);
    if (wizardStep === 6) return payBox();
    goTo(wizardStep + 1);
  };
  const addonsPicked = addonDefinition ? (picks[addonDefinition.key] || []).length : 0;
  const primaryLabel = mode === "cart" ? (submitting ? "Opening Paystack" : user ? "Pay for selected items" : "Log in to pay")
    : wizardStep === 6 ? (submitting ? "Opening Paystack" : user ? "Confirm and pay" : "Log in to pay")
    : wizardStep === 3 && activeDefinition ? `Done with ${labelOf(activeDefinition)}`
    : wizardStep === 4 && !addonsPicked ? "Skip add ons" : "Continue";
  const footerTotal = mode === "cart" ? selectedCartTotal : total;
  const showAside = mode === "cart" || wizardStep < 6;
  const deliveryComplete = getIssues({ withSelections: false, withPolicy: false }).length === 0;
  const showFooter = (mode === "cart" ? wizardStep === 5 : wizardStep >= 5) && deliveryComplete;
  const stepName = mode === "cart" ? "Checkout" : STEPS[wizardStep - 1];

  /* ---------- page ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="hb">
        <style>{STYLES}</style>
        <div ref={topRef} className={`mx-auto max-w-7xl scroll-mt-4 px-4 ${showFooter ? "pb-44" : "pb-16"} pt-8 sm:px-6 md:pt-12`}>
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-[#C2185B]"><Bloom size={22} /> The Heri Bloom ritual</p>
              <h1 className="font-display mt-2 text-4xl md:text-5xl">Build your ritual box</h1>
              <p className="hb-muted mt-2 max-w-xl text-sm leading-6">Choose your box, curate every category, and have it delivered with care.</p>
              {!user && <p className="mt-3 text-sm"><Link to="/login" state={{ from: "/shop" }} className="hb-link">Log in</Link> <span className="hb-muted">to save your progress and check out faster.</span></p>}
            </div>
            <button type="button" onClick={() => setCartOpen(true)} className="hb-btn-quiet relative" aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
              <ShoppingBag size={18} /> Cart
              {cartCount > 0 && <span className="hb-badge absolute -right-1 -top-1 !h-6 !w-6 text-xs font-semibold">{cartCount}</span>}
            </button>
          </header>

          {notice && (
            <div role="status" className="hb-panel mb-6 flex items-start justify-between gap-3 p-4 text-sm">
              <p className="leading-6">{notice}</p>
              <button type="button" className="hb-qbtn shrink-0 !border-[#4B0D32]/20 !text-[#4B0D32]" aria-label="Dismiss message" onClick={() => setNotice("")}><X size={16} /></button>
            </div>
          )}

          {mode === "box" && (
            <div className="mb-6 px-1">
              <Stepper step={wizardStep} maxStep={maxStep} onGo={goTo} />
              <p className="mt-3 text-center text-xs font-medium text-[#C2185B] md:hidden">Step {wizardStep} of 6: {stepName}</p>
            </div>
          )}

          {showAside && !showFooter && (
            <button type="button" onClick={() => setSummaryOpen(true)} className="hb-panel mb-4 flex w-full items-center justify-between px-5 py-3 text-left lg:hidden" aria-label="View order summary">
              <span className="text-sm font-medium">View order summary</span>
              <span className="font-display text-lg text-[#C2185B]">{formatKsh(footerTotal)}</span>
            </button>
          )}

          <div className={`grid items-start gap-8 ${showAside ? "lg:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
            <main className="hb-panel p-6 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div key={`${mode}-${wizardStep}-${activeCategory || ""}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </main>
            {showAside && <aside className="hb-panel sticky top-6 hidden p-6 lg:block" aria-label="Order summary">{renderSummary()}</aside>}
          </div>
        </div>

        {/* Footer appears only once the delivery details are complete */}
        {showFooter && (
        <div className="hb-footer" role="region" aria-label="Order navigation">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
            <button type="button" className="hb-btn-quiet" onClick={onBack} disabled={mode === "box" && wizardStep === 1 && !activeCategory}><ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span></button>
            <button type="button" onClick={() => setSummaryOpen(true)} className="min-w-0 flex-1 text-left lg:pointer-events-none" aria-label="View order summary">
              <span className="hb-muted block text-xs">{mode === "cart" ? `${selectedCartCount} cart item${selectedCartCount === 1 ? "" : "s"}` : `${selections.length} selected, ${count} box${count === 1 ? "" : "es"}`} <span className="text-[#C2185B] lg:hidden">View summary</span></span>
              <span className="font-display text-xl">{formatKsh(footerTotal)}</span>
            </button>
            <button type="button" className="hb-btn" onClick={onPrimary} disabled={submitting || (mode === "box" && wizardStep === 1 && !boxId)}>{primaryLabel} {!submitting && <ArrowRight size={16} />}</button>
          </div>
        </div>

        )}

        {/* Mobile summary sheet */}
        <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} label="Order summary" variant="sheet">
          <div className="p-6 pt-8">{renderSummary()}</div>
        </Modal>

        {/* Box preview */}
        <Modal open={Boolean(boxModal)} onClose={() => setBoxModal(null)} label={`${boxModal?.name || "Box"} details`}>
          {boxModal && (() => {
            const photos = photosOf(boxModal);
            const shown = photos[boxModalImage] || photos[0] || { url: cardBox, alt: boxModal.name };
            return (
              <div className="p-6 pt-16">
                <button type="button" className="relative block w-full overflow-hidden rounded-2xl bg-white" onClick={() => setLightbox(shown)} aria-label="View image larger">
                  <img src={shown.url} alt={shown.alt || boxModal.name} className="h-72 w-full object-contain sm:h-[24rem]" />
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#4B0D32]/70 px-3 py-1 text-xs text-[#FBF7F2]">Tap to enlarge</span>
                </button>
                {photos.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {photos.map((ph, i) => <button type="button" key={`${ph.url}-${i}`} onClick={() => setBoxModalImage(i)} aria-label={`Show photo ${i + 1}`} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${i === boxModalImage ? "border-[#C2185B]" : "border-[#4B0D32]/10"}`}><img src={ph.url} alt="" loading="lazy" className="h-full w-full object-contain" /></button>)}
                  </div>
                )}
                <h2 className="font-display mt-6 text-3xl">{boxModal.name}</h2>
                <p className="hb-muted mt-2 text-sm">{boxModal.tagline}</p>
                <p className="mt-4 text-sm leading-6">{boxModal.description || "A thoughtful care box with carefully chosen essentials for your routine."}</p>
                <p className="mt-5 font-semibold text-[#C2185B]">{formatKsh(boxModal.price)} <span className="hb-muted font-normal">per box</span></p>
                <button type="button" className="hb-btn mt-5 w-full" onClick={() => { if (boxModal._id !== boxId) setPicks({}); setBoxId(boxModal._id); setBoxModal(null); goTo(2); }}>Choose this box <ArrowRight size={16} /></button>
              </div>
            );
          })()}
        </Modal>

        {/* Add on details */}
        <Modal open={Boolean(addonModal)} onClose={() => setAddonModal(null)} label={`${addonModal?.name || "Add on"} details`}>
          {addonModal && addonDefinition && (() => {
            const p = addonModal;
            const photos = photosOf(p);
            const shown = photos[addonImage] || photos[0];
            const n = countOf(addonDefinition, p._id);
            const soldOut = p.inventory != null && p.inventory < 1;
            const atLimit = p.inventory != null && n >= p.inventory;
            return (
              <div className="p-6 pt-16">
                {shown ? (
                  <button type="button" className="relative block w-full overflow-hidden rounded-2xl bg-white" onClick={() => setLightbox(shown)} aria-label="View image larger">
                    <img src={shown.url} alt={shown.alt || p.name} className="h-72 w-full object-contain sm:h-[24rem]" />
                    <span className="absolute bottom-3 right-3 rounded-full bg-[#4B0D32]/70 px-3 py-1 text-xs text-[#FBF7F2]">Tap to enlarge</span>
                  </button>
                ) : (
                  <div className="flex h-72 items-center justify-center rounded-2xl bg-white text-[#C2185B]/50"><Bloom size={64} /></div>
                )}
                {photos.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {photos.map((ph, i) => (
                      <button type="button" key={`${ph.url}-${i}`} onClick={() => setAddonImage(i)} aria-label={`Show photo ${i + 1}`} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${i === addonImage ? "border-[#C2185B]" : "border-[#4B0D32]/10"}`}>
                        <img src={ph.url} alt="" loading="lazy" className="h-full w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
                <h2 className="font-display mt-6 text-3xl">{p.name}</h2>
                <p className="mt-3 text-sm leading-6">{p.description || "A thoughtful extra for your ritual box, or a useful item to buy on its own."}</p>
                <div className="mt-4 space-y-1">
                  <p className="font-semibold text-[#C2185B]">{formatKsh(p.priceModifier)} <span className="hb-muted font-normal">added to your box</span></p>
                  {p.standalonePrice != null && <p className="hb-muted text-sm">{formatKsh(p.standalonePrice)} if bought separately</p>}
                  <p className="hb-muted text-sm">{p.inventory == null ? "In stock" : p.inventory > 0 ? `${p.inventory} available` : "Sold out"}</p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {n === 0 ? (
                    <button type="button" className="hb-btn" disabled={soldOut} onClick={() => pick(addonDefinition, p._id)}>{soldOut ? "Sold out" : "Add to my box"} {!soldOut && <Plus size={16} />}</button>
                  ) : (
                    <div className="flex items-center justify-center gap-4 rounded-full border border-[#C2185B]/30 bg-[#F8E8ED] px-4 py-1">
                      <button type="button" className="hb-qbtn" onClick={() => unpick(addonDefinition, p._id)} aria-label={`Remove one ${p.name}`}><Minus size={16} /></button>
                      <span className="text-sm font-semibold" aria-live="polite">{n} in your box</span>
                      <button type="button" className="hb-qbtn" disabled={atLimit} onClick={() => pick(addonDefinition, p._id)} aria-label={`Add one more ${p.name}`}><Plus size={16} /></button>
                    </div>
                  )}
                  {p.standalonePrice != null && <button type="button" className="hb-btn-outline" disabled={soldOut} onClick={() => { addStandaloneToCart(p, 1); setAddonModal(null); }}>Buy separately</button>}
                </div>
                <button type="button" className="hb-btn-quiet mt-3 w-full" onClick={() => setAddonModal(null)}>Keep browsing</button>
              </div>
            );
          })()}
        </Modal>

        {/* Cart */}
        <Modal open={cartOpen} onClose={() => setCartOpen(false)} label="Shopping cart" variant="right">
          <div className="flex items-center justify-between border-b border-[#4B0D32]/10 px-6 py-5">
            <h2 className="font-display text-2xl">Your cart</h2>
            <button type="button" onClick={() => setCartOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#4B0D32]/15 bg-white text-[#4B0D32] transition hover:border-[#C2185B] hover:text-[#C2185B]" aria-label="Close cart"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length ? (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li key={item.cartId} className={`rounded-2xl border p-4 ${selectedCartIds.has(item.cartId) ? "border-[#C2185B] bg-[#F8E8ED]/60" : "border-[#4B0D32]/10 bg-white"}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selectedCartIds.has(item.cartId)} onChange={() => toggleCartItem(item.cartId)} className="mt-1 h-5 w-5 accent-[#C2185B]" aria-label={`Select ${item.name} for checkout`} />
                      <img src={item.image || cardBox} alt={item.imageAlt || item.name} loading="lazy" className="h-14 w-14 rounded-xl bg-white object-contain" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="hb-muted text-xs">{item.itemType === "box" ? (item.purchaseType === "three_month" ? "Three month plan" : "One time box") : "Add on"}</p>
                        {item.itemType === "box" && item.selections?.length > 0 && (
                          <details className="mt-1"><summary className="cursor-pointer text-xs font-medium text-[#C2185B]">View contents ({item.selections.length})</summary>
                            <ul className="hb-muted mt-1 space-y-0.5 text-xs">{item.selections.map((s, i) => <li key={`${s.productId}-${i}`}>{s.productName}</li>)}</ul>
                          </details>
                        )}
                      </div>
                      <button type="button" onClick={() => removeCartItem(item.cartId)} className="flex h-10 w-10 items-center justify-center rounded-full text-[#4B0D32]/60 hover:text-[#C2185B]" aria-label={`Remove ${item.name}`}><X size={16} /></button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button type="button" className="hb-qbtn" disabled={item.itemType === "box" || item.quantity <= 1} onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                        <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                        <button type="button" className="hb-qbtn" disabled={item.itemType === "box"} onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                      </div>
                      <span className="text-sm font-semibold text-[#C2185B]">{formatKsh(item.unitPrice * item.quantity)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#C2185B]/30 bg-[#F8E8ED] p-8 text-center">
                <Bloom size={48} className="mx-auto text-[#C2185B]" />
                <p className="font-display mt-3 text-xl">Your cart is empty</p>
                <p className="hb-muted mt-1 text-sm">Finish a box or add a thoughtful extra to begin.</p>
              </div>
            )}
          </div>
          <div className="border-t border-[#4B0D32]/10 p-6">
            {cart.length > 0 && <label className="mb-4 flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#C2185B]" checked={allCartSelected} onChange={() => setSelectedCartIds(allCartSelected ? new Set() : new Set(cart.map((i) => i.cartId)))} /> {allCartSelected ? "Deselect all" : "Select all"}</label>}
            <div className="mb-4 flex items-baseline justify-between"><span className="hb-muted text-sm">{selectedCartCount} selected</span><strong className="font-display text-2xl text-[#C2185B]">{formatKsh(selectedCartTotal)}</strong></div>
            <button type="button" className="hb-btn w-full" disabled={!selectedCartItems.length} onClick={startCartCheckout}>Checkout selected items <ArrowRight size={16} /></button>
            <p className="hb-muted mt-3 text-center text-xs">Delivery details come next. Items stay in your cart until payment is confirmed.</p>
            {cart.length > 0 && cartTotalAll !== selectedCartTotal && <p className="hb-muted mt-1 text-center text-xs">Full cart value {formatKsh(cartTotalAll)}</p>}
          </div>
        </Modal>

        {/* Enlarged image, works with a tap on any device */}
        <Modal open={Boolean(lightbox)} onClose={() => setLightbox(null)} label="Enlarged image" variant="lightbox">
          {lightbox && <img src={lightbox.url} alt={lightbox.alt || "Enlarged product"} className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl" />}
        </Modal>
      </div>
    </MotionConfig>
  );
}