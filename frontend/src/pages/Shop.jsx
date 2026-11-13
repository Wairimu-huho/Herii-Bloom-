import * as React from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Check, ChevronDown, CreditCard, Heart, Minus, Plus, X, ShoppingBag, Sparkles } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import cardBox from "../assets/products/box-card.webp";
import heroBox from "../assets/products/box-hero.webp";
const DRAFT_KEY = "heribloom_shop_draft";
const CATEGORY_ORDER = ["pads", "tampons", "panty-liners", "liners", "wipes", "tea", "teas", "chocolate", "chocolates", "candle", "candles", "bath-bombs", "bathbombs", "addon", "addons"];
const CATEGORY_LABELS = { "panty-liners": "Panty Liners", liners: "Panty Liners", chocolate: "Chocolates", chocolates: "Chocolates", tea: "Teas", teas: "Teas", candle: "Candles", candles: "Candles", "bath-bombs": "Bath bombs", bathbombs: "Bath bombs", addon: "Add-ons", addons: "Add-ons" };
const categoryRank = (definition) => {
  const normalized = String(definition.key || definition.name || "").toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("bathbomb")) return 11;
  if (normalized === "addon" || normalized === "addons") return 12;
  const rank = CATEGORY_ORDER.indexOf(definition.key);
  return rank === -1 ? 999 : rank;
};
const formatKsh = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const inputClass = "w-full rounded-2xl border border-[#4B0D32]/10 bg-white/70 px-4 py-3.5 font-body text-sm font-light text-[#4B0D32] placeholder:text-[#4B0D32]/40 transition duration-300 focus:border-[#C2185B] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#C2185B]/10";
const loadDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {};
  } catch {
    return {};
  }
};
const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap");
.hb{font-family:"Poppins",system-ui,sans-serif;color:#4B0D32;scroll-behavior:smooth}
.hb .font-display{font-family:"Playfair Display",Georgia,serif;font-weight:500;letter-spacing:-0.01em}
.hb .font-body{font-family:"Poppins",system-ui,sans-serif}
.hb ::selection{background:#F8E8ED;color:#4B0D32}
.hb button,.hb a{transition-property:all;transition-duration:300ms}
.hb-rise{animation:hbRise .8s cubic-bezier(.22,1,.36,1) both}
.hb-pop{animation:hbPop .4s cubic-bezier(.22,1,.36,1) both}
.hb-float{animation:hbFloat 7s ease-in-out infinite}
.hb-checkout-dock{position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:1000!important;width:100%!important}
@keyframes hbRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes hbPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
@keyframes hbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@media (prefers-reduced-motion:reduce){.hb-rise,.hb-pop,.hb-float{animation:none}.hb{scroll-behavior:auto}}
`;
function LuxuryStepWrapper({ children, isActive = true }) {
  return /* @__PURE__ */ React.createElement(motion.div, { initial: { opacity: 0.3, y: 20, scale: 0.98 }, animate: isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.25, y: 0, scale: 0.96 }, transition: { type: "spring", stiffness: 100, damping: 18, mass: 0.8 }, className: "origin-center" }, children);
}
function Section({ n, title, hint, id, children, isActive = true, sectionRef }) {
  return /* @__PURE__ */ React.createElement(LuxuryStepWrapper, { isActive }, /* @__PURE__ */ React.createElement("section", { ref: sectionRef, id, className: "hb-rise scroll-mt-24 rounded-[28px] border border-[#4B0D32]/10 bg-[#FBF7F2]/80 p-6 shadow-[0_24px_60px_-34px_rgba(75,13,50,0.3)] backdrop-blur-sm md:p-9" }, /* @__PURE__ */ React.createElement("div", { className: "mb-7 flex items-start gap-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-display text-3xl leading-none text-[#C2185B]/60" }, String(n).padStart(2, "0")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[10px] font-medium uppercase tracking-[0.28em] text-[#C2185B]" }, "Step ", n), /* @__PURE__ */ React.createElement("h2", { className: "font-display text-2xl text-[#4B0D32] md:text-[1.7rem]" }, title), hint && /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-body text-sm font-light text-[#4B0D32]/70" }, hint))), children));
}
function Choice({ product, selected, onClick, onImageClick, disabled = false }) {
  const photos = product.photos?.filter((item) => item.active !== false) || [];
  const photo = photos[0];
  return /* @__PURE__ */ React.createElement("button", { type: "button", disabled, onClick, className: `group text-left rounded-2xl border bg-[#FBF7F2] overflow-hidden transition-all duration-500 hover:-translate-y-1 disabled:opacity-50 ${selected ? "border-[#C2185B] bg-[#F8E8ED] shadow-[0_18px_40px_-20px_rgba(194,24,91,0.45)]" : "border-[#4B0D32]/10 hover:border-[#C2185B]/50 hover:shadow-[0_18px_40px_-24px_rgba(75,13,50,0.4)]"}` }, photo ? /* @__PURE__ */ React.createElement("div", { className: "relative h-36 overflow-hidden bg-white p-1 cursor-pointer", onClick: (event) => {
    event.stopPropagation();
    onImageClick?.(photo);
  }, onKeyDown: (event) => {
    if ((event.key === "Enter" || event.key === " ") && onImageClick) {
      event.preventDefault();
      onImageClick(photo);
    }
  }, role: onImageClick ? "button" : void 0, tabIndex: onImageClick ? 0 : void 0 }, /* @__PURE__ */ React.createElement("img", { src: photo.url, alt: photo.alt || product.name, className: "w-full h-full rounded-lg object-contain scale-[1.18] transition-transform duration-300 group-hover:scale-[1.24]" })) : /* @__PURE__ */ React.createElement("div", { className: "w-full h-3 bg-[#F8E8ED]" }), photos.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 px-3 pt-2" }, photos.slice(0, 4).map((item, index) => /* @__PURE__ */ React.createElement("img", { key: `${item.url}-${index}`, src: item.url, alt: "", className: "w-8 h-6 rounded object-cover border border-[#4B0D32]/10 transition-transform duration-200 hover:scale-110" }))), /* @__PURE__ */ React.createElement("div", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "flex justify-between gap-2 font-body text-sm text-[#4B0D32]" }, /* @__PURE__ */ React.createElement("span", null, product.name), /* @__PURE__ */ React.createElement("span", { className: `w-5 h-5 rounded-full border flex items-center justify-center ${selected ? "bg-[#C2185B] border-[#C2185B] text-[#FBF7F2]" : "border-[#4B0D32]/10"}` }, selected && /* @__PURE__ */ React.createElement(Check, { size: 12 }))), /* @__PURE__ */ React.createElement("span", { className: "block font-body text-xs text-[#4B0D32]/70 mt-1" }, product.priceModifier > 0 ? `+ ${formatKsh(product.priceModifier)}` : "Included", product.inventory != null ? ` \xB7 ${product.inventory} available` : "")));
}
export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [draft] = useState(loadDraft);
  const [boxes, setBoxes] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [boxReviews, setBoxReviews] = useState([]);
  const [addonReviews, setAddonReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const [addonReviewSummary, setAddonReviewSummary] = useState({ average: 0, count: 0 });
  const [reviewOption, setReviewOption] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [selectedImage, setSelectedImage] = useState("card");
  const [zoomPosition, setZoomPosition] = useState(null);
  const [status, setStatus] = useState("loading");
  const [productDrawer, setProductDrawer] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const sectionRefs = useRef([]);
  const [boxId, setBoxId] = useState(params.get("box") || draft.boxId || "");
  const [picks, setPicks] = useState(draft.picks || {});
  const [purchaseType, setPurchaseType] = useState(draft.purchaseType || "one_time");
  const [firstDeliveryDate, setFirstDeliveryDate] = useState(draft.firstDeliveryDate || "");
  const [phone, setPhone] = useState(draft.phone || "");
  const [address, setAddress] = useState(draft.address || { street: "", city: "", county: "", deliveryNotes: "" });
  const [cardMessage, setCardMessage] = useState(draft.cardMessage || "");
  const [gift, setGift] = useState(draft.gift || { isGift: false, recipientName: "", recipientPhone: "" });
  const [notificationPreferences, setNotificationPreferences] = useState({ email: true, whatsapp: false });
  const [standaloneOnly, setStandaloneOnly] = useState("");
  const [standaloneQuantity, setStandaloneQuantity] = useState(1);
  const [addonModal, setAddonModal] = useState(null);
  const [addonModalQuantity, setAddonModalQuantity] = useState(1);
  const [addonModalImage, setAddonModalImage] = useState(0);
  const [addonZoomPosition, setAddonZoomPosition] = useState(null);
  const [addonLightbox, setAddonLightbox] = useState(null);
  const [boxModal, setBoxModal] = useState(null);
  const [productLightbox, setProductLightbox] = useState(null);
  const [boxModalImage, setBoxModalImage] = useState(0);
  const [boxZoomPosition, setBoxZoomPosition] = useState(null);
  const [boxLightbox, setBoxLightbox] = useState(null);
  const [accept, setAccept] = useState(false);
  const [openPolicy, setOpenPolicy] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("heribloom_cart")) || [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCartIds, setSelectedCartIds] = useState(() => new Set());
  useEffect(() => {
    Promise.all([api.get("/api/boxes"), api.get("/api/products"), api.get("/api/catalog/settings")]).then(([b, p, s]) => {
      setBoxes(b.data);
      setProducts(p.data);
      setSettings(s.data);
      setStatus("ready");
    }).catch(() => setStatus("error"));
  }, []);
  useEffect(() => {
    if (status !== "ready" || window.location.hash !== "#choose-box") return;
    const timer = window.setTimeout(() => document.getElementById("choose-box")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => window.clearTimeout(timer);
  }, [status]);
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
        if (data.paymentStatus !== "paid" && attempt < 4) timer = window.setTimeout(() => verify(attempt + 1), 2500);
      } catch (error) {
        if (active && attempt < 4) timer = window.setTimeout(() => verify(attempt + 1), 2500);
        else if (active) toast.error(error.response?.data?.message || "We could not verify the Paystack payment");
      }
    };
    verify();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [status, user, params]);
  useEffect(() => {
    if (status !== "ready" || !user || params.get("payment") !== "cancelled" || !params.get("order")) return;
    api.post(`/api/payments/cancel/${params.get("order")}`).catch(() => {
    });
  }, [status, user, params]);
  useEffect(() => {
    if (!boxId) return;
    api.get(`/api/reviews?boxId=${boxId}`).then(({ data }) => {
      setBoxReviews(data.reviews || []);
      setReviewSummary(data.summary || { average: 0, count: 0 });
    }).catch(() => {
      setBoxReviews([]);
      setReviewSummary({ average: 0, count: 0 });
    });
    setSelectedImage(standaloneOnly ? "product-0" : box?.photos?.length ? "photo-0" : "card");
  }, [boxId, boxes, standaloneOnly]);
  useEffect(() => {
    if (!standaloneOnly) {
      setAddonReviews([]);
      setAddonReviewSummary({ average: 0, count: 0 });
      return;
    }
    api.get(`/api/reviews?productId=${standaloneOnly}`).then(({ data }) => {
      setAddonReviews(data.reviews || []);
      setAddonReviewSummary(data.summary || { average: 0, count: 0 });
    }).catch(() => {
      setAddonReviews([]);
      setAddonReviewSummary({ average: 0, count: 0 });
    });
  }, [standaloneOnly]);
  useEffect(() => {
    if (!user) return;
    api.get("/api/reviews/eligible").then(({ data }) => setReviewOption((data.options || []).find((option) => option.box && boxId && String(option.box._id) === String(boxId) || standaloneOnly && option.orderType === "standalone_addon" && option.products?.some((product) => String(product._id) === String(standaloneOnly))) || null)).catch(() => setReviewOption(null));
  }, [user, boxId, standaloneOnly]);
  const byCategory = useMemo(() => products.reduce((all, p) => {
    (all[p.category] ||= []).push(p);
    return all;
  }, {}), [products]);
  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p._id, p])), [products]);
  const box = boxes.find((item) => item._id === boxId);
  const definitions = box?.categoryDefinitions || [];
  const selectable = definitions.filter((d) => !d.includedAutomatically).sort((a, b) => categoryRank(a) - categoryRank(b));
  const addonDefinition = selectable.find((d) => String(d.key || d.name).toLowerCase().replace(/[^a-z]/g, "") === "addon");
  const regularSelectable = selectable.filter((d) => d !== addonDefinition);
  const addonProducts = addonDefinition ? byCategory[addonDefinition.key] || [] : [];
  const includedDefinitions = definitions.filter((d) => d.includedAutomatically);
  const includedProducts = includedDefinitions.flatMap((d) => byCategory[d.key] || []);
  useEffect(() => {
    if (status !== "ready") return;
    if (!box && boxes[0]) setBoxId((boxes.find((b) => b.mostPopular) || boxes[0])._id);
    if (!firstDeliveryDate && settings?.earliestBookableDate) setFirstDeliveryDate(new Date(settings.earliestBookableDate).toISOString().slice(0, 10));
  }, [status, box, boxes, settings, firstDeliveryDate]);
  useEffect(() => {
    if (!confirmation) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ boxId, picks, purchaseType, firstDeliveryDate, phone, address, cardMessage, gift }));
      } catch {
      }
    }
  }, [boxId, picks, purchaseType, firstDeliveryDate, phone, address, cardMessage, gift, confirmation]);
  useEffect(() => {
    try {
      localStorage.setItem("heribloom_cart", JSON.stringify(cart));
    } catch {
    }
  }, [cart]);
  useEffect(() => {
    setSelectedCartIds((current) => {
      if (!current.size && cart.length) return new Set(cart.map((item) => item.cartId));
      const valid = new Set(cart.map((item) => item.cartId));
      return new Set([...current].filter((id) => valid.has(id)));
    });
  }, [cart]);
  const selections = Object.entries(picks).flatMap(([category, ids]) => ids.map((productId) => ({ category, productId, quantity: 1 })));
  const extras = selections.reduce((total2, s) => total2 + (byId[s.productId]?.priceModifier || 0), 0);
  const discountPercent = purchaseType === "three_month" ? Number(settings?.discountPercent || 0) : 0;
  const discount = Math.round(((box?.price || 0) + extras) * discountPercent / 100);
  const count = purchaseType === "three_month" ? 3 : 1;
  const perBox = (box?.price || 0) + extras - discount;
  const total = perBox * count;
  const complete = selectable.every((d) => {
    const countSelected = (picks[d.key] || []).length;
    return countSelected >= Number(d.minSelections || 0) && (d.maxSelections == null || countSelected <= d.maxSelections);
  });
  const standaloneProduct = standaloneOnly ? byId[standaloneOnly] : null;
  const selectedProducts = selections.map((selection) => ({ ...selection, product: byId[selection.productId] })).filter((selection) => selection.product);
  const progressItems = [...regularSelectable, ...addonDefinition ? [addonDefinition] : []];
  const progressComplete = progressItems.filter((definition) => {
    const selectedCount = (picks[definition.key] || []).length;
    return selectedCount >= Number(definition.minSelections || 0);
  }).length;
  const handleChoiceSelection = (definitionKey, shouldScroll = true) => {
    const currentIndex = progressItems.findIndex((definition) => definition.key === definitionKey);
    if (currentIndex < 0) return;
    setActiveStepIndex(currentIndex);
    if (!shouldScroll) return;
    window.setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < progressItems.length) {
        sectionRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveStepIndex(nextIndex);
      } else {
        document.getElementById("delivery-details")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 450);
  };
  const openProductDrawer = (product, definition) => {
    setProductDrawer({ product, definition });
  };
  const drawerSelected = productDrawer ? (picks[productDrawer.definition.key] || []).filter((id) => id === productDrawer.product._id).length : 0;
  const updateDrawerQuantity = (nextQuantity) => {
    if (!productDrawer) return;
    const { product, definition } = productDrawer;
    const current = drawerSelected;
    const next = Math.max(0, Number(nextQuantity) || 0);
    const productLimit = definition.allowRepeat ? definition.maxSelections ?? product.inventory ?? 99 : 1;
    if (product.inventory != null && next > product.inventory) return toast.error(`Only ${product.inventory} available`);
    if (next > productLimit) return toast.error(`This choice can be selected ${productLimit === 1 ? "once" : `${productLimit} times`}`);
    setPicks((all) => {
      const existing = all[definition.key] || [];
      const withoutProduct = existing.filter((id) => id !== product._id);
      return { ...all, [definition.key]: [...withoutProduct, ...Array.from({ length: next }, () => product._id)] };
    });
  };
  const continueFromDrawer = () => {
    if (!productDrawer) return;
    if (drawerSelected === 0) {
      updateDrawerQuantity(1);
      return;
    }
    handleChoiceSelection(productDrawer.definition.key);
    setProductDrawer(null);
  };
  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const selectedCartItems = cart.filter((item) => selectedCartIds.has(item.cartId));
  const selectedCartCount = selectedCartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 1), 0);
  const selectedCartTotal = selectedCartItems.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 1), 0);
  const allCartSelected = cart.length > 0 && selectedCartItems.length === cart.length;
  const toggleCartItem = (cartId) => setSelectedCartIds((current) => { const next = new Set(current); if (next.has(cartId)) next.delete(cartId); else next.add(cartId); return next; });
  const toggleAllCartItems = () => setSelectedCartIds(allCartSelected ? new Set() : new Set(cart.map((item) => item.cartId)));
  const addBoxToCart = () => {
    if (!box || !complete) return toast.error("Complete your box selections before adding it to the cart");
    const boxPhoto = box.photos?.find((photo) => photo.active !== false) || null;
    const cartSelections = selections.map((selection) => ({ ...selection, productName: byId[selection.productId]?.name || "Selected item" }));
    const item = { itemType: "box", cartId: `box-${box._id}`, boxId: box._id, name: box.name, quantity: 1, unitPrice: Number(total || box.price || 0), purchaseType, selections: cartSelections, image: boxPhoto?.url || cardBox, imageAlt: boxPhoto?.alt || box.name };
    setCart((current) => [...current.filter((entry) => entry.itemType !== "box"), item]);
    setCartOpen(true);
    toast.success(`${box.name} added to your cart`);
  };
  const addStandaloneToCart = (product, quantity = 1) => {
    const requested = Math.max(1, Number(quantity) || 1);
    if (product.inventory != null && requested > product.inventory) return toast.error(`Only ${product.inventory} available`);
    setCart((current) => {
      const existing = current.find((entry) => entry.itemType === "addon" && entry.productId === product._id);
      if (existing) return current.map((entry) => entry === existing ? { ...entry, quantity: Math.min(product.inventory ?? 99, entry.quantity + requested) } : entry);
      const productPhoto = product.photos?.find((photo) => photo.active !== false) || null;
      return [...current, { itemType: "addon", cartId: `addon-${product._id}`, productId: product._id, name: product.name, quantity: requested, unitPrice: Number(product.standalonePrice || 0), image: productPhoto?.url || cardBox, imageAlt: productPhoto?.alt || product.name }];
    });
    setCartOpen(true);
    toast.success(`${product.name} added to your cart`);
  };
  const updateCartQuantity = (cartId, quantity) => setCart((current) => current.map((item) => item.cartId === cartId ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item));
  const removeCartItem = (cartId) => setCart((current) => current.filter((item) => item.cartId !== cartId));
  const submitCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: "/shop" } });
      return;
    }
    if (!selectedCartItems.length) return toast.error("Select at least one item to checkout");
    if (!phone.trim() || !address.street.trim() || !address.city.trim() || !firstDeliveryDate) return toast.error("Complete your delivery details first");
    setSubmitting(true);
    setPaymentNotice("");
    try {
      const { data: order } = await api.post("/api/orders/cart", { items: selectedCartItems, firstDeliveryDate, phone, deliveryAddress: address, gift, cardMessage, cancellationAccepted: accept, notificationPreferences });
      const { data: payment } = await api.post("/api/payments/initiate", { orderId: order._id });
      if (payment.checkoutUrl) {
        const remaining = cart.filter((item) => !selectedCartIds.has(item.cartId));
        setCart(remaining);
        localStorage.setItem("heribloom_cart", JSON.stringify(remaining));
        window.location.assign(payment.checkoutUrl);
        return;
      }
      throw new Error("Paystack did not provide a checkout link");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not start Paystack checkout");
      setSubmitting(false);
    }
  };
  const standaloneReady = standaloneProduct && phone.trim() && address.street.trim() && address.city.trim() && firstDeliveryDate;
  const ready = standaloneOnly ? standaloneReady : box && complete && phone.trim() && address.street.trim() && address.city.trim() && firstDeliveryDate && (!gift.isGift || gift.recipientName.trim() && gift.recipientPhone.trim()) && (purchaseType !== "three_month" || accept);
  const toggle = (definition, id) => setPicks((all) => {
    const selected = all[definition.key] || [];
    if (definition.maxSelections === 1) return { ...all, [definition.key]: selected[0] === id ? [] : [id] };
    if (selected.includes(id) && !definition.allowRepeat) return { ...all, [definition.key]: selected.filter((x) => x !== id) };
    if (definition.maxSelections != null && selected.length >= definition.maxSelections) return all;
    return { ...all, [definition.key]: [...selected, id] };
  });
  const repeat = (definition, id, delta) => setPicks((all) => {
    const selected = all[definition.key] || [];
    const product = byId[id];
    const available = product?.inventory;
    if (delta > 0 && available != null && selected.filter((item) => item === id).length >= available) return all;
    if (delta > 0 && definition.maxSelections != null && selected.length >= definition.maxSelections) return all;
    const next = delta > 0 ? [...selected, id] : selected.filter((x, index) => x !== id || selected.indexOf(id) !== index);
    return { ...all, [definition.key]: next };
  });
  const toggleRepeatChoice = (definition, id) => setPicks((all) => {
    const selected = all[definition.key] || [];
    if (selected.includes(id)) return { ...all, [definition.key]: selected.filter((item) => item !== id) };
    const product = byId[id];
    if (product?.inventory != null && product.inventory < 1) return all;
    if (definition.maxSelections != null && selected.length >= definition.maxSelections) return all;
    return { ...all, [definition.key]: [...selected, id] };
  });
  const openAddonModal = (product) => {
    setAddonModal(product);
    setAddonModalQuantity(1);
    setAddonModalImage(0);
    setAddonZoomPosition(null);
  };
  const openBoxModal = (selectedBox) => {
    setBoxModal(selectedBox);
    setBoxModalImage(0);
    setBoxZoomPosition(null);
  };
  const handleBoxImageMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setBoxZoomPosition({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
  };
  const addAddonToBox = (product, quantity = addonModalQuantity) => {
    if (!addonDefinition) return;
    const selected = picks[addonDefinition.key] || [];
    const currentCount = selected.filter((id) => id === product._id).length;
    const requested = Math.max(1, Number(quantity) || 1);
    if (product.inventory != null && currentCount + requested > product.inventory) return toast.error(`Only ${Math.max(0, product.inventory - currentCount)} available for this Add-on`);
    if (!addonDefinition.allowRepeat && currentCount > 0) return toast("This Add-on is already in your box");
    if (addonDefinition.maxSelections != null && selected.length + requested > addonDefinition.maxSelections) return toast.error("You have reached the Add-ons limit");
    setStandaloneOnly("");
    setPicks((all) => ({ ...all, [addonDefinition.key]: [...all[addonDefinition.key] || [], ...Array.from({ length: requested }, () => product._id)] }));
    setAddonModal(null);
    toast.success(`${product.name} \xD7${requested} added to your box`);
  };
  const submit = async () => {
    if (!user) {
      navigate("/login", { state: { from: "/shop" } });
      return;
    }
    if (!ready) {
      toast.error("Complete the checkout details first");
      return;
    }
    setSubmitting(true);
    setPaymentNotice("");
    try {
      const { data: order } = standaloneOnly ? await api.post("/api/orders/addon", { productId: standaloneOnly, quantity: standaloneQuantity, firstDeliveryDate, phone, deliveryAddress: address, notificationPreferences }) : await api.post("/api/orders", { boxId, purchaseType, selections, firstDeliveryDate, phone, deliveryAddress: address, gift, cardMessage, cancellationAccepted: accept, notificationPreferences });
      const { data: payment } = await api.post("/api/payments/initiate", { orderId: order._id });
      sessionStorage.removeItem(DRAFT_KEY);
      if (payment.checkoutUrl) {
        window.location.assign(payment.checkoutUrl);
        return;
      }
      throw new Error("Paystack did not provide a checkout link");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not start Paystack checkout");
      setSubmitting(false);
    }
  };
  const submitBoxReview = async (event) => {
    event.preventDefault();
    if (!reviewOption || reviewOption.orderType !== "standalone_addon" && !reviewOption.boxAvailable) return;
    try {
      await api.post("/api/reviews", { orderId: reviewOption.orderId, boxId: reviewOption.box?._id, productIds: reviewOption.orderType === "standalone_addon" ? [standaloneOnly] : [], rating: reviewRating, text: reviewText });
      toast.success("Review submitted");
      setReviewText("");
      const { data } = await api.get(reviewOption.orderType === "standalone_addon" ? `/api/reviews?productId=${standaloneOnly}` : `/api/reviews?boxId=${boxId}`);
      if (reviewOption.orderType === "standalone_addon") {
        setAddonReviews(data.reviews || []);
        setAddonReviewSummary(data.summary || { average: 0, count: 0 });
      } else {
        setBoxReviews(data.reviews || []);
        setReviewSummary(data.summary || { average: 0, count: 0 });
      }
      setReviewOption(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit review");
    }
  };
  const handleImageMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoomPosition({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
  };
  const handleAddonImageMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAddonZoomPosition({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
  };
  const reorder = async () => {
    try {
      const { data } = await api.get(`/api/orders/${confirmation._id}/reorder`);
      const next = data.selections.reduce((a, s) => {
        (a[s.category] ||= []).push(s.productId);
        return a;
      }, {});
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ boxId: data.boxId, picks: next, phone: data.phone, address: data.deliveryAddress, gift: data.gift, cardMessage: data.cardMessage }));
      navigate("/shop");
    } catch {
      toast.error("Could not load this order");
    }
  };
  if (status === "loading") return /* @__PURE__ */ React.createElement("div", { className: "hb min-h-screen bg-[#FBF7F2]" }, /* @__PURE__ */ React.createElement("style", null, STYLES), /* @__PURE__ */ React.createElement("p", { className: "py-32 text-center font-body font-light text-[#4B0D32]/70" }, /* @__PURE__ */ React.createElement(Heart, { size: 20, fill: "currentColor", className: "hb-float mx-auto mb-4 text-[#C2185B]" }), "Preparing your ritual..."));
  if (status === "error") return /* @__PURE__ */ React.createElement("div", { className: "hb min-h-screen bg-[#FBF7F2]" }, /* @__PURE__ */ React.createElement("style", null, STYLES), /* @__PURE__ */ React.createElement("p", { className: "py-32 text-center font-body font-light text-[#4B0D32]/70" }, "We could not load the shop right now. Please try again."));
  if (confirmation) {
    const paid = confirmation.paymentStatus === "paid";
    const failed = confirmation.paymentStatus === "failed";
    const stageLabel = { awaiting_payment: "Awaiting payment", confirmed: "Confirmed", preparing: "Preparing", out_for_delivery: "Out for delivery", delivered: "Delivered", active: "Active", problem: "Problem" };
    return /* @__PURE__ */ React.createElement("div", { className: "hb min-h-screen bg-gradient-to-b from-[#FBF7F2] to-[#F8E8ED]/60" }, /* @__PURE__ */ React.createElement("style", null, STYLES), /* @__PURE__ */ React.createElement("div", { className: "hb-rise max-w-2xl mx-auto px-6 py-16" }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement(Heart, { className: "hb-float text-[#C2185B] mx-auto mb-4", fill: "currentColor" }), /* @__PURE__ */ React.createElement("h1", { className: "font-display font-bold text-4xl text-[#4B0D32] mb-3" }, paid ? "Your order is confirmed" : failed ? "Payment was not completed" : "Your order is being verified"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70 mb-8" }, paid ? "Thank you. Your payment was received and your order is now confirmed." : failed ? "Nothing more will be charged. You can return to the shop and try again." : "Paystack is still confirming your payment. Please wait a moment before closing this page.")), /* @__PURE__ */ React.createElement("div", { className: "bg-[#FBF7F2] border border-[#4B0D32]/10 rounded-3xl shadow-[0_24px_60px_-34px_rgba(75,13,50,0.3)] p-6 text-left mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs tracking-[0.18em] text-[#C2185B]" }, "ORDER NUMBER"), /* @__PURE__ */ React.createElement("p", { className: "font-display text-2xl font-bold text-[#4B0D32] mt-1" }, confirmation.orderNumber || confirmation._id)), /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-[#F8E8ED] px-3 py-2 font-body text-xs font-semibold text-[#C2185B]" }, stageLabel[confirmation.status] || confirmation.paymentStatus)), /* @__PURE__ */ React.createElement("div", { className: "mt-5 grid sm:grid-cols-2 gap-3 border-t border-[#4B0D32]/10 pt-4 font-body text-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[#4B0D32]/70" }, "Box"), /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-[#4B0D32] mt-1" }, confirmation.boxName)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[#4B0D32]/70" }, "Total paid"), /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-[#C2185B] mt-1" }, formatKsh(confirmation.totalPrice))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[#4B0D32]/70" }, "Payment"), /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-[#4B0D32] mt-1" }, paid ? "Paystack \xB7 Paid" : confirmation.paymentStatus)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[#4B0D32]/70" }, "Payment reference"), /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-[#4B0D32] mt-1 break-all" }, confirmation.paymentReference || "\u2014")))), /* @__PURE__ */ React.createElement("div", { className: "bg-[#FBF7F2] border border-[#4B0D32]/10 rounded-3xl shadow-[0_24px_60px_-34px_rgba(75,13,50,0.3)] p-6 text-left mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "font-display text-2xl font-bold text-[#4B0D32]" }, "Delivery tracking"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70 mt-1" }, "Your delivery progress will update here as your order is prepared."), /* @__PURE__ */ React.createElement("div", { className: "mt-5 space-y-3" }, (confirmation.deliveries || []).map((delivery) => /* @__PURE__ */ React.createElement("div", { key: delivery._id || delivery.sequence, className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#4B0D32]/10 px-4 py-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm font-semibold text-[#4B0D32]" }, "Delivery ", delivery.sequence || 1), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-[#4B0D32]/70 mt-1" }, "Scheduled for ", delivery.scheduledDate ? new Date(delivery.scheduledDate).toLocaleDateString() : "To be scheduled")), /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-[#F8E8ED] px-3 py-1 font-body text-xs text-[#C2185B]" }, stageLabel[delivery.status] || delivery.status))))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-center gap-3" }, /* @__PURE__ */ React.createElement(Link, { to: "/orders", className: "bg-[#4B0D32] text-[#FBF7F2] rounded-full px-5 py-3 font-body text-sm transition hover:bg-[#C2185B]" }, "Open full order tracking"), /* @__PURE__ */ React.createElement("button", { onClick: reorder, className: "border border-[#C2185B] text-[#C2185B] rounded-full px-5 py-3 font-body text-sm transition hover:bg-[#C2185B] hover:text-[#FBF7F2]" }, "Reorder with same picks"), /* @__PURE__ */ React.createElement(Link, { to: "/", className: "border border-[#4B0D32]/10 text-[#4B0D32] rounded-full px-5 py-3 font-body text-sm" }, "Home"))));
  }
  let step = 0;
  const gallerySource = standaloneProduct?.photos?.filter((photo) => photo.active !== false) || box?.photos?.filter((photo) => photo.active !== false) || [];
  const galleryImages = gallerySource.length ? gallerySource.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((photo, index) => ({ id: standaloneProduct ? `product-${index}` : `photo-${index}`, src: photo.url, alt: photo.alt || `${standaloneProduct?.name || box?.name || "Heri Bloom"} photo` })) : [{ id: "card", src: cardBox, alt: `${box?.name || "Heri Bloom box"} product photo` }, { id: "hero", src: heroBox, alt: `${box?.name || "Heri Bloom box"} lifestyle photo` }];
  const activeGalleryImage = galleryImages.find((image) => image.id === selectedImage) || galleryImages[0];
  const currentReviews = standaloneProduct ? addonReviews : boxReviews;
  const currentReviewSummary = standaloneProduct ? addonReviewSummary : reviewSummary;
  const addonModalPhotos = addonModal?.photos?.filter((photo) => photo.active !== false) || [];
  const addonModalActivePhoto = addonModalPhotos[addonModalImage] || addonModalPhotos[0];
  const boxModalPhotos = boxModal?.photos?.filter((photo) => photo.active !== false) || [];
  const boxModalActivePhoto = boxModalPhotos[boxModalImage] || boxModalPhotos[0];
  const boxModalDisplayPhoto = boxModalActivePhoto || (boxModal ? { url: cardBox, alt: boxModal.name } : null);
  return /* @__PURE__ */ React.createElement("div", { className: "hb relative min-h-screen bg-gradient-to-b from-[#FBF7F2] via-[#F8E8ED]/40 to-[#FBF7F2]" }, /* @__PURE__ */ React.createElement("style", null, STYLES), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "pointer-events-none fixed inset-0 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#F8E8ED] opacity-80 blur-3xl" }), /* @__PURE__ */ React.createElement("div", { className: "absolute -left-28 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[#C2185B]/10 blur-3xl" })), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-32" }, /* @__PURE__ */ React.createElement("header", { className: "hb-rise mb-14 grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "mb-5 inline-flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.32em] text-[#C2185B]" }, /* @__PURE__ */ React.createElement(Sparkles, { size: 14 }), " The Heri Bloom ritual"), /* @__PURE__ */ React.createElement("h1", { className: "font-display text-4xl leading-[1.1] text-[#4B0D32] md:text-6xl" }, "Your ritual,", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("em", { className: "font-normal text-[#C2185B]" }, "your way")), /* @__PURE__ */ React.createElement("p", { className: "mt-5 max-w-md font-body text-[15px] font-light leading-7 text-[#4B0D32]/70" }, "Choose your box, personalize your essentials, then discover thoughtful Add-ons below. A little time set aside, entirely for you."), /* @__PURE__ */ React.createElement("ol", { className: "mt-8 flex flex-wrap gap-x-8 gap-y-3 font-body text-[11px] uppercase tracking-[0.22em] text-[#4B0D32]/70" }, ["Choose", "Personalize", "Receive"].map((label, index) => /* @__PURE__ */ React.createElement("li", { key: label, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-display text-lg normal-case tracking-normal text-[#C2185B]" }, "0", index + 1), label)))), /* @__PURE__ */ React.createElement("div", { className: "relative mx-auto w-full max-w-sm" }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "absolute -inset-6 rounded-[40px] bg-gradient-to-br from-[#F8E8ED] to-transparent blur-2xl" }), /* @__PURE__ */ React.createElement("img", { src: heroBox, alt: "Heri Bloom ritual box", className: "hb-float relative aspect-[4/5] w-full rounded-[32px] object-cover shadow-[0_40px_80px_-30px_rgba(75,13,50,0.45)]" }))), /* @__PURE__ */ React.createElement("nav", { "aria-label": "Customization progress", className: "hb-rise sticky top-3 z-30 mb-6 overflow-x-auto rounded-2xl border border-[#4B0D32]/10 bg-[#FBF7F2]/90 p-2 shadow-[0_18px_40px_-28px_rgba(75,13,50,0.45)] backdrop-blur-md" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-w-max items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "px-3 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C2185B]" }, progressComplete, "/", progressItems.length || 0, " complete"), progressItems.map((definition, index) => {
    const selectedCount = (picks[definition.key] || []).length;
    const completeStep = selectedCount >= Number(definition.minSelections || 0);
    return /* @__PURE__ */ React.createElement("a", { key: definition.key, href: `#step-${definition.key}`, onClick: () => setActiveStepIndex(index), className: `flex items-center gap-2 rounded-xl px-3 py-2 font-body text-xs transition ${completeStep ? "bg-[#4B0D32] text-[#FBF7F2]" : "text-[#4B0D32]/65 hover:bg-[#F8E8ED]"}` }, /* @__PURE__ */ React.createElement("span", { className: "font-display text-sm" }, String(index + 1).padStart(2, "0")), CATEGORY_LABELS[definition.key] || definition.name, completeStep && /* @__PURE__ */ React.createElement(Check, { size: 13 }));
  }))), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_440px] gap-8 items-start" }, /* @__PURE__ */ React.createElement("main", { className: "space-y-6" }, /* @__PURE__ */ React.createElement(Section, { id: "choose-box", n: ++step, title: "Choose your box", hint: "Start with the care level that feels right for you." }, /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 gap-4" }, boxes.map((b) => {
    const photo = b.photos?.filter((item) => item.active !== false).sort((a, z) => (a.sortOrder || 0) - (z.sortOrder || 0))[0];
    return /* @__PURE__ */ React.createElement("button", { key: b._id, type: "button", onClick: () => {
      setBoxId(b._id);
      setStandaloneOnly("");
      openBoxModal(b);
    }, className: `group text-left rounded-[28px] border overflow-hidden transition-all duration-500 hover:-translate-y-1.5 ${b._id === boxId && !standaloneOnly ? "border-[#C2185B] bg-[#F8E8ED] shadow-[0_28px_60px_-28px_rgba(194,24,91,0.45)]" : "border-[#4B0D32]/10 bg-[#FBF7F2] hover:border-[#C2185B]/50 hover:shadow-[0_28px_60px_-34px_rgba(75,13,50,0.4)]"}` }, /* @__PURE__ */ React.createElement("div", { className: "h-52 bg-white overflow-hidden" }, photo ? /* @__PURE__ */ React.createElement("img", { src: photo.url, alt: photo.alt || b.name, className: "w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" }) : /* @__PURE__ */ React.createElement("img", { src: cardBox, alt: b.name, className: "w-full h-full object-contain" })), /* @__PURE__ */ React.createElement("div", { className: "p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-display font-bold text-2xl text-[#4B0D32]" }, b.name), b.mostPopular && /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-[#4B0D32] text-[#FBF7F2] px-3 py-1 font-body text-[10px] tracking-wide" }, "MOST POPULAR")), /* @__PURE__ */ React.createElement("span", { className: "block font-body text-sm text-[#4B0D32]/70 mt-2" }, b.tagline), /* @__PURE__ */ React.createElement("span", { className: "block text-[#C2185B] font-body font-semibold text-lg mt-4" }, formatKsh(b.price), " ", /* @__PURE__ */ React.createElement("small", { className: "text-[#4B0D32]/70 font-normal" }, "/ box")), /* @__PURE__ */ React.createElement("span", { className: "inline-block mt-4 font-body text-xs text-[#C2185B]" }, "View photos and choose this box \u2192")));
  }))), /* @__PURE__ */ React.createElement(Section, { n: ++step, title: "Choose your plan" }, /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 gap-4" }, [["one_time", "One-time purchase", "One box, no commitment."], ["three_month", "Three-month plan", `${discountPercent}% off every box.`]].map(([key, title, text]) => /* @__PURE__ */ React.createElement("button", { type: "button", key, onClick: () => setPurchaseType(key), className: `text-left rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-0.5 ${purchaseType === key ? "border-[#C2185B] bg-[#F8E8ED] shadow-[0_18px_40px_-22px_rgba(194,24,91,0.4)]" : "border-[#4B0D32]/10 bg-[#FBF7F2] hover:border-[#C2185B]/50"}` }, /* @__PURE__ */ React.createElement("b", { className: "font-body text-[#4B0D32]" }, title), /* @__PURE__ */ React.createElement("span", { className: "block font-body text-sm text-[#4B0D32]/70 mt-2" }, text))))), includedDefinitions.length > 0 && /* @__PURE__ */ React.createElement("section", { id: "included-section", className: "hb-rise rounded-[28px] border border-[#C2185B]/20 bg-gradient-to-br from-[#F8E8ED] to-[#FBF7F2] p-6 md:p-9" }, /* @__PURE__ */ React.createElement("h2", { className: "font-display font-bold text-2xl text-[#4B0D32]" }, "Included in your box"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70 mt-1 mb-4" }, "These essentials are included automatically."), /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" }, includedProducts.map((product) => /* @__PURE__ */ React.createElement("div", { key: product._id, className: "rounded-xl border border-[#C2185B]/20 bg-[#FBF7F2] px-4 py-3" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]" }, product.name), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-[#4B0D32]/70 mt-1" }, "Included automatically"))))), regularSelectable.map((d, definitionIndex) => {
    const selected = picks[d.key] || [];
    const list = byCategory[d.key] || [];
    const isRepeat = d.allowRepeat && d.maxSelections !== 1;
    return /* @__PURE__ */ React.createElement(Section, { id: `step-${d.key}`, key: d.key, n: ++step, sectionRef: (element) => {
      sectionRefs.current[definitionIndex] = element;
    }, isActive: activeStepIndex === definitionIndex, title: CATEGORY_LABELS[d.key] || d.name, hint: d.optionalExtra ? "Optional paid extra." : `Choose ${d.minSelections === d.maxSelections ? d.minSelections : `${d.minSelections}\u2013${d.maxSelections ?? "any"}`}.` }, /* @__PURE__ */ React.createElement("div", { className: "grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))]" }, list.map((p) => isRepeat ? /* @__PURE__ */ React.createElement("div", { key: p._id }, /* @__PURE__ */ React.createElement(Choice, { onImageClick: setProductLightbox, product: p, selected: selected.includes(p._id), disabled: p.inventory != null && selected.filter((id) => id === p._id).length >= p.inventory && !selected.includes(p._id), onClick: () => openProductDrawer(p, d) }), selected.includes(p._id) && /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center gap-3 mt-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => repeat(d, p._id, -1) }, /* @__PURE__ */ React.createElement(Minus, { size: 15 })), /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm" }, selected.filter((id) => id === p._id).length), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: p.inventory != null && selected.filter((id) => id === p._id).length >= p.inventory, onClick: () => repeat(d, p._id, 1) }, /* @__PURE__ */ React.createElement(Plus, { size: 15 })))) : /* @__PURE__ */ React.createElement(Choice, { key: p._id, product: p, selected: selected.includes(p._id), onClick: () => openProductDrawer(p, d) }))), list.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70" }, "No in-stock options available."));
  }), addonDefinition && /* @__PURE__ */ React.createElement(LuxuryStepWrapper, { isActive: activeStepIndex === regularSelectable.length }, /* @__PURE__ */ React.createElement("section", { ref: (element) => {
    sectionRefs.current[regularSelectable.length] = element;
  }, id: `step-${addonDefinition.key}`, className: "hb-rise rounded-[28px] border border-[#4B0D32]/10 bg-[#FBF7F2]/80 p-6 shadow-[0_24px_60px_-34px_rgba(75,13,50,0.3)] backdrop-blur-sm md:p-9" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-end justify-between gap-4 mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs tracking-[0.2em] text-[#C2185B] mb-2" }, "PERSONALIZE FURTHER"), /* @__PURE__ */ React.createElement("h2", { className: "font-display font-bold text-3xl text-[#4B0D32]" }, "Add-ons"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70 mt-1" }, "Click an item to view photos, details, and add it without leaving your order.")), /* @__PURE__ */ React.createElement(ShoppingBag, { className: "text-[#C2185B]" })), /* @__PURE__ */ React.createElement("div", { className: "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]" }, addonProducts.map((product) => {
    const selectedCount = (picks[addonDefinition.key] || []).filter((id) => id === product._id).length;
    const photo = product.photos?.find((item) => item.active !== false);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key: product._id, onClick: () => openAddonModal(product), className: `group text-left rounded-3xl border overflow-hidden bg-[#FBF7F2] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(75,13,50,0.4)] ${selectedCount ? "border-[#C2185B] bg-[#F8E8ED]" : "border-[#4B0D32]/10"}` }, /* @__PURE__ */ React.createElement("div", { className: "h-36 bg-white overflow-hidden p-1.5" }, photo ? /* @__PURE__ */ React.createElement("img", { src: photo.url, alt: photo.alt || product.name, className: "w-full h-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-110" }) : /* @__PURE__ */ React.createElement("div", { className: "h-full flex items-center justify-center font-body text-xs text-[#4B0D32]/70" }, "Add-on image coming soon")), /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-body font-semibold text-[#4B0D32]" }, product.name), selectedCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-[#4B0D32] text-[#FBF7F2] px-2 py-1 text-[10px]" }, selectedCount, " added")), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-[#4B0D32]/70 mt-2" }, formatKsh(product.standalonePrice ?? product.priceModifier), product.standalonePrice != null ? " standalone" : " add-on")));
  })), !addonProducts.length && /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70" }, "No Add-ons are currently available."))), /* @__PURE__ */ React.createElement(Section, { id: "delivery-details", n: ++step, title: "Delivery details" }, /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("input", { className: `${inputClass} sm:col-span-2`, required: true, placeholder: "Phone number *", value: phone, onChange: (e) => setPhone(e.target.value) }), /* @__PURE__ */ React.createElement("input", { className: `${inputClass} sm:col-span-2`, required: true, placeholder: "Street and building *", value: address.street, onChange: (e) => setAddress({ ...address, street: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { className: inputClass, required: true, placeholder: "City or town *", value: address.city, onChange: (e) => setAddress({ ...address, city: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { className: inputClass, placeholder: "County", value: address.county, onChange: (e) => setAddress({ ...address, county: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { className: `${inputClass} sm:col-span-2`, type: "date", min: settings?.earliestBookableDate ? new Date(settings.earliestBookableDate).toISOString().slice(0, 10) : void 0, value: firstDeliveryDate, onChange: (e) => setFirstDeliveryDate(e.target.value) }), /* @__PURE__ */ React.createElement("textarea", { className: `${inputClass} sm:col-span-2`, placeholder: "Delivery notes for the courier", value: address.deliveryNotes, onChange: (e) => setAddress({ ...address, deliveryNotes: e.target.value }) }), /* @__PURE__ */ React.createElement("div", { className: "sm:col-span-2 rounded-xl border border-[#C2185B]/20 bg-[#F8E8ED] p-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm font-semibold text-[#4B0D32]" }, "How should we send updates?"), /* @__PURE__ */ React.createElement("label", { className: "mt-3 flex items-center gap-2 font-body text-xs text-[#4B0D32]" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: notificationPreferences.email, onChange: (e) => setNotificationPreferences((current) => ({ ...current, email: e.target.checked })), className: "accent-[#C2185B]" }), " Email updates"), /* @__PURE__ */ React.createElement("label", { className: "mt-2 flex items-center gap-2 font-body text-xs text-[#4B0D32]" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: notificationPreferences.whatsapp, onChange: (e) => setNotificationPreferences((current) => ({ ...current, whatsapp: e.target.checked })), className: "accent-[#C2185B]" }), " Optional WhatsApp updates")))), /* @__PURE__ */ React.createElement(Section, { n: ++step, title: "Card message and gift" }, /* @__PURE__ */ React.createElement("textarea", { className: `${inputClass} min-h-[80px]`, maxLength: 240, placeholder: "Short message on a card (optional)", value: cardMessage, onChange: (e) => setCardMessage(e.target.value) }), /* @__PURE__ */ React.createElement("label", { className: "flex gap-2 items-center font-body text-sm text-[#4B0D32] mt-4" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: gift.isGift, onChange: (e) => setGift({ ...gift, isGift: e.target.checked }) }), " This is a gift"), gift.isGift && /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 gap-3 mt-3" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, required: true, placeholder: "Recipient name *", value: gift.recipientName, onChange: (e) => setGift({ ...gift, recipientName: e.target.value }) }), /* @__PURE__ */ React.createElement("input", { className: inputClass, required: true, placeholder: "Recipient phone *", value: gift.recipientPhone, onChange: (e) => setGift({ ...gift, recipientPhone: e.target.value }) }))), purchaseType === "three_month" && /* @__PURE__ */ React.createElement(Section, { n: ++step, title: "Three-month plan terms" }, /* @__PURE__ */ React.createElement("label", { className: "flex gap-3 font-body text-sm text-[#4B0D32]" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: accept, onChange: (e) => setAccept(e.target.checked) }), " I understand that cancellation is only allowed inside the change window; unshipped boxes are refunded and delivered boxes are repriced at the normal one-time price."))), /* @__PURE__ */ React.createElement("aside", { className: "lg:sticky lg:top-24 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "hb-rise rounded-[28px] border border-[#4B0D32]/10 bg-[#FBF7F2]/90 p-4 shadow-[0_30px_70px_-34px_rgba(75,13,50,0.4)] backdrop-blur-sm md:p-5" }, /* @__PURE__ */ React.createElement("div", { className: "mb-5 rounded-2xl border border-[#C2185B]/20 bg-gradient-to-br from-[#F8E8ED] to-white p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C2185B]" }, "YOUR BESPOKE VANITY"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-display text-xl text-[#4B0D32]" }, "Building your ritual")), /* @__PURE__ */ React.createElement(ShoppingBag, { size: 20, className: "text-[#C2185B]" })), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex min-h-20 flex-wrap content-start gap-2 rounded-xl border border-dashed border-[#C2185B]/30 bg-white/70 p-3" }, selectedProducts.length ? selectedProducts.map(({ product, category }, index) => /* @__PURE__ */ React.createElement("span", { key: `${product._id}-${index}`, className: "hb-pop rounded-full bg-[#4B0D32] px-3 py-1.5 font-body text-[10px] text-[#FBF7F2]" }, product.name)) : /* @__PURE__ */ React.createElement("span", { className: "font-body text-xs text-[#4B0D32]/55" }, "Your selected essentials will appear here.")), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex items-center justify-between font-body text-xs text-[#4B0D32]/65" }, /* @__PURE__ */ React.createElement("span", null, selectedProducts.length, " selected"), /* @__PURE__ */ React.createElement("span", null, progressComplete, "/", progressItems.length || 0, " steps ready"))), /* @__PURE__ */ React.createElement("div", { className: "relative group rounded-xl overflow-hidden bg-[#F8E8ED] mb-3 cursor-zoom-in", onMouseMove: handleImageMove, onMouseLeave: () => setZoomPosition(null) }, /* @__PURE__ */ React.createElement("img", { src: activeGalleryImage.src, alt: activeGalleryImage.alt, className: "block w-full aspect-[4/3] object-contain" }), zoomPosition && /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "absolute inset-0 pointer-events-none transition-opacity duration-150", style: { backgroundImage: `url(${activeGalleryImage.src})`, backgroundRepeat: "no-repeat", backgroundSize: "250% 250%", backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%` } })), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mb-5" }, galleryImages.map((image) => /* @__PURE__ */ React.createElement("button", { type: "button", key: image.id, onClick: () => setSelectedImage(image.id), className: `w-14 h-14 rounded-lg overflow-hidden border-2 ${selectedImage === image.id ? "border-[#C2185B]" : "border-transparent"}` }, /* @__PURE__ */ React.createElement("img", { src: image.src, alt: "", className: "w-full h-full object-cover" })))), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs tracking-[0.2em] text-[#C2185B]" }, "LIVE ORDER SUMMARY"), /* @__PURE__ */ React.createElement("h2", { className: "font-display font-bold text-2xl text-[#4B0D32] mt-1" }, standaloneProduct ? standaloneProduct.name : box?.name || "Choose a box"), !standaloneProduct && box?.description && /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm leading-6 text-[#4B0D32]/70 mt-3" }, box.description), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between font-body text-sm mt-4" }, /* @__PURE__ */ React.createElement("span", null, standaloneProduct ? "Standalone Add-on" : `${purchaseType === "three_month" ? "Three-month plan" : "One-time purchase"}`), /* @__PURE__ */ React.createElement("span", null, formatKsh(standaloneProduct ? standaloneProduct.standalonePrice * standaloneQuantity : box?.price))), !standaloneProduct && extras > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between font-body text-sm text-[#4B0D32]/70 mt-2" }, /* @__PURE__ */ React.createElement("span", null, "Paid extras"), /* @__PURE__ */ React.createElement("span", null, formatKsh(extras))), !standaloneProduct && purchaseType === "three_month" && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between font-body text-sm text-[#C2185B] border-t border-[#4B0D32]/10 pt-3 mt-3" }, /* @__PURE__ */ React.createElement("span", null, "Discount (", discountPercent, "%)"), /* @__PURE__ */ React.createElement("span", null, "-", formatKsh(discount))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between border-t border-[#4B0D32]/10 pt-4 mt-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm text-[#4B0D32]/70" }, standaloneProduct ? `${standaloneQuantity} item${standaloneQuantity === 1 ? "" : "s"}` : `${count} box total`), /* @__PURE__ */ React.createElement("b", { className: "font-display text-2xl text-[#C2185B]" }, formatKsh(standaloneProduct ? standaloneProduct.standalonePrice * standaloneQuantity : total))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 border-t border-[#4B0D32]/10 pt-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[10px] tracking-[0.2em] text-[#C2185B]" }, "SECURE PAYMENT"), /* @__PURE__ */ React.createElement("h3", { className: "font-display text-xl text-[#4B0D32] mt-1" }, "Pay securely with Paystack"), /* @__PURE__ */ React.createElement("div", { className: "mt-3 rounded-xl border border-[#C2185B]/20 bg-[#F8E8ED] p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(CreditCard, { size: 20, className: "text-[#C2185B]" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm font-semibold text-[#4B0D32]" }, "Card, mobile money or bank transfer"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-body text-xs leading-5 text-[#4B0D32]/70" }, "You will be redirected to Paystack\u2019s secure test checkout."))))), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: addBoxToCart, disabled: !box || !complete, className: "w-full mt-5 border border-[#C2185B] text-[#C2185B] rounded-full py-3 font-body text-sm disabled:cursor-not-allowed disabled:opacity-40" }, "Add completed box to cart ", /* @__PURE__ */ React.createElement(ShoppingBag, { size: 15, className: "inline ml-1" })), /* @__PURE__ */ React.createElement("button", { onClick: submit, disabled: !ready || submitting, className: "w-full mt-3 bg-[#4B0D32] text-[#FBF7F2] rounded-full py-3.5 font-body text-sm tracking-wide transition hover:-translate-y-0.5 hover:bg-[#C2185B] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#C2185B]" }, submitting ? "Opening Paystack checkout..." : user ? "Continue to payment" : "Log in to check out", /* @__PURE__ */ React.createElement(ArrowRight, { size: 16, className: "inline ml-2" }))), /* @__PURE__ */ React.createElement("section", { className: "bg-[#FBF7F2]/90 border border-[#4B0D32]/10 rounded-3xl p-6 shadow-[0_16px_40px_-28px_rgba(75,13,50,0.3)]" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-bold text-xl text-[#4B0D32]" }, "Reviews for ", standaloneProduct?.name || box?.name || "this box"), currentReviewSummary.count > 0 && /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm text-[#C2185B]" }, currentReviewSummary.average, "/5 (", currentReviewSummary.count, ")")), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 mt-4" }, currentReviews.slice(0, 3).map((review) => /* @__PURE__ */ React.createElement("article", { key: review._id, className: "rounded-xl border border-[#4B0D32]/10 p-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-body text-xs font-semibold text-[#4B0D32]" }, review.user?.name || "Verified customer"), /* @__PURE__ */ React.createElement("span", { className: "text-[#C2185B] text-xs" }, "\u2605".repeat(review.rating), "\u2606".repeat(5 - review.rating))), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-[#4B0D32]/70 mt-2" }, review.text), /* @__PURE__ */ React.createElement("span", { className: "inline-block mt-2 rounded-full bg-[#F8E8ED] text-[#C2185B] px-2 py-1 font-body text-[10px]" }, "Verified buyer"))), !currentReviews.length && /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-[#4B0D32]/70 mt-3" }, "No reviews for this ", standaloneProduct ? "add-on" : "box", " yet.")), user && (reviewOption?.boxAvailable || reviewOption?.orderType === "standalone_addon") && /* @__PURE__ */ React.createElement("form", { onSubmit: submitBoxReview, className: "mt-5 border-t border-[#4B0D32]/10 pt-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs font-semibold text-[#4B0D32] mb-2" }, "You received this item \u2014 share your review"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 mb-3" }, [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ React.createElement("button", { type: "button", key: star, onClick: () => setReviewRating(star), className: `text-lg ${star <= reviewRating ? "text-[#C2185B]" : "text-[#4B0D32]/20"}` }, "\u2605"))), /* @__PURE__ */ React.createElement("textarea", { required: true, maxLength: 1e3, value: reviewText, onChange: (event) => setReviewText(event.target.value), placeholder: `Tell us about this ${standaloneProduct ? "add-on" : "box"}`, className: `${inputClass} min-h-[80px]` }), /* @__PURE__ */ React.createElement("button", { className: "mt-3 bg-[#4B0D32] text-[#FBF7F2] rounded-full px-4 py-2 font-body text-xs" }, "Submit review"))), /* @__PURE__ */ React.createElement("section", { className: "bg-[#FBF7F2]/90 border border-[#4B0D32]/10 rounded-3xl p-5 shadow-[0_16px_40px_-28px_rgba(75,13,50,0.3)]" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[10px] tracking-[0.2em] text-[#C2185B] mb-3" }, "CUSTOMER CARE"), [["shipping", "Shipping & delivery", settings?.legal?.shipping], ["returns", "Returns, refunds & cancellations", settings?.legal?.returns]].map(([key, title, policy]) => /* @__PURE__ */ React.createElement("div", { key, className: "border-t border-[#4B0D32]/10 first:border-t-0" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setOpenPolicy((current) => current === key ? "" : key), className: "flex w-full items-center justify-between gap-3 py-3 text-left font-body text-sm font-semibold text-[#4B0D32]" }, /* @__PURE__ */ React.createElement("span", null, title), /* @__PURE__ */ React.createElement(ChevronDown, { size: 16, className: `shrink-0 transition-transform ${openPolicy === key ? "rotate-180 text-[#C2185B]" : "text-[#4B0D32]/70"}` })), openPolicy === key && /* @__PURE__ */ React.createElement("div", { className: "pb-3" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs leading-6 text-[#4B0D32]/70" }, policy?.summary), /* @__PURE__ */ React.createElement("p", { className: "mt-2 whitespace-pre-line font-body text-xs leading-6 text-[#4B0D32]/70" }, policy?.body), /* @__PURE__ */ React.createElement(Link, { to: `/policies/${key}`, className: "mt-2 inline-flex font-body text-xs font-semibold text-[#C2185B] hover:text-[#4B0D32]" }, "Read full policy ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 13, className: "ml-1" }))))))))), /* @__PURE__ */ React.createElement("div", { className: "hb-checkout-dock fixed inset-x-0 bottom-0 z-40 border-t border-[#4B0D32]/10 bg-[#FBF7F2]/95 px-4 py-3 shadow-[0_-18px_40px_-28px_rgba(75,13,50,0.55)] backdrop-blur-md", style: { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1e3, width: "100%" }, role: "region", "aria-label": "Checkout summary" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C2185B]" }, "READY WHEN YOU ARE"), /* @__PURE__ */ React.createElement("div", { className: "mt-1 flex items-baseline gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "truncate font-body text-xs text-[#4B0D32]/65" }, cart.length ? `${cartCount} cart item${cartCount === 1 ? "" : "s"}` : standaloneProduct ? `${standaloneQuantity} item${standaloneQuantity === 1 ? "" : "s"}` : `${selectedProducts.length} selected \xB7 ${count} box${count === 1 ? "" : "es"}`, " "), /* @__PURE__ */ React.createElement("span", { className: "font-display text-lg font-bold text-[#4B0D32]" }, formatKsh(cart.length ? cartTotal : standaloneProduct ? standaloneProduct.standalonePrice * standaloneQuantity : total)))), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: cart.length ? submitCart : submit, disabled: !ready || submitting, className: "shrink-0 rounded-full bg-[#4B0D32] px-5 py-3 font-body text-xs font-semibold text-[#FBF7F2] transition hover:bg-[#C2185B] disabled:cursor-not-allowed disabled:opacity-40 sm:px-7 sm:text-sm" }, submitting ? "Opening checkout\u2026" : cart.length ? user ? "Checkout cart" : "Log in to check out" : user ? "Continue to payment" : "Log in to check out", /* @__PURE__ */ React.createElement(ArrowRight, { size: 15, className: "ml-1 inline" })))), cartOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[52] bg-[#4B0D32]/35 backdrop-blur-sm", role: "dialog", "aria-modal": "true", "aria-label": "Shopping cart", onClick: () => setCartOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#FBF7F2] shadow-2xl", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-[#4B0D32]/10 px-6 py-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C2185B]" }, "YOUR CART"), /* @__PURE__ */ React.createElement("h2", { className: "mt-1 font-display text-2xl text-[#4B0D32]" }, "Your ritual, gathered")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setCartOpen(false), className: "rounded-full p-2 text-[#4B0D32] hover:bg-[#F8E8ED]", "aria-label": "Close cart" }, /* @__PURE__ */ React.createElement(X, { size: 21 }))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-6" }, cart.length ? /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, cart.map((item) => /* @__PURE__ */ React.createElement("article", { key: item.cartId, className: `rounded-2xl border p-4 ${selectedCartIds.has(item.cartId) ? "border-[#C2185B] bg-[#F8E8ED]/60" : "border-[#4B0D32]/10 bg-white/60"}` }, /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex items-center gap-3" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: selectedCartIds.has(item.cartId), onChange: () => toggleCartItem(item.cartId), className: "h-4 w-4 accent-[#C2185B]", "aria-label": `Select ${item.name} for checkout` }), /* @__PURE__ */ React.createElement("span", { className: "font-body text-[10px] uppercase tracking-[0.15em] text-[#C2185B]" }, item.itemType === "box" ? "Ritual box" : "Add-on")), /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("img", { src: item.image || cardBox, alt: item.imageAlt || item.name, className: "h-14 w-14 rounded-xl bg-white object-contain" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm font-semibold text-[#4B0D32]" }, item.name), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-body text-xs text-[#4B0D32]/60" }, item.itemType === "box" ? `${item.purchaseType === "three_month" ? "Three-month plan" : "One-time box"}` : "Standalone add-on"), item.itemType === "box" && item.selections?.length ? /* @__PURE__ */ React.createElement("details", { className: "mt-2" }, /* @__PURE__ */ React.createElement("summary", { className: "cursor-pointer font-body text-[11px] font-semibold text-[#C2185B]" }, `View contents (${item.selections.length})`), /* @__PURE__ */ React.createElement("ul", { className: "mt-2 space-y-1 font-body text-[11px] text-[#4B0D32]/70" }, item.selections.map((selection, index) => /* @__PURE__ */ React.createElement("li", { key: `${selection.productId || selection.product || selection.productName}-${index}` }, `${selection.category}: ${selection.productName || "Selected item"}${selection.quantity > 1 ? ` ×${selection.quantity}` : ""}`)))) : null))), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => removeCartItem(item.cartId), className: "text-[#4B0D32]/50 hover:text-[#C2185B]", "aria-label": `Remove ${item.name}` }, /* @__PURE__ */ React.createElement(X, { size: 15 }))), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", disabled: item.itemType === "box", onClick: () => updateCartQuantity(item.cartId, item.quantity - 1), className: "flex h-7 w-7 items-center justify-center rounded-full border border-[#4B0D32]/15 text-[#4B0D32] disabled:opacity-35" }, /* @__PURE__ */ React.createElement(Minus, { size: 13 })), /* @__PURE__ */ React.createElement("span", { className: "min-w-5 text-center font-body text-sm text-[#4B0D32]" }, item.quantity), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: item.itemType === "box", onClick: () => updateCartQuantity(item.cartId, item.quantity + 1), className: "flex h-7 w-7 items-center justify-center rounded-full border border-[#C2185B] text-[#C2185B] disabled:opacity-35" }, /* @__PURE__ */ React.createElement(Plus, { size: 13 }))), /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm font-semibold text-[#C2185B]" }, formatKsh(item.unitPrice * item.quantity)))))) : /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-dashed border-[#C2185B]/30 bg-[#F8E8ED] p-6 text-center" }, /* @__PURE__ */ React.createElement(ShoppingBag, { size: 24, className: "mx-auto text-[#C2185B]" }), /* @__PURE__ */ React.createElement("p", { className: "mt-3 font-display text-xl text-[#4B0D32]" }, "Your cart is waiting"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-body text-xs leading-5 text-[#4B0D32]/65" }, "Add your ritual box or a thoughtful add-on to begin."))), /* @__PURE__ */ React.createElement("div", { className: "border-t border-[#4B0D32]/10 p-6" }, /* @__PURE__ */ React.createElement("label", { className: "mb-4 flex items-center gap-2 font-body text-xs text-[#4B0D32]" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: allCartSelected, onChange: toggleAllCartItems, className: "h-4 w-4 accent-[#C2185B]" }), allCartSelected ? "Deselect all" : "Select all"), /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm text-[#4B0D32]/70" }, `${selectedCartCount} selected · Selected total`), /* @__PURE__ */ React.createElement("strong", { className: "font-display text-2xl text-[#C2185B]" }, formatKsh(selectedCartTotal))), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: submitCart, disabled: !selectedCartItems.length || submitting, className: "w-full rounded-full bg-[#4B0D32] py-3.5 font-body text-sm text-[#FBF7F2] transition hover:bg-[#C2185B] disabled:cursor-not-allowed disabled:opacity-40" }, submitting ? "Opening Paystack checkout..." : selectedCartItems.length ? "Checkout selected items" : "Select items to checkout", " ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 16, className: "ml-1 inline" }))))), productDrawer && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[55] bg-[#4B0D32]/35 backdrop-blur-sm", role: "dialog", "aria-modal": "true", "aria-label": `${productDrawer.product.name} details`, onClick: () => setProductDrawer(null) }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#FBF7F2] shadow-2xl", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-[#4B0D32]/10 px-6 py-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C2185B]" }, "PERSONALIZE YOUR BOX"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-display text-2xl text-[#4B0D32]" }, productDrawer.product.name)), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setProductDrawer(null), className: "rounded-full p-2 text-[#4B0D32] hover:bg-[#F8E8ED]", "aria-label": "Close product details" }, /* @__PURE__ */ React.createElement(X, { size: 21 }))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-white" }, productDrawer.product.photos?.[0] ? /* @__PURE__ */ React.createElement("img", { src: productDrawer.product.photos[0].url, alt: productDrawer.product.photos[0].alt || productDrawer.product.name, className: "h-full w-full object-contain" }) : /* @__PURE__ */ React.createElement("div", { className: "font-body text-sm text-[#4B0D32]/55" }, "Product image coming soon")), /* @__PURE__ */ React.createElement("p", { className: "mt-6 font-body text-sm leading-7 text-[#4B0D32]/75" }, "A considered choice for your Heri Bloom ritual. Select the quantity that feels right, then continue building your box."), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex items-center justify-between rounded-2xl border border-[#C2185B]/20 bg-white/70 p-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm font-semibold text-[#4B0D32]" }, "Quantity"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-body text-xs text-[#4B0D32]/55" }, productDrawer.definition.maxSelections === 1 ? "Choose one" : `Up to ${productDrawer.definition.allowRepeat ? productDrawer.definition.maxSelections ?? "your limit" : 1}`)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => updateDrawerQuantity(drawerSelected - 1), disabled: drawerSelected === 0, className: "flex h-9 w-9 items-center justify-center rounded-full border border-[#4B0D32]/15 text-[#4B0D32] disabled:opacity-35", "aria-label": "Decrease quantity" }, /* @__PURE__ */ React.createElement(Minus, { size: 15 })), /* @__PURE__ */ React.createElement("span", { className: "min-w-6 text-center font-body font-semibold text-[#4B0D32]" }, drawerSelected), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => updateDrawerQuantity(drawerSelected + 1), disabled: productDrawer.product.inventory != null && drawerSelected >= productDrawer.product.inventory, className: "flex h-9 w-9 items-center justify-center rounded-full border border-[#C2185B] text-[#C2185B] disabled:opacity-35", "aria-label": "Increase quantity" }, /* @__PURE__ */ React.createElement(Plus, { size: 15 })))), /* @__PURE__ */ React.createElement("div", { className: "mt-5 flex items-center justify-between font-body text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-[#4B0D32]/65" }, "Price adjustment"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-[#C2185B]" }, productDrawer.product.priceModifier > 0 ? `+ ${formatKsh(productDrawer.product.priceModifier)}` : "Included"))), /* @__PURE__ */ React.createElement("div", { className: "border-t border-[#4B0D32]/10 p-6" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: continueFromDrawer, className: "w-full rounded-full bg-[#4B0D32] py-3.5 font-body text-sm text-[#FBF7F2] transition hover:bg-[#C2185B]" }, drawerSelected === 0 ? "Add selection to my box" : "Continue building my box", " ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 16, className: "ml-2 inline" })), complete && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    addBoxToCart();
    setProductDrawer(null);
  }, className: "mt-3 w-full rounded-full border border-[#C2185B] py-3 font-body text-sm text-[#C2185B] transition hover:bg-[#F8E8ED]" }, "Add completed box to cart ", /* @__PURE__ */ React.createElement(ShoppingBag, { size: 15, className: "ml-1 inline" })), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setProductDrawer(null), className: "mt-3 w-full rounded-full border border-[#4B0D32]/15 py-3 font-body text-xs text-[#4B0D32]/70 transition hover:border-[#C2185B] hover:text-[#C2185B]" }, "Keep browsing")))), boxModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-[#4B0D32]/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6", role: "dialog", "aria-modal": "true", "aria-label": `${boxModal.name} details`, onClick: () => setBoxModal(null) }, /* @__PURE__ */ React.createElement("div", { className: "hb-pop w-full sm:max-w-2xl max-h-[94vh] overflow-y-auto bg-[#FBF7F2] rounded-t-3xl sm:rounded-3xl border border-white/70 shadow-2xl", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-6 pt-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs tracking-[0.2em] text-[#C2185B]" }, "BOX DETAILS"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-[#4B0D32]/70 mt-1" }, "Click the image to view it larger")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setBoxModal(null), className: "rounded-full p-2 text-[#4B0D32] hover:bg-white/70", "aria-label": "Close box details" }, /* @__PURE__ */ React.createElement(X, { size: 21 }))), /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("div", { className: "relative group rounded-2xl overflow-hidden bg-white border border-white/80 cursor-zoom-in", onMouseMove: handleBoxImageMove, onMouseLeave: () => setBoxZoomPosition(null), onClick: () => boxModalDisplayPhoto && setBoxLightbox(boxModalDisplayPhoto), onKeyDown: (event) => {
    if ((event.key === "Enter" || event.key === " ") && boxModalDisplayPhoto) {
      event.preventDefault();
      setBoxLightbox(boxModalDisplayPhoto);
    }
  }, role: boxModalDisplayPhoto ? "button" : void 0, tabIndex: boxModalDisplayPhoto ? 0 : void 0 }, /* @__PURE__ */ React.createElement("img", { src: boxModalDisplayPhoto.url, alt: boxModalDisplayPhoto.alt || boxModal.name, className: "block w-full h-72 sm:h-[25rem] object-contain" }), boxZoomPosition && boxModalDisplayPhoto && /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "absolute inset-0 pointer-events-none", style: { backgroundImage: `url(${boxModalDisplayPhoto.url})`, backgroundRepeat: "no-repeat", backgroundSize: "250% 250%", backgroundPosition: `${boxZoomPosition.x}% ${boxZoomPosition.y}%` } }), boxModalDisplayPhoto && /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-3 right-3 rounded-full bg-[#4B0D32]/60 text-[#FBF7F2] px-3 py-1 font-body text-[10px]" }, "Click to enlarge")), boxModalPhotos.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 mt-4 overflow-x-auto pb-1" }, boxModalPhotos.map((photo, index) => /* @__PURE__ */ React.createElement("button", { type: "button", key: `${photo.url}-${index}`, onClick: () => {
    setBoxModalImage(index);
    setBoxZoomPosition(null);
  }, className: `shrink-0 w-20 h-16 rounded-xl overflow-hidden bg-white border-2 ${boxModalImage === index ? "border-[#C2185B]" : "border-[#4B0D32]/10"}` }, /* @__PURE__ */ React.createElement("img", { src: photo.url, alt: photo.alt || boxModal.name, className: "w-full h-full object-contain" })))), /* @__PURE__ */ React.createElement("h2", { className: "font-display font-bold text-3xl text-[#4B0D32] mt-6" }, boxModal.name), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70 mt-2" }, boxModal.tagline || "A thoughtful care box designed around your needs."), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm leading-6 text-[#4B0D32] mt-4" }, boxModal.description || "A thoughtful care box designed around your needs, with carefully selected essentials for your routine."), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mt-5" }, /* @__PURE__ */ React.createElement("span", { className: "font-body text-[#C2185B] font-semibold" }, formatKsh(boxModal.price), " ", /* @__PURE__ */ React.createElement("span", { className: "text-[#4B0D32]/70 font-normal" }, "/ box")), /* @__PURE__ */ React.createElement("span", { className: "font-body text-xs text-[#4B0D32]/70" }, "Photos can be enlarged")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    setBoxId(boxModal._id);
    setBoxModal(null);
    setTimeout(() => document.getElementById("included-section")?.scrollIntoView({ behavior: "smooth", block: "start" }) || document.getElementById("pads-selection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, className: "w-full mt-6 bg-[#4B0D32] text-[#FBF7F2] rounded-full py-3 font-body" }, "Make your selection ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 16, className: "inline ml-2" }))))), productLightbox && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[60] bg-[#4B0D32]/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-10", role: "dialog", "aria-modal": "true", "aria-label": `Enlarged ${productLightbox.alt || "product"} image`, onClick: () => setProductLightbox(null) }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setProductLightbox(null), className: "absolute top-5 right-5 rounded-full bg-white/90 text-[#4B0D32] p-3 shadow-lg", "aria-label": "Close enlarged product image" }, /* @__PURE__ */ React.createElement(X, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl max-h-full", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("img", { src: productLightbox.url, alt: productLightbox.alt || "Product", className: "max-h-[88vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl" }))), boxLightbox && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[60] bg-[#4B0D32]/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-10", role: "dialog", "aria-modal": "true", "aria-label": "Enlarged box image", onClick: () => setBoxLightbox(null) }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setBoxLightbox(null), className: "absolute top-5 right-5 rounded-full bg-white/90 text-[#4B0D32] p-3 shadow-lg", "aria-label": "Close enlarged box image" }, /* @__PURE__ */ React.createElement(X, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl max-h-full", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("img", { src: boxLightbox.url, alt: boxLightbox.alt || boxModal?.name || "Box", className: "max-h-[88vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl" }))), addonModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-[#4B0D32]/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6", role: "dialog", "aria-modal": "true", "aria-label": `${addonModal.name} details`, onClick: () => setAddonModal(null) }, /* @__PURE__ */ React.createElement("div", { className: "hb-pop w-full sm:max-w-2xl max-h-[94vh] overflow-y-auto bg-[#FBF7F2] rounded-t-3xl sm:rounded-3xl border border-white/70 shadow-2xl", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-6 pt-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs tracking-[0.2em] text-[#C2185B]" }, "ADD-ON DETAILS"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-[#4B0D32]/70 mt-1" }, "Click the image to view it larger")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setAddonModal(null), className: "rounded-full p-2 text-[#4B0D32] hover:bg-white/70", "aria-label": "Close Add-on details" }, /* @__PURE__ */ React.createElement(X, { size: 21 }))), /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("div", { className: "relative group rounded-2xl overflow-hidden bg-[#F8E8ED] border border-white/80 cursor-zoom-in", onMouseMove: handleAddonImageMove, onMouseLeave: () => setAddonZoomPosition(null), onClick: () => addonModalActivePhoto && setAddonLightbox(addonModalActivePhoto) }, addonModalActivePhoto ? /* @__PURE__ */ React.createElement("img", { src: addonModalActivePhoto.url, alt: addonModalActivePhoto.alt || addonModal.name, className: "block w-full h-72 sm:h-[25rem] object-contain transition-transform duration-300" }) : /* @__PURE__ */ React.createElement("div", { className: "h-72 sm:h-[25rem] flex items-center justify-center font-body text-sm text-[#4B0D32]/70" }, "Add-on image coming soon"), addonZoomPosition && addonModalActivePhoto && /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "absolute inset-0 pointer-events-none", style: { backgroundImage: `url(${addonModalActivePhoto.url})`, backgroundRepeat: "no-repeat", backgroundSize: "250% 250%", backgroundPosition: `${addonZoomPosition.x}% ${addonZoomPosition.y}%` } }), " ", addonModalActivePhoto && /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-3 right-3 rounded-full bg-[#4B0D32]/60 text-[#FBF7F2] px-3 py-1 font-body text-[10px]" }, "Click to enlarge")), addonModalPhotos.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 mt-4 overflow-x-auto pb-1" }, addonModalPhotos.map((photo, index) => /* @__PURE__ */ React.createElement("button", { type: "button", key: `${photo.url}-${index}`, onClick: () => {
    setAddonModalImage(index);
    setAddonZoomPosition(null);
  }, className: `shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 ${addonModalImage === index ? "border-[#C2185B]" : "border-transparent"}` }, /* @__PURE__ */ React.createElement("img", { src: photo.url, alt: photo.alt || addonModal.name, className: "w-full h-full object-cover" })))), /* @__PURE__ */ React.createElement("h2", { className: "font-display font-bold text-3xl text-[#4B0D32] mt-6" }, addonModal.name), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-[#4B0D32]/70 mt-2" }, "A thoughtful extra for your ritual box or a useful item to purchase on its own."), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-4 mt-5 rounded-xl border border-[#C2185B]/20 bg-white/70 px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm text-[#4B0D32]" }, "Quantity"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", disabled: addonModalQuantity <= 1, onClick: () => setAddonModalQuantity((quantity) => Math.max(1, quantity - 1)), className: "w-8 h-8 rounded-full border border-[#4B0D32]/10 text-[#4B0D32] disabled:opacity-40", "aria-label": "Decrease Add-on quantity" }, /* @__PURE__ */ React.createElement(Minus, { size: 14, className: "mx-auto" })), /* @__PURE__ */ React.createElement("span", { className: "min-w-6 text-center font-body font-semibold text-[#4B0D32]" }, addonModalQuantity), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: addonModal.inventory != null && addonModalQuantity >= addonModal.inventory, onClick: () => setAddonModalQuantity((quantity) => quantity + 1), className: "w-8 h-8 rounded-full border border-[#C2185B] text-[#C2185B] disabled:opacity-40", "aria-label": "Increase Add-on quantity" }, /* @__PURE__ */ React.createElement(Plus, { size: 14, className: "mx-auto" })))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3 mt-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-body text-[#C2185B] font-semibold" }, formatKsh(addonModal.priceModifier), " added to box"), /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm text-[#4B0D32]/70" }, addonModal.inventory == null ? "In stock" : `${addonModal.inventory} available`)), /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 gap-3 mt-6" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => addAddonToBox(addonModal), className: "bg-[#4B0D32] text-[#FBF7F2] rounded-full py-3 font-body text-sm" }, "Add to my box ", /* @__PURE__ */ React.createElement(Plus, { size: 16, className: "inline ml-1" })), addonModal.standalonePrice != null && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    addStandaloneToCart(addonModal, addonModalQuantity);
    setAddonModal(null);
  }, className: "border border-[#C2185B] text-[#C2185B] rounded-full py-3 font-body text-sm" }, "Add to cart \xB7 ", formatKsh(addonModal.standalonePrice)), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    setStandaloneQuantity(addonModalQuantity);
    setStandaloneOnly(addonModal._id);
    setPicks({});
    setAddonModal(null);
  }, className: "border border-[#4B0D32]/15 text-[#4B0D32] rounded-full py-3 font-body text-sm" }, "Buy this only")))))), addonLightbox && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[60] bg-[#4B0D32]/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-10", role: "dialog", "aria-modal": "true", "aria-label": "Enlarged Add-on image", onClick: () => setAddonLightbox(null) }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setAddonLightbox(null), className: "absolute top-5 right-5 rounded-full bg-white/90 text-[#4B0D32] p-3 shadow-lg", "aria-label": "Close enlarged image" }, /* @__PURE__ */ React.createElement(X, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl max-h-full", onClick: (event) => event.stopPropagation() }, /* @__PURE__ */ React.createElement("img", { src: addonLightbox.url, alt: addonLightbox.alt || addonModal?.name || "Add-on", className: "max-h-[88vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl" }))));
}
