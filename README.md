# DevOpsHub AI

A free, static, all-in-one DevOps platform — generators, references, troubleshooting, interview prep, resume builder, and an AI assistant. Built with HTML, CSS, vanilla JavaScript, Three.js (3D background), and GSAP (animations). No build step. No backend. No database.

## ✅ What's real vs simulated

- **Real & fully functional:** Docker/Dockerfile/K8s/Terraform/Ansible/CI-CD generators, Linux command finder, troubleshooting database, interview question bank, resume builder (print-to-PDF), AI Assistant (calls Claude API live).
- **Real interactive command trainers (NEW):** Linux Terminal Lab, Git Command Trainer, Docker & Kubernetes Trainer — each maintains genuine in-memory state (a virtual filesystem, a commit/branch graph, a container/pod list) that updates correctly as you type real commands. These are not scripted animations — the state machine actually works, the same way a real shell would respond, just without a real OS/Docker daemon/cluster underneath.
- **Simulated for demo purposes:** the Monitoring Dashboard generates random numbers client-side — it is not connected to real infrastructure.
- **Not included** (would require a paid backend + database, incompatible with free GitHub Pages): user accounts/login, saved templates, bookmarks, community forum, a real Docker/Kubernetes engine.

## 📁 Project structure

```
devopshub-ai/
├── index.html              ← homepage (3D hero, labs showcase, features, roadmap preview)
├── css/style.css            ← all styling
├── js/
│   ├── webgl-bg.js          ← Three.js 3D background
│   ├── main.js              ← nav, scroll reveal, terminal typer, GSAP hooks
│   └── terminal-widget.js   ← reusable interactive terminal UI (history, arrow-keys)
├── data/
│   ├── linux-commands.js    ← Linux command finder database
│   ├── linux-vfs.js         ← virtual filesystem + Linux command engine
│   ├── git-sim.js           ← Git repo state machine (commits/branches/merge)
│   ├── docker-k8s-sim.js    ← Docker + kubectl command engines
│   ├── troubleshoot.js
│   └── tools-data.js        ← tools directory, interview Qs, roadmap nodes
└── pages/
    ├── labs.html            ← hub page linking the 3 interactive labs
    ├── linux-lab.html       ← Linux Terminal Lab
    ├── git-lab.html         ← Git Command Trainer (with live branch graph)
    ├── container-lab.html   ← Docker & Kubernetes Trainer (tabbed)
    ├── generators.html      ← Docker/K8s/CI-CD/Terraform/Ansible generators
    ├── tools.html           ← tools directory + Linux command finder
    ├── troubleshoot.html    ← troubleshooting center
    ├── roadmap.html         ← interactive roadmap
    ├── dashboard.html       ← simulated monitoring dashboard
    ├── interview.html       ← interview prep
    ├── resume.html          ← resume builder
    ├── assistant.html       ← AI chat assistant
    ├── help.html
    └── about.html
```

---

## 🚀 Deploying to GitHub Pages — step by step

### 1. Create a GitHub account (skip if you have one)
Go to [github.com](https://github.com) → Sign up.

### 2. Create a new repository
1. Click the **+** icon top-right → **New repository**
2. Repository name: `devopshub-ai` (or anything you like)
3. Set to **Public**
4. Do **not** initialize with a README (we already have files)
5. Click **Create repository**

### 3. Upload your files
**Option A — Web UI (easiest, no terminal needed):**
1. On your new repo page, click **uploading an existing file**
2. Drag the entire contents of the `devopshub-ai` folder (not the folder itself — its *contents*: `index.html`, `css/`, `js/`, `data/`, `pages/`) into the upload box
3. Scroll down, click **Commit changes**

**Option B — Git command line:**
```bash
cd devopshub-ai
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/devopshub-ai.git
git push -u origin main
```

### 4. Enable GitHub Pages
1. In your repo, click **Settings** (top menu)
2. In the left sidebar, click **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)` → click **Save**
5. Wait ~1–2 minutes. Refresh the page — you'll see a green box with your live URL:
   `https://YOUR-USERNAME.github.io/devopshub-ai/`

### 5. Visit your live site
Open the URL above. Your full site — 3D background, all generators, everything — is now live and free, forever, with no server costs.

---

## 🔁 Making future updates

**Web UI:** Open the file in GitHub → click the pencil (✏️) icon → edit → **Commit changes**. Pages auto-redeploys in ~1 minute.

**Git CLI:**
```bash
git add .
git commit -m "Update homepage copy"
git push
```

---

## 🤖 About the AI Assistant page

`pages/assistant.html` calls `https://api.anthropic.com/v1/messages` directly from the browser. This works in this preview environment because the request is routed through a proxy that injects credentials automatically.

**Once deployed to your own GitHub Pages site, this call will fail** (CORS + no API key) unless you do one of the following:
- **Easiest:** swap in any free client-side chatbot widget, or simply remove/hide the assistant page and link out to claude.ai instead.
- **Proper fix:** stand up a tiny serverless function (e.g. a free Cloudflare Worker or Vercel Edge Function) that holds your real Anthropic API key server-side and proxies the request — then point the `fetch()` in `assistant.html` at that endpoint instead of Anthropic directly. This keeps your key secret (never put a real API key in client-side code on a public repo).

Every other page/tool on the site has zero dependency on this and will work perfectly on GitHub Pages immediately.

---

## 🎨 Customizing

- **Colors:** edit the CSS variables at the top of `css/style.css` (`--cyan`, `--violet`, `--amber`, etc.)
- **Content:** tool descriptions, interview questions, troubleshooting entries, and roadmap nodes all live in `data/*.js` as plain JS arrays/objects — edit directly, no build step needed.
- **3D background:** tune particle count, colors, and shapes in `js/webgl-bg.js`.

## 📄 License / attribution
Independent educational project. Not affiliated with Docker Inc., CNCF, AWS, or other trademark holders referenced on the site.
