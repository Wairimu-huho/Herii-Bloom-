import { useEffect, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import cardBox from "../assets/products/box-card.webp";
import heroBox from "../assets/products/box-hero.webp";

const fallbackAbout = {
  eyebrow: "OUR STORY",
  title: "Care that sees the whole you.",
  intro: "Heri Bloom makes menstrual health feel more supported, more comfortable, and more like an everyday act of self-care.",
  storyHeading: "More than a monthly box",
  story: "We believe your period should never make you feel like an afterthought. Heri Bloom brings thoughtful essentials, comforting extras, and real support together in one considered ritual.",
  missionHeading: "Our mission",
  mission: "To make menstrual care easier to access and nicer to experience, while creating space for every person to feel seen, prepared, and cared for.",
  promiseHeading: "Our promise to you",
  promise: "Every box is chosen with comfort, dignity, and joy in mind—from the essentials you need to the small details that help you feel like yourself.",
  pillarOneTitle: "Comfort first",
  pillarOneText: "Thoughtful essentials chosen to help you feel prepared and at ease.",
  pillarTwoTitle: "Care with dignity",
  pillarTwoText: "A period-care experience that treats your needs as important, never an afterthought.",
  pillarThreeTitle: "Small joys",
  pillarThreeText: "Comforting extras that turn a necessary routine into a gentler ritual.",
  impactEyebrow: "CARE IN ACTION",
  impactNumber: "01",
  impactText: "For every season of your cycle, we are building a more thoughtful way to care.",
  founderHeading: "A note from Heri Bloom",
  founderNote: "Heri Bloom was created from a simple belief: care should feel personal. Thank you for making space for yourself here.",
  founderName: "The Heri Bloom team",
  ctaTitle: "Build a ritual that feels like you.",
  ctaText: "Choose your essentials, add a little comfort, and let Heri Bloom meet you where you are.",
};

function Divider() {
  return <div className="flex items-center justify-center gap-3 mt-6"><span className="w-12 h-px bg-hairline" /><Heart size={13} className="text-brand" fill="currentColor" /><span className="w-12 h-px bg-hairline" /></div>;
}

export default function About() {
  const [about, setAbout] = useState(fallbackAbout);
  useEffect(() => {
    api.get("/api/catalog/settings")
      .then(({ data }) => setAbout({ ...fallbackAbout, ...(data.about || {}) }))
      .catch(() => {});
  }, []);

  const pillars = [
    { number: "01", title: about.pillarOneTitle, text: about.pillarOneText },
    { number: "02", title: about.pillarTwoTitle, text: about.pillarTwoText },
    { number: "03", title: about.pillarThreeTitle, text: about.pillarThreeText },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#fdf7f8] text-ink">
      <section className="bg-blush-deep overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div className="relative z-10">
            <p className="font-body text-xs tracking-[0.24em] text-brand mb-5">{about.eyebrow}</p>
            <h1 className="font-display font-normal text-5xl sm:text-6xl md:text-7xl leading-[0.94] text-ink">{about.title}</h1>
            <Divider />
            <p className="font-body font-medium text-base sm:text-lg text-ink leading-8 mt-7 max-w-xl">{about.intro}</p>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -top-8 right-8 sm:right-16 text-brand/10 font-display text-[10rem] sm:text-[14rem] leading-none select-none">✿</div>
            <div className="relative w-full max-w-md h-[22rem] sm:h-[30rem] rounded-t-[10rem] rounded-b-[3rem] overflow-hidden border-[10px] border-cream shadow-2xl shadow-brand/10 bg-cream">
              <img src={heroBox} alt="Heri Bloom care box" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="font-body text-xs tracking-[0.24em] text-cream/60 mb-5">{about.missionHeading}</p>
          <blockquote className="font-display italic font-normal text-3xl sm:text-4xl md:text-5xl leading-tight">“{about.mission}”</blockquote>
          <Divider />
        </div>
      </section>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 items-center">
          <div className="rounded-[3rem] overflow-hidden bg-blush-deep aspect-[4/3] shadow-xl shadow-brand/10">
            <img src={cardBox} alt="Heri Bloom ritual box" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-body text-xs tracking-[0.24em] text-brand mb-4">THE HERI BLOOM APPROACH</p>
            <h2 className="font-display font-normal text-4xl sm:text-5xl leading-tight text-ink">{about.storyHeading}</h2>
            <p className="font-body font-medium text-sm sm:text-base text-ink leading-8 mt-6">{about.story}</p>
          </div>
        </section>

        <section className="mt-20 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-body text-xs tracking-[0.24em] text-brand mb-4">A GENTLER RITUAL</p>
            <h2 className="font-display font-normal text-4xl sm:text-5xl text-ink">{about.promiseHeading}</h2>
            <p className="font-body font-medium text-sm sm:text-base text-ink leading-8 mt-5">{about.promise}</p>
          </div>
          <div className="grid md:grid-cols-3 mt-12 border-y border-hairline">
            {pillars.map((pillar, index) => <article key={pillar.number} className={`py-8 sm:py-10 md:px-8 ${index > 0 ? "border-t md:border-t-0 md:border-l border-hairline" : ""}`}><p className="font-body text-xs tracking-[0.2em] text-brand mb-5">{pillar.number}</p><h3 className="font-display text-2xl sm:text-3xl text-ink">{pillar.title}</h3><p className="font-body font-medium text-sm text-ink leading-7 mt-4">{pillar.text}</p></article>)}
          </div>
        </section>

        <section className="mt-20 sm:mt-28 bg-blush-deep border border-hairline rounded-[2rem] px-6 py-10 sm:px-10 md:py-14 grid md:grid-cols-[0.35fr_1fr] gap-7 md:gap-12 items-center">
          <div><p className="font-body text-xs tracking-[0.24em] text-brand">{about.impactEyebrow}</p><p className="font-display text-7xl sm:text-8xl text-brand mt-3">{about.impactNumber}</p></div>
          <p className="font-display text-2xl sm:text-3xl md:text-4xl leading-tight text-ink">{about.impactText}</p>
        </section>

        <section className="mt-20 sm:mt-28 max-w-3xl mx-auto text-center">
          <p className="font-body text-xs tracking-[0.24em] text-brand mb-4">A PERSONAL NOTE</p>
          <h2 className="font-display font-normal text-4xl sm:text-5xl text-ink">{about.founderHeading}</h2>
          <p className="font-body font-medium text-base sm:text-lg text-ink leading-8 mt-6">{about.founderNote}</p>
          <p className="font-script text-3xl text-brand-dark mt-7">{about.founderName}</p>
        </section>

        <section className="mt-20 sm:mt-28 bg-ink text-cream rounded-[2rem] px-6 py-12 sm:px-10 md:py-16 text-center">
          <h2 className="font-display font-normal text-3xl sm:text-4xl">{about.ctaTitle}</h2>
          <p className="font-body font-medium text-sm sm:text-base text-cream/90 leading-7 max-w-2xl mx-auto mt-4">{about.ctaText}</p>
          <Link to="/shop#choose-box" className="inline-flex items-center gap-2 mt-8 rounded-full border border-cream/70 text-cream px-6 py-3 font-body font-semibold text-sm hover:bg-cream hover:text-ink transition-colors">Explore the boxes <ArrowRight size={16} /></Link>
        </section>
      </main>
    </div>
  );
}
