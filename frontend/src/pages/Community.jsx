
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Flag,
  Heart,
  MessageCircle,
  PenLine,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  ivory: "#FBF7F2",
  blush: "#F8E8ED",
  plum: "#4B0D32",
  rose: "#C2185B",
  card: "#FFFDFA",
  border: "#EAD9DE",
  muted: "#766775",
  ink: "#34203A",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getInitial = (name) =>
  name?.trim()?.charAt(0)?.toUpperCase() || "H";

function SectionLabel({ children, light = false }) {
  return (
    <p
      className={`font-body text-[10px] font-semibold uppercase tracking-[0.24em] ${
        light ? "text-[#F1B6C8]" : "text-[#C2185B]"
      }`}
    >
      {children}
    </p>
  );
}

function ActionButton({
  children,
  onClick,
  active = false,
  label,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2
        font-body text-sm transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#C2185B] focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50 ${
          active
            ? "bg-[#F8E8ED] text-[#C2185B]"
            : "text-[#766775] hover:bg-[#F8E8ED] hover:text-[#4B0D32]"
        }`}
    >
      {children}
    </button>
  );
}

function PostCard({ post, user, onLogin }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);
  const [likes, setLikes] = useState(post.likedBy?.length || 0);
  const [liked, setLiked] = useState(
    Boolean(
      user &&
        post.likedBy?.some(
          (id) => String(id) === String(user._id)
        )
    )
  );

  useEffect(() => {
    setLikes(post.likedBy?.length || 0);
    setLiked(
      Boolean(
        user &&
          post.likedBy?.some(
            (id) => String(id) === String(user._id)
          )
      )
    );
  }, [post.likedBy, user?._id]);

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);
    setLoadingComments(true);

    try {
      const { data } = await api.get(
        `/api/posts/${post._id}/comments`
      );
      setComments(data);
    } catch {
      toast.error("Could not load comments. Please try again.");
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();

    if (!user) return onLogin();
    if (!commentText.trim()) return;

    setSending(true);

    try {
      const { data } = await api.post(
        `/api/posts/${post._id}/comments`,
        { content: commentText.trim() }
      );

      setCommentText("");

      if (data.flagged) {
        toast(
          "Your comment has been sent for review before it can appear."
        );
      } else {
        setComments((current) => [...current, data]);
        toast.success("Your reply has been shared.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not post your reply."
      );
    } finally {
      setSending(false);
    }
  };

  const toggleLike = async () => {
    if (!user) return onLogin();

    try {
      const { data } = await api.post(
        `/api/posts/${post._id}/like`
      );

      setLikes(data.likes);
      setLiked(data.liked);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not update your reaction."
      );
    }
  };

  const reportPost = async () => {
    if (!user) return onLogin();

    try {
      await api.post(`/api/posts/${post._id}/report`, {
        reason: "Reported by reader",
      });
      toast.success("Thank you for helping keep this space safe.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not report this post."
      );
    }
  };

  const reportComment = async (commentId) => {
    if (!user) return onLogin();

    try {
      await api.post(`/api/comments/${commentId}/report`, {
        reason: "Reported by reader",
      });
      toast.success("Thank you for helping keep this space safe.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not report this comment."
      );
    }
  };

  return (
    <article
      className="overflow-hidden rounded-[24px] border border-[#EAD9DE]
        bg-[#FFFDFA] shadow-[0_4px_22px_rgba(75,13,50,0.035)]
        transition duration-300 hover:border-[#E3C1CF]
        hover:shadow-[0_12px_32px_rgba(75,13,50,0.07)]"
    >
      <div className="p-5 sm:p-7 lg:p-8">
        {/* Author */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center
                rounded-full border border-[#EAD9DE] bg-[#F8E8ED]
                font-display text-lg text-[#4B0D32]"
              aria-hidden="true"
            >
              {getInitial(post.user?.name)}
            </div>

            <div className="min-w-0">
              <p className="truncate font-body text-sm font-semibold text-[#4B0D32]">
                {post.user?.name || "Heri Bloom reader"}
              </p>
              <p className="mt-1 font-body text-xs text-[#766775]">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reportPost}
            aria-label="Report this post"
            title="Report post"
            className="rounded-full p-2 text-[#766775] transition
              hover:bg-[#F8E8ED] hover:text-[#C2185B]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[#C2185B]"
          >
            <Flag size={16} strokeWidth={1.7} />
          </button>
        </div>

        {/* Post content */}
        <div className="mt-6">
          <h2 className="font-display text-[25px] font-normal leading-snug text-[#4B0D32] sm:text-[29px]">
            {post.title}
          </h2>

          <p className="mt-4 whitespace-pre-line font-body text-sm
            leading-7 text-[#34203A] sm:text-[15px] sm:leading-8">
            {post.content}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[#EAD9DE] pt-4">
          <ActionButton
            onClick={toggleComments}
            active={showComments}
            label={showComments ? "Hide comments" : "Show comments"}
          >
            <MessageCircle size={16} strokeWidth={1.7} />
            {showComments ? "Hide replies" : "Comments"}
          </ActionButton>

          <ActionButton
            onClick={toggleLike}
            active={liked}
            label={liked ? "Unlike post" : "Like post"}
          >
            <Heart
              size={16}
              strokeWidth={1.7}
              fill={liked ? "currentColor" : "none"}
            />
            <span>{likes}</span>
          </ActionButton>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-[#EAD9DE] bg-[#FBF7F2] px-5 py-6 sm:px-7 lg:px-8">
          <div className="mb-5 flex items-center gap-2">
            <MessageCircle
              size={16}
              className="text-[#C2185B]"
            />
            <h3 className="font-display text-xl text-[#4B0D32]">
              Thoughtful replies
            </h3>
          </div>

          {loadingComments ? (
            <p className="py-4 font-body text-sm text-[#766775]">
              Gathering the conversation...
            </p>
          ) : comments.length > 0 ? (
            <div className="space-y-5">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border-b border-[#EAD9DE] pb-5 last:border-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-body text-sm font-semibold text-[#4B0D32]">
                      {comment.user?.name || "Heri Bloom reader"}
                    </p>

                    <button
                      type="button"
                      onClick={() => reportComment(comment._id)}
                      className="font-body text-xs text-[#766775]
                        transition hover:text-[#C2185B]"
                    >
                      Report
                    </button>
                  </div>

                  <p className="mt-2 whitespace-pre-line font-body text-sm leading-7 text-[#34203A]">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#E3C1CF]
              px-4 py-5 font-body text-sm leading-6 text-[#766775]">
              No replies just yet. A kind word can be the beginning
              of a beautiful conversation.
            </p>
          )}

          {user ? (
            <form onSubmit={submitComment} className="mt-5">
              <label
                htmlFor={`comment-${post._id}`}
                className="mb-2 block font-body text-xs font-medium text-[#4B0D32]"
              >
                Add a thoughtful reply
              </label>

              <div className="flex items-end gap-2">
                <textarea
                  id={`comment-${post._id}`}
                  value={commentText}
                  onChange={(event) =>
                    setCommentText(event.target.value)
                  }
                  maxLength={1000}
                  rows={2}
                  placeholder="Share a little encouragement..."
                  className="min-h-14 flex-1 resize-y rounded-2xl
                    border border-[#EAD9DE] bg-[#FFFDFA] px-4 py-3
                    font-body text-sm leading-6 text-[#34203A]
                    outline-none transition placeholder:text-[#A0959F]
                    focus:border-[#C2185B] focus:ring-2
                    focus:ring-[#C2185B]/10"
                />

                <button
                  type="submit"
                  disabled={sending || !commentText.trim()}
                  aria-label="Send reply"
                  className="flex h-11 w-11 shrink-0 items-center
                    justify-center rounded-full bg-[#4B0D32]
                    text-white transition hover:bg-[#C2185B]
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[#C2185B] focus-visible:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="mt-5 inline-flex items-center gap-2
                font-body text-sm font-semibold text-[#4B0D32]
                hover:text-[#C2185B]"
            >
              Log in to join the conversation
              <ArrowUpRight size={15} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function ReminderCard() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border
      border-[#EAD9DE] bg-[#FFFDFA] p-6 sm:p-7">
      <div
        className="pointer-events-none absolute -right-8 -top-8
          h-28 w-28 rounded-full bg-[#F8E8ED]/70"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-5 flex h-10 w-10 items-center justify-center
          rounded-full bg-[#F8E8ED] text-[#C2185B]">
          <Heart size={18} strokeWidth={1.6} />
        </div>

        <SectionLabel>A gentle reminder</SectionLabel>

        <h2 className="mt-4 font-display text-[27px] leading-tight text-[#4B0D32]">
          There is no perfect way to care for yourself.
        </h2>

        <p className="mt-4 font-body text-sm leading-7 text-[#766775]">
          Every cycle is different. Ask a question, share what helped,
          or simply read along. You deserve kindness at every stage.
        </p>

        <div className="mt-6 flex items-center gap-2 font-body text-xs
          italic text-[#C2185B]">
          <Sparkles size={14} />
          <span>Give yourself a little grace.</span>
        </div>
      </div>
    </div>
  );
}

function JournalCard() {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#4B0D32]
      p-6 text-white sm:p-7">
      <div
        className="pointer-events-none absolute -right-12 -top-10
          h-36 w-36 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-5 -top-3
          h-24 w-24 rounded-full border border-white/10"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-6 flex h-10 w-10 items-center justify-center
          rounded-full border border-white/20 bg-white/10 text-[#F1B6C8]">
          <BookOpen size={18} strokeWidth={1.6} />
        </div>

        <SectionLabel light>Explore more</SectionLabel>

        <h2 className="mt-4 font-display text-[27px] leading-tight">
          Little things to help you feel more like you.
        </h2>

        <p className="mt-4 font-body text-sm leading-7 text-white/75">
          Explore gentle, practical guidance on your cycle, self-care,
          and the small rituals that make a difference.
        </p>

        <Link
          to="/self-care"
          className="mt-6 inline-flex items-center gap-2
            border-b border-[#F1B6C8]/50 pb-1 font-body text-sm
            font-medium text-[#F1B6C8] transition
            hover:border-white hover:text-white"
        >
          Visit the journal
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [composerOpen, setComposerOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  const requireLogin = () =>
    navigate("/login", { state: { from: "/community" } });

  useEffect(() => {
    let active = true;

    api
      .get("/api/posts")
      .then(({ data }) => {
        if (!active) return;
        setPosts(data);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const openComposer = () => {
    if (!user) return requireLogin();
    setComposerOpen((open) => !open);
  };

  const submitPost = async (event) => {
    event.preventDefault();

    if (!user) return requireLogin();

    const title = postForm.title.trim();
    const content = postForm.content.trim();

    if (!title || !content) return;

    setSaving(true);

    try {
      const { data } = await api.post("/api/posts", {
        title,
        content,
      });

      setPostForm({ title: "", content: "" });
      setComposerOpen(false);

      if (
        data.flaggedByFilter ||
        data.status === "hidden"
      ) {
        toast(
          "Your note has been sent for review before it can appear."
        );
      } else {
        setPosts((current) => [data, ...current]);
        toast.success("Your note has been shared.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not publish your note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FBF7F2]
      text-[#34203A]">

      {/* Editorial hero */}
      <section className="relative overflow-hidden border-b
        border-[#EAD9DE] bg-[#F8E8ED]">
        <div
          className="pointer-events-none absolute -right-24 top-0
            h-72 w-72 rounded-full border border-[#4B0D32]/[0.06]
            sm:-right-12 sm:h-96 sm:w-96"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 top-12
            h-52 w-52 rounded-full border border-[#4B0D32]/[0.06]
            sm:right-8 sm:top-20 sm:h-64 sm:w-64"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-16
          sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-[#C2185B]/60" />
              <SectionLabel>The Heri Bloom community</SectionLabel>
            </div>

            <h1 className="max-w-3xl font-display text-[43px]
              font-normal leading-[1.04] tracking-[-0.035em]
              text-[#4B0D32] sm:text-6xl md:text-[68px]">
              A softer space to share, ask, and be heard.
            </h1>

            <p className="mt-6 max-w-2xl font-body text-base
              leading-8 text-[#5E4B5D] sm:mt-8 sm:text-lg">
              A thoughtful corner for cycle conversations, gentle
              encouragement, and the everyday wisdom we learn from
              one another.
            </p>

            <div className="mt-8 flex items-center gap-3
              text-[#C2185B]" aria-hidden="true">
              <span className="h-px w-10 bg-[#C2185B]/40" />
              <Heart size={13} strokeWidth={1.5} />
              <span className="h-px w-10 bg-[#C2185B]/40" />
            </div>

            <button
              type="button"
              onClick={openComposer}
              className="mt-8 inline-flex items-center justify-center
                gap-2 rounded-full bg-[#4B0D32] px-6 py-3.5
                font-body text-sm font-medium text-white
                shadow-[0_5px_18px_rgba(75,13,50,0.12)]
                transition duration-200 hover:-translate-y-0.5
                hover:bg-[#C2185B] hover:shadow-lg
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#C2185B] focus-visible:ring-offset-2
                focus-visible:ring-offset-[#F8E8ED]"
            >
              <PenLine size={16} strokeWidth={1.7} />
              Share your thoughts
            </button>

            <p className="mt-3 font-body text-xs text-[#766775]">
              Your experiences matter. Share at your own pace.
            </p>
          </div>
        </div>
      </section>

      {/* Community content */}
      <main className="mx-auto grid w-full max-w-6xl
        gap-10 px-5 py-12 sm:px-6 sm:py-16
        lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12
        lg:px-8 lg:py-20">

        <section className="min-w-0">
          {/* Section heading */}
          <div className="mb-7 flex flex-wrap items-end
            justify-between gap-4 sm:mb-9">
            <div>
              <SectionLabel>From the community</SectionLabel>
              <h2 className="mt-3 font-display text-3xl
                font-normal tracking-tight text-[#4B0D32] sm:text-4xl">
                Recent conversations
              </h2>
              <p className="mt-2 font-body text-sm leading-6 text-[#766775]">
                Real experiences. Gentle support. No judgment.
              </p>
            </div>

            <button
              type="button"
              onClick={openComposer}
              className="inline-flex shrink-0 items-center gap-2
                rounded-full border border-[#E3C1CF] bg-[#FFFDFA]
                px-4 py-2.5 font-body text-xs font-semibold
                text-[#4B0D32] transition hover:border-[#4B0D32]
                hover:bg-[#F8E8ED]"
            >
              <PenLine size={14} />
              <span className="hidden sm:inline">
                Start a conversation
              </span>
              <span className="sm:hidden">Write a note</span>
            </button>
          </div>

          {/* Composer */}
          {composerOpen && (
            <form
              onSubmit={submitPost}
              className="mb-8 rounded-[24px] border border-[#EAD9DE]
                bg-[#FFFDFA] p-5 shadow-[0_8px_28px_rgba(75,13,50,0.045)]
                sm:p-7 lg:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <SectionLabel>Your note</SectionLabel>
                  <h3 className="mt-3 font-display text-2xl
                    text-[#4B0D32] sm:text-3xl">
                    Start a thoughtful conversation
                  </h3>
                  <p className="mt-2 max-w-lg font-body text-sm
                    leading-6 text-[#766775]">
                    Share a question, a discovery, or something
                    you wish you had known sooner.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  aria-label="Close composer"
                  className="rounded-full p-2 text-[#766775]
                    transition hover:bg-[#F8E8ED] hover:text-[#4B0D32]"
                >
                  <X size={18} />
                </button>
              </div>

              <label
                htmlFor="community-title"
                className="mb-2 block font-body text-xs font-semibold text-[#4B0D32]"
              >
                Give your note a title
              </label>
              <input
                id="community-title"
                required
                maxLength={140}
                value={postForm.title}
                onChange={(event) =>
                  setPostForm({
                    ...postForm,
                    title: event.target.value,
                  })
                }
                placeholder="What is on your mind?"
                className="w-full rounded-2xl border border-[#EAD9DE]
                  bg-[#FBF7F2] px-4 py-3.5 font-body text-sm
                  text-[#34203A] outline-none transition
                  placeholder:text-[#A0959F] focus:border-[#C2185B]
                  focus:ring-2 focus:ring-[#C2185B]/10"
              />

              <label
                htmlFor="community-content"
                className="mb-2 mt-5 block font-body text-xs font-semibold text-[#4B0D32]"
              >
                Your story
              </label>
              <textarea
                id="community-content"
                required
                maxLength={5000}
                rows={6}
                value={postForm.content}
                onChange={(event) =>
                  setPostForm({
                    ...postForm,
                    content: event.target.value,
                  })
                }
                placeholder="Take your time. Share as much or as little as feels right..."
                className="w-full resize-y rounded-2xl border border-[#EAD9DE]
                  bg-[#FBF7F2] px-4 py-3.5 font-body text-sm
                  leading-7 text-[#34203A] outline-none transition
                  placeholder:text-[#A0959F] focus:border-[#C2185B]
                  focus:ring-2 focus:ring-[#C2185B]/10"
              />

              {/* Optional writing prompts */}
              <div className="mt-5">
                <p className="font-body text-xs font-medium text-[#766775]">
                  Need a little inspiration? Try a prompt.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "What surprised me about my cycle",
                    "Something that helped me this week",
                    "What I wish I had known",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() =>
                        setPostForm((current) => ({
                          ...current,
                          content: current.content
                            ? `${current.content.trim()}\n\n${prompt}: `
                            : `${prompt}: `,
                        }))
                      }
                      className="rounded-full border border-[#EAD9DE]
                        bg-white px-3 py-2 font-body text-xs
                        text-[#766775] transition hover:border-[#C2185B]
                        hover:bg-[#F8E8ED] hover:text-[#4B0D32]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t
                border-[#EAD9DE] pt-5 sm:flex-row sm:items-center
                sm:justify-between">
                <p className="max-w-sm font-body text-xs leading-5 text-[#766775]">
                  Posts may be automatically checked before publishing.
                  Please be kind to yourself and others.
                </p>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !postForm.title.trim() ||
                    !postForm.content.trim()
                  }
                  className="inline-flex shrink-0 items-center
                    justify-center gap-2 rounded-full bg-[#4B0D32]
                    px-6 py-3 font-body text-sm font-medium text-white
                    transition hover:bg-[#C2185B]
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[#C2185B] focus-visible:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Reviewing..." : "Share your note"}
                  {saving ? (
                    <Sparkles size={15} />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Loading */}
          {status === "loading" && (
            <div className="space-y-5" aria-live="polite">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[24px]
                    border border-[#EAD9DE] bg-[#FFFDFA] p-7"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-[#F8E8ED]" />
                    <div className="space-y-2">
                      <div className="h-3 w-28 rounded bg-[#F8E8ED]" />
                      <div className="h-2 w-20 rounded bg-[#F8E8ED]" />
                    </div>
                  </div>
                  <div className="mt-7 h-5 w-3/4 rounded bg-[#F8E8ED]" />
                  <div className="mt-4 h-3 w-full rounded bg-[#F8E8ED]" />
                  <div className="mt-3 h-3 w-5/6 rounded bg-[#F8E8ED]" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="rounded-[24px] border border-[#EAD9DE]
              bg-[#FFFDFA] px-6 py-14 text-center">
              <Heart
                size={28}
                className="mx-auto text-[#C2185B]"
                strokeWidth={1.4}
              />
              <h3 className="mt-5 font-display text-2xl text-[#4B0D32]">
                We will be back shortly.
              </h3>
              <p className="mx-auto mt-3 max-w-sm font-body text-sm
                leading-7 text-[#766775]">
                The community is temporarily unavailable.
                Please try again in a little while.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("loading");
                  api
                    .get("/api/posts")
                    .then(({ data }) => {
                      setPosts(data);
                      setStatus("ready");
                    })
                    .catch(() => setStatus("error"));
                }}
                className="mt-6 rounded-full bg-[#4B0D32] px-5 py-3
                  font-body text-sm text-white transition hover:bg-[#C2185B]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {status === "ready" && posts.length === 0 && (
            <div className="rounded-[24px] border border-[#EAD9DE]
              bg-[#FFFDFA] px-6 py-14 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center
                justify-center rounded-full bg-[#F8E8ED] text-[#C2185B]">
                <BookOpen size={23} strokeWidth={1.5} />
              </div>

              <SectionLabel>Room for your story</SectionLabel>

              <h3 className="mt-4 font-display text-2xl
                text-[#4B0D32] sm:text-3xl">
                Every conversation begins somewhere.
              </h3>

              <p className="mx-auto mt-3 max-w-md font-body text-sm
                leading-7 text-[#766775]">
                Be the first to share an experience, ask a question,
                or offer a little encouragement.
              </p>

              <button
                type="button"
                onClick={openComposer}
                className="mt-6 inline-flex items-center gap-2
                  rounded-full bg-[#4B0D32] px-5 py-3
                  font-body text-sm text-white transition hover:bg-[#C2185B]"
              >
                <PenLine size={15} />
                Start the conversation
              </button>
            </div>
          )}

          {/* Posts */}
          {status === "ready" && posts.length > 0 && (
            <div className="space-y-5 sm:space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  onLogin={requireLogin}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
          <ReminderCard />
          <JournalCard />

          <div className="rounded-[20px] border border-[#EAD9DE]
            bg-[#F8E8ED]/60 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#C2185B]">
                <Check size={17} />
              </div>
              <div>
                <h3 className="font-body text-sm font-semibold text-[#4B0D32]">
                  A space for kindness
                </h3>
                <p className="mt-2 font-body text-xs leading-6 text-[#766775]">
                  Different bodies and experiences deserve respect.
                  Share thoughtfully, protect your privacy, and remember
                  that everyone's journey is different.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer accent */}
      <div className="border-t border-[#EAD9DE] bg-[#FFFDFA]">
        <div className="mx-auto flex max-w-6xl items-center
          justify-center gap-3 px-5 py-7 text-center">
          <Heart size={13} className="text-[#C2185B]" />
          <p className="font-body text-xs tracking-wide text-[#766775]">
            A little more understanding, a little more kindness.
          </p>
          <Heart size={13} className="text-[#C2185B]" />
        </div>
      </div>
    </div>
  );
}
