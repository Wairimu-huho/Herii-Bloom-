import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import api from "../api/client";

export default function WhatsAppFloat() {
  const [number, setNumber] = useState("");
  useEffect(() => { api.get("/api/catalog/settings").then(({ data }) => setNumber(data.contact?.whatsapp || "")).catch(() => {}); }, []);
  const digits = String(number).replace(/\D/g, "");
  if (!digits) return null;
  return <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" aria-label="Chat with Heri Bloom on WhatsApp" style={{ right: "max(1rem, env(safe-area-inset-right))" }} className="fixed top-1/2 -translate-y-1/2 z-[100] box-border max-w-[calc(100vw-2rem)] inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-5 py-4 shadow-xl shadow-green-900/20 hover:bg-[#1ebe5d] hover:scale-105 transition-all"><MessageCircle size={25} fill="currentColor" /><span className="font-body text-sm font-semibold hidden sm:inline">Chat with us</span></a>;
}
