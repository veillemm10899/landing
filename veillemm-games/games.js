/* ============================================================
   VEILLEMM — PLAYGROUND ENGINE
   Three shippable canvas games:
     01 BLOCKSHOT — breakout / paddle physics + particles
     02 BITWORM   — snake with neon trail + swipe controls
     03 ZAPGRID   — reaction grid, time attack + combo
   Each game is a self-contained module wired to its cabinet.
   ============================================================ */

(function () {
  "use strict";

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- helpers ---------- */
  function setupCanvas(canvas, w, h) {
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return ctx;
  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function pad(n, len) { return String(Math.max(0, Math.floor(n))).padStart(len, "0"); }

  /* ---------- cabinet wiring ---------- */
  function wireCabinet(cab, cfg) {
    const overlay = cab.querySelector("[data-overlay]");
    const statusEl = cab.querySelector("[data-status]");
    const titleEl = cab.querySelector("[data-title]");
    const helpEl = cab.querySelector("[data-help]");
    const scoreEl = cab.querySelector("[data-score]");
    const livesEl = cab.querySelector("[data-lives]");
    const startBtn = cab.querySelector("[data-start]");
    const restartBtn = cab.querySelector("[data-restart]");

    return {
      showOverlay(status, title, help, btnLabel) {
        statusEl.textContent = status;
        titleEl.textContent = title;
        if (help) helpEl.textContent = help;
        if (btnLabel) startBtn.textContent = btnLabel;
        overlay.classList.remove("hidden");
      },
      hideOverlay() { overlay.classList.add("hidden"); },
      setScore(v) { scoreEl.textContent = pad(v, cfg.scorePad); },
      setLives(v) { livesEl.textContent = cfg.livesFmt(v); },
      onStart(fn) { startBtn.addEventListener("click", fn); },
      onRestart(fn) { restartBtn.addEventListener("click", fn); }
    };
  }

  /* ---------- visibility pause ---------- */
  function watch(cab, isActive) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { isActive(e.isIntersecting); });
    }, { threshold: 0.05 });
    io.observe(cab);
  }

  /* ============================================================
     GAME 01 — BLOCKSHOT
     ============================================================ */
  function createBlockshot(cab) {
    const W = 360, H = 480;
    const canvas = cab.querySelector("#game-blockshot");
    const ctx = setupCanvas(canvas, W, H);

    const hud = wireCabinet(cab, {
      scorePad: 6,
      livesFmt: function (n) { return Array.from({ length: n }, () => "●").join(""); }
    });

    const COLS = 8, ROWS = 5;
    const BW = W / COLS, BH = 16, GAP = 4, TOP = 48;
    const ROW_COLORS = ["#3CFFA4", "#45C8FF", "#45C8FF", "#FF4D9D", "#FFC24D"];

    let score, lives, level, bricks, paddle, ball, ready, readyT;
    let particles, shake, shakeT;
    let keys, pointerTarget;
    let raf, last, visible, running, state;
    let banner, bannerT;

    function buildBricks() {
      bricks = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          bricks.push({ x: c * BW + GAP / 2, y: TOP + r * (BH + GAP), w: BW - GAP, h: BH, alive: true, row: r });
        }
      }
    }

    function resetBall() {
      paddle = { x: W / 2 - 38, y: H - 26, w: 76, h: 12 };
      ball = { x: W / 2, y: H - 44, r: 7, vx: 0, vy: 0 };
      ready = true;
      readyT = 0.9;
    }

    function burst(x, y, color, n) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 60 + Math.random() * 180;
        particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.5 + Math.random() * 0.3, t: 0, c: color, s: 2 + Math.random() * 3 });
      }
    }

    function reset() {
      score = 0; lives = 3; level = 1;
      particles = []; shake = 0; shakeT = 0;
      keys = {}; pointerTarget = null;
      banner = ""; bannerT = 0;
      buildBricks();
      resetBall();
      hud.setScore(score); hud.setLives(lives);
      hud.showOverlay("READY", "Break the grid.", "Move with ← → or drag. Don't drop the ball.", "INSERT COIN");
      stateTo("idle");
    }

    function stateTo(s) {
      state = s;
      if (s === "running" && running !== true) {
        running = true; last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (s !== "running" && running === true) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }

    function launch() {
      if (!ready) return;
      ready = false;
      const ang = -Math.PI / 2 + (Math.random() * 0.9 - 0.45);
      const sp = 300 + level * 14;
      ball.vx = Math.cos(ang) * sp;
      ball.vy = Math.sin(ang) * sp;
    }

    function hitBrick(b) {
      b.alive = false;
      score += 10 * level;
      burst(b.x + b.w / 2, b.y + b.h / 2, ROW_COLORS[b.row], 14);
      shake = 4; shakeT = 0.18;
      if (bricks.every(function (x) { return !x.alive; })) {
        level++;
        score += 50;
        buildBricks();
        resetBall();
        hud.setScore(score);
        banner = "LEVEL " + level;
        bannerT = 1.2;
      }
    }

    function update(dt) {
      if (bannerT > 0) bannerT -= dt;

      if (ready) {
        readyT -= dt;
        paddle.x = (pointerTarget !== null ? pointerTarget : paddle.x);
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r - 1;
        if (keys.ArrowLeft || keys.a) paddle.x -= 340 * dt;
        if (keys.ArrowRight || keys.d) paddle.x += 340 * dt;
        paddle.x = clamp(paddle.x, 0, W - paddle.w);
        ball.x = clamp(ball.x, ball.r, W - ball.r);
        if (readyT <= 0) launch();
        return;
      }

      // input
      if (pointerTarget !== null) paddle.x = pointerTarget - paddle.w / 2;
      if (keys.ArrowLeft || keys.a) paddle.x -= 360 * dt;
      if (keys.ArrowRight || keys.d) paddle.x += 360 * dt;
      paddle.x = clamp(paddle.x, 0, W - paddle.w);

      // ball
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

      // paddle bounce
      if (ball.vy > 0 &&
          ball.x > paddle.x - ball.r && ball.x < paddle.x + paddle.w + ball.r &&
          ball.y + ball.r > paddle.y && ball.y + ball.r < paddle.y + paddle.h + 12) {
        const rel = clamp((ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2), -1, 1);
        const ang = -Math.PI / 2 + rel * 0.95;
        const sp = 300 + level * 14;
        ball.vx = Math.cos(ang) * sp;
        ball.vy = Math.sin(ang) * sp;
        burst(ball.x, paddle.y, "#3CFFA4", 6);
      }

      // bricks
      for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.alive) continue;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
            ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          hitBrick(b);
          const overlapX = (ball.x - (b.x + b.w / 2)) / (b.w / 2);
          const overlapY = (ball.y - (b.y + b.h / 2)) / (b.h / 2);
          if (Math.abs(overlapX) > Math.abs(overlapY)) ball.vx = ball.vx > 0 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
          else ball.vy = ball.vy > 0 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
          break;
        }
      }

      // miss
      if (ball.y - ball.r > H) {
        lives--;
        hud.setLives(lives);
        burst(ball.x, H - 8, "#FF4D9D", 18);
        if (lives <= 0) {
          stateTo("idle");
          hud.showOverlay("GAME OVER", "Score " + pad(score, 6), "One more run?", "TRY AGAIN");
        } else {
          resetBall();
        }
      }

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= (1 - 2.2 * dt); p.vy *= (1 - 2.2 * dt);
        if (p.t >= p.life) particles.splice(i, 1);
      }
      if (shakeT > 0) shakeT -= dt; else shake = 0;
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#04060C";
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

      // bricks
      for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.alive) continue;
        const c = ROW_COLORS[b.row];
        ctx.fillStyle = c;
        ctx.shadowColor = c;
        ctx.shadowBlur = 10;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(b.x, b.y + b.h - 4, b.w, 4);
      }

      // ball
      if (ball) {
        ctx.fillStyle = "#F2FFFA";
        ctx.shadowColor = "#3CFFA4";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // paddle
      ctx.fillStyle = "#3CFFA4";
      ctx.shadowColor = "#3CFFA4";
      ctx.shadowBlur = 16;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(paddle.x, paddle.y + paddle.h - 3, paddle.w, 3);

      // particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = 1 - p.t / p.life;
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ready aim guide
      if (ready && !running) {
        ctx.strokeStyle = "rgba(60,255,164,0.18)";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // level banner
      if (banner && bannerT > 0) {
        ctx.globalAlpha = Math.min(1, bannerT);
        ctx.fillStyle = "#3CFFA4";
        ctx.font = "700 30px Chakra Petch, sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "#3CFFA4"; ctx.shadowBlur = 20;
        ctx.fillText(banner, W / 2, H / 2 - 40);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    function loop(now) {
      const dt = clamp((now - last) / 1000, 0, 0.033);
      last = now;
      update(dt);
      render();
      if (running) raf = requestAnimationFrame(loop);
    }

    // input
    window.addEventListener("keydown", function (e) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
      keys[e.key] = true;
    });
    window.addEventListener("keyup", function (e) { keys[e.key] = false; });

    function pointer(e) {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) * (W / r.width);
      pointerTarget = clamp(x, 0, W);
      if (state === "running") hud.hideOverlay();
      e.preventDefault();
    }
    canvas.addEventListener("mousemove", pointer);
    canvas.addEventListener("touchmove", function (e) { pointer(e.touches[0]); }, { passive: false });
    canvas.addEventListener("touchstart", function (e) { pointer(e.touches[0]); }, { passive: false });

    hud.onStart(function () {
      hud.hideOverlay();
      if (state === "idle") stateTo("running");
      if (ready) launch();
    });
    hud.onRestart(reset);

    reset();
    watch(cab, function (v) {
      visible = v;
      if (v && running && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    });
  }

  /* ============================================================
     GAME 02 — BITWORM
     ============================================================ */
  function createBitworm(cab) {
    const N = 21, CELL = 20, SIZE = N * CELL; // 420
    const canvas = cab.querySelector("#game-bitworm");
    const ctx = setupCanvas(canvas, SIZE, SIZE);

    const hud = wireCabinet(cab, { scorePad: 4, livesFmt: function (n) { return n; } });

    let snake, dir, nextDir, food, score, stepMs, stepAcc;
    let raf, last, running, visible, alive;
    let flash, flashT;

    function randomFood() {
      const empty = [];
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          let hit = false;
          for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === x && snake[i].y === y) { hit = true; break; }
          }
          if (!hit) empty.push({ x: x, y: y });
        }
      }
      return empty[Math.floor(Math.random() * empty.length)];
    }

    function reset() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
      dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
      score = 0; stepMs = 150; stepAcc = 0; flash = 0; flashT = 0; alive = true;
      food = randomFood();
      hud.setScore(score); hud.setLives(snake.length);
      hud.showOverlay("READY", "Eat. Grow. Survive.", "WASD / arrows / swipe to steer.", "INSERT COIN");
      stateTo("idle");
    }

    function stateTo(s) {
      if (s === "running" && running !== true) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
      else if (s !== "running" && running === true) { running = false; cancelAnimationFrame(raf); raf = null; }
    }

    function setDir(d) {
      if (d.x === -dir.x && d.y === -dir.y) return;
      if ((d.x !== 0 && d.x !== dir.x) || (d.y !== 0 && d.y !== dir.y)) nextDir = d;
    }

    function step() {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N) return die();
      for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return die();
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        stepMs = Math.max(72, stepMs - 2.4);
        hud.setScore(score);
        food = randomFood();
        flash = 1; flashT = 0.25;
      } else {
        snake.pop();
      }
      hud.setLives(snake.length);
    }

    function die() {
      alive = false;
      stateTo("idle");
      hud.showOverlay("GAME OVER", "Length " + snake.length, "The machine won. This time.", "TRY AGAIN");
    }

    function update(dt) {
      if (!alive) return;
      stepAcc += dt * 1000;
      while (stepAcc >= stepMs) { stepAcc -= stepMs; step(); if (!alive) break; }
      if (flashT > 0) { flashT -= dt; flash = Math.max(0, flash - dt * 4); }
    }

    function render() {
      ctx.fillStyle = "#04060C";
      ctx.fillRect(0, 0, SIZE, SIZE);

      // grid
      ctx.strokeStyle = "rgba(69,200,255,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= N; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
      }

      // food
      const t = performance.now() / 1000;
      const pulse = 0.5 + Math.sin(t * 5) * 0.5;
      const fc = "#FF4D9D";
      ctx.save();
      ctx.translate(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2);
      ctx.fillStyle = fc;
      ctx.shadowColor = fc; ctx.shadowBlur = 14 + pulse * 10;
      ctx.fillRect(-6 + pulse * 2, -6 + pulse * 2, 12 - pulse * 4, 12 - pulse * 4);
      ctx.restore();

      // snake
      for (let i = snake.length - 1; i >= 0; i--) {
        const s = snake[i];
        const k = i / Math.max(snake.length - 1, 1);
        const col = i === 0 ? "#F2FFFA" : lerpColor("#3CFFA4", "#45C8FF", k);
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = i === 0 ? 14 : 8;
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      }
      ctx.shadowBlur = 0;

      // catch flash
      if (flash > 0) {
        ctx.fillStyle = "rgba(60,255,164," + (flash * 0.22) + ")";
        ctx.fillRect(0, 0, SIZE, SIZE);
      }
    }

    function lerpColor(a, b, k) {
      const pa = [60, 255, 164], pb = [69, 200, 255];
      const r = Math.round(pa[0] + (pb[0] - pa[0]) * k);
      const g = Math.round(pa[1] + (pb[1] - pa[1]) * k);
      const bl = Math.round(pa[2] + (pb[2] - pa[2]) * k);
      return "rgb(" + r + "," + g + "," + bl + ")";
    }

    function loop(now) {
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      update(dt);
      render();
      if (running) raf = requestAnimationFrame(loop);
    }

    // keyboard
    const keyMap = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
    };
    window.addEventListener("keydown", function (e) {
      const d = keyMap[e.key];
      if (d) { setDir(d); if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault(); }
    });

    // swipe
    let sw = { x: 0, y: 0 };
    canvas.addEventListener("touchstart", function (e) { sw = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
    canvas.addEventListener("touchmove", function (e) {
      const dx = e.touches[0].clientX - sw.x, dy = e.touches[0].clientY - sw.y;
      if (Math.abs(dx) > 24 || Math.abs(dy) > 24) {
        if (Math.abs(dx) > Math.abs(dy)) setDir({ x: dx > 0 ? 1 : -1, y: 0 });
        else setDir({ x: 0, y: dy > 0 ? 1 : -1 });
        sw = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    hud.onStart(function () { stateTo("running"); hud.hideOverlay(); });
    hud.onRestart(reset);

    reset();
    watch(cab, function (v) {
      visible = v;
      if (v && running && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    });
  }

  /* ============================================================
     GAME 03 — ZAPGRID
     ============================================================ */
  function createZapgrid(cab) {
    const SIZE = 420, GRID = 3, GAP = 16;
    const CELL = (SIZE - GAP * (GRID + 1)) / GRID; // ~118.6
    const canvas = cab.querySelector("#game-zapgrid");
    const ctx = setupCanvas(canvas, SIZE, SIZE);

    const hud = wireCabinet(cab, { scorePad: 3, livesFmt: function (n) { return "x" + n; } });

    const TIME = 30;
    let active, activeT, dwell, score, combo, timeLeft;
    let raf, last, running, visible, alive;
    let particles, flashCell, flashT;

    function randomActive() {
      let n;
      do { n = Math.floor(Math.random() * GRID * GRID); } while (n === active);
      return n;
    }

    function reset() {
      active = Math.floor(Math.random() * GRID * GRID);
      activeT = 0; dwell = 950; score = 0; combo = 1;
      timeLeft = TIME; alive = true;
      particles = []; flashCell = -1; flashT = 0;
      hud.setScore(score); hud.setLives(combo);
      hud.showOverlay("READY", "Catch the cell.", "Tap the lit cell before it moves.", "INSERT COIN");
      stateTo("idle");
    }

    function stateTo(s) {
      if (s === "running" && running !== true) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
      else if (s !== "running" && running === true) { running = false; cancelAnimationFrame(raf); raf = null; }
    }

    function cellPos(i) {
      const c = i % GRID, r = Math.floor(i / GRID);
      return { x: GAP + c * (CELL + GAP), y: GAP + r * (CELL + GAP) };
    }

    function cellFromXY(px, py) {
      for (let i = 0; i < GRID * GRID; i++) {
        const c = cellPos(i);
        if (px >= c.x && px <= c.x + CELL && py >= c.y && py <= c.y + CELL) return i;
      }
      return -1;
    }

    function burst(cx, cy, color, n) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 80 + Math.random() * 220;
        particles.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4 + Math.random() * 0.3, t: 0, c: color, s: 2 + Math.random() * 3 });
      }
    }

    function update(dt) {
      if (!alive) return;
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        alive = false;
        stateTo("idle");
        hud.showOverlay("GAME OVER", "Score " + pad(score, 3), "Best combo x" + combo + ". Beat it.", "TRY AGAIN");
        return;
      }
      activeT += dt * 1000;
      if (activeT >= dwell) {
        activeT = 0;
        active = randomActive();
        combo = 1;
        hud.setLives(combo);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= (1 - 2.4 * dt); p.vy *= (1 - 2.4 * dt);
        if (p.t >= p.life) particles.splice(i, 1);
      }
      if (flashT > 0) { flashT -= dt; if (flashT <= 0) flashCell = -1; }
    }

    function render() {
      ctx.fillStyle = "#04060C";
      ctx.fillRect(0, 0, SIZE, SIZE);

      // timer bar
      const frac = clamp(timeLeft / TIME, 0, 1);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(GAP, 10, SIZE - GAP * 2, 6);
      ctx.fillStyle = frac > 0.3 ? "#3CFFA4" : "#FF4D9D";
      ctx.fillRect(GAP, 10, (SIZE - GAP * 2) * frac, 6);

      const t = performance.now() / 1000;

      for (let i = 0; i < GRID * GRID; i++) {
        const c = cellPos(i);
        const isActive = i === active;
        ctx.fillStyle = isActive ? "rgba(60,255,164,0.10)" : "rgba(255,255,255,0.03)";
        ctx.fillRect(c.x, c.y, CELL, CELL);
        ctx.strokeStyle = isActive ? "rgba(60,255,164,0.5)" : "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(c.x + 0.5, c.y + 0.5, CELL - 1, CELL - 1);

        if (isActive && alive) {
          const pulse = 0.35 + Math.sin(t * 9) * 0.3 + Math.sin(t * 23) * 0.15;
          const glow = "rgba(60,255,164," + clamp(pulse, 0.15, 0.9) + ")";
          ctx.fillStyle = glow;
          ctx.shadowColor = "#3CFFA4"; ctx.shadowBlur = 26;
          ctx.fillRect(c.x + 8, c.y + 8, CELL - 16, CELL - 16);
          ctx.shadowBlur = 0;
        }
        if (flashCell === i && flashT > 0) {
          ctx.fillStyle = "rgba(255,255,255," + (flashT * 2) + ")";
          ctx.fillRect(c.x, c.y, CELL, CELL);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = 1 - p.t / p.life;
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c; ctx.shadowBlur = 8;
        ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    function loop(now) {
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      update(dt);
      render();
      if (running) raf = requestAnimationFrame(loop);
    }

    function handleTap(e) {
      const r = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      const px = (pt.clientX - r.left) * (SIZE / r.width);
      const py = (pt.clientY - r.top) * (SIZE / r.height);
      const cell = cellFromXY(px, py);
      const c = cellPos(cell);
      if (cell === active && alive) {
        score += combo;
        combo++;
        dwell = Math.max(360, 950 - combo * 16);
        activeT = 0;
        active = randomActive();
        hud.setScore(score);
        hud.setLives(combo);
        flashCell = cell; flashT = 0.12;
        burst(c.x + CELL / 2, c.y + CELL / 2, "#3CFFA4", 16);
      } else if (cell !== -1 && alive) {
        combo = 1;
        hud.setLives(combo);
        burst(c.x + CELL / 2, c.y + CELL / 2, "#FF4D9D", 10);
      }
      if (e.preventDefault) e.preventDefault();
    }
    canvas.addEventListener("mousedown", handleTap);
    canvas.addEventListener("touchstart", handleTap, { passive: false });

    hud.onStart(function () { stateTo("running"); hud.hideOverlay(); });
    hud.onRestart(reset);

    reset();
    watch(cab, function (v) {
      visible = v;
      if (v && running && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    const blockshot = document.querySelector("[data-game='blockshot']");
    const bitworm = document.querySelector("[data-game='bitworm']");
    const zapgrid = document.querySelector("[data-game='zapgrid']");
    if (blockshot) createBlockshot(blockshot);
    if (bitworm) createBitworm(bitworm);
    if (zapgrid) createZapgrid(zapgrid);
  });
})();
