import logo from "../assets/logo/heri-bloom-logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-cream mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <img src={logo} alt="Heri Bloom, The Ritual Box" className="h-24 w-auto mx-auto mb-4" />
        <p className="font-script text-2xl text-brand-dark">Small box. Big care.</p>
        <p className="font-body text-xs text-ink-soft/70 mt-6">
          &copy; {new Date().getFullYear()} Heri Bloom. All rights reserved.
        </p>
      </div>
    </footer>
  );
}