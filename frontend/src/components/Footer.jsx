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
  { label: "Shipping & delivery", to: "/contact" },
  { label: "Returns & refunds", to: "/contact" },
  { label: "Privacy policy", to: "/contact" },
  { label: "Terms & conditions", to: "/contact" },
];

function FooterLink({ to, children }) {
  return <Link to={to} className="font-body text-sm text-cream/70 hover:text-cream transition-colors">{children}</Link>;
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

  return <footer className="mt-20 overflow-hidden bg-ink text-cream">
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20">
      <div className="grid lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr] gap-12 lg:gap-10">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="Heri Bloom home"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream"><img src={logo} alt="" className="h-10 w-auto object-contain" /></span><span className="font-display font-bold text-2xl text-cream">Heri Bloom</span></Link>
          <p className="font-script text-2xl text-brand-soft mt-7">Small box. Big care.</p>
          <p className="font-body text-sm text-cream/65 leading-7 mt-3">Thoughtful menstrual care and everyday comfort, delivered as a ritual made for you.</p>
          <div className="flex flex-wrap gap-2 mt-7">{socials.map(({ key, label, mark }) => <a key={key} href={socialUrl(key, contact[key])} target="_blank" rel="noreferrer" aria-label={`Heri Bloom on ${label}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-xs font-display font-bold text-cream/80 hover:border-brand hover:bg-brand hover:text-cream transition-colors">{mark}</a>)}</div>
        </div>
        <div><p className="font-body text-xs tracking-[0.2em] text-brand-soft mb-5">EXPLORE</p><nav className="flex flex-col gap-3">{shopLinks.map((link) => <FooterLink key={link.label} {...link}>{link.label}</FooterLink>)}</nav></div>
        <div><p className="font-body text-xs tracking-[0.2em] text-brand-soft mb-5">CUSTOMER CARE</p><nav className="flex flex-col gap-3">{careLinks.map((link) => <FooterLink key={link.label} {...link}>{link.label}</FooterLink>)}</nav></div>
        <div><p className="font-body text-xs tracking-[0.2em] text-brand-soft mb-5">GOOD TO KNOW</p><nav className="flex flex-col gap-3">{policyLinks.map((link) => <FooterLink key={link.label} {...link}>{link.label}</FooterLink>)}</nav></div>
      </div>
      <div className="mt-14 border-t border-cream/15 pt-8 grid md:grid-cols-[1fr_auto] gap-7 items-end">
        <div className="space-y-3"><p className="font-body text-xs tracking-[0.18em] text-brand-soft">NEED A LITTLE HELP?</p><div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6"><a href={contact.email ? gmailComposeUrl(contact.email) : "/contact"} target={contact.email ? "_blank" : undefined} rel={contact.email ? "noreferrer" : undefined} className="inline-flex items-center gap-2 font-body text-sm text-cream/75 hover:text-cream transition-colors"><Mail size={15} />{contact.email || "Email Heri Bloom"}</a>{contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-body text-sm text-cream/75 hover:text-cream transition-colors"><Phone size={15} />{contact.phone}</a>}{contact.address && <span className="inline-flex items-center gap-2 font-body text-sm text-cream/75"><MapPin size={15} />{contact.address}</span>}</div></div>
        {whatsappDigits ? <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-body text-sm font-semibold text-white hover:bg-[#1ebe5d] transition-colors"><MessageCircle size={17} fill="currentColor" />Chat with us <ArrowUpRight size={15} /></a> : <Link to="/contact" className="inline-flex w-fit items-center gap-2 rounded-full border border-cream/30 px-5 py-3 font-body text-sm font-semibold text-cream hover:bg-cream hover:text-ink transition-colors">Get in touch <ArrowUpRight size={15} /></Link>}
      </div>
    </div>
    <div className="border-t border-cream/15 bg-[#2b0922]"><div className="w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"><p className="font-body text-xs text-cream/50">&copy; {new Date().getFullYear()} Heri Bloom. All rights reserved.</p><p className="inline-flex items-center gap-1 font-body text-xs text-cream/50">Made with <Heart size={12} className="text-brand-soft" fill="currentColor" /> for better care.</p></div></div>
  </footer>;
}
