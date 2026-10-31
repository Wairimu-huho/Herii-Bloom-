import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, Package, RotateCcw } from "lucide-react";
import api from "../api/client";

const stageLabels = { awaiting_payment: "Awaiting payment", confirmed: "Confirmed", preparing: "Preparing", out_for_delivery: "Out for delivery", delivered: "Delivered", active: "Active", problem: "Problem", cancelled: "Cancelled" };
const formatKsh = (value) => `KSh ${Number(value || 0).toLocaleString()}`;

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timer;
    const reference = params.get("reference") || params.get("trxref");
    const verify = async (currentAttempt = 0) => {
      try {
        const { data } = await api.get(`/api/payments/verify/${orderId}${reference ? `?reference=${encodeURIComponent(reference)}` : ""}`);
        if (!active) return;
        setOrder(data); setLoading(false); setAttempt(currentAttempt);
        if (data.paymentStatus !== "paid" && data.paymentStatus !== "failed" && currentAttempt < 5) timer = window.setTimeout(() => verify(currentAttempt + 1), 2500);
      } catch (requestError) {
        if (!active) return;
        if (currentAttempt < 5) { setAttempt(currentAttempt + 1); timer = window.setTimeout(() => verify(currentAttempt + 1), 2500); }
        else { setLoading(false); setError(requestError.response?.data?.message || "We could not verify this payment yet."); }
      }
    };
    verify();
    return () => { active = false; window.clearTimeout(timer); };
  }, [orderId, params]);

  const reorder = async () => {
    try { const { data } = await api.get(`/api/orders/${orderId}/reorder`); const picks = data.selections.reduce((result, item) => { (result[item.category] ||= []).push(item.productId); return result; }, {}); sessionStorage.setItem("heribloom_shop_draft", JSON.stringify({ boxId: data.boxId, picks, phone: data.phone, address: data.deliveryAddress, gift: data.gift, cardMessage: data.cardMessage })); window.location.assign("/shop"); }
    catch (requestError) { toast.error(requestError.response?.data?.message || "Could not prepare reorder"); }
  };

  if (loading && !order) return <main className="min-h-[70vh] bg-blush-deep/30 px-4 py-20"><div className="mx-auto max-w-xl rounded-3xl border border-hairline bg-cream p-10 text-center"><Package className="mx-auto text-brand" size={38} /><h1 className="mt-5 font-display text-3xl font-bold text-ink">Confirming your payment</h1><p className="mt-3 font-body text-sm text-ink-soft">Please wait while Paystack confirms your order. This can take a few seconds.</p><div className="mx-auto mt-6 h-2 max-w-xs overflow-hidden rounded-full bg-blush-deep"><div className="h-full w-1/2 animate-pulse rounded-full bg-brand" /></div></div></main>;
  if (error && !order) return <main className="min-h-[70vh] bg-blush-deep/30 px-4 py-20"><div className="mx-auto max-w-xl rounded-3xl border border-hairline bg-cream p-10 text-center"><h1 className="font-display text-3xl font-bold text-ink">Payment verification needs attention</h1><p className="mt-3 font-body text-sm text-ink-soft">{error}</p><Link to="/orders" className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 font-body text-sm text-cream">Open my orders</Link></div></main>;

  const paid = order.paymentStatus === "paid";
  const failed = order.paymentStatus === "failed";
  return <main className="min-h-[70vh] bg-blush-deep/30 px-4 py-12"><div className="mx-auto max-w-3xl"><div className="text-center"><CheckCircle2 className={`mx-auto mb-4 ${paid ? "text-brand" : "text-ink-soft"}`} size={48} /><h1 className="font-display text-4xl font-bold text-ink">{paid ? "Your order is confirmed" : failed ? "Payment was not completed" : "Your order is being verified"}</h1><p className="mt-3 font-body text-sm text-ink-soft">{paid ? "Your payment was received. Here are your order and delivery details." : failed ? "Nothing more will be charged. You can return to the shop and try again." : `Paystack is still processing your payment. Checking again… (${attempt}/5)`}</p></div><section className="mt-8 rounded-3xl border border-hairline bg-cream p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-body text-xs tracking-[0.2em] text-brand">ORDER NUMBER</p><h2 className="mt-1 font-display text-3xl font-bold text-ink">{order.orderNumber || order._id}</h2></div><span className="rounded-full bg-blush-deep px-4 py-2 font-body text-xs font-semibold text-brand">{stageLabels[order.status] || order.paymentStatus}</span></div><div className="mt-6 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-2"><div><p className="font-body text-xs text-ink-soft">Box</p><p className="mt-1 font-body text-sm font-semibold text-ink">{order.boxName}</p></div><div><p className="font-body text-xs text-ink-soft">Total</p><p className="mt-1 font-body text-sm font-semibold text-brand">{formatKsh(order.totalPrice)}</p></div><div><p className="font-body text-xs text-ink-soft">Payment</p><p className="mt-1 font-body text-sm font-semibold text-ink">{paid ? "Paystack · Paid" : order.paymentStatus}</p></div><div><p className="font-body text-xs text-ink-soft">Reference</p><p className="mt-1 break-all font-body text-sm font-semibold text-ink">{order.paymentReference || "—"}</p></div></div></section><section className="mt-5 rounded-3xl border border-hairline bg-cream p-6 shadow-sm sm:p-8"><h2 className="font-display text-2xl font-bold text-ink">Delivery tracking</h2><p className="mt-2 font-body text-sm text-ink-soft">Your progress will update as the Heri Bloom team prepares and sends each delivery.</p><div className="mt-5 space-y-3">{(order.deliveries || []).map((delivery) => <div key={delivery._id || delivery.sequence} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline p-4"><div><p className="font-body text-sm font-semibold text-ink">Delivery {delivery.sequence || 1}</p><p className="mt-1 font-body text-xs text-ink-soft">Scheduled for {delivery.scheduledDate ? new Date(delivery.scheduledDate).toLocaleDateString() : "To be scheduled"}</p></div><span className="rounded-full bg-blush-deep px-3 py-1 font-body text-xs text-brand">{stageLabels[delivery.status] || delivery.status}</span></div>)}</div></section><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/orders" className="rounded-full bg-brand px-5 py-3 font-body text-sm text-cream transition hover:bg-ink">Open full order tracking</Link><button type="button" onClick={reorder} className="inline-flex items-center gap-2 rounded-full border border-brand px-5 py-3 font-body text-sm text-brand transition hover:bg-brand hover:text-cream"><RotateCcw size={15} /> Reorder with same picks</button><Link to="/" className="rounded-full border border-hairline px-5 py-3 font-body text-sm text-ink">Home</Link></div></div></main>;
}
