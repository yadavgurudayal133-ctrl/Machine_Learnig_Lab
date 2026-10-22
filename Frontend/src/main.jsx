import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrainCircuit, BookOpen, Code2, ClipboardCheck, ChartNoAxesCombined,
  CheckCircle2, Circle, Search, ChevronRight, Menu, X, Rocket, NotebookPen,
  Target, Lightbulb, ExternalLink, RefreshCw
} from "lucide-react";
import "./style.css";

const API = "http://127.0.0.1:8000";
const icons = [BookOpen, Code2, ClipboardCheck, ChartNoAxesCombined];

function App() {
  const [roadmap, setRoadmap] = useState([]);
  const [selected, setSelected] = useState("python");
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [stats, setStats] = useState({completed_phases:0,total_phases:8,quiz_attempts:0,quiz_accuracy_percent:0});
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  async function loadAll() {
    setBusy(true);
    setError("");
    try {
      const [r, s, q] = await Promise.all([
        fetch(`${API}/api/roadmap`), fetch(`${API}/api/stats`), fetch(`${API}/api/quiz`)
      ]);
      if (!r.ok || !s.ok || !q.ok) throw new Error("API response was not successful");
      setRoadmap(await r.json());
      setStats(await s.json());
      setQuiz(await q.json());
    } catch {
      setError("Backend se connect nahi ho pa raha. README ke steps se FastAPI start karo.");
    } finally {
      setBusy(false);
    }
  }

  async function loadLesson(id) {
    setSelected(id);
    setMobileNav(false);
    setQuizResult(null);
    try {
      const response = await fetch(`${API}/api/lessons/${id}`);
      if (!response.ok) throw new Error();
      setLesson(await response.json());
    } catch {
      setError("Lesson load nahi hua. Check karo ki backend run ho raha hai.");
    }
  }

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (roadmap.length) loadLesson(selected); }, [roadmap.length]);

  const filtered = useMemo(() => roadmap.map(p => ({
    ...p, topics: p.topics.filter(t => `${p.title} ${t}`.toLowerCase().includes(search.toLowerCase()))
  })).filter(p => p.topics.length || p.title.toLowerCase().includes(search.toLowerCase())), [roadmap, search]);

  async function toggleComplete() {
    if (!lesson) return;
    const phase = roadmap.find(p => p.id === selected);
    const completed = !phase?.completed;
    try {
      const response = await fetch(`${API}/api/progress/${selected}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({completed})
      });
      if (!response.ok) throw new Error();
      await loadAll();
    } catch {
      setError("Progress save nahi hua. Backend connection check karo.");
    }
  }

  async function submitQuiz() {
    if (!quizAnswer) return;
    try {
      const response = await fetch(`${API}/api/quiz`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({answer:quizAnswer})
      });
      const result = await response.json();
      setQuizResult(result);
      setStats(await (await fetch(`${API}/api/stats`)).json());
    } catch {
      setError("Quiz submit nahi hua. Backend connection check karo.");
    }
  }

  const activePhase = roadmap.find(p => p.id === selected);
  const complete = activePhase?.completed ?? false;
  const progress = stats.total_phases ? Math.round(stats.completed_phases / stats.total_phases * 100) : 0;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><BrainCircuit size={24}/></div>
        <div><strong>ML Learning Lab</strong><small>PERSONAL CLASSROOM</small></div>
        <button className="icon-button close-nav" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={20}/></button>
      </div>
      <div className="side-label">YOUR WORKSPACE</div>
      <button className="nav-item active"><ChartNoAxesCombined size={18}/> Learning dashboard</button>
      <button className="nav-item" onClick={() => document.getElementById("quiz-section")?.scrollIntoView({behavior:"smooth"})}><ClipboardCheck size={18}/> Quiz & revision</button>
      <button className="nav-item" onClick={() => document.getElementById("notebooks")?.scrollIntoView({behavior:"smooth"})}><NotebookPen size={18}/> Notebook projects</button>
      <div className="side-label roadmap-label">LEARNING ROADMAP</div>
      <label className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics..."/></label>
      <nav className="roadmap-nav">
        {filtered.map((p) => <div className="phase-group" key={p.id}>
          <div className="phase-title"><span>{String(p.phase).padStart(2,"0")}</span>{p.title}</div>
          {p.topics.map((t,i)=><button key={t} className={`topic-link ${selected===p.id && i===0?"topic-selected":""}`} onClick={()=>loadLesson(p.id)}><span className="topic-dot">{p.completed?<CheckCircle2 size={14}/>:<Circle size={14}/>}</span><span>{t}</span></button>)}
        </div>)}
      </nav>
      <div className="sidebar-footer"><div className="avatar">GD</div><div><strong>My Learning Space</strong><small>Local development mode</small></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-button menu-button" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={21}/></button>
        <div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>Dashboard</strong></div>
        <button className="refresh-button" onClick={loadAll}><RefreshCw size={15}/> Refresh</button>
      </header>
      <div className="page-content">
        <section className="welcome-row">
          <div><div className="eyebrow"><span className="green-dot"/> YOUR JOURNEY STARTS HERE</div><h1>Build your ML skills,<br/><span>one concept at a time.</span></h1><p>Learn the idea. Write the code. Test your understanding. Build something real.</p></div>
          <div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="brain-core"><BrainCircuit size={58}/></div><span className="float-chip chip-a">Python</span><span className="float-chip chip-b">ML</span><span className="float-chip chip-c">AI</span></div>
        </section>

        {error && <div className="error-banner">{error}<button onClick={()=>setError("")}>Dismiss</button></div>}
        <section className="stats-grid">
          <StatCard icon={<BookOpen/>} label="Phases completed" value={`${stats.completed_phases}/${stats.total_phases}`} note="Mark a phase complete after study" color="blue"/>
          <StatCard icon={<Target/>} label="Roadmap progress" value={`${progress}%`} note="Your learning milestones" color="green"/>
          <StatCard icon={<ClipboardCheck/>} label="Quiz attempts" value={stats.quiz_attempts} note={`${stats.quiz_accuracy_percent}% correct overall`} color="orange"/>
        </section>

        <div className="section-heading"><div><div className="eyebrow">CONTINUE LEARNING</div><h2>Your learning path</h2></div><span className="subtle-label">8 structured phases</span></div>
        <section className="phase-cards">
          {roadmap.map((p) => <button className={`phase-card ${selected===p.id?"phase-card-active":""}`} key={p.id} onClick={()=>loadLesson(p.id)}>
            <div className="phase-card-top"><span className="phase-number">{String(p.phase).padStart(2,"0")}</span>{p.completed?<CheckCircle2 className="done-icon" size={19}/>:<Circle className="pending-icon" size={19}/>}</div>
            <h3>{p.title}</h3><p>{p.topics.slice(0,3).join(" · ")}</p><div className="phase-card-bottom"><span>{p.level}</span><ChevronRight size={17}/></div>
          </button>)}
        </section>

        <section className="lesson-layout">
          <article className="panel lesson-panel">
            <div className="panel-heading"><div className="panel-icon purple"><BookOpen size={19}/></div><div><div className="eyebrow">LESSON ROOM</div><h2>{lesson?.title || "Choose a lesson"}</h2></div></div>
            {busy && <p className="muted">Loading learning content…</p>}
            {!busy && lesson && <>
              <p className="lesson-explanation">{lesson.explanation}</p>
              <div className="content-label"><Lightbulb size={16}/> Understand the concept</div>
              <div className="concept-box"><strong>Study workflow</strong><p>1. Read the explanation. 2. Predict what the code will do. 3. Run it in Jupyter or Colab. 4. Change one thing and observe the result.</p></div>
              <div className="content-label"><Code2 size={16}/> Code example</div>
              <pre className="code-block"><code>{lesson.code.replaceAll("\\n","\n")}</code><button onClick={()=>navigator.clipboard?.writeText(lesson.code.replaceAll("\\n","\n"))}>Copy code</button></pre>
              <div className="task-box"><span className="task-icon"><Target size={17}/></span><div><strong>Try it yourself</strong><p>{lesson.task}</p></div></div>
              <button className={`primary-button ${complete?"completed-button":""}`} onClick={toggleComplete}>{complete?<CheckCircle2 size={17}/>:<CheckCircle2 size={17}/>} {complete?"Mark as not complete":"Mark phase complete"}</button>
              <p className="tiny-note">Tip: mark a phase complete only after you have studied and practised its topics.</p>
            </>}
          </article>

          <aside className="right-column">
            <section className="panel quiz-panel" id="quiz-section">
              <div className="panel-heading"><div className="panel-icon orange"><ClipboardCheck size={19}/></div><div><div className="eyebrow">QUICK CHECK</div><h2>Test your understanding</h2></div></div>
              {quiz ? <><p className="quiz-question">{quiz.question}</p><div className="quiz-options">{quiz.options.map(o=><label key={o.id} className={`quiz-option ${quizAnswer===o.id?"option-selected":""}`}><input type="radio" name="quiz" value={o.id} checked={quizAnswer===o.id} onChange={()=>{setQuizAnswer(o.id);setQuizResult(null)}}/><span className="option-letter">{o.id.toUpperCase()}</span><span>{o.text}</span></label>)}</div><button className="primary-button full-button" disabled={!quizAnswer} onClick={submitQuiz}>Check answer <ChevronRight size={16}/></button>{quizResult && <div className={`quiz-feedback ${quizResult.correct?"feedback-correct":"feedback-wrong"}`}><strong>{quizResult.correct?"Correct! Nice work.":"Not quite — review the concept."}</strong><p>{quizResult.explanation}</p></div>}</> : <p className="muted">Loading quiz…</p>}
            </section>
            <section className="panel notebook-panel" id="notebooks">
              <div className="panel-heading"><div className="panel-icon green"><NotebookPen size={19}/></div><div><div className="eyebrow">HANDS-ON WORK</div><h2>Notebook projects</h2></div></div>
              <p className="muted">Run full experiments in a notebook environment.</p>
              <a className="resource-link" href="https://colab.research.google.com/" target="_blank" rel="noreferrer"><span className="resource-logo">Co</span><span><strong>Google Colab</strong><small>Run Python in your browser</small></span><ExternalLink size={16}/></a>
              <a className="resource-link" href="https://jupyter.org/try" target="_blank" rel="noreferrer"><span className="resource-logo jupyter">J</span><span><strong>Jupyter</strong><small>Notebook environment</small></span><ExternalLink size={16}/></a>
              <div className="project-tip"><Rocket size={17}/><span>First project idea: explore a small CSV dataset with Pandas, charts and missing-value checks.</span></div>
            </section>
          </aside>
        </section>
        <footer>ML Learning Lab <span>·</span> Built for consistent practice, not just passive reading.</footer>
      </div>
    </main>
  </div>;
}

function StatCard({icon,label,value,note,color}) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

createRoot(document.getElementById("root")).render(<App/>);
