import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from "react-router-dom";

const projects = [
  {
    slug: "superstore-profitability",
    number: "01",
    type: "Power BI · Sales analysis",
    title: "The discount trap",
    subtitle: "Superstore Americas · Product profitability",
    image: "/assets/superstore-profitability.png",
    imageAlt: "Power BI profitability dashboard with category and discount comparisons",
    summary:
      "A profitability review of product, category and discount performance—built to make loss-making patterns easier to spot.",
    finding: "$286,397",
    findingLabel: "total profit displayed in the supplied dashboard",
    proofPoints: [
      ["15.6%", "average discount"],
      ["17.65%", "products with negative margins"],
      ["Technology", "best category shown"],
      ["Furniture", "weakest category shown"],
    ],
    details:
      "The supplied dashboard reports $286,397 total profit, a 15.6% average discount, and negative margins for 17.65% of products. It labels Technology as the best category and Furniture as the weakest. The companion report examines the relationship between discounting and profitability.",
    tags: ["Power BI", "Excel", "Profitability"],
    link: "/assets/discount-trap-report.pdf",
    linkLabel: "Read the analysis",
    download: "/assets/superstore-analysis.xlsx",
    downloadLabel: "Source workbook",
  },
  {
    slug: "techmart-nigeria",
    number: "02",
    type: "Power BI · Regional summary",
    title: "TechMart Nigeria",
    subtitle: "A regional performance dashboard",
    image: "/assets/techmart-dashboard.png",
    imageAlt: "TechMart Nigeria regional summary dashboard",
    summary:
      "A single-page view of revenue, profit, store performance and customer totals across the supplied retail dashboard.",
    finding: "₦11.38M",
    findingLabel: "revenue displayed in the dashboard",
    proofPoints: [
      ["33.2%", "profit displayed"],
      ["50", "stores displayed"],
      ["5K", "customers displayed"],
    ],
    details:
      "The screenshot also displays a 33.2% profit figure, 50 stores and 5K customers. These are values shown in the supplied dashboard image; the portfolio does not infer a reporting period or additional business impact.",
    tags: ["Power BI", "DAX", "Excel"],
    link: "/assets/techmart-executive-report.pdf",
    linkLabel: "Read the executive report",
  },
  {
    slug: "oil-gas-dashboard",
    number: "03",
    type: "Sales dashboard · Petroleum",
    title: "Oil & Gas dashboard",
    subtitle: "Regional petroleum sales tracking",
    video: "/assets/oil-gas-dashboard.mp4",
    mediaLabel: "Oil and Gas sales dashboard walkthrough",
    summary:
      "Track petroleum sales across regions with interactive filters for region, product, and time period.",
    finding: "3",
    findingLabel: "filters described in the source: region, product, and time period",
    details:
      "The supplied project page describes a retail company that could not track petroleum sales across regions in real time. It says an interactive dashboard was built with filters for region, product, and time period. A local dashboard walkthrough is available below.",
    tags: ["Sales analysis", "Petroleum", "Dashboard"],
  },
  {
    slug: "employee-analytics",
    number: "04",
    type: "MySQL & Python · HR analytics",
    title: "Employee analytics",
    subtitle: "Attrition, salary & job satisfaction",
    video: "/assets/employee-analytics-demo.mp4",
    mediaLabel: "Employee analytics dashboard walkthrough",
    summary:
      "An employee analytics dashboard exploring attrition rate, salary, and job-satisfaction factors.",
    finding: "3",
    findingLabel: "analysis areas described in the supplied project page",
    proofPoints: [
      ["Attrition", "employee turnover"],
      ["Salary", "compensation"],
      ["Job satisfaction", "employee experience"],
    ],
    details:
      "The supplied project page describes a MySQL and Python dashboard for tracking attrition rate, salary, and job-satisfaction factors. A local demo recording is provided; no quantified business outcome is claimed here.",
    tags: ["MySQL", "Python", "HR analytics"],
  },
  {
    slug: "healthcare-data-model",
    number: "05",
    type: "SQL · Data modeling",
    title: "Healthcare data model",
    subtitle: "A relational schema for connected records",
    image: "/assets/healthcare-schema.png",
    imageAlt: "Relational database diagram connecting sales, customers, products and prescriptions",
    summary:
      "A relational schema exercise connecting operational records across customers, prescriptions, products, suppliers and sales.",
    finding: "7",
    findingLabel: "tables shown in the supplied schema diagram",
    proofPoints: [
      ["Category", "product classification"],
      ["Suppliers", "supplier records"],
      ["Products", "inventory details"],
      ["Prescriptions", "prescription records"],
      ["Sales", "transaction records"],
      ["Employees", "employee records"],
      ["Customers", "customer records"],
    ],
    details:
      "The supplied diagram includes category, supplier, product, prescription, sales, employee and customer tables. It is presented here as a data-modeling sample, not as a deployed healthcare system.",
    tags: ["SQL", "MySQL", "Data modeling"],
  },
];

const navigation = [
  { to: "/", label: "Overview", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? "↗" : "→"}</span>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="wordmark" to="/" onClick={() => setOpen(false)} aria-label="Promise Sunday, home">
        <span className="wordmark-mark">PS<span>.</span></span>
        <span className="wordmark-name">PROMISE SUNDAY<small>DATA ANALYST · NIGERIA</small></span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen(!open)}
      >
        <span>{open ? "Close" : "Menu"}</span><span className="menu-icon">{open ? "×" : "☰"}</span>
      </button>
      <nav id="primary-navigation" className={`primary-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
        <Link className="nav-cta" to="/contact" onClick={() => setOpen(false)}>Let&apos;s talk <Arrow diagonal /></Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <Link className="footer-signoff" to="/">Promise Sunday<span>.</span></Link>
      <span>Thoughtful analysis. Clearer decisions.</span>
      <a href="mailto:promisespeter@email.com">promisespeter@email.com <Arrow diagonal /></a>
      <span className="footer-year">© 2026</span>
    </footer>
  );
}

function SectionLabel({ index, children }) {
  return <div className="section-label"><span>{index}</span><span>{children}</span><i /></div>;
}

function ProjectCard({ project, featured = false }) {
  return (
    <article className={`project-card${featured ? " project-card-featured" : ""}`}>
      {project.video ? (
        <div className="project-image-link project-video-preview">
          <video controls playsInline preload="none" aria-label={project.mediaLabel}>
            <source src={project.video} type="video/mp4" />
            Your browser does not support this video.
          </video>
          <span className="image-index">{project.number} / {String(projects.length).padStart(2, "0")}</span>
        </div>
      ) : (
        <Link className="project-image-link" to={`/projects/${project.slug}`} aria-label={`View ${project.title} project`}>
          <img className="project-image" src={project.image} alt={project.imageAlt} loading="lazy" />
          <span className="image-index">{project.number} / {String(projects.length).padStart(2, "0")}</span>
          <span className="image-arrow"><Arrow diagonal /></span>
        </Link>
      )}
      <div className="project-card-meta"><span>{project.type}</span><span>{project.number}</span></div>
      <Link className="project-title-link" to={`/projects/${project.slug}`}><h3>{project.title}</h3></Link>
      <p className="project-subtitle">{project.subtitle}</p>
      <p className="project-summary">{project.summary}</p>
      <Link className="text-link" to={`/projects/${project.slug}`}>Explore project <Arrow /></Link>
    </article>
  );
}

const voiceIntroduction =
  "Hello, I’m Promise Sunday, a data analyst based in Nigeria. I help teams turn data into useful insights and clear dashboards. My projects explore profitability, retail performance, petroleum sales and employee analytics. I believe good data work should foster innovation, transparency and accountability. Explore my work to learn more.";

function supportsSpeech() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

function VoiceIntroduction() {
  const location = useLocation();
  const utteranceRef = useRef(null);
  const [status, setStatus] = useState(() => (supportsSpeech() ? "idle" : "unsupported"));

  useEffect(() => {
    setStatus((current) => (current === "speaking" ? "stopped" : current));
    return () => {
      utteranceRef.current = null;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [location.key]);

  function playIntroduction() {
    if (!supportsSpeech()) {
      setStatus("unsupported");
      return;
    }

    const synthesis = window.speechSynthesis;
    const utterance = new window.SpeechSynthesisUtterance(voiceIntroduction);
    utterance.lang = "en-NG";
    utterance.rate = 0.96;
    utteranceRef.current = utterance;
    utterance.onstart = () => {
      if (utteranceRef.current === utterance) setStatus("speaking");
    };
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setStatus("stopped");
      }
    };
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setStatus("unsupported");
      }
    };

    synthesis.cancel();
    setStatus("speaking");
    try {
      synthesis.speak(utterance);
    } catch {
      utteranceRef.current = null;
      setStatus("unsupported");
    }
  }

  function stopIntroduction() {
    utteranceRef.current = null;
    if (supportsSpeech()) window.speechSynthesis.cancel();
    setStatus("stopped");
  }

  const statusMessage = {
    idle: "Ready when you are.",
    speaking: "Promise is speaking.",
    stopped: "Introduction stopped. Play it again any time.",
    unsupported: "Voice playback isn’t available here; the full introduction is below.",
  }[status];

  return (
    <aside className="voice-note" aria-labelledby="voice-note-title">
      <div className="voice-note-heading">
        <span className="voice-kicker">MEET PROMISE <i /> VOICE INTRODUCTION</span>
        <span className="voice-mark" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <h2 id="voice-note-title">A little introduction</h2>
      <p className="voice-script">{voiceIntroduction}</p>
      <div className="voice-controls">
        <button
          className="voice-play"
          type="button"
          onClick={playIntroduction}
          disabled={status === "speaking" || status === "unsupported"}
          aria-label={status === "stopped" ? "Play the introduction again" : "Hear Promise’s introduction"}
        >
          <span aria-hidden="true">{status === "speaking" ? "Ⅱ" : "▶"}</span>
          {status === "speaking" ? "Speaking" : status === "stopped" ? "Play again" : "Hear my introduction"}
        </button>
        {status === "speaking" && (
          <button className="voice-stop" type="button" onClick={stopIntroduction}>
            Stop
          </button>
        )}
        <p className="voice-status" role="status" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </p>
      </div>
    </aside>
  );
}

function MessageTicker() {
  const values = (
    <>
      <span>INNOVATION</span><i>✳</i>
      <span>TRANSPARENCY</span><i>✳</i>
      <span>ACCOUNTABILITY</span><i>✳</i>
      <span>INSIGHT INTO IMPACT</span><i>✳</i>
    </>
  );

  return (
    <section className="message-strip" aria-label="Promise’s values">
      <p className="message-accessible">Innovation. Transparency. Accountability. Insight into impact.</p>
      <div className="message-window" aria-hidden="true">
        <div className="message-track">
          <div className="message-group">{values}</div>
          <div className="message-group">{values}</div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> OPEN TO COLLABORATION <span className="eyebrow-rule" /> BASED IN NIGERIA</p>
            <h1>Make the numbers<br />mean <em>something.</em></h1>
            <p className="hero-intro">I&apos;m Promise Sunday, a data analyst turning untidy information into useful stories, considered dashboards and clearer decisions.</p>
            <div className="hero-actions">
              <Link className="button button-lime" to="/projects">Explore selected work <Arrow diagonal /></Link>
              <Link className="button button-outline-light" to="/about">A little about me <Arrow /></Link>
            </div>
            <VoiceIntroduction />
            <div className="hero-footnote"><span>01 — {String(projects.length).padStart(2, "0")}</span><span>POWER BI · SQL · EXCEL · PYTHON</span></div>
          </div>
          <div className="hero-visual">
            <div className="portrait-frame">
              <img src="/assets/promise-sunday.jpg" alt="Promise Sunday, data analyst" />
              <span className="portrait-caption">PROMISE SUNDAY<br /><span>DATA ANALYST</span></span>
            </div>
            <div className="hero-stamp" aria-label="Turning data into decisions">
              <span>INSIGHT</span><span className="stamp-line" /><span>INTO</span><span>IMPACT<span className="stamp-star">✳</span></span>
            </div>
            <div className="hero-coordinate">06°27&apos; N &nbsp; 03°23&apos; E</div>
          </div>
          <div className="hero-index">PS / 2026</div>
        </section>

        <MessageTicker />

        <section className="proof-strip" aria-label="Focus and tools">
          <span>ANALYSIS WITH INTENTION</span><i />
          <span>POWER BI</span><span>SQL</span><span>EXCEL</span><span>PYTHON</span>
          <span className="proof-end">BUILT FOR CLARITY <Arrow diagonal /></span>
        </section>

        <section className="work-section section-pad">
          <div className="section-heading">
            <SectionLabel index="01">SELECTED WORK</SectionLabel>
            <div className="heading-row">
              <h2>Evidence, not<br /><em>just visuals.</em></h2>
              <p>Five projects that bring different questions to the same place: what does the data tell us, and what can we do with it?</p>
            </div>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => <ProjectCard project={project} featured={index === 0} key={project.slug} />)}
          </div>
          <div className="section-tail">
            <span>THE WORK IS THE PROOF</span>
            <Link className="text-link" to="/projects">All project notes <Arrow diagonal /></Link>
          </div>
        </section>

        <section className="statement-band">
          <SectionLabel index="02">HOW I THINK</SectionLabel>
          <p>Good analysis doesn&apos;t stop at <em>what happened.</em><br />It helps people decide <span>what happens next.</span></p>
          <Link to="/services" className="statement-link">See how I can help <Arrow diagonal /></Link>
          <div className="statement-orbit orbit-one" /><div className="statement-orbit orbit-two" />
        </section>

        <section className="process-section section-pad">
          <SectionLabel index="03">A PRACTICAL APPROACH</SectionLabel>
          <div className="process-layout">
            <h2>From messy<br />to <em>meaningful.</em></h2>
            <div className="process-list">
              {[
                ["01", "Understand the question", "Start with the decision someone needs to make—not the chart they asked for."],
                ["02", "Prepare the data", "Clean, shape and query the information with care, keeping assumptions visible."],
                ["03", "Make the story clear", "Build concise analysis and dashboards that make useful patterns easier to act on."],
              ].map(([num, title, text]) => (
                <div className="process-item" key={num}><span>{num}</span><div><h3>{title}</h3><p>{text}</p></div><Arrow diagonal /></div>
              ))}
            </div>
          </div>
        </section>

        <ContactBanner />
      </main>
    </>
  );
}

function Work() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Power BI", "SQL", "Python", "Dashboard"];
  const visible = projects.filter((project) => filter === "All" || project.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase())));
  return (
    <main className="page-main">
      <PageIntro number="01" eyebrow="PROJECTS" title={<>A closer look at<br /><em>the questions.</em></>} intro="Five analysis and modeling samples, with supporting sources close by and case notes grounded in the supplied materials." />
      <section className="work-list-section section-pad">
        <div className="filter-bar" role="group" aria-label="Filter projects by tool">
          <span>FILTER BY TOOL</span>
          {filters.map((item) => <button key={item} className={filter === item ? "filter-button is-selected" : "filter-button"} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}
          <span className="filter-count">{String(visible.length).padStart(2, "0")} PROJECTS</span>
        </div>
        {visible.length ? <div className="project-grid work-project-grid">{visible.map((project) => <ProjectCard project={project} key={project.slug} />)}</div> : (
          <div className="empty-state"><span>NO MATCHES</span><h2>Nothing in that filter yet.</h2><p>Try a different tool to see the current project samples.</p><button className="text-link" onClick={() => setFilter("All")}>Show all projects <Arrow /></button></div>
        )}
      </section>
      <section className="demo-section section-pad">
        <SectionLabel index="04">IN MOTION</SectionLabel>
        <div className="demo-heading"><h2>Dashboard<br /><em>walkthrough.</em></h2><p>A short screen recording from the supplied Power BI dashboard demo.</p></div>
        <div className="video-frame">
          <video controls playsInline preload="none" poster="/assets/superstore-profitability.png" aria-label="Power BI sales dashboard walkthrough">
            <source src="/assets/sales-dashboard.mp4" type="video/mp4" />
            Your browser does not support this video.
          </video>
          <span>POWER BI / SALES DASHBOARD</span>
        </div>
      </section>
      <ContactBanner />
    </main>
  );
}

function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <NotFound />;
  return (
    <main className="page-main">
      <section className="detail-hero">
        <Link to="/projects" className="back-link"><Arrow /> BACK TO PROJECTS</Link>
        <div className="detail-meta"><span>CASE NOTE {project.number}</span><span>{project.type}</span></div>
        <h1>{project.title}<br /><em>{project.subtitle}</em></h1>
      </section>
      <section className="detail-content section-pad">
        <div className="detail-image">
          {project.video ? (
            <video controls playsInline preload="metadata" aria-label={project.mediaLabel}>
              <source src={project.video} type="video/mp4" />
              Your browser does not support this video.
            </video>
          ) : <img src={project.image} alt={project.imageAlt} />}
        </div>
        <div className="detail-story">
          <div><span className="mini-label">THE QUESTION</span><p>{project.summary}</p></div>
          <div><span className="mini-label">WHAT THE SOURCE SHOWS</span><p>{project.details}</p></div>
          <div className="finding-panel">
            <span className="mini-label">AT A GLANCE</span>
            <strong>{project.finding}</strong>
            <p>{project.findingLabel}</p>
            {project.proofPoints && (
              <ul className="proof-point-list">
                {project.proofPoints.map(([value, label]) => (
                  <li key={`${value}-${label}`}><strong>{value}</strong><span>{label}</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="detail-links">
            {project.link && <a className="button button-dark" href={project.link} target="_blank" rel="noreferrer">{project.linkLabel} <Arrow diagonal /></a>}
            {project.download && <a className="text-link" href={project.download} download>{project.downloadLabel} <Arrow diagonal /></a>}
          </div>
        </div>
      </section>
      <section className="next-project section-pad">
        <span>KEEP EXPLORING</span><Link className="text-link" to="/projects">Back to all projects <Arrow diagonal /></Link>
      </section>
    </main>
  );
}

function PageIntro({ number, eyebrow, title, intro }) {
  return (
    <section className="page-intro">
      <SectionLabel index={number}>{eyebrow}</SectionLabel>
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
  );
}

function About() {
  const skills = ["Power BI", "SQL", "Microsoft Excel", "Python", "Google Sheets", "Data visualization", "Dashboard design"];
  return (
    <main className="page-main">
      <PageIntro number="02" eyebrow="ABOUT PROMISE" title={<>Curiosity, with<br /><em>a spreadsheet.</em></>} intro="I’m Promise Sunday, a Nigeria-based data analyst interested in making complex information feel clear, useful and human." />
      <section className="about-layout section-pad">
        <div className="about-portrait"><img src="/assets/promise-sunday.jpg" alt="Promise Sunday" /><span>THE PERSON BEHIND THE REPORT</span></div>
        <div className="about-copy">
          <SectionLabel index="01">A LITTLE CONTEXT</SectionLabel>
          <h2>Data has a way of telling on the <em>details.</em></h2>
          <p>I enjoy the whole process: asking a better question, cleaning up a noisy dataset, and shaping the answer into something a team can use.</p>
          <p>My work spans dashboards, data cleaning, SQL queries and business intelligence. I aim for clarity over complexity—and I keep the evidence close to the story.</p>
          <a className="text-link" href="/assets/promise-sunday-cv.pdf" target="_blank" rel="noreferrer">View my CV <Arrow diagonal /></a>
        </div>
      </section>
      <section className="skills-section section-pad">
        <SectionLabel index="02">TOOLS & PRACTICE</SectionLabel>
        <div className="skills-layout"><h2>The right tool<br />for the <em>question.</em></h2><div className="skills-cloud">{skills.map((skill, index) => <span key={skill}><i>0{index + 1}</i>{skill}</span>)}</div></div>
      </section>
      <section className="statement-band about-statement"><SectionLabel index="03">THE PRINCIPLE</SectionLabel><p>Make the complicated<br />feel <em>clear enough to use.</em></p><Link to="/projects" className="statement-link">See selected work <Arrow diagonal /></Link><div className="statement-orbit orbit-one" /><div className="statement-orbit orbit-two" /></section>
      <ContactBanner />
    </main>
  );
}

const services = [
  {
    n: "01", title: "Dashboard development", tag: "SEE THE SIGNAL",
    description: "Purposeful dashboards that help a team read performance without losing the detail behind it.",
    items: ["Sales and revenue reporting", "HR and KPI tracking", "Financial reports", "Data visualization"],
  },
  {
    n: "02", title: "Data cleaning & analysis", tag: "GET THE DATA READY",
    description: "A careful pass through the data: tidy up inconsistencies, query what matters, and make patterns easier to trust.",
    items: ["Excel and Python data cleaning", "SQL database queries", "Trend and pattern analysis", "Report automation"],
  },
  {
    n: "03", title: "Business intelligence", tag: "TURN INSIGHT INTO ACTION",
    description: "Useful analysis that connects customer and sales patterns back to real business questions.",
    items: ["Customer segmentation", "Sales forecasting", "Performance analytics", "Monthly data reports"],
  },
];

function Services() {
  return (
    <main className="page-main">
      <PageIntro number="03" eyebrow="WHAT I DO" title={<>Good data work<br />starts with <em>why.</em></>} intro="I help businesses make information easier to understand—through thoughtful analysis, practical dashboards and reporting." />
      <section className="services-list section-pad">
        <SectionLabel index="01">WAYS TO WORK TOGETHER</SectionLabel>
        {services.map((service) => (
          <article className="service-row" key={service.n}>
            <span className="service-number">{service.n}</span>
            <div className="service-main"><span className="mini-label">{service.tag}</span><h2>{service.title}</h2><p>{service.description}</p></div>
            <ul>{service.items.map((item) => <li key={item}><span>↳</span>{item}</li>)}</ul>
          </article>
        ))}
      </section>
      <ContactBanner />
    </main>
  );
}

function Contact() {
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (status) setStatus("");
  }
  function submit(event) {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name}\nReply to: ${form.email}`);
    window.location.href = `mailto:promisespeter@email.com?subject=${subject}&body=${body}`;
    setStatus("Your message is ready in your email app. If it didn’t open, email promisespeter@email.com directly.");
  }
  return (
    <main className="page-main">
      <PageIntro number="04" eyebrow="START A CONVERSATION" title={<>Have a question<br />worth <em>answering?</em></>} intro="Tell me a little about what you’re working on. I’m open to conversations about data, dashboards and project opportunities." />
      <section className="contact-layout section-pad">
        <div className="contact-aside"><SectionLabel index="01">GET IN TOUCH</SectionLabel><h2>Let&apos;s make<br />the next step<br /><em>clear.</em></h2><p>For a project enquiry or a simple hello, use the form or reach out directly.</p>
          <a href="mailto:promisespeter@email.com" className="contact-direct">promisespeter@email.com <Arrow diagonal /></a>
          <a href="https://github.com/promisespeter-ship-it/promise-sunday" className="contact-direct" target="_blank" rel="noreferrer">GITHUB <Arrow diagonal /></a>
          <a href="https://www.linkedin.com/in/promise-peter-8a453b3a6/" className="contact-direct" target="_blank" rel="noreferrer">LINKEDIN <Arrow diagonal /></a>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <label htmlFor="name">YOUR NAME<input id="name" name="name" value={form.name} onChange={update} placeholder="How should I address you?" autoComplete="name" required /></label>
          <label htmlFor="email">EMAIL ADDRESS<input id="email" type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required /></label>
          <label htmlFor="message">WHAT&apos;S ON YOUR MIND?<textarea id="message" name="message" value={form.message} onChange={update} placeholder="A little context helps me give you a useful reply." rows="5" required /></label>
          {status && <p className="form-status" role="status">{status}</p>}
          <button className="button button-dark" type="submit">Prepare an email <Arrow diagonal /></button>
          <p className="form-note">This form opens your email app; it doesn&apos;t send or store your message on this site.</p>
        </form>
      </section>
    </main>
  );
}

function ContactBanner() {
  return (
    <section className="contact-banner">
      <div><span>HAVE A GOOD QUESTION?</span><h2>Let&apos;s find<br /><em>the signal.</em></h2></div>
      <Link className="button button-lime" to="/contact">Start a conversation <Arrow diagonal /></Link>
      <div className="banner-cross">✳</div>
    </section>
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <span>404 / NOT FOUND</span><h1>This page got<br /><em>lost in the data.</em></h1><p>That link doesn&apos;t lead to a page in this portfolio.</p><Link className="button button-dark" to="/">Back to overview <Arrow /></Link>
    </main>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Work />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/work" element={<Navigate to="/projects" replace />} />
        <Route path="/work/:slug" element={<LegacyProjectRoute />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

function LegacyProjectRoute() {
  const { slug } = useParams();
  return <Navigate to={`/projects/${slug}`} replace />;
}
