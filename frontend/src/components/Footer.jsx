import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo/heri-bloom-logo.png";
import api from "../api/client";

const fallbackContact = { email: "", phone: "", whatsapp: "", address: "", instagram: "heribloom", tiktok: "heribloom", facebook: "heribloom", twitter: "heribloom" };
const cleanHandle = (value) => String(value || "").trim().replace(/^@/, "");
const socialUrl = (network, value) => { const handle = cleanHandle(value); const bases = { instagram: "https://instagram.com/", tiktok: "https://www.tiktok.com/@", facebook: "https://facebook.com/", twitter: "https://x.com/" }; return handle ? `${bases[network]}${handle}` : "#"; };
const gmailComposeUrl = (to) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;

const shopLinks = [
  { label: "Shop all boxes", to: "/shop#choose-box" },
  { label: "Self-care", to: "/self-care" },
  { label: "Community", to: "/community" },
  { label: "About Heri Bloom", to: "/about" },
];
const careLinks = [
  { label: "Contact us", to: "/contact" },
  { label: "My account", to: "/login" },
  { label: "Create an account", to: "/register" },
  { label: "Delivery information", to: "/contact" },
];
const policyLinks = [
  { label: "Shipping & delivery", to: "/policies/shipping" },
  { label: "Returns & refunds", to: "/policies/returns" },
  { label: "Privacy policy", to: "/policies/privacy" },
  { label: "Terms & conditions", to: "/policies/terms" },
];

function FooterLink({ to, children }) {
  return <Link to={to} className="font-body text-xs text-[#FBF7F2]/70 transition-colors hover:text-[#FBF7F2]">{children}</Link>;
}

export default function Footer() {
  const [contact, setContact] = useState(fallbackContact);
  useEffect(() => { api.get("/api/catalog/settings").then(({ data }) => setContact({ ...fallbackContact, ...(data.contact || {}) })).catch(() => {}); }, []);
  const whatsappDigits = String(contact.whatsapp || "").replace(/\D/g, "");
  const socials = [
    { key: "instagram", label: "Instagram", mark: "ig" },
    { key: "tiktok", label: "TikTok", mark: "♪" },
    { key: "facebook", label: "Facebook", mark: "f" },
    { key: "twitter", label: "X", mark: "X" },
  ];

  return (
    <footer className="mt-16 border-t border-[#FBF7F2]/10 bg-[#4B0D32] text-[#FBF7F2]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_.8fr_.8fr_.9fr] lg:gap-10">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Heri Bloom home">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF7F2] p-2"><img src={logo} alt="" className="h-full w-auto object-contain" /></span>
              <span className="font-display text-2xl font-bold tracking-[-.04em]">Heri <span className="text-[#F6B6C8]">Bloom</span></span>
            </Link>
            <p className="mt-7 font-display text-2xl italic text-[#F6B6C8]">Small box. Big care.</p>
            <p className="mt-3 max-w-xs font-body text-sm leading-7 text-[#FBF7F2]/65">Thoughtful menstrual care and everyday comfort, delivered as a ritual made for you.</p>
            <div className="mt-7 flex flex-wrap gap-2">{socials.map(({ key, label, mark }) => <a key={key} href={socialUrl(key, contact[key])} target="_blank" rel="noreferrer" aria-label={`Heri Bloom on ${label}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FBF7F2]/20 font-body text-xs font-semibold text-[#FBF7F2]/80 transition-colors hover:border-[#C2185B] hover:bg-[#C2185B] hover:text-[#FBF7F2]">{mark}</a>)}</div>
          </div>
          <div><p className="mb-5 font-body text-[10px] font-semibold tracking-[.22em] text-[#F6B6C8]">EXPLORE</p><nav className="flex flex-col gap-3">{shopLinks.map((link) => <FooterLink key={link.label} {...link}>{link.label}</FooterLink>)}</nav></div>
          <div><p className="mb-5 font-body text-[10px] font-semibold tracking-[.22em] text-[#F6B6C8]">CUSTOMER CARE</p><nav className="flex flex-col gap-3">{careLinks.map((link) => <FooterLink key={link.label} {...link}>{link.label}</FooterLink>)}</nav></div>
          <div><p className="mb-5 font-body text-[10px] font-semibold tracking-[.22em] text-[#F6B6C8]">GOOD TO KNOW</p><nav className="flex flex-col gap-3">{policyLinks.map((link) => <FooterLink key={link.label} {...link}>{link.label}</FooterLink>)}</nav></div>
        </div>

        <div className="mt-14 grid items-end gap-7 border-t border-[#FBF7F2]/15 pt-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-3"><p className="font-body text-[10px] font-semibold tracking-[.18em] text-[#F6B6C8]">NEED A LITTLE HELP?</p><div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6"><a href={contact.email ? gmailComposeUrl(contact.email) : "/contact"} target={contact.email ? "_blank" : undefined} rel={contact.email ? "noreferrer" : undefined} className="inline-flex items-center gap-2 font-body text-xs text-[#FBF7F2]/70 transition-colors hover:text-[#FBF7F2]"><Mail size={15} />{contact.email || "Email Heri Bloom"}</a>{contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-body text-xs text-[#FBF7F2]/70 transition-colors hover:text-[#FBF7F2]"><Phone size={15} />{contact.phone}</a>}{contact.address && <span className="inline-flex items-center gap-2 font-body text-xs text-[#FBF7F2]/70"><MapPin size={15} />{contact.address}</span>}</div></div>
          {whatsappDigits ? <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-body text-xs font-semibold text-white transition hover:bg-[#1ebe5d]"><MessageCircle size={16} fill="currentColor" />Chat with us <ArrowUpRight size={14} /></a> : <Link to="/contact" className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FBF7F2]/30 px-5 py-3 font-body text-xs font-semibold text-[#FBF7F2] transition hover:bg-[#FBF7F2] hover:text-[#4B0D32]"><ArrowUpRight size={14} />Get in touch</Link>}
        </div>
      </div>
      <div className="border-t border-[#FBF7F2]/15 bg-[#2B0922]"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 sm:flex-row sm:px-6 lg:px-8"><p className="font-body text-[10px] text-[#FBF7F2]/50">© {new Date().getFullYear()} Heri Bloom. All rights reserved.</p><p className="inline-flex items-center gap-1 font-body text-[10px] text-[#FBF7F2]/50">Made with <Heart size={12} className="text-[#F6B6C8]" fill="currentColor" /> for better care.</p></div></div>
    </footer>
  );
}
