import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";

const categories = ["all", "cycle education", "self care rituals", "product education", "wellness tips"];
const label = (value) => String(value || "wellness tips").replace(/\b\w/g, (character) => character.toUpperCase());

function ArticleCard({ article, featured = false }) {
  return <article className={`group flex h-full flex-col overflow-hidden border border-[#ead9de] bg-[#fffdfb] shadow-[0_10px_35px_rgba(75,13,50,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(75,13,50,0.10)] ${featured ? "lg:grid lg:grid-cols-[1.15fr_0.85fr]" : "rounded-2xl"}`}><div className={`overflow-hidden bg-[#f6e7eb] ${featured ? "h-52 sm:h-60 lg:h-full lg:min-h-[18rem]" : "h-44 sm:h-48"}`}>{article.coverImage ? <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-brand/35"><Heart size={42} fill="currentColor" /></div>}</div><div className={`flex flex-1 flex-col ${featured ? "justify-center p-5 sm:p-7" : "p-4 sm:p-5"}`}><div className="flex flex-wrap items-center gap-3"><span className="font-body text-[10px] font-semibold tracking-[0.18em] text-[#4b0d32] uppercase">{label(article.category)}</span><span className="h-px w-5 bg-brand/40" /><span className="font-body text-xs text-ink-soft">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span></div><Link to={`/self-care/${article.slug}`} className={`block font-display leading-tight text-[#4b0d32] hover:text-brand transition-colors ${featured ? "mt-3 text-2xl sm:text-3xl" : "mt-3 text-xl"}`}>{article.title}</Link><p className="font-body text-sm leading-7 text-ink-soft mt-4 line-clamp-3">{article.summary || article.body}</p><Link to={`/self-care/${article.slug}`} className="mt-auto inline-flex w-fit items-center gap-2 pt-6 font-body text-sm font-semibold text-[#4b0d32] hover:text-brand">Continue reading <ArrowRight size={15} /></Link></div></article>;
}

export default function SelfCare() {
  const [articles, setArticles] = useState([]); const [category, setCategory] = useState("all"); const [query, setQuery] = useState(""); const [status, setStatus] = useState("loading");
  useEffect(() => { api.get("/api/articles").then(({ data }) => { setArticles(data); setStatus("ready"); }).catch(() => setStatus("error")); }, []);
  const visible = articles.filter((article) => (category === "all" || article.category === category) && `${article.title} ${article.summary || ""} ${article.body || ""}`.toLowerCase().includes(query.toLowerCase().trim()));
  const [featured, ...rest] = visible;
  return <div className="min-h-screen overflow-x-hidden bg-[#F3D5E0] px-3 pb-8 pt-4 text-ink sm:px-5 sm:pb-10 sm:pt-5">
    <main className="mx-auto w-full max-w-7xl rounded-[24px] border border-[#ead9de] bg-[#FBF7F2] px-4 py-6 shadow-[0_24px_65px_-42px_rgba(75,13,50,0.42)] sm:rounded-[30px] sm:px-7 sm:py-8 lg:px-10">
      <section className="flex flex-col gap-3 border-b border-[#ead9de] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="font-body text-[10px] font-semibold tracking-[0.24em] text-[#c2185b] sm:text-xs">THE HERI BLOOM JOURNAL</p>
          <h1 className="font-display mt-2 text-4xl font-normal leading-[1.02] text-[#4b0d32] sm:text-5xl">A softer way to care for yourself.</h1>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-ink-soft sm:text-base">Thoughtful notes on menstrual health, nourishing rituals, and the small choices that help you feel more prepared.</p>
        </div>
        <div className="flex items-center gap-2 pb-1 text-[#c2185b]" aria-hidden="true"><span className="h-px w-8 bg-current/50" /><Heart size={14} fill="currentColor" /><span className="h-px w-8 bg-current/50" /></div>
      </section>
      <section className="pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-body text-[10px] font-semibold tracking-[0.22em] text-[#4b0d32]">READ, LEARN, REST</p><h2 className="font-display mt-1 text-2xl text-[#4b0d32] sm:text-3xl">Latest from the journal</h2></div>
          <label className="flex w-full max-w-sm items-center gap-3 rounded-full border border-[#d9bdc7] bg-white/70 px-4 py-2.5"><Search size={16} className="shrink-0 text-[#4b0d32]" /><input aria-label="Search articles" className="min-w-0 flex-1 bg-transparent font-body text-sm text-ink outline-none placeholder:text-ink-soft" placeholder="Search the journal" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-3.5 py-2 font-body text-[11px] transition-colors sm:text-xs ${category === item ? "border-[#4b0d32] bg-[#4b0d32] text-[#FBF7F2]" : "border-[#ead9de] bg-white/60 text-ink-soft hover:border-[#4b0d32] hover:text-[#4b0d32]"}`}>{item === "all" ? "All notes" : label(item)}</button>)}</div>
      </section>
      {status === "loading" && <p className="py-12 text-center font-body text-sm text-ink-soft">Loading the journal...</p>}
      {status === "error" && <p className="py-12 text-center font-body text-sm text-ink-soft">The journal is temporarily unavailable. Please check back soon.</p>}
      {status === "ready" && !visible.length && <div className="mt-6 rounded-2xl border border-[#ead9de] bg-white/70 px-6 py-12 text-center"><Heart className="mx-auto text-brand" fill="currentColor" /><p className="font-display mt-4 text-2xl text-[#4b0d32]">No notes found yet.</p><p className="mt-2 font-body text-sm text-ink-soft">Try another search or category.</p></div>}
      {status === "ready" && visible.length > 0 && <><div className="mt-6">{featured && <ArticleCard article={featured} featured />}</div>{rest.length > 0 && <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map((article) => <ArticleCard key={article._id} article={article} />)}</div>}<section className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#4b0d32] px-5 py-6 text-[#FBF7F2] sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><p className="font-body text-[10px] font-semibold tracking-[0.22em] text-[#f1b6c8]">A LITTLE REMINDER</p><h2 className="font-display mt-2 text-2xl">Your care belongs on the calendar.</h2><p className="mt-2 max-w-xl font-body text-sm leading-6 text-[#FBF7F2]/75">Save space for rest, preparation, and the rituals that make ordinary days feel a little gentler.</p></div><Heart className="shrink-0 text-[#f1b6c8]" size={34} fill="currentColor" /></section></>}
    </main>
  </div>
}
