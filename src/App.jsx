import { useEffect, useMemo, useState } from "react";

const emptyResume = {
  name: "", email: "", phone: "", location: "", headline: "",
  objective: "", college: "", degree: "", graduation: "", cgpa: "",
  skills: "", github: "", linkedin: "", website: "", photo: "",
  projects: [{ title: "", description: "", technologies: "", link: "" }],
  experience: [{ role: "", company: "", duration: "", description: "" }],
  certifications: [{ name: "", issuer: "", year: "" }],
  achievements: "", languages: "", interests: ""
};

const API = "http://localhost:5000/api";

function App() {
  const [resume, setResume] = useState(emptyResume);
  const [saved, setSaved] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const completion = useMemo(() => {
    const fields = ["name", "email", "phone", "objective", "college", "degree", "skills"];
    return Math.round(fields.filter((key) => String(resume[key] || "").trim()).length / fields.length * 100);
  }, [resume]);

  const setField = (key, value) => setResume((old) => ({ ...old, [key]: value }));
  const setEntry = (section, index, key, value) => {
    setResume((old) => ({
      ...old,
      [section]: old[section].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };
  const addEntry = (section, blank) => setResume((old) => ({ ...old, [section]: [...old[section], blank] }));
  const removeEntry = (section, index) => setResume((old) => ({
    ...old, [section]: old[section].filter((_, i) => i !== index)
  }));

  async function loadSaved() {
    try {
      const response = await fetch(`${API}/resumes`);
      if (!response.ok) throw new Error("API unavailable");
      setSaved(await response.json());
    } catch {
      setMessage("Backend not connected yet. Start MongoDB and the server to save resumes.");
    }
  }

  useEffect(() => { loadSaved(); }, []);

  async function saveResume() {
    if (!resume.name.trim()) {
      setMessage("Please enter your full name before saving.");
      setActiveTab("personal");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(resumeId ? `${API}/resumes/${resumeId}` : `${API}/resumes`, {
        method: resumeId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resume)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save failed");
      setResumeId(data._id || resumeId);
      setMessage("Your resume has been saved to MongoDB.");
      await loadSaved();
    } catch (error) {
      setMessage(`Could not save: ${error.message}. Check that MongoDB and the backend are running.`);
    } finally {
      setBusy(false);
    }
  }

  function startNew() {
    setResume(emptyResume);
    setResumeId("");
    setMessage("Started a new resume.");
    setActiveTab("personal");
  }

  function openSaved(item) {
    const { _id, ...data } = item;
    setResume({ ...emptyResume, ...data });
    setResumeId(_id);
    setMessage(`Editing ${item.name || "saved resume"}.`);
    setActiveTab("personal");
    document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
  }

  async function deleteSaved(id) {
    if (!window.confirm("Delete this saved resume?")) return;
    try {
      const response = await fetch(`${API}/resumes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      if (resumeId === id) startNew();
      setMessage("Resume deleted.");
      await loadSaved();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function uploadPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setField("photo", reader.result);
    reader.readAsDataURL(file);
  }

  const tabs = [
    ["personal", "Personal"],
    ["education", "Education"],
    ["projects", "Projects"],
    ["experience", "Experience"],
    ["extras", "Skills & extras"]
  ];

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="#home">Resume<span>Craft.</span></a>
        <nav><a href="#home">Home</a><a href="#features">Features</a><a href="#builder">Builder</a></nav>
        <a className="nav-cta" href="#builder">Create resume <span>↗</span></a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="spark">✦</span> YOUR CAREER STARTS HERE</div>
            <h1>Make your first impression <em>unforgettable.</em></h1>
            <p className="hero-text">Build a polished, professional resume and showcase your potential with one simple workspace.</p>
            <div className="hero-actions">
              <a className="primary-btn" href="#builder">Build my resume <span>↗</span></a>
              <a className="text-link" href="#features">Explore features ↓</a>
            </div>
            <div className="hero-proof"><span className="proof-dot"></span> Designed for students and fresh graduates</div>
          </div>
          <div className="hero-art" aria-label="Resume preview illustration">
            <div className="orb orb-one"></div><div className="orb orb-two"></div>
            <div className="floating-note note-top">✧ Your next chapter</div>
            <div className="mock-resume">
              <div className="mock-head"><div className="mock-avatar">S</div><div><b>YOUR NAME</b><small>STUDENT · DEVELOPER</small></div></div>
              <div className="mock-rule"></div><div className="mock-label">PROFILE</div>
              <div className="mock-line long"></div><div className="mock-line"></div>
              <div className="mock-label">EDUCATION</div><div className="mock-line long"></div><div className="mock-line short"></div>
              <div className="mock-label">SELECTED PROJECTS</div><div className="mock-project"><i></i><span></span></div><div className="mock-project"><i></i><span></span></div>
              <div className="mock-skills"><span>HTML</span><span>JAVA</span><span>DESIGN</span></div>
            </div>
            <div className="floating-note note-bottom">✦ Ready to grow</div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-intro"><span className="eyebrow">EVERYTHING IN ONE PLACE</span><h2>Your story, <em>beautifully presented.</em></h2><p>All the essentials to move from student to standout candidate.</p></div>
          <div className="feature-grid">
            <article className="feature-card"><div className="feature-icon">✧</div><h3>Professional profile</h3><p>Bring your contact details, summary and online presence together.</p></article>
            <article className="feature-card"><div className="feature-icon">▤</div><h3>Education & skills</h3><p>Show your academic background and strengths clearly.</p></article>
            <article className="feature-card"><div className="feature-icon">◇</div><h3>Projects & experience</h3><p>Highlight the work that demonstrates what you can do.</p></article>
            <article className="feature-card"><div className="feature-icon">↓</div><h3>Save & print</h3><p>Store your resumes in MongoDB and print a clean PDF.</p></article>
          </div>
        </section>

        <section className="builder-section" id="builder">
          <div className="section-intro"><span className="eyebrow">LET'S GET STARTED</span><h2>Build your <em>next opportunity.</em></h2><p>Complete your details and see your resume take shape instantly.</p></div>
          <div className="builder-layout">
            <section className="editor-panel">
              <div className="editor-title"><div><span className="eyebrow">RESUME EDITOR</span><h2>Your information</h2></div><button className="ghost-btn" onClick={startNew}>＋ New</button></div>
              <div className="tabs">{tabs.map(([id, label]) => <button key={id} className={activeTab === id ? "tab active" : "tab"} onClick={() => setActiveTab(id)}>{label}</button>)}</div>

              {activeTab === "personal" && <div className="form-content">
                <h3>Personal information</h3>
                <div className="photo-upload">{resume.photo ? <img src={resume.photo} alt="Profile" /> : <div className="photo-placeholder">＋</div>}<label className="upload-label">Add profile photo <small>Optional · JPG or PNG, max 2 MB</small><input type="file" accept="image/*" onChange={(e) => uploadPhoto(e.target.files?.[0])} /></label></div>
                <div className="field-grid">
                  <Field label="Full name" value={resume.name} onChange={(v) => setField("name", v)} placeholder="e.g. Alex Johnson" />
                  <Field label="Professional headline" value={resume.headline} onChange={(v) => setField("headline", v)} placeholder="e.g. Computer Science Student" />
                  <Field label="Email" value={resume.email} onChange={(v) => setField("email", v)} placeholder="you@example.com" type="email" />
                  <Field label="Phone" value={resume.phone} onChange={(v) => setField("phone", v)} placeholder="+91 98765 43210" />
                  <Field label="City / Location" value={resume.location} onChange={(v) => setField("location", v)} placeholder="Coimbatore, India" />
                  <Field label="Portfolio URL" value={resume.website} onChange={(v) => setField("website", v)} placeholder="https://yourportfolio.com" />
                </div>
                <label className="field-label">Professional summary / career objective<textarea value={resume.objective} onChange={(e) => setField("objective", e.target.value)} placeholder="Write 2–3 sentences about your interests, strengths and career goals." rows="4" /></label>
                <div className="field-grid"><Field label="GitHub URL" value={resume.github} onChange={(v) => setField("github", v)} placeholder="https://github.com/username" /><Field label="LinkedIn URL" value={resume.linkedin} onChange={(v) => setField("linkedin", v)} placeholder="https://linkedin.com/in/username" /></div>
              </div>}

              {activeTab === "education" && <div className="form-content"><h3>Education</h3><p className="hint">Add your latest qualification first.</p>
                <div className="field-grid"><Field label="College / University" value={resume.college} onChange={(v) => setField("college", v)} placeholder="Institution name" /><Field label="Degree / Department" value={resume.degree} onChange={(v) => setField("degree", v)} placeholder="B.Tech Computer Science" /><Field label="Graduation year" value={resume.graduation} onChange={(v) => setField("graduation", v)} placeholder="2027" /><Field label="CGPA / Percentage" value={resume.cgpa} onChange={(v) => setField("cgpa", v)} placeholder="8.2 CGPA" /></div></div>}

              {activeTab === "projects" && <div className="form-content"><div className="section-row"><div><h3>Projects</h3><p className="hint">Show what you have built and what you learned.</p></div><button className="small-add" onClick={() => addEntry("projects", { title: "", description: "", technologies: "", link: "" })}>＋ Add project</button></div>
                {resume.projects.map((item, i) => <div className="entry-card" key={i}><div className="entry-heading"><b>Project {i + 1}</b>{resume.projects.length > 1 && <button className="remove-btn" onClick={() => removeEntry("projects", i)}>Remove</button>}</div><Field label="Project title" value={item.title} onChange={(v) => setEntry("projects", i, "title", v)} placeholder="Project name" /><label className="field-label">Description<textarea value={item.description} onChange={(e) => setEntry("projects", i, "description", e.target.value)} rows="3" placeholder="What problem does it solve? What did you build?" /></label><Field label="Technologies used" value={item.technologies} onChange={(v) => setEntry("projects", i, "technologies", v)} placeholder="React, Node.js, MongoDB" /><Field label="Project URL" value={item.link} onChange={(v) => setEntry("projects", i, "link", v)} placeholder="GitHub or live demo URL" /></div>)}</div>}

              {activeTab === "experience" && <div className="form-content"><div className="section-row"><div><h3>Internship & experience</h3><p className="hint">Include internships, part-time roles or volunteering.</p></div><button className="small-add" onClick={() => addEntry("experience", { role: "", company: "", duration: "", description: "" })}>＋ Add experience</button></div>
                {resume.experience.map((item, i) => <div className="entry-card" key={i}><div className="entry-heading"><b>Experience {i + 1}</b>{resume.experience.length > 1 && <button className="remove-btn" onClick={() => removeEntry("experience", i)}>Remove</button>}</div><Field label="Role / Position" value={item.role} onChange={(v) => setEntry("experience", i, "role", v)} placeholder="Web development intern" /><Field label="Company / Organization" value={item.company} onChange={(v) => setEntry("experience", i, "company", v)} placeholder="Company name" /><Field label="Duration" value={item.duration} onChange={(v) => setEntry("experience", i, "duration", v)} placeholder="June 2026 – August 2026" /><label className="field-label">Responsibilities<textarea value={item.description} onChange={(e) => setEntry("experience", i, "description", e.target.value)} rows="3" placeholder="Describe your contribution and impact." /></label></div>)}</div>}

              {activeTab === "extras" && <div className="form-content"><h3>Skills & additional information</h3><label className="field-label">Technical skills<textarea value={resume.skills} onChange={(e) => setField("skills", e.target.value)} rows="3" placeholder="Java, Python, HTML, CSS, SQL" /></label><label className="field-label">Languages<textarea value={resume.languages} onChange={(e) => setField("languages", e.target.value)} rows="2" placeholder="English, Tamil" /></label><label className="field-label">Achievements<textarea value={resume.achievements} onChange={(e) => setField("achievements", e.target.value)} rows="3" placeholder="Awards, hackathons, scholarships..." /></label><label className="field-label">Certifications<textarea value={resume.certifications.map(c => [c.name, c.issuer, c.year].filter(Boolean).join(" — ")).join("\n")} onChange={(e) => setResume(old => ({ ...old, certifications: e.target.value.split("\n").filter(Boolean).map(line => ({ name: line, issuer: "", year: "" })) }))} rows="3" placeholder="NPTEL course certificate&#10;Web development workshop" /></label><label className="field-label">Interests<textarea value={resume.interests} onChange={(e) => setField("interests", e.target.value)} rows="2" placeholder="Web development, UI design, problem solving" /></label></div>}

              <div className="editor-footer"><button className="primary-btn save-btn" onClick={saveResume} disabled={busy}>{busy ? "Saving..." : resumeId ? "Update saved resume" : "Save resume to MongoDB"} <span>↗</span></button><button className="ghost-btn" onClick={() => window.print()}>Print / Save PDF</button></div>
              {message && <p className="status-message" role="status">{message}</p>}
            </section>

            <aside className="preview-column">
              <div className="preview-top"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Your resume</h2></div><span className="live-pill"><i></i> Live</span></div>
              <article className="resume-paper">
                <div className="resume-header">
                  {resume.photo && <img className="resume-photo" src={resume.photo} alt="" />}
                  <div><h1>{resume.name || "Your Name"}</h1><p className="resume-headline">{resume.headline || "Student · Aspiring Professional"}</p><p className="resume-contact">{[resume.email, resume.phone, resume.location].filter(Boolean).join("  ·  ")}</p>
                  <p className="resume-links">{[resume.github, resume.linkedin, resume.website].filter(Boolean).join("  |  ")}</p></div>
                </div>
                <ResumeSection title="Profile">{resume.objective || "Your professional summary will appear here."}</ResumeSection>
                <ResumeSection title="Education"><b>{resume.degree || "Degree / Department"}</b><p>{resume.college || "College / University"}</p><p>{[resume.graduation && `Graduation: ${resume.graduation}`, resume.cgpa && `CGPA: ${resume.cgpa}`].filter(Boolean).join("  ·  ")}</p></ResumeSection>
                <ResumeSection title="Technical skills">{resume.skills || "Your skills will appear here."}</ResumeSection>
                {resume.projects.some(p => p.title || p.description) && <ResumeSection title="Projects">{resume.projects.filter(p => p.title || p.description).map((p, i) => <div className="resume-entry" key={i}><b>{p.title}</b><p>{p.description}</p><small>{p.technologies}</small></div>)}</ResumeSection>}
                {resume.experience.some(x => x.role || x.company) && <ResumeSection title="Experience">{resume.experience.filter(x => x.role || x.company).map((x, i) => <div className="resume-entry" key={i}><b>{x.role} {x.company && `— ${x.company}`}</b><p>{x.duration}</p><p>{x.description}</p></div>)}</ResumeSection>}
                {resume.certifications.length > 0 && <ResumeSection title="Certifications">{resume.certifications.map((c, i) => c.name && <p key={i}>{c.name}</p>)}</ResumeSection>}
                {resume.achievements && <ResumeSection title="Achievements">{resume.achievements}</ResumeSection>}
                {resume.languages && <ResumeSection title="Languages">{resume.languages}</ResumeSection>}
                {resume.interests && <ResumeSection title="Interests">{resume.interests}</ResumeSection>}
              </article>
              <div className="saved-panel"><div className="saved-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h3>Saved resumes</h3></div><button className="refresh-btn" onClick={loadSaved}>↻ Refresh</button></div>
                {saved.length === 0 ? <p className="hint">Your saved resumes will appear here after MongoDB is connected.</p> : saved.map((item) => <div className="saved-item" key={item._id}><button className="saved-name" onClick={() => openSaved(item)}>{item.name || "Untitled resume"}<small>{item.degree || "Student profile"}</small></button><button className="remove-btn" onClick={() => deleteSaved(item._id)}>Delete</button></div>)}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <footer className="footer"><a className="brand" href="#home">Resume<span>Craft.</span></a><p>Build your future. One profile at a time.</p><small>© 2026 ResumeCraft · Student Resume Builder</small></footer>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return <label className="field-label">{label}<input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}
function ResumeSection({ title, children }) {
  return <section className="resume-section"><h3>{title}</h3><div>{children}</div></section>;
}

export default App;
