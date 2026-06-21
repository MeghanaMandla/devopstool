// ============================================================
// Git Repository Simulator
// Real state machine: commits, branches, HEAD, staging area.
// Not an animation — actual graph data structure you can query.
// ============================================================

function createGitRepo() {
  let commits = {};       // hash -> { hash, message, parent, branch, timestamp }
  let branches = {};      // name -> commit hash
  let HEAD = null;        // { type: 'branch', name: 'main' } or { type: 'detached', hash: '...' }
  let staged = [];        // staged file names
  let workingChanges = ['app.py', 'README.md']; // unstaged modified files
  let initialized = false;
  let commitCounter = 0;

  function shortHash() {
    commitCounter++;
    return (commitCounter * 7919 + 104729).toString(16).slice(0, 7);
  }

  function currentBranch() {
    return HEAD && HEAD.type === 'branch' ? HEAD.name : null;
  }

  function currentCommitHash() {
    if (!HEAD) return null;
    return HEAD.type === 'branch' ? branches[HEAD.name] : HEAD.hash;
  }

  function init() {
    if (initialized) return 'Reinitialized existing Git repository in .git/';
    initialized = true;
    branches['main'] = null;
    HEAD = { type: 'branch', name: 'main' };
    return 'Initialized empty Git repository in .git/';
  }

  function add(args) {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    if (!args.length) return 'Nothing specified, nothing added.';
    if (args[0] === '.' || args[0] === '-A') {
      staged = [...new Set([...staged, ...workingChanges])];
      workingChanges = [];
      return '';
    }
    args.forEach(f => {
      if (workingChanges.includes(f)) {
        staged.push(f);
        workingChanges = workingChanges.filter(w => w !== f);
      } else if (!staged.includes(f)) {
        staged.push(f);
      }
    });
    return '';
  }

  function commit(message) {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    if (!staged.length) return 'nothing to commit, working tree clean';
    const hash = shortHash();
    const parent = currentCommitHash();
    commits[hash] = { hash, message: message || 'No message', parent, branch: currentBranch(), timestamp: Date.now() };
    if (HEAD.type === 'branch') {
      branches[HEAD.name] = hash;
    } else {
      HEAD = { type: 'detached', hash };
    }
    const count = staged.length;
    staged = [];
    return `[${currentBranch() || 'detached HEAD'} ${hash}] ${message}\n ${count} file${count > 1 ? 's' : ''} changed`;
  }

  function branch(args) {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    if (!args.length) {
      return Object.keys(branches).map(b => (b === currentBranch() ? '* ' : '  ') + b).join('\n');
    }
    const name = args[0];
    if (branches[name]) return `fatal: a branch named '${name}' already exists`;
    branches[name] = currentCommitHash();
    return '';
  }

  function checkout(args) {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    const createNew = args[0] === '-b';
    const name = createNew ? args[1] : args[0];
    if (!name) return 'error: missing branch name';
    if (createNew) {
      if (branches[name]) return `fatal: a branch named '${name}' already exists`;
      branches[name] = currentCommitHash();
    } else if (!branches[name] && !commits[name]) {
      return `error: pathspec '${name}' did not match any file(s) known to git`;
    }
    if (branches.hasOwnProperty(name)) {
      HEAD = { type: 'branch', name };
    } else {
      HEAD = { type: 'detached', hash: name };
    }
    return createNew ? `Switched to a new branch '${name}'` : `Switched to branch '${name}'`;
  }

  function merge(args) {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    const sourceBranch = args[0];
    if (!sourceBranch) return 'fatal: no branch specified';
    if (!branches[sourceBranch]) return `merge: ${sourceBranch} - not something we can merge`;
    if (HEAD.type !== 'branch') return 'fatal: cannot merge while in detached HEAD state';

    const sourceHash = branches[sourceBranch];
    const targetHash = branches[HEAD.name];

    if (sourceHash === targetHash) return 'Already up to date.';

    // Check if fast-forward is possible: walk source's parent chain looking for target
    let walk = sourceHash, isAncestor = false;
    while (walk) {
      if (walk === targetHash) { isAncestor = true; break; }
      walk = commits[walk] ? commits[walk].parent : null;
    }

    if (isAncestor || !targetHash) {
      branches[HEAD.name] = sourceHash;
      return `Updating ${(targetHash||'').slice(0,7)}..${sourceHash.slice(0,7)}\nFast-forward`;
    }

    // Simulate occasional conflict for educational purposes (deterministic-ish)
    const willConflict = (sourceHash.charCodeAt(0) + targetHash.charCodeAt(0)) % 3 === 0;
    if (willConflict) {
      return `Auto-merging app.py\nCONFLICT (content): Merge conflict in app.py\nAutomatic merge failed; fix conflicts and then commit the result.`;
    }

    const hash = shortHash();
    commits[hash] = { hash, message: `Merge branch '${sourceBranch}' into ${HEAD.name}`, parent: targetHash, mergeParent: sourceHash, branch: HEAD.name, timestamp: Date.now() };
    branches[HEAD.name] = hash;
    return `Merge made by the 'recursive' strategy.`;
  }

  function log() {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    const startHash = currentCommitHash();
    if (!startHash) return '';
    let out = [], walk = startHash, seen = new Set();
    while (walk && commits[walk] && !seen.has(walk)) {
      seen.add(walk);
      const c = commits[walk];
      out.push(`commit ${c.hash}${walk === startHash ? ' (HEAD -> ' + (currentBranch()||'detached') + ')' : ''}\nDate: ${new Date(c.timestamp).toDateString()}\n\n    ${c.message}\n`);
      walk = c.parent;
    }
    return out.join('\n') || '(no commits yet)';
  }

  function status() {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    let out = `On branch ${currentBranch() || '(detached HEAD)'}\n`;
    if (staged.length) {
      out += `\nChanges to be committed:\n` + staged.map(f => `  modified:   ${f}`).join('\n') + '\n';
    }
    if (workingChanges.length) {
      out += `\nChanges not staged for commit:\n` + workingChanges.map(f => `  modified:   ${f}`).join('\n') + '\n';
    }
    if (!staged.length && !workingChanges.length) {
      out += '\nnothing to commit, working tree clean';
    }
    return out;
  }

  function push() {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    return `Enumerating objects, done.\nTo github.com:user/repo.git\n   ${(currentCommitHash()||'').slice(0,7)}..main -> ${currentBranch() || 'main'}`;
  }

  function pull() {
    if (!initialized) return 'fatal: not a git repository (or any of the parent directories): .git';
    return `Already up to date.`;
  }

  function getGraphData() {
    return { commits, branches, HEAD: currentBranch() || (HEAD && HEAD.hash) };
  }

  return { init, add, commit, branch, checkout, merge, log, status, push, pull, getGraphData,
           isInitialized: () => initialized };
}

function runGitCommand(repo, rawInput) {
  const input = rawInput.trim();
  if (!input) return '';
  const tokens = input.split(/\s+/);
  if (tokens[0] !== 'git') return `${tokens[0]}: command not found (try a "git ..." command)`;
  const sub = tokens[1];
  const args = tokens.slice(2);

  switch (sub) {
    case 'init': return repo.init();
    case 'add': return repo.add(args);
    case 'commit': {
      const mIdx = args.indexOf('-m');
      const message = mIdx >= 0 ? args.slice(mIdx + 1).join(' ').replace(/^["']|["']$/g, '') : '';
      return repo.commit(message);
    }
    case 'branch': return repo.branch(args);
    case 'checkout': return repo.checkout(args);
    case 'merge': return repo.merge(args);
    case 'log': return repo.log();
    case 'status': return repo.status();
    case 'push': return repo.push();
    case 'pull': return repo.pull();
    case undefined: return 'usage: git <command> [<args>]\n\nCommon commands: init, add, commit, branch, checkout, merge, log, status, push, pull';
    default: return `git: '${sub}' is not a git command. See 'git help'.`;
  }
}
