import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Archive, Check, Package, Plus, Settings, Tags, Store } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const inputClass = "w-full rounded-xl border border-hairline bg-cream px-3 py-2.5 font-body text-sm text-ink focus:outline-none focus:border-brand";
const formatKsh = (value) => `KSh ${Number(value || 0).toLocaleString()}`;
const emptyBox = { name: "", tagline: "", description: "", price: "", mostPopular: false, active: true };

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
  const [newProduct, setNewProduct] = useState({ name: "", category: "", priceModifier: 0, standalonePrice: "", inventory: "", hasOptions: true });
  const [newCategory, setNewCategory] = useState({ key: "", name: "", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, hasOptions: true });
  const [boxForm, setBoxForm] = useState(emptyBox);
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productsResponse, boxesResponse, categoriesResponse, settingsResponse] = await Promise.all([
      api.get("/api/products/admin"), api.get("/api/boxes/admin"), api.get("/api/catalog/categories"), api.get("/api/catalog/settings"),
    ]);
    const loadedCategories = categoriesResponse.data;
    setProducts(productsResponse.data);
    setBoxes(boxesResponse.data);
    setCategories(loadedCategories);
    setSettings(settingsResponse.data);
    setBoxCategorySelections(Object.fromEntries(boxesResponse.data.map((box) => [
      box._id,
      box.categoryIds?.length ? box.categoryIds : loadedCategories.filter((category) => box.categories?.includes(category.key)).map((category) => category._id),
    ])));
    setNewProduct((current) => ({ ...current, category: current.category || loadedCategories[0]?.key || "" }));
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/login", { replace: true, state: { from: "/admin" } });
  }, [loading, user, navigate]);
  useEffect(() => { if (user?.role === "admin") load().catch((error) => toast.error(error.response?.data?.message || "Could not load admin data")); }, [user]);

  const updateProduct = async (product, changes) => {
    try { const { data } = await api.put(`/api/products/${product._id}`, changes); setProducts((all) => all.map((item) => item._id === data._id ? data : item)); toast.success(`${data.name} updated`); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update product"); }
  };

  const editProduct = async (product) => {
    const name = window.prompt("Product name", product.name);
    if (!name?.trim()) return;
    const priceModifier = window.prompt("Price modifier in KSh", product.priceModifier);
    if (priceModifier === null) return;
    const inventory = window.prompt("Inventory quantity (leave blank for unlimited)", product.inventory ?? "");
    if (inventory === null) return;
    const standalonePrice = window.prompt("Standalone price in KSh (leave blank if not sold separately)", product.standalonePrice ?? "");
    if (standalonePrice === null) return;
    const hasOptions = window.confirm("Should customers choose from options for this product? Click Cancel for a standalone product.");
    await updateProduct(product, { name: name.trim(), priceModifier: Number(priceModifier), standalonePrice: standalonePrice === "" ? null : Number(standalonePrice), inventory: inventory === "" ? null : Number(inventory), hasOptions });
  };

  const addProduct = async (event) => {
    event.preventDefault(); setSaving(true);
    try { const { data } = await api.post("/api/products", { ...newProduct, priceModifier: Number(newProduct.priceModifier), standalonePrice: newProduct.standalonePrice === "" ? null : Number(newProduct.standalonePrice), inventory: newProduct.inventory === "" ? null : Number(newProduct.inventory) }); setProducts((all) => [...all, data]); setNewProduct({ name: "", category: categories[0]?.key || "", priceModifier: 0, standalonePrice: "", inventory: "", hasOptions: true }); toast.success("Product added"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not add product"); }
    finally { setSaving(false); }
  };

  const archiveProduct = async (product) => {
    if (!window.confirm(`Archive ${product.name}? It will disappear from the shop but remain in past orders.`)) return;
    try { const { data } = await api.delete(`/api/products/${product._id}`); setProducts((all) => all.map((item) => item._id === product._id ? data.product : item)); toast.success("Product archived"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not archive product"); }
  };

  const saveBox = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const payload = { ...boxForm, price: Number(boxForm.price) };
      const response = editingBoxId ? await api.put(`/api/boxes/${editingBoxId}`, payload) : await api.post("/api/boxes", payload);
      if (editingBoxId) setBoxes((all) => all.map((box) => box._id === response.data._id ? { ...box, ...response.data } : box));
      else setBoxes((all) => [...all, response.data]);
      setBoxForm(emptyBox); setEditingBoxId(null); toast.success(editingBoxId ? "Box updated" : "Box added");
    } catch (error) { toast.error(error.response?.data?.message || "Could not save box"); }
    finally { setSaving(false); }
  };

  const editBox = (box) => { setEditingBoxId(box._id); setBoxForm({ name: box.name, tagline: box.tagline || "", description: box.description || "", price: box.price, mostPopular: box.mostPopular, active: box.active }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const updateBox = async (box, changes) => {
    try { const { data } = await api.put(`/api/boxes/${box._id}`, changes); setBoxes((all) => all.map((item) => item._id === data._id ? { ...item, ...data } : item)); toast.success(`${data.name} updated`); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update box"); }
  };

  const addBoxPhoto = async (box) => {
    const url = window.prompt("Photo URL", "");
    if (!url?.trim()) return;
    const alt = window.prompt("Photo description", `${box.name} photo`) || `${box.name} photo`;
    await updateBox(box, { photos: [...(box.photos || []), { url: url.trim(), alt, sortOrder: (box.photos || []).length, active: true }] });
  };
  const uploadBoxPhoto = async (box, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file");
    if (file.size > 8 * 1024 * 1024) return toast.error("Image must be 8 MB or smaller");
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("alt", `${box.name} photo`);
    try {
      const { data } = await api.post(`/api/boxes/${box._id}/photos`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setBoxes((all) => all.map((item) => item._id === data._id ? data : item));
      toast.success("Box photo uploaded");
    } catch (error) { toast.error(error.response?.data?.message || "Could not upload photo"); }
  };
  const editBoxPhoto = async (box, index) => {
    const photo = box.photos[index];
    const url = window.prompt("Photo URL", photo.url);
    if (!url?.trim()) return;
    const alt = window.prompt("Photo description", photo.alt || `${box.name} photo`) || `${box.name} photo`;
    await updateBox(box, { photos: box.photos.map((item, itemIndex) => itemIndex === index ? { ...item, url: url.trim(), alt } : item) });
  };
  const removeBoxPhoto = async (box, index) => {
    if (!window.confirm("Remove this box photo?")) return;
    await updateBox(box, { photos: box.photos.filter((_, itemIndex) => itemIndex !== index).map((item, sortOrder) => ({ ...item, sortOrder })) });
  };

  const addProductPhoto = async (product) => {
    const url = window.prompt("Photo URL", "");
    if (!url?.trim()) return;
    const alt = window.prompt("Photo description", `${product.name} photo`) || `${product.name} photo`;
    const isAddon = String(product.category || "").toLowerCase().replace(/[^a-z]/g, "") === "addon";
    await updateProduct(product, { photos: isAddon ? [...(product.photos || []), { url: url.trim(), alt, sortOrder: (product.photos || []).length, active: true }] : [{ url: url.trim(), alt, sortOrder: 0, active: true }] });
  };
  const uploadProductPhoto = async (product, event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file");
    if (file.size > 8 * 1024 * 1024) return toast.error("Image must be 8 MB or smaller");
    const formData = new FormData(); formData.append("photo", file); formData.append("alt", `${product.name} photo`);
    try { const { data } = await api.post(`/api/products/${product._id}/photos`, formData, { headers: { "Content-Type": "multipart/form-data" } }); setProducts((all) => all.map((item) => item._id === data._id ? data : item)); toast.success("Product photo uploaded"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not upload product photo"); }
  };
  const editProductPhoto = async (product, index) => {
    const photo = product.photos[index]; const url = window.prompt("Photo URL", photo.url); if (!url?.trim()) return;
    const alt = window.prompt("Photo description", photo.alt || `${product.name} photo`) || `${product.name} photo`;
    await updateProduct(product, { photos: product.photos.map((item, itemIndex) => itemIndex === index ? { ...item, url: url.trim(), alt } : item) });
  };
  const removeProductPhoto = async (product, index) => {
    if (!window.confirm("Remove this product photo?")) return;
    await updateProduct(product, { photos: product.photos.filter((_, itemIndex) => itemIndex !== index).map((item, sortOrder) => ({ ...item, sortOrder })) });
  };

  const saveCategory = async (event) => {
    event.preventDefault(); setSaving(true);
    const payload = { ...newCategory, minSelections: Number(newCategory.minSelections), maxSelections: newCategory.maxSelections === "" ? null : Number(newCategory.maxSelections) };
    try {
      const response = editingCategoryId ? await api.put(`/api/catalog/categories/${editingCategoryId}`, payload) : await api.post("/api/catalog/categories", payload);
      setCategories((all) => editingCategoryId ? all.map((item) => item._id === response.data._id ? response.data : item) : [...all, response.data]);
      setNewCategory({ key: "", name: "", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, hasOptions: true, includedAutomatically: false });
      setEditingCategoryId(null); toast.success(editingCategoryId ? "Category updated" : "Category added");
    } catch (error) { toast.error(error.response?.data?.message || "Could not save category"); }
    finally { setSaving(false); }
  };

  const editCategory = (category) => { setEditingCategoryId(category._id); setNewCategory({ key: category.key, name: category.name, minSelections: category.minSelections, maxSelections: category.maxSelections ?? "", allowRepeat: category.allowRepeat, optionalExtra: category.optionalExtra, hasOptions: category.hasOptions, includedAutomatically: category.includedAutomatically }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const saveSettings = async (event) => {
    event.preventDefault(); setSaving(true);
    try { const { data } = await api.put("/api/catalog/settings", { ...settings, discountPercent: Number(settings.discountPercent), maxBoxesPerDay: Number(settings.maxBoxesPerDay), changeWindowDays: Number(settings.changeWindowDays), cutoffHour: Number(settings.cutoffHour) }); setSettings(data); toast.success("Checkout settings saved"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not save settings"); }
    finally { setSaving(false); }
  };

  if (loading || !user || user.role !== "admin") return <p className="font-body text-ink-soft text-center py-32">Checking admin access...</p>;

  return <div className="max-w-6xl mx-auto px-6 py-12"><div className="flex flex-wrap items-end justify-between gap-4 mb-10"><div><p className="font-body text-xs font-medium tracking-[0.2em] text-brand mb-2">ADMIN DASHBOARD</p><h1 className="font-display font-bold text-4xl text-ink">Manage Heri Bloom</h1><p className="font-body text-sm text-ink-soft mt-2">Welcome, {user.name}. Changes here update what customers see in the shop.</p></div><button type="button" onClick={() => navigate("/")} className="font-body text-sm text-brand">Back to storefront</button></div>
    <div className="space-y-6">
      <Panel title="Boxes" icon={Store}><form onSubmit={saveBox} className="grid md:grid-cols-[1.2fr_1.4fr_0.7fr_auto] gap-3 mb-6"><input className={inputClass} required placeholder="Box name" value={boxForm.name} onChange={(e) => setBoxForm({ ...boxForm, name: e.target.value })} /><input className={inputClass} placeholder="Tagline" value={boxForm.tagline} onChange={(e) => setBoxForm({ ...boxForm, tagline: e.target.value })} /><input className={inputClass} required type="number" min="0" placeholder="Price KSh" value={boxForm.price} onChange={(e) => setBoxForm({ ...boxForm, price: e.target.value })} /><button disabled={saving} className="inline-flex items-center justify-center gap-1 bg-brand text-cream rounded-xl px-5 font-body text-sm"><Plus size={15} />{editingBoxId ? "Save box" : "Add box"}</button><textarea className={`${inputClass} md:col-span-3 min-h-24 resize-y`} maxLength="1200" placeholder="Detailed box description (shown in the shop and order summary)" value={boxForm.description} onChange={(e) => setBoxForm({ ...boxForm, description: e.target.value })} /><span className="font-body text-xs text-ink-soft self-end">{boxForm.description.length}/1200 characters</span></form>{editingBoxId && <button type="button" onClick={() => { setEditingBoxId(null); setBoxForm(emptyBox); }} className="font-body text-xs text-brand mb-5">Cancel editing</button>}<p className="font-body text-sm text-ink-soft mb-5">Add, edit, archive, and decide which categories each box offers. Archived boxes remain in historical orders.</p><div className="grid md:grid-cols-2 gap-4">{boxes.map((box) => <div key={box._id} className="rounded-xl border border-hairline p-4"><div className="flex justify-between gap-4"><div><p className="font-display font-bold text-xl text-ink">{box.name}</p><p className="font-body text-sm text-brand">{formatKsh(box.price)}</p></div><div className="flex items-start gap-2"><button type="button" onClick={() => editBox(box)} className="text-xs text-brand">Edit</button><button type="button" onClick={() => updateBox(box, { active: !box.active })} className={`h-fit rounded-full px-3 py-1 text-xs ${box.active ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{box.active ? "Active" : "Archived"}</button></div></div><div className="mt-4 border-t border-hairline pt-4"><div className="flex items-center justify-between mb-3"><p className="font-body text-xs font-semibold text-ink">Box photos</p><><button type="button" onClick={() => addBoxPhoto(box)} className="text-xs text-brand">Add URL</button><label className="text-xs text-brand cursor-pointer">Upload photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => uploadBoxPhoto(box, event)} /></label></></div><div className="flex flex-wrap gap-2">{(box.photos || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((photo, index) => <div key={`${photo.url}-${index}`} className="relative w-20"><img src={photo.url} alt={photo.alt || `${box.name} photo`} className="w-20 h-16 rounded-lg object-cover border border-hairline" onError={(event) => { event.currentTarget.style.opacity = "0.35"; }} /><div className="flex justify-center gap-2 mt-1"><button type="button" onClick={() => editBoxPhoto(box, index)} className="text-[10px] text-brand">Edit</button><button type="button" onClick={() => removeBoxPhoto(box, index)} className="text-[10px] text-brand">Remove</button></div></div>)}{!(box.photos || []).length && <p className="font-body text-xs text-ink-soft">No custom photos. The storefront fallback image will be used.</p>}</div></div><div className="grid grid-cols-2 gap-2 mt-4">{categories.map((category) => { const selected = boxCategorySelections[box._id] || []; return <label key={category._id} className="flex items-center gap-2 font-body text-xs text-ink"><input type="checkbox" checked={selected.includes(category._id)} onChange={(event) => setBoxCategorySelections((all) => ({ ...all, [box._id]: event.target.checked ? [...selected, category._id] : selected.filter((id) => id !== category._id) }))} className="accent-brand" />{category.name}</label>; })}</div><button type="button" onClick={() => updateBox(box, { categoryIds: boxCategorySelections[box._id] || [] })} className="mt-4 bg-brand text-cream rounded-xl px-4 py-2 font-body text-xs">Save categories</button></div>)}</div></Panel>
      <Panel title="Products and stock" icon={Package}><p className="font-body text-sm text-ink-soft mb-5">Use stock controls to make products available again. Archive instead of deleting so old orders keep their product history.</p><form onSubmit={addProduct} className="grid md:grid-cols-[1.4fr_1fr_0.7fr_auto] gap-3 mb-3"><input className={inputClass} required placeholder="New product name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} /><select className={inputClass} required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}><option value="">Choose category</option>{categories.map((category) => <option key={category._id} value={category.key}>{category.name}</option>)}</select><input className={inputClass} type="number" min="0" placeholder="Extra KSh" value={newProduct.priceModifier} onChange={(e) => setNewProduct({ ...newProduct, priceModifier: e.target.value })} /><input className={inputClass} type="number" min="0" placeholder="Standalone KSh" value={newProduct.standalonePrice} onChange={(e) => setNewProduct({ ...newProduct, standalonePrice: e.target.value })} /><input className={inputClass} type="number" min="0" placeholder="Inventory (optional)" value={newProduct.inventory} onChange={(e) => setNewProduct({ ...newProduct, inventory: e.target.value })} /><button disabled={saving} className="bg-brand text-cream rounded-xl px-5 font-body text-sm">Add product</button></form><label className="flex items-center gap-2 font-body text-xs text-ink-soft mb-5"><input type="checkbox" checked={newProduct.hasOptions} onChange={(e) => setNewProduct({ ...newProduct, hasOptions: e.target.checked })} className="accent-brand" /> This product has selectable options</label><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-hairline font-body text-xs text-ink-soft"><th className="py-3 pr-3">Product</th><th className="py-3 pr-3">Category</th><th className="py-3 pr-3">Options</th><th className="py-3 pr-3">Price extra</th><th className="py-3 pr-3">Standalone</th><th className="py-3 pr-3">Stock</th><th className="py-3">Action</th></tr></thead><tbody>{products.map((product) => <tr key={product._id} className="border-b border-hairline/60 font-body text-sm"><td className="py-3 pr-3 text-ink"><div className="flex items-center gap-2"><div><p>{product.name}{product.archived && <span className="ml-2 text-xs text-ink-soft">Archived</span>}</p>{true ? <div className="flex flex-wrap gap-2 mt-2">{(product.photos || []).slice(0, 4).map((photo, index) => <span key={`${photo.url}-${index}`} className="inline-flex items-center gap-1"><img src={photo.url} alt={photo.alt || product.name} className="w-10 h-8 rounded object-cover border border-hairline" onError={(event) => { event.currentTarget.style.opacity = "0.35"; }} /><button type="button" onClick={() => editProductPhoto(product, index)} className="text-[10px] text-brand">Edit</button><button type="button" onClick={() => removeProductPhoto(product, index)} className="text-[10px] text-brand">Remove</button></span>)}<div className="flex gap-3 mt-2">{(String(product.category || "").toLowerCase().replace(/[^a-z]/g, "") === "addon" || !(product.photos || []).length) && <button type="button" onClick={() => addProductPhoto(product)} className="text-[10px] text-brand">Add URL</button>}<label className="text-[10px] text-brand cursor-pointer">Upload<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => uploadProductPhoto(product, event)} /></label></div></div> : null}</div></div></td><td className="py-3 pr-3 text-ink-soft">{product.category}</td><td className="py-3 pr-3 text-ink-soft">{product.hasOptions === false ? "None" : "Selectable"}</td><td className="py-3 pr-3 text-ink-soft">{formatKsh(product.priceModifier)}</td><td className="py-3 pr-3 text-ink-soft">{product.standalonePrice == null ? "—" : formatKsh(product.standalonePrice)}</td><td className="py-3 pr-3"><button type="button" disabled={product.archived} onClick={() => updateProduct(product, { inStock: !product.inStock, active: true })} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${product.inStock && !product.archived ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{product.inStock && !product.archived && <Check size={12} />}{product.archived ? "Archived" : product.inStock ? "In stock" : "Out of stock"}</button></td><td className="py-3"><div className="flex gap-3">{!product.archived && <><button type="button" onClick={() => editProduct(product)} className="text-xs text-brand">Edit</button><button type="button" onClick={() => archiveProduct(product)} className="inline-flex items-center gap-1 text-xs text-brand"><Archive size={13} /> Archive</button></>}{product.archived && <button type="button" onClick={() => updateProduct(product, { archived: false, active: true, inStock: true })} className="text-xs text-brand">Restore</button>}</div></td></tr>)}</tbody></table></div></Panel>
      <Panel title="Categories" icon={Tags}><p className="font-body text-sm text-ink-soft mb-5">The default categories are pads, tampons, panty liners, wipes, chocolate, teas, candles, bath bombs, essential oils, and add-ons.</p><form onSubmit={saveCategory} className="grid md:grid-cols-[1fr_1fr_0.6fr_0.6fr_auto] gap-3 mb-6"><input className={inputClass} required placeholder="Key, e.g. bath-bombs" value={newCategory.key} onChange={(e) => setNewCategory({ ...newCategory, key: e.target.value })} /><input className={inputClass} required placeholder="Customer-facing name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} /><input className={inputClass} type="number" min="0" placeholder="Pick min" value={newCategory.minSelections} onChange={(e) => setNewCategory({ ...newCategory, minSelections: e.target.value })} /><input className={inputClass} type="number" min="0" placeholder="Pick max" value={newCategory.maxSelections} onChange={(e) => setNewCategory({ ...newCategory, maxSelections: e.target.value })} /><div className="md:col-span-2 flex flex-wrap gap-4 items-center font-body text-xs text-ink-soft"><label><input type="checkbox" checked={newCategory.allowRepeat} onChange={(e) => setNewCategory({ ...newCategory, allowRepeat: e.target.checked })} className="accent-brand mr-1" /> Allow repeats</label><label><input type="checkbox" checked={newCategory.optionalExtra} onChange={(e) => setNewCategory({ ...newCategory, optionalExtra: e.target.checked })} className="accent-brand mr-1" /> Paid add-on</label><label><input type="checkbox" checked={newCategory.includedAutomatically} onChange={(e) => setNewCategory({ ...newCategory, includedAutomatically: e.target.checked })} className="accent-brand mr-1" /> Include automatically in every box</label></div><button disabled={saving} className="bg-brand text-cream rounded-xl px-5 font-body text-sm">{editingCategoryId ? "Save category" : "Add category"}</button></form><div className="grid md:grid-cols-3 gap-3">{categories.map((category) => <div key={category._id} className="rounded-xl border border-hairline p-4"><p className="font-body font-semibold text-ink">{category.name}</p><p className="font-body text-xs text-ink-soft mt-1">{category.key} · pick {category.minSelections}–{category.maxSelections ?? "any"}</p><p className="font-body text-xs text-ink-soft mt-1">{category.optionalExtra ? "Optional paid extra" : "Included category"}{category.allowRepeat ? " · repeats allowed" : ""}</p><button type="button" onClick={() => editCategory(category)} className="mt-3 mr-3 text-xs text-brand">Edit rules</button><button type="button" onClick={async () => { if (!window.confirm(`Archive ${category.name}?`)) return; try { await api.delete(`/api/catalog/categories/${category._id}`); setCategories((all) => all.filter((item) => item._id !== category._id)); toast.success("Category archived"); } catch (error) { toast.error(error.response?.data?.message || "Could not archive category"); } }} className="mt-3 text-xs text-brand">Archive category</button></div>)}</div></Panel>
      {settings && <Panel title="Checkout and delivery settings" icon={Settings}><form onSubmit={saveSettings} className="grid md:grid-cols-2 gap-4"><label className="font-body text-sm text-ink">Three-month discount %<input className={`${inputClass} mt-1`} type="number" min="0" max="100" value={settings.discountPercent} onChange={(e) => setSettings({ ...settings, discountPercent: e.target.value })} /></label><label className="font-body text-sm text-ink">Maximum boxes per day<input className={`${inputClass} mt-1`} type="number" min="1" value={settings.maxBoxesPerDay} onChange={(e) => setSettings({ ...settings, maxBoxesPerDay: e.target.value })} /></label><label className="font-body text-sm text-ink">Earliest bookable date<input className={`${inputClass} mt-1`} type="date" value={new Date(settings.earliestBookableDate).toISOString().slice(0, 10)} onChange={(e) => setSettings({ ...settings, earliestBookableDate: e.target.value })} /></label><label className="font-body text-sm text-ink">Change window in days<input className={`${inputClass} mt-1`} type="number" min="0" value={settings.changeWindowDays} onChange={(e) => setSettings({ ...settings, changeWindowDays: e.target.value })} /></label><label className="font-body text-sm text-ink">Cutoff hour, 0–23<input className={`${inputClass} mt-1`} type="number" min="0" max="23" value={settings.cutoffHour} onChange={(e) => setSettings({ ...settings, cutoffHour: e.target.value })} /></label><label className="flex items-center gap-2 font-body text-sm text-ink mt-7"><input type="checkbox" checked={settings.discountAppliesToAddons} onChange={(e) => setSettings({ ...settings, discountAppliesToAddons: e.target.checked })} className="accent-brand" /> Discount applies to add-ons</label><button disabled={saving} className="md:col-span-2 bg-brand text-cream rounded-xl py-3 font-body text-sm">Save checkout settings</button></form></Panel>}
    </div>
  </div>;
}
