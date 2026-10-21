import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Archive, Check, Package, Settings, Tags, Store } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const inputClass = "w-full rounded-xl border border-hairline bg-cream px-3 py-2.5 font-body text-sm text-ink focus:outline-none focus:border-brand";
const formatKsh = (value) => `KSh ${Number(value || 0).toLocaleString()}`;

function Panel({ title, icon: Icon, children }) {
  return <section className="bg-cream border border-hairline rounded-2xl p-6"><div className="flex items-center gap-3 mb-5"><Icon size={20} className="text-brand" /><h2 className="font-display font-bold text-2xl text-ink">{title}</h2></div>{children}</section>;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [boxCategorySelections, setBoxCategorySelections] = useState({});
  const [newProduct, setNewProduct] = useState({ name: "", category: "", priceModifier: 0 });
  const [newCategory, setNewCategory] = useState({ key: "", name: "", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productsResponse, boxesResponse, categoriesResponse, settingsResponse] = await Promise.all([
      api.get("/api/products/admin"), api.get("/api/boxes/admin"), api.get("/api/catalog/categories"), api.get("/api/catalog/settings"),
    ]);
    setProducts(productsResponse.data); setBoxes(boxesResponse.data); setCategories(categoriesResponse.data); setSettings(settingsResponse.data);
    setBoxCategorySelections(Object.fromEntries(boxesResponse.data.map((box) => [box._id, box.categoryIds?.length ? box.categoryIds : categoriesResponse.data.filter((category) => box.categories?.includes(category.key)).map((category) => category._id)])));
    setNewProduct((current) => ({ ...current, category: current.category || categoriesResponse.data[0]?.key || "" }));
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/login", { replace: true, state: { from: "/admin" } });
  }, [loading, user, navigate]);

  useEffect(() => { if (user?.role === "admin") load().catch((error) => toast.error(error.response?.data?.message || "Could not load admin data")); }, [user]);

  const updateProduct = async (product, changes) => {
    try { const { data } = await api.put(`/api/products/${product._id}`, changes); setProducts((all) => all.map((item) => item._id === data._id ? data : item)); toast.success(`${data.name} updated`); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update product"); }
  };

  const addProduct = async (event) => {
    event.preventDefault(); setSaving(true);
    try { const { data } = await api.post("/api/products", { ...newProduct, priceModifier: Number(newProduct.priceModifier) }); setProducts((all) => [...all, data]); setNewProduct({ name: "", category: categories[0]?.key || "", priceModifier: 0 }); toast.success("Product added"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not add product"); }
    finally { setSaving(false); }
  };

  const archive = async (product) => {
    if (!window.confirm(`Archive ${product.name}? It will disappear from the shop but remain in past orders.`)) return;
    try { const { data } = await api.delete(`/api/products/${product._id}`); setProducts((all) => all.map((item) => item._id === product._id ? data.product : item)); toast.success("Product archived"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not archive product"); }
  };

  const addCategory = async (event) => {
    event.preventDefault(); setSaving(true);
    try { const { data } = await api.post("/api/catalog/categories", { ...newCategory, minSelections: Number(newCategory.minSelections), maxSelections: newCategory.maxSelections === "" ? null : Number(newCategory.maxSelections) }); setCategories((all) => [...all, data]); setNewCategory({ key: "", name: "", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false }); toast.success("Category added"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not add category"); }
    finally { setSaving(false); }
  };

  const saveSettings = async (event) => {
    event.preventDefault(); setSaving(true);
    try { const { data } = await api.put("/api/catalog/settings", { ...settings, discountPercent: Number(settings.discountPercent), maxBoxesPerDay: Number(settings.maxBoxesPerDay), changeWindowDays: Number(settings.changeWindowDays), cutoffHour: Number(settings.cutoffHour), noDeliveryWeekdays: settings.noDeliveryWeekdays }); setSettings(data); toast.success("Checkout settings saved"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not save settings"); }
    finally { setSaving(false); }
  };

  const updateBox = async (box, changes) => {
    try { const { data } = await api.put(`/api/boxes/${box._id}`, changes); setBoxes((all) => all.map((item) => item._id === data._id ? { ...item, ...data } : item)); toast.success(`${data.name} updated`); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update box"); }
  };

  if (loading || !user || user.role !== "admin") return <p className="font-body text-ink-soft text-center py-32">Checking admin access...</p>;

  return <div className="max-w-6xl mx-auto px-6 py-12"><div className="flex flex-wrap items-end justify-between gap-4 mb-10"><div><p className="font-body text-xs font-medium tracking-[0.2em] text-brand mb-2">ADMIN DASHBOARD</p><h1 className="font-display font-bold text-4xl text-ink">Manage Heri Bloom</h1><p className="font-body text-sm text-ink-soft mt-2">Welcome, {user.name}. Changes here update what customers see in the shop.</p></div><button type="button" onClick={() => navigate("/")} className="font-body text-sm text-brand hover:text-brand-dark">Back to storefront</button></div>
    <div className="space-y-6">
      <Panel title="Products and stock" icon={Package}><p className="font-body text-sm text-ink-soft mb-5">Set a product back to <strong>in stock</strong> when your vendor has replenished it. Archive products instead of deleting them so historical orders remain readable.</p><form onSubmit={addProduct} className="grid md:grid-cols-[1.4fr_1fr_0.7fr_auto] gap-3 mb-7"><input className={inputClass} required placeholder="New product name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} /><select className={inputClass} required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}><option value="">Choose category</option>{categories.map((category) => <option key={category._id} value={category.key}>{category.name}</option>)}</select><input className={inputClass} type="number" min="0" placeholder="Extra KSh" value={newProduct.priceModifier} onChange={(e) => setNewProduct({ ...newProduct, priceModifier: e.target.value })} /><button disabled={saving} className="bg-brand text-cream rounded-xl px-5 font-body text-sm">Add product</button></form><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-hairline font-body text-xs text-ink-soft"><th className="py-3 pr-3">Product</th><th className="py-3 pr-3">Category</th><th className="py-3 pr-3">Price extra</th><th className="py-3 pr-3">Stock</th><th className="py-3">Action</th></tr></thead><tbody>{products.map((product) => <tr key={product._id} className="border-b border-hairline/60 font-body text-sm"><td className="py-3 pr-3 text-ink">{product.name}{product.archived && <span className="ml-2 text-xs text-ink-soft">Archived</span>}</td><td className="py-3 pr-3 text-ink-soft">{product.category}</td><td className="py-3 pr-3 text-ink-soft">{formatKsh(product.priceModifier)}</td><td className="py-3 pr-3"><button type="button" disabled={product.archived} onClick={() => updateProduct(product, { inStock: !product.inStock, active: true })} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${product.inStock && !product.archived ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{product.inStock && !product.archived && <Check size={12} />}{product.archived ? "Archived" : product.inStock ? "In stock" : "Out of stock"}</button></td><td className="py-3"><div className="flex gap-3">{!product.archived && <button type="button" onClick={() => archive(product)} className="inline-flex items-center gap-1 text-xs text-brand"><Archive size={13} /> Archive</button>}{product.archived && <button type="button" onClick={() => updateProduct(product, { archived: false, active: true, inStock: true })} className="text-xs text-brand">Restore</button>}</div></td></tr>)}</tbody></table></div></Panel>
      <Panel title="Categories" icon={Tags}><p className="font-body text-sm text-ink-soft mb-5">Create categories such as Bath bombs or Essential oils without changing code. Assigning a category to a box is available through the box API and can be added to this screen next.</p><form onSubmit={addCategory} className="grid md:grid-cols-[1fr_1fr_0.6fr_0.6fr_auto] gap-3 mb-6"><input className={inputClass} required placeholder="Key, e.g. bath-bombs" value={newCategory.key} onChange={(e) => setNewCategory({ ...newCategory, key: e.target.value })} /><input className={inputClass} required placeholder="Customer-facing name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} /><input className={inputClass} type="number" min="0" placeholder="Pick min" value={newCategory.minSelections} onChange={(e) => setNewCategory({ ...newCategory, minSelections: e.target.value })} /><input className={inputClass} type="number" min="0" placeholder="Pick max" value={newCategory.maxSelections} onChange={(e) => setNewCategory({ ...newCategory, maxSelections: e.target.value })} /><button disabled={saving} className="bg-brand text-cream rounded-xl px-5 font-body text-sm">Add</button></form><div className="grid md:grid-cols-3 gap-3">{categories.map((category) => <div key={category._id} className="rounded-xl border border-hairline p-4"><p className="font-body font-semibold text-ink">{category.name}</p><p className="font-body text-xs text-ink-soft mt-1">{category.key} · pick {category.minSelections}–{category.maxSelections ?? "any"}</p><p className="font-body text-xs text-ink-soft mt-1">{category.optionalExtra ? "Optional paid extra" : "Included category"}{category.allowRepeat ? " · repeats allowed" : ""}</p></div>)}</div></Panel>
      <Panel title="Boxes" icon={Store}><p className="font-body text-sm text-ink-soft mb-5">Choose which database categories each box offers. This is where you would enable Bath bombs for Premium only, for example.</p><div className="grid md:grid-cols-2 gap-4">{boxes.map((box) => <div key={box._id} className="rounded-xl border border-hairline p-4"><div className="flex justify-between gap-4"><div><p className="font-display font-bold text-xl text-ink">{box.name}</p><p className="font-body text-sm text-brand">{formatKsh(box.price)}</p></div><button type="button" onClick={() => updateBox(box, { active: !box.active })} className={`h-fit rounded-full px-3 py-1 text-xs ${box.active ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{box.active ? "Active" : "Archived"}</button></div><div className="grid grid-cols-2 gap-2 mt-4">{categories.map((category) => { const selected = boxCategorySelections[box._id] || []; return <label key={category._id} className="flex items-center gap-2 font-body text-xs text-ink"><input type="checkbox" checked={selected.includes(category._id)} onChange={(event) => setBoxCategorySelections((all) => ({ ...all, [box._id]: event.target.checked ? [...selected, category._id] : selected.filter((id) => id !== category._id) }))} className="accent-brand" />{category.name}</label>; })}</div><button type="button" onClick={() => updateBox(box, { categoryIds: boxCategorySelections[box._id] || [] })} className="mt-4 bg-brand text-cream rounded-xl px-4 py-2 font-body text-xs">Save categories</button></div>)}</div></Panel>
      {settings && <Panel title="Checkout and delivery settings" icon={Settings}><form onSubmit={saveSettings} className="grid md:grid-cols-2 gap-4"><label className="font-body text-sm text-ink">Three-month discount %<input className={`${inputClass} mt-1`} type="number" min="0" max="100" value={settings.discountPercent} onChange={(e) => setSettings({ ...settings, discountPercent: e.target.value })} /></label><label className="font-body text-sm text-ink">Maximum boxes per day<input className={`${inputClass} mt-1`} type="number" min="1" value={settings.maxBoxesPerDay} onChange={(e) => setSettings({ ...settings, maxBoxesPerDay: e.target.value })} /></label><label className="font-body text-sm text-ink">Earliest bookable date<input className={`${inputClass} mt-1`} type="date" value={new Date(settings.earliestBookableDate).toISOString().slice(0, 10)} onChange={(e) => setSettings({ ...settings, earliestBookableDate: e.target.value })} /></label><label className="font-body text-sm text-ink">Change window in days<input className={`${inputClass} mt-1`} type="number" min="0" value={settings.changeWindowDays} onChange={(e) => setSettings({ ...settings, changeWindowDays: e.target.value })} /></label><label className="font-body text-sm text-ink">Cutoff hour, 0–23<input className={`${inputClass} mt-1`} type="number" min="0" max="23" value={settings.cutoffHour} onChange={(e) => setSettings({ ...settings, cutoffHour: e.target.value })} /></label><label className="flex items-center gap-2 font-body text-sm text-ink mt-7"><input type="checkbox" checked={settings.discountAppliesToAddons} onChange={(e) => setSettings({ ...settings, discountAppliesToAddons: e.target.checked })} className="accent-brand" /> Discount applies to add-ons</label><button disabled={saving} className="md:col-span-2 bg-brand text-cream rounded-xl py-3 font-body text-sm">Save checkout settings</button></form></Panel>}
    </div>
  </div>;
}

