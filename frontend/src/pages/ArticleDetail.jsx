import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Flag, Heart, MessageCircle, Send } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const label = (value) => String(value || "wellness tips").replace(/\b\w/g, (character) => character.toUpperCase());

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [status, setStatus] = useState("loading");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/api/articles/${slug}`),
      api.get("/api/articles"),
      api.get(`/api/articles/${slug}/comments`),
      api.get(`/api/articles/${slug}/engagement`),
    ]).then(([articleResponse, articlesResponse, commentsResponse, engagementResponse]) => {
      const next = articleResponse.data;
      setArticle(next);
      setRelated(articlesResponse.data.filter((item) => item._id !== next._id && item.category === next.category).slice(0, 3));
      setComments(commentsResponse.data);
      setLikes(engagementResponse.data.likes || 0);
      setLiked(Boolean(engagementResponse.data.liked));
      setStatus("ready");
    }).catch(() => setStatus("error"));
  }, [slug]);

  const requireLogin = () => navigate("/login", { state: { from: `/self-care/${slug}` } });

  const toggleLike = async () => {
    if (!user) return requireLogin();
    try {
      const { data } = await api.post(`/api/articles/${slug}/like`);
      setLikes(data.likes);
      setLiked(data.liked);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update like");
    }
  };

  const openCommentComposer = () => {
    if (!user) return requireLogin();
    setCommentOpen((open) => !open);
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!user) return requireLogin();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/api/articles/${slug}/comments`, { content: commentText });
      setCommentText("");
      setCommentOpen(false);
      if (data.flagged) toast("Your comment was sent for review before it can appear.");
      else {
        setComments((all) => [...all, data.comment]);
        toast.success("Comment posted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not post comment");
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") return <p className="bg-[#fbf7f2] py-32 text-center font-body text-ink-soft">Loading article...</p>;
  if (status === "error" || !article) return <div className="min-h-[60vh] bg-[#fbf7f2] px-6 py-32 text-center"><Heart className="mx-auto text-brand" fill="currentColor" /><h1 className="font-display mt-4 text-3xl text-[#4b0d32]">Article not found</h1><Link to="/self-care" className="mt-6 inline-flex items-center gap-2 font-body text-sm text-[#4b0d32]"><ArrowLeft size={15} /> Back to the journal</Link></div>;

  return <div className="min-h-screen overflow-x-hidden bg-[#fbf7f2] text-ink">
    <article className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
      <Link to="/self-care" className="inline-flex items-center gap-2 font-body text-sm text-[#4b0d32] hover:text-brand"><ArrowLeft size={15} /> Back to the journal</Link>
      <header className="mx-auto mt-12 max-w-3xl text-center">
        <p className="font-body text-xs font-semibold tracking-[0.22em] text-[#4b0d32] uppercase">{label(article.category)}</p>
        <h1 className="font-display mt-6 text-4xl font-normal leading-tight text-[#4b0d32] sm:text-5xl md:text-6xl">{article.title}</h1>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 font-body text-xs text-ink-soft"><span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span><span className="h-1 w-1 rounded-full bg-brand" />{article.author?.name ? <span>By {article.author.name}</span> : <span>From the Heri Bloom journal</span>}</div>
      </header>
      {article.coverImage && <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl bg-[#f6e7eb] shadow-[0_20px_55px_rgba(75,13,50,0.08)]"><img src={article.coverImage} alt={article.title} className="max-h-[34rem] w-full object-cover" /></div>}
      <div className="mx-auto mt-12 max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3 text-brand"><span className="h-px w-12 bg-brand/40" /><Heart size={13} fill="currentColor" /><span className="h-px w-12 bg-brand/40" /></div>
        <p className="whitespace-pre-line font-body text-base font-medium leading-8 text-ink sm:text-lg">{article.body}</p>
        {article.sourceUrl && <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 border-b border-[#4b0d32] pb-1 font-body text-sm text-[#4b0d32] hover:text-brand">Source / further reading <ExternalLink size={15} /></a>}

        <section id="comments" className="mt-14 border-t border-[#ead9de] pt-5">
          <div className="flex items-center gap-5">
            <button type="button" onClick={toggleLike} aria-pressed={liked} className={`inline-flex items-center gap-2 font-body text-sm transition-colors ${liked ? "text-brand" : "text-ink-soft hover:text-brand"}`}><Heart size={17} fill={liked ? "currentColor" : "none"} /> {likes}</button>
            <button type="button" onClick={openCommentComposer} className="inline-flex items-center gap-2 font-body text-sm text-ink-soft transition-colors hover:text-brand"><MessageCircle size={17} /> {comments.length}</button>
            <span className="font-body text-xs text-ink-soft">{comments.length === 1 ? "comment" : "comments"}</span>
          </div>

          {commentOpen && <form onSubmit={submitComment} className="mt-5 flex items-end gap-2"><textarea autoFocus value={commentText} onChange={(event) => setCommentText(event.target.value)} maxLength={1000} rows={2} placeholder="Write a thoughtful note..." className="min-h-16 flex-1 resize-none rounded-xl border border-[#ead9de] bg-[#fffdfb] px-3 py-2.5 font-body text-sm text-ink outline-none focus:border-brand" /><button disabled={sending || !commentText.trim()} aria-label="Post comment" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4b0d32] text-cream hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"> <Send size={15} /></button></form>}
          {!user && commentOpen && <p className="mt-2 font-body text-xs text-ink-soft">You need an account to comment.</p>}

          {comments.length > 0 && <div className="mt-8 space-y-5">{comments.map((comment) => <article key={comment._id} className="border-b border-[#ead9de] pb-5"><div className="flex items-center justify-between gap-3"><p className="font-body text-sm font-semibold text-[#4b0d32]">{comment.user?.name || "Heri Bloom reader"}</p><span className="font-body text-xs text-ink-soft">{new Date(comment.createdAt).toLocaleDateString()}</span></div><p className="mt-2 whitespace-pre-line font-body text-sm leading-7 text-ink">{comment.content}</p>{user && <button type="button" onClick={async () => { try { await api.post(`/api/comments/${comment._id}/report`, { reason: "Reported by reader" }); toast.success("Comment reported"); } catch (error) { toast.error(error.response?.data?.message || "Could not report comment"); } }} className="mt-3 inline-flex items-center gap-1 font-body text-xs text-ink-soft hover:text-brand"><Flag size={13} /> Report</button>}</article>)}</div>}
        </section>
      </div>
    </article>

    {related.length > 0 && <section className="border-t border-[#ead9de] bg-[#fffdfb] px-5 py-14 sm:px-6 sm:py-16 lg:px-8"><div className="mx-auto max-w-5xl"><div className="flex items-end justify-between gap-5"><div><p className="font-body text-[10px] font-semibold tracking-[0.24em] text-[#4b0d32]">KEEP READING</p><h2 className="font-display mt-3 text-3xl text-[#4b0d32]">More from this journal</h2></div><Link to="/self-care" className="hidden items-center gap-2 font-body text-sm text-[#4b0d32] sm:inline-flex">View all <ArrowRight size={15} /></Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((item) => <Link key={item._id} to={`/self-care/${item.slug}`} className="group border border-[#ead9de] bg-[#fbf7f2] p-5 hover:border-brand transition-colors"><p className="font-body text-[10px] font-semibold tracking-[0.15em] text-[#4b0d32] uppercase">{label(item.category)}</p><h3 className="font-display mt-3 text-xl leading-tight text-[#4b0d32] group-hover:text-brand">{item.title}</h3><p className="mt-3 line-clamp-2 font-body text-sm leading-6 text-ink-soft">{item.summary || item.body}</p></Link>)}</div></div></section>}
    <section className="mx-auto mb-16 mt-14 max-w-5xl px-5 sm:px-6 lg:px-8"><div className="flex flex-col gap-5 bg-[#4b0d32] px-6 py-9 text-cream sm:px-10 md:flex-row md:items-center md:justify-between"><div><p className="font-body text-[10px] font-semibold tracking-[0.24em] text-[#f1b6c8]">MAKE SPACE FOR CARE</p><h2 className="font-display mt-3 text-2xl sm:text-3xl">A gentler ritual starts with one small choice.</h2></div><Heart className="shrink-0 text-[#f1b6c8]" size={34} fill="currentColor" /></div></section>
  </div>;
}
