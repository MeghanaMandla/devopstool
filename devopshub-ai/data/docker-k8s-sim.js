// ============================================================
// Docker Command Trainer — real state for images/containers
// ============================================================
function createDockerState() {
  let images = [
    { repo: 'nginx', tag: 'latest', id: 'a8758716bb6a', size: '187MB' },
    { repo: 'node', tag: '20-alpine', id: 'f028a5ce2b4e', size: '178MB' },
    { repo: 'postgres', tag: '16', id: 'c2f3b1a9d7e4', size: '412MB' },
  ];
  let containers = []; // { id, image, name, status, ports, created }
  let containerCounter = 0;

  function genId() { containerCounter++; return (containerCounter * 6151 + 7919).toString(16).padEnd(12, '0').slice(0, 12); }

  function pull(args) {
    const image = args[0];
    if (!image) return 'Usage: docker pull IMAGE';
    const [repo, tag] = image.split(':');
    if (!images.find(i => i.repo === repo && i.tag === (tag || 'latest'))) {
      images.push({ repo, tag: tag || 'latest', id: genId(), size: Math.floor(Math.random()*300+50) + 'MB' });
    }
    return `${tag || 'latest'}: Pulling from library/${repo}\nDigest: sha256:${genId()}${genId()}\nStatus: Downloaded newer image for ${image}`;
  }

  function images_() {
    const header = 'REPOSITORY          TAG                 IMAGE ID       SIZE';
    const rows = images.map(i => `${i.repo.padEnd(20)}${i.tag.padEnd(20)}${i.id}   ${i.size}`);
    return [header, ...rows].join('\n');
  }

  function run(args) {
    let detach = args.includes('-d');
    let name = null;
    const nameIdx = args.indexOf('--name');
    if (nameIdx >= 0) name = args[nameIdx + 1];
    let portMap = null;
    const pIdx = args.indexOf('-p');
    if (pIdx >= 0) portMap = args[pIdx + 1];

    const image = args.filter(a => !a.startsWith('-') && a !== name && a !== portMap).pop();
    if (!image) return 'docker: requires at least 1 argument.';

    const id = genId();
    const containerName = name || `${image.split(':')[0]}-${id.slice(0,4)}`;
    containers.push({ id, image, name: containerName, status: 'Up 0 seconds', ports: portMap || '', created: Date.now() });
    return detach ? id : `Starting ${containerName}... (running in foreground — press Ctrl+C to stop, or use -d to detach)`;
  }

  function ps(args) {
    const all = args.includes('-a');
    const list = all ? containers : containers.filter(c => c.status.startsWith('Up'));
    const header = 'CONTAINER ID   IMAGE              STATUS              PORTS               NAMES';
    const rows = list.map(c => `${c.id.slice(0,12)}   ${c.image.padEnd(18)} ${c.status.padEnd(19)} ${(c.ports||'').padEnd(19)} ${c.name}`);
    return [header, ...rows].join('\n') || header;
  }

  function stop(args) {
    const target = args[0];
    const c = containers.find(c => c.id.startsWith(target) || c.name === target);
    if (!c) return `Error: No such container: ${target}`;
    c.status = 'Exited (0) 0 seconds ago';
    return c.id.slice(0,12);
  }

  function rm(args) {
    const target = args.filter(a => !a.startsWith('-'))[0];
    const idx = containers.findIndex(c => c.id.startsWith(target) || c.name === target);
    if (idx === -1) return `Error: No such container: ${target}`;
    if (containers[idx].status.startsWith('Up') && !args.includes('-f')) {
      return `Error response from daemon: cannot remove container "${target}": container is running: stop the container before removing or force remove`;
    }
    const id = containers[idx].id;
    containers.splice(idx, 1);
    return id.slice(0,12);
  }

  function logs(args) {
    const target = args.filter(a=>!a.startsWith('-'))[0];
    const c = containers.find(c => c.id.startsWith(target) || c.name === target);
    if (!c) return `Error: No such container: ${target}`;
    return `[INFO] Starting ${c.image}...\n[INFO] Listening on port 8080\n[INFO] Ready to accept connections`;
  }

  function build(args) {
    const tagIdx = args.indexOf('-t');
    const tag = tagIdx >= 0 ? args[tagIdx+1] : 'unnamed:latest';
    const [repo, t] = tag.split(':');
    images.push({ repo, tag: t || 'latest', id: genId(), size: Math.floor(Math.random()*200+80)+'MB' });
    return `[+] Building 4.2s\n => [internal] load build definition\n => [internal] load .dockerignore\n => CACHED [1/4] FROM docker.io/library/node:20-alpine\n => [2/4] WORKDIR /app\n => [3/4] COPY . .\n => [4/4] RUN npm install\n => exporting to image\n => => naming to docker.io/library/${tag}\n\n✓ Successfully built and tagged ${tag}`;
  }

  function inspect(args) {
    const target = args[0];
    const c = containers.find(c => c.id.startsWith(target) || c.name === target);
    if (!c) return `Error: No such object: ${target}`;
    return JSON.stringify({ Id: c.id, Name: '/'+c.name, Image: c.image, State: { Status: c.status.startsWith('Up') ? 'running' : 'exited' } }, null, 2);
  }

  return { pull, images: images_, run, ps, stop, rm, logs, build, inspect,
           getState: () => ({ images, containers }) };
}

function runDockerCommand(state, rawInput) {
  const input = rawInput.trim();
  if (!input) return '';
  const tokens = input.split(/\s+/);
  if (tokens[0] !== 'docker') return `${tokens[0]}: command not found (try a "docker ..." command)`;
  const sub = tokens[1];
  const args = tokens.slice(2);

  switch (sub) {
    case 'pull': return state.pull(args);
    case 'images': return state.images();
    case 'run': return state.run(args);
    case 'ps': return state.ps(args);
    case 'stop': return state.stop(args);
    case 'rm': return state.rm(args);
    case 'logs': return state.logs(args);
    case 'build': return state.build(args);
    case 'inspect': return state.inspect(args);
    case undefined: return 'Usage: docker [COMMAND]\n\nCommon commands: pull, images, run, ps, stop, rm, logs, build, inspect';
    default: return `docker: '${sub}' is not a docker command.\nSee 'docker --help'`;
  }
}

// ============================================================
// Kubernetes Command Trainer (kubectl) — real cluster state
// ============================================================
function createK8sState() {
  let pods = [
    { name: 'frontend-7d9f8-x8k2p', ready: '1/1', status: 'Running', restarts: 0, age: '2d' },
    { name: 'backend-5c8b6-m2n9q', ready: '1/1', status: 'Running', restarts: 0, age: '2d' },
    { name: 'backend-5c8b6-p7r3t', ready: '1/1', status: 'Running', restarts: 0, age: '2d' },
    { name: 'cache-redis-0', ready: '1/1', status: 'Running', restarts: 0, age: '5d' },
  ];
  let deployments = [
    { name: 'frontend', ready: '1/1', upToDate: 1, available: 1, age: '2d' },
    { name: 'backend', ready: '2/2', upToDate: 2, available: 2, age: '2d' },
  ];
  let services = [
    { name: 'frontend-svc', type: 'ClusterIP', clusterIP: '10.96.12.4', ports: '80/TCP', age: '2d' },
    { name: 'backend-svc', type: 'ClusterIP', clusterIP: '10.96.45.9', ports: '8080/TCP', age: '2d' },
  ];
  let podCounter = pods.length;

  function get(args) {
    const resource = args[0];
    if (resource === 'pods' || resource === 'pod' || resource === 'po') {
      const header = 'NAME                        READY   STATUS    RESTARTS   AGE';
      return [header, ...pods.map(p => `${p.name.padEnd(28)}${p.ready.padEnd(8)}${p.status.padEnd(10)}${String(p.restarts).padEnd(11)}${p.age}`)].join('\n');
    }
    if (resource === 'deployments' || resource === 'deployment' || resource === 'deploy') {
      const header = 'NAME       READY   UP-TO-DATE   AVAILABLE   AGE';
      return [header, ...deployments.map(d => `${d.name.padEnd(11)}${d.ready.padEnd(8)}${String(d.upToDate).padEnd(13)}${String(d.available).padEnd(12)}${d.age}`)].join('\n');
    }
    if (resource === 'services' || resource === 'service' || resource === 'svc') {
      const header = 'NAME            TYPE        CLUSTER-IP     PORT(S)     AGE';
      return [header, ...services.map(s => `${s.name.padEnd(16)}${s.type.padEnd(12)}${s.clusterIP.padEnd(15)}${s.ports.padEnd(12)}${s.age}`)].join('\n');
    }
    if (resource === 'nodes' || resource === 'node') {
      return 'NAME       STATUS   ROLES           AGE   VERSION\nnode-1     Ready    control-plane   30d   v1.29.0\nnode-2     Ready    worker          30d   v1.29.0\nnode-3     Ready    worker          30d   v1.29.0';
    }
    return `error: the server doesn't have a resource type "${resource}"`;
  }

  function describe(args) {
    const resource = args[0], name = args[1];
    if (resource === 'pod' || resource === 'po') {
      const pod = pods.find(p => p.name === name);
      if (!pod) return `Error from server (NotFound): pods "${name}" not found`;
      return `Name:         ${pod.name}\nStatus:       ${pod.status}\nRestarts:     ${pod.restarts}\nEvents:\n  Normal  Scheduled  ${pod.age}   default-scheduler  Successfully assigned to node-2\n  Normal  Pulled     ${pod.age}   kubelet            Container image already present\n  Normal  Started    ${pod.age}   kubelet            Started container`;
    }
    return `error: the server doesn't have a resource type "${resource}"`;
  }

  function applyManifest() {
    podCounter++;
    const name = `myapp-${(podCounter*31).toString(16).slice(0,5)}-${(podCounter*17).toString(16).slice(0,5)}`;
    pods.push({ name, ready: '1/1', status: 'Running', restarts: 0, age: '0s' });
    deployments.push({ name: 'myapp', ready: '1/1', upToDate: 1, available: 1, age: '0s' });
    return `deployment.apps/myapp created\nservice/myapp-svc created`;
  }

  function deletePod(args) {
    const resource = args[0], name = args[1];
    if (resource === 'pod' || resource === 'po') {
      const idx = pods.findIndex(p => p.name === name);
      if (idx === -1) return `Error from server (NotFound): pods "${name}" not found`;
      pods.splice(idx, 1);
      return `pod "${name}" deleted`;
    }
    return `error: the server doesn't have a resource type "${resource}"`;
  }

  function scale(args) {
    const deployIdx = args.indexOf('deployment');
    const name = args[deployIdx + 1];
    const replicasArg = args.find(a => a.startsWith('--replicas='));
    const replicas = replicasArg ? parseInt(replicasArg.split('=')[1]) : null;
    const d = deployments.find(d => d.name === name);
    if (!d) return `Error from server (NotFound): deployments.apps "${name}" not found`;
    if (replicas !== null) {
      d.ready = `${replicas}/${replicas}`;
      d.upToDate = replicas; d.available = replicas;
    }
    return `deployment.apps/${name} scaled`;
  }

  function logs(args) {
    const name = args[0];
    const pod = pods.find(p => p.name === name);
    if (!pod) return `Error from server (NotFound): pods "${name}" not found`;
    return `[INFO] Server listening on :8080\n[INFO] Connected to database\n[INFO] Ready to accept traffic`;
  }

  return { get, describe, apply: applyManifest, delete: deletePod, scale, logs,
           getState: () => ({ pods, deployments, services }) };
}

function runK8sCommand(state, rawInput) {
  const input = rawInput.trim();
  if (!input) return '';
  const tokens = input.split(/\s+/);
  if (tokens[0] !== 'kubectl') return `${tokens[0]}: command not found (try a "kubectl ..." command)`;
  const sub = tokens[1];
  const args = tokens.slice(2);

  switch (sub) {
    case 'get': return state.get(args);
    case 'describe': return state.describe(args);
    case 'apply': return state.apply(args);
    case 'delete': return state.delete(args);
    case 'scale': return state.scale(args);
    case 'logs': return state.logs(args);
    case undefined: return 'kubectl controls the Kubernetes cluster manager.\n\nCommon commands: get, describe, apply, delete, scale, logs';
    default: return `error: unknown command "${sub}" for "kubectl"`;
  }
}
