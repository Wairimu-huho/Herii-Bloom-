import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import lotus from "../assets/logo/lotus-mark.png";

const inputClass =
  "w-full rounded-xl border border-hairline bg-cream px-4 py-3 font-body text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.name?.split(" ")[0]}`);
      navigate(data.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not log you in, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="relative max-w-md mx-auto px-6 py-16">
        <div className="bg-cream border border-hairline rounded-2xl p-8">
          <img src={lotus} alt="" className="h-14 w-auto mx-auto mb-3" />
          <h1 className="font-display font-bold text-3xl text-ink text-center mb-1">Welcome back</h1>
          <p className="font-body text-sm text-ink-soft text-center mb-8">Log in to manage your ritual box.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              className={inputClass}
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className={inputClass}
              placeholder="Password"
              aria-label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-dark disabled:bg-brand/50 text-cream font-body font-medium px-6 py-3.5 rounded-full transition-colors mt-2"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="font-body text-sm text-ink-soft text-center mt-6">
            New to Heri Bloom?{" "}
            <Link to="/register" state={{ from }} className="text-brand font-medium hover:text-brand-dark">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
