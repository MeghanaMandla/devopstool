// Three.js WebGL background: floating wireframe nodes representing containers/clusters
(function(){
  const canvas = document.getElementById('webgl-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .1, 300);
  camera.position.set(0, 0, 70);

  // Particle field (data points)
  const COUNT = 1800;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const palette = [
    new THREE.Color('#00f0ff'),
    new THREE.Color('#7c5cff'),
    new THREE.Color('#00e6a0'),
    new THREE.Color('#8fb8ff'),
  ];
  for (let i = 0; i < COUNT; i++) {
    pos[i*3] = (Math.random()-.5) * 220;
    pos[i*3+1] = (Math.random()-.5) * 160;
    pos[i*3+2] = (Math.random()-.5) * 120;
    const c = palette[Math.floor(Math.random()*palette.length)];
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: .55, vertexColors: true, transparent: true, opacity: .7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Floating containers — small wireframe boxes representing Docker containers
  const containers = [];
  for (let i = 0; i < 7; i++) {
    const size = Math.random()*4 + 3;
    const boxGeo = new THREE.BoxGeometry(size, size, size);
    const boxMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00f0ff : 0x7c5cff,
      wireframe: true, transparent: true, opacity: .12,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(
      (Math.random()-.5) * 140,
      (Math.random()-.5) * 90,
      (Math.random()-.5) * 60 - 20
    );
    box.userData.speed = Math.random()*.3 + .1;
    box.userData.offset = Math.random()*Math.PI*2;
    scene.add(box);
    containers.push(box);
  }

  // Cluster hub — central icosahedron (Kubernetes-like)
  const hubGeo = new THREE.IcosahedronGeometry(16, 1);
  const hubMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: .045 });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.position.set(40, 10, -30);
  scene.add(hub);

  const hub2Geo = new THREE.TorusGeometry(10, 2.4, 8, 48);
  const hub2Mat = new THREE.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: .05 });
  const hub2 = new THREE.Mesh(hub2Geo, hub2Mat);
  hub2.position.set(-45, -15, -20);
  scene.add(hub2);

  // Network lines connecting nearby nodes
  const nodeCount = 26;
  const netNodes = [];
  for (let i = 0; i < nodeCount; i++) {
    netNodes.push(new THREE.Vector3(
      (Math.random()-.5)*180, (Math.random()-.5)*120, (Math.random()-.5)*70-30
    ));
  }
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: .045 });
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i+1; j < nodeCount; j++) {
      if (netNodes[i].distanceTo(netNodes[j]) < 32) {
        const lg = new THREE.BufferGeometry().setFromPoints([netNodes[i], netNodes[j]]);
        scene.add(new THREE.Line(lg, lineMat));
      }
    }
  }

  let mx = 0, my = 0, scrollY = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX/innerWidth - .5) * 2;
    my = (e.clientY/innerHeight - .5) * 2;
  });
  window.addEventListener('scroll', () => scrollY = window.scrollY);

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    points.rotation.y = t * .015;
    points.rotation.x = t * .008;
    hub.rotation.x = t * .15;
    hub.rotation.y = t * .2;
    hub2.rotation.x = t * .12;
    hub2.rotation.z = t * .08;
    containers.forEach(box => {
      box.rotation.x = t * box.userData.speed;
      box.rotation.y = t * box.userData.speed * .7;
      box.position.y += Math.sin(t + box.userData.offset) * .01;
    });
    camera.position.x += (mx*5 - camera.position.x) * .03;
    camera.position.y += (-my*4 - camera.position.y) * .03;
    camera.position.y -= scrollY * .012;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();
