// ============================================================
// Virtual Linux Filesystem + Command Engine
// A real, navigable in-memory filesystem with working commands.
// Not a fake animation — actual state, actual logic.
// ============================================================

function createVFS() {
  // Tree structure: { type: 'dir'|'file', children: {...}, content: '...', perms: 'rwxr-xr-x', owner: 'user' }
  const fs = {
    '/': { type: 'dir', children: {
      'home': { type: 'dir', children: {
        'user': { type: 'dir', children: {
          'projects': { type: 'dir', children: {
            'app.py': { type: 'file', content: 'print("Hello, DevOps!")\n', perms: 'rw-r--r--' },
            'README.md': { type: 'file', content: '# My Project\n\nA sample project.\n', perms: 'rw-r--r--' },
          }, perms: 'rwxr-xr-x' },
          'logs': { type: 'dir', children: {
            'app.log': { type: 'file', content: '[INFO] Server started on port 8080\n[INFO] Connected to database\n[WARN] High memory usage detected\n[ERROR] Connection timeout after 30s\n', perms: 'rw-r--r--' },
            'error.log': { type: 'file', content: '[ERROR] 2026-01-15 NullPointerException at line 42\n[ERROR] 2026-01-15 Connection refused: localhost:5432\n', perms: 'rw-r--r--' },
          }, perms: 'rwxr-xr-x' },
          '.bashrc': { type: 'file', content: 'export PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\n', perms: 'rw-r--r--' },
          'notes.txt': { type: 'file', content: 'TODO: fix the memory leak in worker.py\nTODO: rotate logs\n', perms: 'rw-r--r--' },
        }, perms: 'rwxr-xr-x' },
      }, perms: 'rwxr-xr-x' },
      'etc': { type: 'dir', children: {
        'hosts': { type: 'file', content: '127.0.0.1 localhost\n', perms: 'rw-r--r--' },
        'nginx': { type: 'dir', children: {
          'nginx.conf': { type: 'file', content: 'server {\n  listen 80;\n  server_name example.com;\n}\n', perms: 'rw-r--r--' }
        }, perms: 'rwxr-xr-x' }
      }, perms: 'rwxr-xr-x' },
      'var': { type: 'dir', children: {
        'log': { type: 'dir', children: {
          'syslog': { type: 'file', content: 'Jan 15 10:22:01 host systemd[1]: Started nginx.service\n', perms: 'rw-r--r--' }
        }, perms: 'rwxr-xr-x' }
      }, perms: 'rwxr-xr-x' },
      'tmp': { type: 'dir', children: {}, perms: 'rwxrwxrwx' },
    }, perms: 'rwxr-xr-x' }
  };

  let cwd = '/home/user';

  function resolvePath(path) {
    if (!path) return cwd;
    let parts;
    if (path.startsWith('/')) {
      parts = path.split('/').filter(Boolean);
    } else {
      parts = cwd.split('/').filter(Boolean).concat(path.split('/').filter(Boolean));
    }
    const resolved = [];
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') { resolved.pop(); continue; }
      resolved.push(p);
    }
    return '/' + resolved.join('/');
  }

  function getNode(path) {
    const resolved = resolvePath(path);
    if (resolved === '/') return fs['/'];
    const parts = resolved.split('/').filter(Boolean);
    let node = fs['/'];
    for (const p of parts) {
      if (!node.children || !node.children[p]) return null;
      node = node.children[p];
    }
    return node;
  }

  function getParent(path) {
    const resolved = resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);
    const name = parts.pop();
    const parentPath = '/' + parts.join('/');
    return { parent: getNode(parentPath || '/'), name, resolved };
  }

  return { fs, getCwd: () => cwd, setCwd: (p) => cwd = p, resolvePath, getNode, getParent };
}

// Process list simulation (static realistic data)
const FAKE_PROCESSES = [
  { pid: 1, user: 'root', cpu: '0.0', mem: '0.1', cmd: '/sbin/init' },
  { pid: 412, user: 'root', cpu: '0.2', mem: '1.4', cmd: 'systemd-journald' },
  { pid: 893, user: 'root', cpu: '0.0', mem: '0.8', cmd: 'sshd: /usr/sbin/sshd -D' },
  { pid: 1204, user: 'user', cpu: '12.4', mem: '8.2', cmd: 'node app.js' },
  { pid: 1310, user: 'user', cpu: '2.1', mem: '4.6', cmd: 'python3 worker.py' },
  { pid: 1422, user: 'root', cpu: '0.4', mem: '2.1', cmd: 'dockerd' },
  { pid: 1567, user: 'user', cpu: '45.8', mem: '18.3', cmd: 'java -jar app.jar' },
  { pid: 1690, user: 'root', cpu: '0.1', mem: '0.6', cmd: 'nginx: master process' },
  { pid: 1691, user: 'www-data', cpu: '0.3', mem: '1.2', cmd: 'nginx: worker process' },
  { pid: 2044, user: 'user', cpu: '0.0', mem: '0.3', cmd: 'bash' },
];

const FAKE_SERVICES = {
  'nginx': { status: 'active (running)', enabled: true },
  'docker': { status: 'active (running)', enabled: true },
  'sshd': { status: 'active (running)', enabled: true },
  'postgresql': { status: 'failed', enabled: true },
  'redis': { status: 'active (running)', enabled: false },
  'cron': { status: 'active (running)', enabled: true },
};

// ============================================================
// Linux command processor — parses input, mutates VFS, returns output
// ============================================================
function makeLinuxEngine(vfs) {
  function ls(args) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    const target = args.find(a => !a.startsWith('-')) || vfs.getCwd();
    const node = vfs.getNode(target);
    if (!node) return `ls: cannot access '${target}': No such file or directory`;
    if (node.type === 'file') return target.split('/').pop();
    const entries = Object.entries(node.children || {});
    if (flags.includes('l')) {
      return entries.map(([name, n]) => {
        const type = n.type === 'dir' ? 'd' : '-';
        const perms = n.perms || 'rw-r--r--';
        const size = n.type === 'file' ? (n.content || '').length : 4096;
        return `${type}${perms} 1 user user ${String(size).padStart(5)} Jan 15 10:00 ${name}${n.type === 'dir' ? '/' : ''}`;
      }).join('\n') || '(empty directory)';
    }
    return entries.map(([name, n]) => name + (n.type === 'dir' ? '/' : '')).join('  ') || '(empty directory)';
  }

  function cd(args) {
    const target = args[0] || '/home/user';
    const resolved = vfs.resolvePath(target);
    const node = vfs.getNode(resolved);
    if (!node) return `cd: ${target}: No such file or directory`;
    if (node.type !== 'dir') return `cd: ${target}: Not a directory`;
    vfs.setCwd(resolved);
    return '';
  }

  function pwd() { return vfs.getCwd(); }

  function mkdir(args) {
    if (!args.length) return 'mkdir: missing operand';
    const target = args[args.length - 1];
    const { parent, name } = vfs.getParent(target);
    if (!parent || parent.type !== 'dir') return `mkdir: cannot create directory '${target}': No such file or directory`;
    if (parent.children[name]) return `mkdir: cannot create directory '${target}': File exists`;
    parent.children[name] = { type: 'dir', children: {}, perms: 'rwxr-xr-x' };
    return '';
  }

  function touch(args) {
    if (!args.length) return 'touch: missing file operand';
    const target = args[0];
    const { parent, name } = vfs.getParent(target);
    if (!parent) return `touch: cannot touch '${target}': No such file or directory`;
    if (!parent.children[name]) parent.children[name] = { type: 'file', content: '', perms: 'rw-r--r--' };
    return '';
  }

  function cat(args) {
    if (!args.length) return 'cat: missing file operand';
    return args.map(target => {
      const node = vfs.getNode(target);
      if (!node) return `cat: ${target}: No such file or directory`;
      if (node.type === 'dir') return `cat: ${target}: Is a directory`;
      return node.content || '';
    }).join('\n');
  }

  function rm(args) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    const targets = args.filter(a => !a.startsWith('-'));
    if (!targets.length) return 'rm: missing operand';
    return targets.map(target => {
      const { parent, name } = vfs.getParent(target);
      if (!parent || !parent.children[name]) return `rm: cannot remove '${target}': No such file or directory`;
      const node = parent.children[name];
      if (node.type === 'dir' && !flags.includes('r')) return `rm: cannot remove '${target}': Is a directory`;
      delete parent.children[name];
      return '';
    }).filter(Boolean).join('\n');
  }

  function cp(args) {
    if (args.length < 2) return 'cp: missing destination file operand';
    const [src, dest] = args;
    const srcNode = vfs.getNode(src);
    if (!srcNode) return `cp: cannot stat '${src}': No such file or directory`;
    const { parent, name } = vfs.getParent(dest);
    if (!parent) return `cp: cannot create '${dest}': No such file or directory`;
    parent.children[name] = JSON.parse(JSON.stringify(srcNode));
    return '';
  }

  function mv(args) {
    if (args.length < 2) return 'mv: missing destination file operand';
    const [src, dest] = args;
    const srcParent = vfs.getParent(src);
    if (!srcParent.parent || !srcParent.parent.children[srcParent.name]) return `mv: cannot stat '${src}': No such file or directory`;
    const node = srcParent.parent.children[srcParent.name];
    const destParent = vfs.getParent(dest);
    if (!destParent.parent) return `mv: cannot move to '${dest}': No such file or directory`;
    destParent.parent.children[destParent.name] = node;
    delete srcParent.parent.children[srcParent.name];
    return '';
  }

  function chmod(args) {
    if (args.length < 2) return 'chmod: missing operand';
    const [mode, target] = args;
    const node = vfs.getNode(target);
    if (!node) return `chmod: cannot access '${target}': No such file or directory`;
    const octalToPerm = { '7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--', '3': '-wx', '2': '-w-', '1': '--x', '0': '---' };
    if (/^\d{3}$/.test(mode)) {
      node.perms = mode.split('').map(d => octalToPerm[d]).join('');
    }
    return '';
  }

  function ps() {
    const header = '  PID USER     %CPU  %MEM COMMAND';
    const rows = FAKE_PROCESSES.map(p => `${String(p.pid).padStart(5)} ${p.user.padEnd(8)} ${p.cpu.padStart(5)} ${p.mem.padStart(5)} ${p.cmd}`);
    return [header, ...rows].join('\n');
  }

  function top() {
    return ps() + '\n\n(this is a static snapshot — type "ps" again or "ps aux" for the full table)';
  }

  function systemctl(args) {
    const [action, service] = args;
    if (!action) return 'systemctl: missing operand';
    if (action === 'status') {
      const svc = FAKE_SERVICES[service];
      if (!svc) return `Unit ${service}.service could not be found.`;
      return `● ${service}.service\n   Loaded: loaded\n   Active: ${svc.status}\n   ${svc.enabled ? 'Enabled' : 'Disabled'} at boot`;
    }
    if (action === 'restart' || action === 'start') {
      if (FAKE_SERVICES[service]) { FAKE_SERVICES[service].status = 'active (running)'; return `${action === 'restart' ? 'Restarted' : 'Started'} ${service}.service`; }
      return `Failed to ${action} ${service}.service: Unit not found.`;
    }
    if (action === 'stop') {
      if (FAKE_SERVICES[service]) { FAKE_SERVICES[service].status = 'inactive (dead)'; return `Stopped ${service}.service`; }
      return `Failed to stop ${service}.service: Unit not found.`;
    }
    if (action === 'enable' || action === 'disable') {
      if (FAKE_SERVICES[service]) { FAKE_SERVICES[service].enabled = action === 'enable'; return `${action === 'enable' ? 'Enabled' : 'Disabled'} ${service}.service`; }
      return `Failed: Unit not found.`;
    }
    return `systemctl: unknown action '${action}'`;
  }

  function journalctl(args) {
    if (args.includes('-u')) {
      const svc = args[args.indexOf('-u') + 1];
      return `-- Journal for ${svc} --\nJan 15 10:22:01 host ${svc}[1422]: Starting up...\nJan 15 10:22:02 host ${svc}[1422]: Listening on port 80\nJan 15 10:22:05 host ${svc}[1422]: Ready to accept connections`;
    }
    return `-- Recent journal entries --\nJan 15 10:22:01 host systemd[1]: Started nginx.service\nJan 15 10:25:14 host kernel: [12345.678] TCP: out of memory warning\nJan 15 10:30:02 host CRON[2211]: (root) CMD (logrotate)`;
  }

  function grep(args) {
    const flags = args.filter(a => a.startsWith('-'));
    const rest = args.filter(a => !a.startsWith('-'));
    const [pattern, file] = rest;
    if (!pattern || !file) return 'grep: missing operand';
    const node = vfs.getNode(file);
    if (!node || node.type !== 'file') return `grep: ${file}: No such file or directory`;
    const lines = (node.content || '').split('\n');
    const matched = lines.filter(l => flags.includes('-i') ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));
    return matched.join('\n') || '';
  }

  function df() {
    return `Filesystem     Size  Used Avail Use% Mounted on\n/dev/sda1       40G   18G   20G  48% /\ntmpfs          3.9G     0  3.9G   0% /dev/shm`;
  }

  function free() {
    return `              total        used        free      shared  buff/cache   available\nMem:          7.8Gi       3.2Gi       1.1Gi       180Mi       3.5Gi       4.2Gi\nSwap:         2.0Gi       412Mi       1.6Gi`;
  }

  return { ls, cd, pwd, mkdir, touch, cat, rm, cp, mv, chmod, ps, top, systemctl, journalctl, grep, df, free };
}

function runLinuxCommand(engine, vfs, rawInput) {
  const input = rawInput.trim();
  if (!input) return '';
  const tokens = input.split(/\s+/);
  const cmd = tokens[0];
  const args = tokens.slice(1);

  const handlers = {
    ls: () => engine.ls(args),
    cd: () => engine.cd(args),
    pwd: () => engine.pwd(),
    mkdir: () => engine.mkdir(args),
    touch: () => engine.touch(args),
    cat: () => engine.cat(args),
    rm: () => engine.rm(args),
    cp: () => engine.cp(args),
    mv: () => engine.mv(args),
    chmod: () => engine.chmod(args),
    ps: () => engine.ps(),
    top: () => engine.top(),
    systemctl: () => engine.systemctl(args),
    journalctl: () => engine.journalctl(args),
    grep: () => engine.grep(args),
    df: () => engine.df(),
    free: () => engine.free(),
    whoami: () => 'user',
    echo: () => args.join(' '),
    clear: () => '\x1b[2J\x1b[H',
    help: () => `Available commands:\n  pwd, ls [-l], cd <dir>, mkdir <dir>, touch <file>, cat <file>\n  rm [-r] <target>, cp <src> <dest>, mv <src> <dest>, chmod <mode> <file>\n  ps, top, systemctl <action> <service>, journalctl [-u service]\n  grep [-i] <pattern> <file>, df, free, whoami, echo, clear`,
  };

  if (handlers[cmd]) {
    try { return handlers[cmd](); }
    catch (e) { return `${cmd}: error: ${e.message}`; }
  }
  return `${cmd}: command not found. Type "help" for available commands.`;
}
