/* ============================================================
   MAISON DOUX — 3D Atelier
   Procedurally built pastry environment (Three.js r128)
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof THREE === "undefined") {
    document.body.classList.add("no-webgl");
    return;
  }

  var container = document.getElementById("webgl");
  if (!container) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    document.body.classList.add("no-webgl");
    return;
  }

  var W = window.innerWidth;
  var H = window.innerHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, W < 768 ? 1.6 : 2);

  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  camera.position.set(0, 0.7, 9.6);
  camera.lookAt(0, 0.4, 0);

  /* ---------- Lights: warm, pastry-case ---------- */
  scene.add(new THREE.AmbientLight(0xffe6c4, 0.4));

  var key = new THREE.PointLight(0xffd9a0, 1.6, 40, 2);
  key.position.set(6, 6, 6);
  scene.add(key);

  var rim = new THREE.PointLight(0xbf8f4f, 1.1, 40, 2);
  rim.position.set(-6, -1, 3);
  scene.add(rim);

  var back = new THREE.PointLight(0x2b1a12, 0.7, 30, 2);
  back.position.set(0, 2, -6);
  scene.add(back);

  /* ---------- Materials ---------- */
  var mat = {
    cream:    new THREE.MeshPhysicalMaterial({ color: 0xf0e2cc, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    chocolate: new THREE.MeshPhysicalMaterial({ color: 0x3a2217, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.18, metalness: 0.05 }),
    caramel:  new THREE.MeshPhysicalMaterial({ color: 0xc88b4a, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.35 }),
    gold:     new THREE.MeshStandardMaterial({ color: 0xe3b26b, metalness: 0.85, roughness: 0.3 }),
    rose:     new THREE.MeshPhysicalMaterial({ color: 0xd9a48f, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.4 }),
    pistachio: new THREE.MeshPhysicalMaterial({ color: 0x9db899, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.4 }),
    cherry:   new THREE.MeshPhysicalMaterial({ color: 0x8e2a24, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }),
    filling:  new THREE.MeshStandardMaterial({ color: 0xfaf3e6, roughness: 0.5 })
  };

  var group = new THREE.Group();
  scene.add(group);

  /* ============ Layered cake with dripping frosting ============ */
  var cake = new THREE.Group();
  var cakeRadii = [1.5, 1.34, 1.18, 1.02];
  var cakeH = 0.34;
  var y = 0;
  var cakeLayers = [];
  cakeRadii.forEach(function (r, i) {
    var m = i % 2 === 0 ? mat.cream : mat.chocolate;
    var geo = new THREE.CylinderGeometry(r, r, cakeH, 64);
    var layer = new THREE.Mesh(geo, m);
    layer.position.y = y;
    y += cakeH - 0.012;
    cake.add(layer);
    cakeLayers.push(layer);
  });

  /* Frosting dome on top via lathe */
  var domePts = [];
  domePts.push(new THREE.Vector2(0, 0));
  domePts.push(new THREE.Vector2(0.5, 0.28));
  domePts.push(new THREE.Vector2(0.8, 0.5));
  domePts.push(new THREE.Vector2(0.96, 0.56));
  domePts.push(new THREE.Vector2(1.02, 0.55));
  domePts.push(new THREE.Vector2(1.04, 0.42));
  var dome = new THREE.Mesh(new THREE.LatheGeometry(domePts, 48), mat.chocolate);
  dome.position.y = y;
  cake.add(dome);

  /* Drips around the top rim */
  var drips = 9;
  for (var d = 0; d < drips; d++) {
    var len = 0.22 + Math.random() * 0.32;
    var drip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.1, len, 12),
      mat.chocolate
    );
    var a = (d / drips) * Math.PI * 2 + Math.random() * 0.4;
    drip.position.set(Math.cos(a) * 1.0, y - len / 2 + 0.2, Math.sin(a) * 1.0);
    drip.rotation.z = Math.cos(a) * 0.12;
    drip.rotation.x = -Math.sin(a) * 0.12;
    cake.add(drip);
    var blob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), mat.chocolate);
    blob.position.set(Math.cos(a) * 1.0, y - len + 0.2, Math.sin(a) * 1.0);
    cake.add(blob);
  }

  /* Cherry on top */
  var cherry = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 24), mat.cherry);
  cherry.position.y = y + 0.72;
  cherry.position.z = 0.1;
  cake.add(cherry);
  var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), mat.gold);
  stem.position.y = y + 1.0;
  stem.rotation.x = 0.4;
  cake.add(stem);

  cake.position.y = -1.55;
  group.add(cake);

  /* ============ Chocolate donut with sprinkles ============ */
  var donut = new THREE.Group();
  var torus = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.4, 28, 64), mat.chocolate);
  torus.rotation.x = Math.PI / 2 - 0.12;
  donut.add(torus);

  /* Sprinkles */
  var sprinkleGeo = new THREE.BoxGeometry(0.07, 0.07, 0.2);
  var sprinkleColors = [mat.gold, mat.cream, mat.rose, mat.caramel];
  var sprinkles = 26;
  for (var s = 0; s < sprinkles; s++) {
    var sm = sprinkleColors[s % sprinkleColors.length];
    var sp = new THREE.Mesh(sprinkleGeo, sm);
    var u = Math.random() * Math.PI * 2;
    var v = Math.random() * Math.PI * 2;
    var R = 1.05, r = 0.4;
    var px = (R + r * Math.cos(v)) * Math.cos(u);
    var py = r * Math.sin(v);
    var pz = (R + r * Math.cos(v)) * Math.sin(u);
    sp.position.set(px, py, pz);
    var tangent = new THREE.Vector3(-Math.sin(u), 0, Math.cos(u));
    sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    donut.add(sp);
  }

  donut.position.set(0, -0.4, 2.6);
  donut.rotation.z = 0.35;
  group.add(donut);

  /* ============ Floating macarons ============ */
  function makeMacaron(color, scale) {
    var g = new THREE.Group();
    var top = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 24), color);
    top.scale.y = 0.52;
    top.position.y = 0.26;
    g.add(top);
    var bot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 24), color);
    bot.scale.y = 0.52;
    bot.position.y = -0.26;
    g.add(bot);
    var fill = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 28), mat.filling);
    g.add(fill);
    var foot = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.03, 10, 28), color);
    foot.rotation.x = Math.PI / 2;
    foot.position.y = 0.02;
    g.add(foot);
    g.scale.setScalar(scale);
    return g;
  }

  var macarons = [];
  var macaronsData = [
    { mat: mat.rose, pos: [2.7, 2.0, -1.4], scale: 0.8, phase: 0.0 },
    { mat: mat.pistachio, pos: [-2.9, 1.6, -2.0], scale: 0.66, phase: 2.1 },
    { mat: mat.caramel, pos: [0.5, 3.0, -2.7], scale: 0.55, phase: 4.0 }
  ];
  macaronsData.forEach(function (md) {
    var m = makeMacaron(md.mat, md.scale);
    m.position.set(md.pos[0], md.pos[1], md.pos[2]);
    m.rotation.z = (Math.random() - 0.5) * 0.3;
    m.userData.phase = md.phase;
    m.userData.baseY = md.pos[1];
    group.add(m);
    macarons.push(m);
  });

  /* ============ Gold dust ============ */
  var dustCount = reduced ? 0 : 380;
  var dustPos = new Float32Array(dustCount * 3);
  var dustSizes = new Float32Array(dustCount);
  for (var p = 0; p < dustCount; p++) {
    var rad = 3 + Math.random() * 6;
    var th = Math.random() * Math.PI * 2;
    var ph = Math.acos(2 * Math.random() - 1);
    dustPos[p * 3] = rad * Math.sin(ph) * Math.cos(th);
    dustPos[p * 3 + 1] = rad * Math.cos(ph) * 0.7;
    dustPos[p * 3 + 2] = rad * Math.sin(ph) * Math.sin(th) - 1;
    dustSizes[p] = 0.5 + Math.random();
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("size", new THREE.BufferAttribute(dustSizes, 1));
  var dustMat = new THREE.PointsMaterial({
    color: 0xe3b26b,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ---------- Interaction state ---------- */
  var pointer = { x: 0, y: 0 };
  var scroll = { p: 0 };
  var time = 0;

  window.__veillemmScene = {
    setPointer: function (nx, ny) { pointer.x = nx; pointer.y = ny; },
    setScroll: function (p) { scroll.p = p; }
  };

  function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }
  window.addEventListener("resize", onResize, { passive: true });

  /* ---------- Render loop ---------- */
  var clock = new THREE.Clock();
  var raf = null;
  var running = true;

  function animate() {
    if (!running) return;
    raf = requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.05);
    time += dt;

    /* scroll-driven camera + scene rotation */
    var targetY = 0.7 - scroll.p * 8.2;
    var camX = pointer.x * 1.5;
    var camY = targetY + pointer.y * 0.7;

    camera.position.x += (camX - camera.position.x) * 0.06;
    camera.position.y += (camY - camera.position.y) * 0.06;
    camera.lookAt(0, 0.3, 0);

    group.rotation.y = scroll.p * 0.9;

    /* idle motion */
    cake.rotation.y += dt * 0.12;
    cake.position.y = -1.55 + Math.sin(time * 0.6) * 0.06;

    donut.rotation.z = 0.35 + Math.sin(time * 0.5) * 0.12;
    donut.position.y = -0.4 + Math.sin(time * 0.7 + 1) * 0.08;

    macarons.forEach(function (m) {
      m.position.y = m.userData.baseY + Math.sin(time * 0.8 + m.userData.phase) * 0.14;
      m.rotation.y += dt * 0.4;
    });

    dust.rotation.y += dt * 0.02;
    dust.position.y = Math.sin(time * 0.3) * 0.25;

    renderer.render(scene, camera);
  }

  if (reduced) {
    renderer.render(scene, camera);
  } else {
    animate();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      clock.getDelta();
      animate();
    }
  });
})();
