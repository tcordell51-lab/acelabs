/* Mnemon overworld (window.AtlasAdventure), forked lean from the Living Atlas. Original pixel art, physical
 * walking, region zones only: every zone comes from a world file through AtlasRegion (atlas-region.js).
 * Tall grass (tile 3) on a route deals wild encounters; water (tile 2) blocks unless the zone's water move is known.
 * Plain ASCII. */
(function () {
  'use strict';
  const T = 32;
  // The base theme a zone falls back to; every world zone supplies its own theme.
  const BASE_THEME = { name: 'Field', area: 'Field', grass: '#3f7a52', light: '#4b8a5d', dark: '#2a5a3b', roof: '#c9a84c', trim: '#6b5a2a', water: '#2f6f7a', flower: '#e2c97a', creature: 'cytrus', npc: 'Guide' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const tileKey = (x, y) => `${x},${y}`;
  const courseCode = value => String(value || '').toUpperCase();
  const hash = (x, y) => Math.abs(((x * 374761393 + y * 668265263) ^ (x * y * 1274126177)) | 0) % 997;
  function create(canvas, options = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') throw new TypeError('AtlasAdventure needs a canvas.');
    let ctx = canvas.getContext('2d');   // let: the static tile layer (tileLayer) paints through the same helpers
    if (!ctx) throw new Error('A 2D canvas is required.');
    const host = canvas.parentElement;

    const onInteract = typeof options.onInteract === 'function' ? options.onInteract : () => {};
    const onStateChange = typeof options.onStateChange === 'function' ? options.onStateChange : () => {};
    const drawCreature = options.drawCreature || (window.AtlasWorld && window.AtlasWorld.drawCreature);
    const media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    const original = { tab: canvas.getAttribute('tabindex'), label: canvas.getAttribute('aria-label'), role: canvas.getAttribute('role'), touch: canvas.style.touchAction };
    const hadClass = host.classList.contains('atlas-adventure');
    host.classList.add('atlas-adventure');
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Walking world. Arrow keys or W A S D move. Space or Enter interacts. Touch controls are below.');
    canvas.style.touchAction = 'none';
    const hud = document.createElement('div');
    hud.className = 'aw-hud';
    hud.innerHTML = '<div class="aw-place"><span class="aw-eyebrow">ACE OF REALMS</span><strong class="aw-place-name"></strong><span class="aw-place-detail"></span><span class="aw-next" hidden></span></div><div class="aw-compass" aria-hidden="true">N</div>';
    const nextLine = hud.querySelector('.aw-next'); let nextLineAt = -1e9;
    const status = document.createElement('div'); status.className = 'aw-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const notice = document.createElement('div'); notice.className = 'aw-notice'; notice.setAttribute('role', 'status');
    const controls = document.createElement('div'); controls.className = 'aw-controls';
    controls.innerHTML = '<div class="aw-dpad" role="group" aria-label="Walk around the world"><button type="button" data-aw-dir="up" aria-label="Walk north"><i class="aw-arrow"></i></button><button type="button" data-aw-dir="left" aria-label="Walk west"><i class="aw-arrow"></i></button><span aria-hidden="true" class="aw-pad-center"></span><button type="button" data-aw-dir="right" aria-label="Walk east"><i class="aw-arrow"></i></button><button type="button" data-aw-dir="down" aria-label="Walk south"><i class="aw-arrow"></i></button></div><div class="aw-actions"><button type="button" class="aw-interact"><span class="aw-a">A</span><span class="aw-action-text">Explore</span></button><button type="button" class="aw-run" aria-pressed="true" title="Run at double speed. Shift switches between walking and running while held.">Run: on</button><span class="aw-controls-help">Walk, tap a path, A to interact, Shift to walk or run</span></div>';
    const nearbyPanel = document.createElement('div'); nearbyPanel.className = 'aw-nearby'; nearbyPanel.setAttribute('aria-label', 'Nearby destination');
    const interactButton = controls.querySelector('.aw-interact'), actionText = controls.querySelector('.aw-action-text'), runButton = controls.querySelector('.aw-run');
    // Running (10/18): twice the walking speed. "Always run" is a per-player preference in this browser
    // (ace_dat_realms_mnemon_v1_run_v1, '0' = off), on by default; holding Shift flips it while held (run when it is off,
    // walk when it is on). Movement is sub-stepped so a run step never tunnels through a wall tile.
    const RUN_KEY = 'ace_dat_realms_mnemon_v1_run_v1', RUN_FACTOR = 2, WALK_SPEED = 4.2;
    let alwaysRun = (() => { try { return localStorage.getItem(RUN_KEY) !== '0'; } catch (e) { return true; } })(), shiftHeld = false;
    function speed() { return WALK_SPEED * (alwaysRun !== shiftHeld ? RUN_FACTOR : 1); }
    function paintRun() { if (runButton) { runButton.setAttribute('aria-pressed', alwaysRun ? 'true' : 'false'); runButton.textContent = alwaysRun ? 'Run: on' : 'Run: off'; } }
    function setAlwaysRun(value) { alwaysRun = !!value; try { localStorage.setItem(RUN_KEY, alwaysRun ? '1' : '0'); } catch (e) {} paintRun(); }
    paintRun();
    host.append(hud, status, notice, nearbyPanel, controls);
    let partner = String(options.partner || 'cytrus');
    let reducedMotion = options.reducedMotion === undefined ? !!(media && media.matches) : !!options.reducedMotion;
    let zone, player = { x: 24.5, y: 31.5, facing: 'down', walk: 0 }, follower = { x: 24.1, y: 32.4 };
    let camera = { x: 0, y: 0 }, route = [], routeTarget = null, keys = new Set(), pointers = new Map(), touchStarts = new Map(), wildCooldowns = new Map();
    let autoWalk = false; // true while walkToNearest's route runs: no wild encounter interrupts it (10/18)
    let paused = false, destroyed = false, frame = 0, lastTime = 0, time = 0, lastSave = 0, lastNearby = null, lastEncounter = -60000, grassDistance = 0;
    // Generic arrival/battle grace from the original renderer; no curriculum or personal state copied.
    const GRASS_ARRIVE_MS = 3000, GRASS_AFTER_MS = 4000; let grassReadyAt = 0;
    const clockNow = () => { try { return Math.max(time, performance.now()); } catch (e) { return time; } };
    let width = 0, height = 0, scale = 1, dpr = 1, moving = false, nearby = null, noticeUntil = 0;
    const discoveries = new Set(Array.isArray(options.initialState && options.initialState.discoveries) ? options.initialState.discoveries.filter(x => typeof x === 'string').slice(0, 5000) : []);
    const listeners = [];
    function placeDetail() { if (zone) hud.querySelector('.aw-place-detail').textContent = zone.subtitle || ''; }
    function listen(el, name, fn, opts) { el.addEventListener(name, fn, opts); listeners.push(() => el.removeEventListener(name, fn, opts)); }
    function blank(kind, id, courseId, page, w, h) {
      return { kind, id, courseId, page, w, h, tiles: new Uint8Array(w * h).fill(0), blocks: new Set(), objects: [], buildings: [], theme: BASE_THEME, spawn: { x: w / 2 + .5, y: h - 6.5 } };
    }
    function setTile(map, x, y, type) { if (x >= 0 && y >= 0 && x < map.w && y < map.h) map.tiles[y * map.w + x] = type; }
    function fill(map, x, y, w, h, type) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setTile(map, i, j, type); }
    // Water blocks, except in a region whose team knows that water's move. A region map supplies
    // map.swim(x, y) (the world's own water move, Osmose in Biology), read live from
    // the team's move registry, so a sync or a partner swap can never strand a learned move. Else map.surf.
    function swimOk(map, x, y) { try { return map.swim ? !!map.swim(x, y) : !!map.surf; } catch (e) { return !!map.surf; } }
    function blocked(map, x, y) { return x < 0 || y < 0 || x >= map.w || y >= map.h || (map.tiles[y * map.w + x] === 2 && !swimOk(map, x, y)) || map.tiles[y * map.w + x] === 4 || map.blocks.has(tileKey(x, y)); }
    function tree(map, x, y) { if (!blocked(map, x, y) && map.tiles[y * map.w + x] === 0) { map.objects.push({ kind: 'tree', x: x + .5, y: y + .65 }); map.blocks.add(tileKey(x, y)); } }
    function decorate(map) {
      for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
        if (x < 2 || y < 2 || x >= map.w - 2 || y >= map.h - 2) { setTile(map, x, y, 4); continue; }
        if (map.tiles[y * map.w + x] === 0 && hash(x + map.page * 3, y) % 19 === 0) tree(map, x, y);
      }
    }
    function addBuilding(map, x, y, w, h, label, payload) {
      const doorX = x + Math.floor(w / 2), doorY = y + h;
      const building = { x, y, w, h, label, ...payload };
      map.buildings.push(building);
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) map.blocks.add(tileKey(i, j));
      fill(map, doorX - 1, doorY, 3, 2, 1);
      map.objects.push({ kind: 'door', x: doorX + .5, y: doorY + .5, label, ...payload });
      return building;
    }
    function portal(map, x, y, label, target) { fill(map, x - 1, y - 1, 3, 3, 1); map.objects.push({ kind: 'portal', x: x + .5, y: y + .5, label, target }); }
    function npc(map, x, y, name, text) { map.objects.push({ kind: 'npc', x: x + .5, y: y + .5, label: name, text }); map.blocks.add(tileKey(x, y)); }
    // Region zones are saved as course pages PAGE_BASE and up (AtlasRegion.zoneFromPage reads them back).
    const REGION = () => window.AtlasRegion;
    const regionKit = { blank, fill, setTile, addBuilding, portal, tree, tileKey };
    function regionIdFor(target) {
      const R = REGION(); if (!R || !target || !R.ZONES.length) return null;
      if (target.region) return R.ZONES.includes(target.region) ? target.region : null;
      if (Number(target.page) >= R.PAGE_BASE) { const z = R.zoneFromPage(target.page); if (z) return z; }
      const entry = target.courseId ? regionEntry(target.courseId) : null;
      return target.courseId ? entry : R.ZONES[0];
    }
    // Region zones save under their own course.
    function regionMap(id) { const R = REGION(), map = R.build(regionKit, id); map.kind = 'region'; map.courseId = R.courseOf ? R.courseOf(id) : ''; try { map.surf = !!(R.surfFor && R.surfFor(id)); } catch (e) { map.surf = false; } return map; }
    function regionEntry(courseId) { const R = REGION(); if (!R) return null; try { return R.entryFor ? R.entryFor(courseCode(courseId)) : null; } catch (e) { return null; } }
    function surfing() { return !!(zone && zone.kind === 'region' && zone.tiles[Math.floor(player.y) * zone.w + Math.floor(player.x)] === 2 && swimOk(zone, Math.floor(player.x), Math.floor(player.y))); }
    function regionCollected(o) { return o && o.action === 'item' && discoveries.has(o.id); }
    function getState() { return { zoneId: zone.id, kind: 'course', courseId: courseCode(zone.courseId), page: zone.page, lectureId: null, examId: null, x: Math.round(player.x * 1000) / 1000, y: Math.round(player.y * 1000) / 1000, facing: player.facing, discoveries: [...discoveries], region: zone.regionId }; }
    function save() { if (!destroyed) { lastSave = time; onStateChange(getState()); } }
    function canStand(x, y) {
      const r = .22;
      return !blocked(zone, Math.floor(x - r), Math.floor(y - r)) && !blocked(zone, Math.floor(x + r), Math.floor(y - r)) && !blocked(zone, Math.floor(x - r), Math.floor(y + r)) && !blocked(zone, Math.floor(x + r), Math.floor(y + r));
    }
    function clearMovement() { shiftHeld = false; keys.clear(); pointers.clear(); touchStarts.clear(); route = []; routeTarget = null; moving = false; controls.querySelectorAll('.is-held').forEach(el => el.classList.remove('is-held')); }
    function notify(text) { notice.textContent = text; noticeUntil = time + 7000; notice.classList.add('is-visible'); }
    function loadZone(target, position) {
      clearMovement();
      const regionId = regionIdFor(target);
      if (!regionId) throw new Error('No world zones are registered.');
      zone = regionMap(regionId);
      const p = position || zone.spawn;
      player.x = Number.isFinite(p.x) ? p.x : zone.spawn.x; player.y = Number.isFinite(p.y) ? p.y : zone.spawn.y;
      if (!canStand(player.x, player.y)) { player.x = zone.spawn.x; player.y = zone.spawn.y; }
      player.facing = ['up', 'down', 'left', 'right'].includes(p.facing) ? p.facing : 'up';
      follower.x = player.x - .5; follower.y = player.y + .6;
      camera.x = player.x * T; camera.y = player.y * T;
      hud.querySelector('.aw-place-name').textContent = zone.name;
      placeDetail();
      host.dataset.awCourse = courseCode(zone.courseId) || 'academy';
      lastNearby = null; grassDistance = 0; lastEncounter = time; grassReadyAt = clockNow() + GRASS_ARRIVE_MS; updateNearby(); save();
      status.textContent = `${zone.name}. ${zone.subtitle}. Walk with the direction pad or keyboard. Approach a building or a person and press A.`;
      if (zone.kind === 'region' && target.arrive) { const p2 = zone.objects.find(o => o.kind === 'portal' && o.target && o.target.kind === target.arrive.kind && (o.target.region || '') === (target.arrive.region || '')); if (p2) { for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [0, 2], [2, 0], [-2, 0]]) if (canStand(p2.x + dx, p2.y + dy)) { player.x = p2.x + dx; player.y = p2.y + dy; break; } follower.x = player.x - .5; follower.y = player.y + .6; camera.x = player.x * T; camera.y = player.y * T; updateNearby(); save(); } }
    }
    function nearestObject() {
      let found = null, best = 1.65;
      for (const o of zone.objects) {
        if (['tree', 'decor'].includes(o.kind) || regionCollected(o)) continue;
        const distance = Math.hypot(player.x - o.x, player.y - o.y);
        if (distance >= 1.65) continue;
        // The object the player is facing wins a near tie (10/18): standing under a signpost with a character beside
        // it, A reads the sign he faces instead of always talking to whichever was placed first.
        const fx = { left: -1, right: 1 }[player.facing] || 0, fy = { up: -1, down: 1 }[player.facing] || 0;
        const facing = (o.x - player.x) * fx + (o.y - player.y) * fy > .5;
        const score = distance - (facing ? .3 : 0);
        if (score < best) { best = score; found = o; }
      }
      return found;
    }
    function updateNearby() {
      nearby = nearestObject();
      const identity = nearby ? `${zone.id}:${nearby.kind}:${nearby.x}:${nearby.y}` : '';
      if (identity === lastNearby) return;
      lastNearby = identity;
      if (nearby) {
        const label = nearby.title || nearby.label || 'Interact';
        nearbyPanel.textContent = label;
        nearbyPanel.classList.add('is-visible');
        actionText.textContent = nearby.kind === 'region' ? (nearby.verb ? String(nearby.verb) : nearby.action === 'trainer' && nearby.beaten ? 'Rematch' : ({ sign: 'Read', trainer: 'Challenge', warden: 'Challenge', grunt: 'Confront', rival: 'Challenge', item: 'Pick up', puzzle: 'Play', shiny: 'Approach' })[nearby.action] || 'Talk') : nearby.kind === 'door' ? 'Enter' : nearby.kind === 'portal' ? 'Travel' : nearby.kind === 'chest' ? 'Discover' : 'Talk';
        interactButton.disabled = paused;
        interactButton.setAttribute('aria-label', `${actionText.textContent}: ${label}`);
        status.textContent = `Nearby: ${label}. Press A, Space, or Enter to ${actionText.textContent.toLowerCase()}.`;
      } else {
        nearbyPanel.classList.remove('is-visible'); nearbyPanel.textContent = ''; actionText.textContent = 'Explore'; interactButton.disabled = true; interactButton.setAttribute('aria-label', 'Walk near a building or a character to interact');
      }
    }
    function emit(payload) { clearMovement(); onInteract({ courseId: zone.courseId, zoneId: zone.id, page: zone.page, ...payload }); }
    function interact(o = nearby) {
      if (paused || !o) return;
      if (o.kind === 'door' && o.action) { emit({ kind: 'region', action: o.action, session: o.session || null, lectureId: o.lectureId || null, name: o.title, region: zone.regionId || null, handler: o.handler || null, id: o.id || null }); return; }
      if (o.kind === 'region') {
        if (o.action === 'item') {
          if (discoveries.has(o.id)) { notify('Nothing else here.'); return; }
          discoveries.add(o.id); save(); lastNearby = null; updateNearby();
          emit({ kind: 'region', action: 'item', id: o.id, coins: o.coins || 5, region: zone.regionId, title: o.title || '', session: o.session || zone.session || null });
          return;
        }
        // Signposts read (10/07): a warden's route checklist counts them (AtlasRegion.wardenChecklist).
        if (o.action === 'sign') { const sk = 'sign:' + zone.id + ':' + o.x + ',' + o.y; if (!discoveries.has(sk)) { discoveries.add(sk); save(); } }
        emit({ kind: 'region', action: o.action, session: o.session || zone.session || null, name: o.name || o.label, title: o.title, text: o.text || '', line: o.line || '', puzzle: o.puzzle || null, region: zone.regionId, id: o.id || null, handler: o.handler || null, beaten: !!o.beaten });
        return;
      }
      if (o.kind === 'portal') { const from = zone.kind === 'region' ? { kind: 'region', region: zone.regionId } : null; loadZone(from && o.target.kind === 'region' ? { ...o.target, arrive: from } : o.target); notify(zone.name); }
      else if (o.kind === 'chest') {
        const first = !discoveries.has(o.id); discoveries.add(o.id); save(); notify(first ? o.text : 'You already recorded this discovery.');
        emit({ kind: 'npc', name: o.label, text: first ? o.text : 'This discovery is already in your journey.', discoveryId: o.id, firstDiscovery: first });
      }
      else if (o.kind === 'npc') emit({ kind: 'npc', name: o.label, text: o.text });
    }
    function findPath(sx, sy, ex, ey) {
      sx = Math.floor(sx); sy = Math.floor(sy); ex = Math.floor(ex); ey = Math.floor(ey);
      if (blocked(zone, ex, ey)) return [];
      const start = sy * zone.w + sx, goal = ey * zone.w + ex, previous = new Int32Array(zone.w * zone.h).fill(-1), queue = [start];
      previous[start] = start;
      for (let cursor = 0; cursor < queue.length && previous[goal] < 0; cursor++) {
        const index = queue[cursor], x = index % zone.w, y = Math.floor(index / zone.w);
        for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          const nx = x + dx, ny = y + dy, next = ny * zone.w + nx;
          if (blocked(zone, nx, ny) || previous[next] >= 0) continue;
          previous[next] = index; queue.push(next);
        }
      }
      if (previous[goal] < 0) return [];
      const path = []; let at = goal;
      while (at !== start) { path.push({ x: at % zone.w + .5, y: Math.floor(at / zone.w) + .5 }); at = previous[at]; }
      return path.reverse();
    }
    function tapAt(clientX, clientY) {
      if (paused) return;
      const bounds = canvas.getBoundingClientRect();
      const x = (clientX - bounds.left - width / 2) / scale / T + camera.x / T;
      const y = (clientY - bounds.top - height / 2) / scale / T + camera.y / T;
      let target = null, best = 2;
      for (const o of zone.objects) { if (['tree', 'decor'].includes(o.kind) || regionCollected(o)) continue; const d = Math.hypot(x - o.x, y - o.y); if (d < best) { target = o; best = d; } }
      // Tapping a building selects its entrance even when its roof occupies blocked tiles.
      for (const b of zone.buildings) if (x >= b.x && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h) target = zone.objects.find(o => o.kind === 'door' && o.x === b.x + Math.floor(b.w / 2) + .5 && o.y === b.y + b.h + .5);
      const destinations = target ? [[target.x, target.y + 1], [target.x, target.y - 1], [target.x - 1, target.y], [target.x + 1, target.y]] : [[x, y]];
      let bestPath = null;
      for (const [dx, dy] of destinations) {
        const path = findPath(player.x, player.y, dx, dy);
        if (path.length && (!bestPath || path.length < bestPath.length)) bestPath = path;
        else if (Math.floor(player.x) === Math.floor(dx) && Math.floor(player.y) === Math.floor(dy) && target) { interact(target); return; }
      }
      if (bestPath) { route = bestPath; routeTarget = target; canvas.focus({ preventScroll: true }); }
      else if (target && Math.hypot(player.x - target.x, player.y - target.y) < 1.65) interact(target);
      else notify('That spot is blocked. Tap a path or use the direction pad.');
    }
    function move(dx, dy, dt) {
      const mag = Math.hypot(dx, dy); if (!mag) return 0;
      const step = speed() * dt, parts = Math.max(1, Math.ceil(step / .2)), mx = dx / mag * step / parts, my = dy / mag * step / parts;
      const oldX = player.x, oldY = player.y;
      for (let i = 0; i < parts; i++) { if (canStand(player.x + mx, player.y)) player.x += mx; if (canStand(player.x, player.y + my)) player.y += my; }
      player.facing = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up';
      const distance = Math.hypot(player.x - oldX, player.y - oldY);
      if (distance) player.walk += distance * 5;
      return distance;
    }
    function tick(dt) {
      if (paused || document.hidden) return;
      const before = moving;
      let dx = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0), dy = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);
      let distance = 0;
      if (dx || dy) { route = []; routeTarget = null; distance = move(dx, dy, dt); }
      else if (route.length) {
        const point = route[0], d = Math.hypot(point.x - player.x, point.y - player.y);
        if (d < speed() * dt + .015) {
          if (canStand(point.x, point.y)) { distance = d; player.x = point.x; player.y = point.y; route.shift(); }
          else { route = []; routeTarget = null; }
          if (!route.length && routeTarget) { const target = routeTarget; routeTarget = null; updateNearby(); if (Math.hypot(player.x - target.x, player.y - target.y) < 1.7) interact(target); }
        } else distance = move(point.x - player.x, point.y - player.y, dt);
      }
      moving = distance > .0001;
      const followDistance = Math.hypot(follower.x - player.x, follower.y - player.y);
      if (followDistance > .85) { const f = Math.min(1, dt * 6); follower.x += (player.x - follower.x) * f; follower.y += (player.y - follower.y) * f; }
      camera.x += (player.x * T - camera.x) * (reducedMotion ? 1 : Math.min(1, dt * 9)); camera.y += (player.y * T - camera.y) * (reducedMotion ? 1 : Math.min(1, dt * 9));
      if (!route.length) autoWalk = false;
      if (moving) {
        if (autoWalk) { lastEncounter = time; grassReadyAt = Math.max(grassReadyAt, time + GRASS_ARRIVE_MS); }
        updateNearby(); if (time - lastSave > 1100) save();
        const tile = zone.tiles[Math.floor(player.y) * zone.w + Math.floor(player.x)];
        if (tile === 3 && zone.kind === 'region' && zone.session && window.AtlasCourses?.sessionAvailability?.(courseCode(zone.courseId), zone.session)?.available) {
          grassDistance += distance;
          if (grassDistance > (3 + Math.random() * 3) * skyScale('grass') && time >= grassReadyAt) {
            grassDistance = 0; lastEncounter = time; grassReadyAt = time + GRASS_AFTER_MS; notify('Something rustles in the tall grass!');
            // A world can route its own grass: zone.wildAction names a custom handler; else the app deals the route's wild battle.
            emit(zone.wildAction ? { kind: 'region', action: 'custom', handler: zone.wildAction, session: zone.session, region: zone.regionId, id: zone.wildAction + ':step:' + zone.session } : { kind: 'region', action: 'wild', session: zone.session, region: zone.regionId });
          }
        } else if (tile === 2 && zone.kind === 'region' && surfing()) {
          // Bridge creatures surface while crossing water: a little rarer than grass encounters.
          grassDistance += distance;
          if (grassDistance > (5 + Math.random() * 4) * skyScale('water') && time - lastEncounter > 12000 * skyScale('water')) {
            grassDistance = 0; lastEncounter = time; notify('Something is swimming beneath you!');
            emit({ kind: 'region', action: 'water', region: zone.regionId });
          }
        } else grassDistance = Math.max(0, grassDistance - distance * .15);
      } else if (before) save();
    }
    function resize() {
      const bounds = canvas.getBoundingClientRect(); width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); scale = width < 550 ? 1 : width < 900 ? 1.2 : 1.45;
    }
    function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h)); }
    // Perf (10/23): the static tile layer. A zone's tiles are painted once into an offscreen canvas and each frame copies
    // the visible part in one drawImage; only animated tiles (water, and overlays whose painter reads the time) are
    // still drawn per frame on top. It rebuilds by itself when the zone, its tiles, its overlays or Reduce animation
    // change. window.AtlasTileCache = false turns it off (the old per-tile path).
    const STATIC_RD = new Set(['solid', 'tint', 'web', 'grid', 'stripeh', 'stripev', 'dots', 'roof', 'brick', 'plank', 'checker', 'scale']);
    const ovAnim = new Map(); let probeCanvas = null, layer = null;
    function overlayAnimated(type) {
      const key = String(type); if (ovAnim.has(key)) return ovAnim.get(key);
      let anim = true;
      if (key.startsWith('rd|')) anim = !STATIC_RD.has(key.split('|')[1]);
      else {
        let used = false; const probe = { rect() {}, get time() { used = true; return 0; }, get reduced() { return false; } };
        try { probeCanvas = probeCanvas || document.createElement('canvas'); probeCanvas.width = T; probeCanvas.height = T; REGION()?.drawTile?.(probeCanvas.getContext('2d'), type, 0, 0, probe); anim = used; } catch (e) { anim = true; }
      }
      ovAnim.set(key, anim); return anim;
    }
    function tileSig() { const t = zone.tiles; let s = zone.w * 131 + zone.h; for (let i = 0; i < t.length; i++) s = (s * 31 + t[i]) | 0; return s + ':' + (zone.overlay ? zone.overlay.size : 0) + ':' + (reducedMotion ? 1 : 0); }
    function tileLayer() {
      if (window.AtlasTileCache === false || !zone || !zone.tiles) return null;
      const sig = tileSig();
      if (layer && layer.zone === zone && layer.sig === sig) return layer;
      layer = null;
      const W = zone.w * T, H = zone.h * T; if (!W || !H || W > 4096 || H > 4096) return null;
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); if (!g) return null;
      const anim = new Uint8Array(zone.w * zone.h), main = ctx;
      try {
        ctx = g; g.imageSmoothingEnabled = false;
        for (let y = 0; y < zone.h; y++) for (let x = 0; x < zone.w; x++) {
          const i = y * zone.w + x, type = zone.tiles[i]; tileDraw(x, y, type);
          let a = type === 2 && !reducedMotion; if (!a && zone.overlay) { const ov = zone.overlay.get(x + ',' + y); if (ov) a = overlayAnimated(ov); }
          anim[i] = a ? 1 : 0;
        }
      } catch (e) { return null; } finally { ctx = main; }
      layer = { zone, sig, canvas: c, anim }; return layer;
    }
    function tileDraw(x, y, type) {
      baseTileDraw(x, y, type);
      const ov = zone.overlay && zone.overlay.get(x + ',' + y);
      if (ov) { try { REGION()?.drawTile?.(ctx, ov, x * T, y * T, { rect, time, reduced: reducedMotion }); } catch (e) {} }
    }
    function baseTileDraw(x, y, type) {
      const px = x * T, py = y * T, h = hash(x, y), th = zone.theme;
      if (type === 2) {
        rect(px, py, T, T, th.water); rect(px, py + 5 + (reducedMotion ? 0 : Math.sin(time / 750 + x + y) * 2), 10, 2, '#afdccc'); rect(px + 18, py + 22, 12, 2, '#92cbd0');
      } else if (type === 4) {
        rect(px, py, T, T, th.wallColor || th.dark);
        if (th.wall === 'stone' && zone.kind === 'region') { rect(px, py, T, 3, th.wallTop); rect(px + 1, py + 4, 14, 12, th.wallTop); rect(px + 17, py + 4, 14, 12, th.wallTop); rect(px + 8, py + 18, 15, 12, th.wallTop); rect(px, py + 18, 6, 12, th.wallTop); rect(px + 25, py + 18, 7, 12, th.wallTop); }
        else if (th.wall === 'rock' && zone.kind === 'region') { rect(px + 2, py + 6, 28, 24, th.wallColor); rect(px + 5, py + 3, 18, 12, th.wallTop); rect(px + 18, py + 12, 11, 9, th.wallTop); rect(px + 4, py + 26, 26, 4, '#5f6f68'); }
        else { rect(px + 4, py + 2, 24, 28, '#468d72'); rect(px + 8, py, 16, 9, '#71ad80'); rect(px + 2, py + 15, 28, 9, '#397b67'); }
      } else if (type === 5) {
        rect(px, py, T, T, (x + y) % 2 ? (th.floorA || '#dbc69d') : (th.floorB || '#e8d7af')); rect(px, py, 1, T, th.floorLine || '#c4b68f'); rect(px, py, T, 1, th.floorLine || '#c4b68f');
      } else if (type === 1) {
        if (th.pathStyle === 'cobble') { rect(px, py, T, T, th.pathDark); for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) rect(px + 1 + i * 16 + (j % 2) * 8 - (j % 2 && i ? 16 : 0), py + 1 + j * 8, 14, 6, (h + i + j) % 3 ? th.path : '#e6cda4'); }
        else if (th.pathStyle === 'tile') { rect(px, py, T, T, th.path); rect(px, py, T, 1, th.pathDark); rect(px, py, 1, T, th.pathDark); rect(px + 15, py + 15, 2, 2, th.pathDark); }
        else { rect(px, py, T, T, th.path || '#e8d3a1'); rect(px + 3, py + 4, 11, 2, th.pathDark || '#dbc494'); rect(px + 23, py + 22, 4, 3, '#c9b888'); if (h % 3 === 0) rect(px + 14, py + 14, 3, 2, '#f7e5b5'); }
      } else {
        rect(px, py, T, T, h % 3 ? th.grass : th.light);
        if (type === 3) {
          for (let i = 0; i < 4; i++) { const xx = px + 3 + (i % 2) * 15, yy = py + 7 + Math.floor(i / 2) * 15; rect(xx, yy, 2, 8, th.dark); rect(xx + 3, yy - 3, 2, 10, th.dark); rect(xx + 6, yy, 2, 8, th.dark); }
        } else { rect(px + h % 24, py + h % 17, 2, 3, th.dark); if (h % 8 === 0) { rect(px + 9, py + 18, 4, 4, th.flower); rect(px + 10, py + 19, 2, 2, '#fcf6d0'); } }
      }
    }
    // Sky (sky.js): weather nudges encounter rates; labels queue while the map is tinted so they stay bright.
    function skyScale(kind) { const SK = window.AtlasSky; return SK && SK.encounterScale ? SK.encounterScale(zone.courseId, kind) : 1; }
    const skyFrame = { zone: null, cx: 0, cy: 0, w: 0, h: 0, dpr: 1, scale: 1, time: 0, reduced: false, host };
    function label(text, x, y, color = '#234c4e', wide = false, fontSize = 10) {
      if (skyDefer && window.AtlasSky.defer(text, x, y, color, wide, fontSize)) return;
      ctx.font = 'bold '+fontSize+'px system-ui, sans-serif'; ctx.textAlign = 'center'; const measure = Math.min(wide ? 190 : 115, ctx.measureText(text).width + 12);
      rect(x - measure / 2, y - 12, measure, 17, '#fff2ce'); rect(x - measure / 2, y + 5, measure, 2, '#a7a783'); ctx.fillStyle = color; ctx.fillText(text, Math.round(x), Math.round(y), measure - 8);
    }
    function buildingDraw(b) {
      const x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T, roof = b.roof || zone.theme.roof, trim = b.trim || zone.theme.trim;
      rect(x + 8, y + 18, w - 4, h - 10, '#728b76'); rect(x + 7, y + 36, w - 14, h - 28, '#f1ddb0'); rect(x + 7, y + h - 17, w - 14, 25, '#c5b68c');
      for (let row = 0; row < 4; row++) { rect(x + 4 + row * 5, y + row * 9, w - 8 - row * 10, 11, roof); rect(x + 4 + row * 5, y + row * 9 + 9, w - 8 - row * 10, 3, trim); }
      rect(x, y + 34, w, 8, trim);
      for (const wx of [x + 23, x + w - 51]) { rect(wx, y + 55, 28, 31, trim); rect(wx + 3, y + 58, 22, 25, '#88b8bf'); rect(wx + 12, y + 58, 3, 25, '#f9e8b8'); rect(wx + 3, y + 69, 22, 3, '#f9e8b8'); }
      const doorX = (b.x + Math.floor(b.w / 2)) * T;
      rect(doorX - 3, y + h - 39, 37, 47, trim); rect(doorX + 2, y + h - 34, 27, 42, '#496763'); rect(doorX + 22, y + h - 14, 3, 4, '#f0d47e'); rect(doorX - 5, y + h + 4, 41, 8, '#d5c393');
      label(b.label, x + w / 2, y + 65, '#3b5550', false);
      if (b.destination === 'gym') { rect(x + w / 2 - 8, y + 79, 16, 18, '#f4ce78'); rect(x + w / 2 - 11, y + 84, 22, 8, '#f4ce78'); rect(x + w / 2 - 3, y + 95, 6, 8, '#f4ce78'); }
      if (b.destination === 'shop') { rect(x + w / 2 - 10, y + 80, 20, 16, '#f3ead2'); rect(x + w / 2 - 6, y + 74, 12, 8, '#6f97c4'); rect(x + w / 2 - 3, y + 76, 6, 4, '#f3ead2'); }
      if (b.destination === 'clinic') { rect(x + w / 2 - 4, y + 77, 8, 24, '#cf7279'); rect(x + w / 2 - 12, y + 85, 24, 8, '#cf7279'); }
      if (b.destination === 'interior') { rect(x + w / 2 - 11, y + 82, 22, 17, '#fdf0ce'); rect(x + w / 2, y + 83, 1, 15, '#b69d73'); rect(x + w / 2 - 8, y + 87, 6, 1, '#b69d73'); rect(x + w / 2 + 3, y + 87, 6, 1, '#b69d73'); }
    }
    function treeDraw(o) {
      const x = o.x * T, y = o.y * T;
      rect(x - 6, y - 13, 12, 24, '#956b4d'); rect(x - 19, y - 32, 38, 21, '#397e62'); rect(x - 15, y - 47, 30, 23, '#519871'); rect(x - 9, y - 52, 18, 16, '#71b383'); rect(x - 20, y - 15, 40, 7, '#306d5d'); rect(x - 13, y - 36, 6, 9, '#7abb85');
    }
    function personDraw(x, y, facing, phase, isNpc) {
      const p = Math.sin(phase) > 0 ? 2 : -2, c = isNpc ? '#f0ede0' : '#3f8185';
      rect(x - 10, y + 8, 21, 5, 'rgba(39,73,67,.22)'); rect(x - 7, y - 9, 14, 20, c); rect(x - 9, y - 7, 4, 14, isNpc ? '#cdbfbb' : '#28535e'); rect(x + 5, y - 7, 4, 14, c);
      rect(x - 7, y + 8, 5, 7 + (moving && !isNpc ? p : 0), '#344751'); rect(x + 2, y + 8, 5, 7 - (moving && !isNpc ? p : 0), '#344751');
      rect(x - 7, y - 22, 14, 13, '#ecc59e'); rect(x - 8, y - 27, 16, 7, isNpc ? '#7d6968' : '#f2c668'); rect(x - 10, y - 22, 20, 3, isNpc ? '#7d6968' : '#bc7d40');
      if (facing !== 'up') { rect(x - 4 + (facing === 'right' ? 4 : 0), y - 18, 2, 2, '#344751'); if (facing === 'down') rect(x + 3, y - 18, 2, 2, '#344751'); }
      if (!isNpc && facing === 'up') { rect(x - 6, y - 6, 12, 12, '#d18458'); rect(x - 4, y - 4, 8, 3, '#efc376'); }
    }
    function objectDraw(o) {
      const x = o.x * T, y = o.y * T;
      if (o.kind === 'region' || o.kind === 'decor') {
        const helpers = { rect, label, time, reduced: reducedMotion, near: t => Math.hypot(player.x - t.x, player.y - t.y), collected: regionCollected,
          person: (px, py, shirt, hair) => { personDraw(px, py, 'down', 0, true); rect(px - 7, py - 9, 14, 18, shirt); rect(px - 8, py - 27, 16, 7, hair); rect(px - 10, py - 22, 20, 3, hair); },
          bubble: (px, py) => { rect(px + 8, py - 42, 13, 9, '#fff2ce'); rect(px + 10, py - 33, 3, 3, '#fff2ce'); rect(px + 11, py - 38, 2, 2, '#739185'); rect(px + 16, py - 38, 2, 2, '#739185'); } };
        let drawn = false; try { drawn = !!REGION()?.draw(ctx, o, x, y, helpers); } catch (e) { drawn = false; }
        if (!drawn && o.kind === 'region') personDraw(x, y, 'down', 0, true);
      }
      else if (o.kind === 'tree') treeDraw(o);
      else if (o.kind === 'npc') {
        personDraw(x, y, 'down', 0, true);
        if (Math.hypot(player.x - o.x, player.y - o.y) < 4) label(o.label, x, y - 38);
      }
      else if (o.kind === 'portal') {
        rect(x - 18, y - 3, 36, 11, '#e8dcb4'); rect(x - 13, y - 1, 26, 7, '#9cae8d'); rect(x - 3, y - 21, 6, 23, '#9b7452'); rect(x - 22, y - 30, 44, 18, '#f6e0ad'); rect(x - 18, y - 23, 30, 3, '#608079'); rect(x + 9, y - 26, 6, 9, '#608079');
        if (Math.hypot(player.x - o.x, player.y - o.y) < 5) label(o.label, x, y - 39, '#234c4e', true);
      } else if (o.kind === 'chest') {
        const open = discoveries.has(o.id); rect(x - 12, y - 7, 24, 19, '#785b46'); rect(x - 10, y - 5, 20, 15, '#d3a05c'); rect(x - 12, y - (open ? 16 : 9), 24, 8, '#a4774c'); rect(x - 2, y - 3, 4, 7, '#fff1b4');
        if (!open && !reducedMotion && Math.sin(time / 400) > .6) { rect(x + 17, y - 19, 2, 8, '#fff3bc'); rect(x + 14, y - 16, 8, 2, '#fff3bc'); }
      }
    }
    function creatureDraw(x, y) {
      if (typeof drawCreature === 'function') drawCreature(ctx, partner, x, y, .95);
      else { rect(x - 9, y - 4, 18, 13, '#eeb566'); rect(x - 7, y - 12, 5, 10, '#eeb566'); rect(x + 3, y - 12, 5, 10, '#eeb566'); rect(x - 5, y, 2, 2, '#344751'); rect(x + 4, y, 2, 2, '#344751'); }
    }
    let skyDefer = false;
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false;
      const SKY = window.AtlasSky; try { skyDefer = !!(SKY && SKY.begin(zone)); } catch (e) { skyDefer = false; }
      rect(0, 0, width, height, '#0b1a10');
      ctx.save(); ctx.translate(Math.round(width / 2 - camera.x * scale), Math.round(height / 2 - camera.y * scale)); ctx.scale(scale, scale);
      const left = Math.max(0, Math.floor((camera.x - width / scale / 2) / T) - 2), right = Math.min(zone.w, Math.ceil((camera.x + width / scale / 2) / T) + 2);
      const top = Math.max(0, Math.floor((camera.y - height / scale / 2) / T) - 3), bottom = Math.min(zone.h, Math.ceil((camera.y + height / scale / 2) / T) + 3);
      const L = tileLayer();
      if (L) { const sx = left * T, sy = top * T, sw = (right - left) * T, sh = (bottom - top) * T; if (sw > 0 && sh > 0) ctx.drawImage(L.canvas, sx, sy, sw, sh, sx, sy, sw, sh);
        for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) if (L.anim[y * zone.w + x]) tileDraw(x, y, zone.tiles[y * zone.w + x]); }
      else for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) tileDraw(x, y, zone.tiles[y * zone.w + x]);
      if (route.length) { const end = route[route.length - 1]; rect(end.x * T - 8, end.y * T - 2, 16, 4, '#fff7ca'); rect(end.x * T - 2, end.y * T - 8, 4, 16, '#fff7ca'); }
      const drawables = zone.buildings.map(b => ({ y: b.y + b.h, draw: () => buildingDraw(b) }));
      zone.objects.filter(o => o.kind !== 'door' && o.x > left - 3 && o.x < right + 3 && o.y > top - 3 && o.y < bottom + 3).forEach(o => drawables.push({ y: o.y + (o.kind === 'tree' ? .3 : 0), draw: () => objectDraw(o) }));
      // Crossing water: the partner rides along out of sight, and the player rides a bubble.
      const riding = surfing(), followerWet = zone.kind === 'region' && zone.tiles[Math.floor(follower.y) * zone.w + Math.floor(follower.x)] === 2;
      if (!riding && !followerWet) drawables.push({ y: follower.y, draw: () => creatureDraw(follower.x * T, follower.y * T) });
      drawables.push({ y: player.y, draw: () => { if (riding && REGION()?.drawSurfer) REGION().drawSurfer(ctx, player.x * T, player.y * T, { rect, time, reduced: reducedMotion }, (px, py) => personDraw(px, py, player.facing, 0, false)); else personDraw(player.x * T, player.y * T, player.facing, reducedMotion ? 0 : player.walk, false); } });
      drawables.sort((a, b) => a.y - b.y).forEach(o => o.draw());
      if (SKY) { skyFrame.zone = zone; skyFrame.cx = camera.x; skyFrame.cy = camera.y; skyFrame.w = width; skyFrame.h = height; skyFrame.dpr = dpr; skyFrame.scale = scale; skyFrame.time = time; skyFrame.reduced = reducedMotion; try { SKY.paint(ctx, skyFrame); } catch (e) {} skyDefer = false; try { SKY.flush(label); } catch (e) {} ctx.imageSmoothingEnabled = false; }
      if (nearby && !paused) { const pulse = reducedMotion ? 0 : Math.sin(time / 220) * 2; rect(nearby.x * T - 3, nearby.y * T - 43 + pulse, 6, 6, '#fff4c4'); rect(nearby.x * T - 1, nearby.y * T - 37 + pulse, 2, 4, '#fff4c4'); }
      // Quest objective (10/21, atlas-region.js setObjective): a marker on the map, then the minimap and HUD arrow.
      const objFrame = zone.kind === 'region' && REGION() && REGION().drawObjective ? { zone, player, camera, scale, width, height, T, time, reduced: reducedMotion } : null;
      if (objFrame) { try { REGION().drawObjective(ctx, objFrame); } catch (e) {} }
      ctx.restore();
      if (objFrame && REGION().drawHUD) { try { REGION().drawHUD(ctx, objFrame); } catch (e) {} ctx.imageSmoothingEnabled = false; }
      if (time - nextLineAt > 500) { nextLineAt = time; let t = ''; try { t = zone.kind === 'region' && REGION() && REGION().objectiveText ? REGION().objectiveText(zone, player) : ''; } catch (e) { t = ''; } if (t !== nextLine.textContent) { nextLine.textContent = t; nextLine.hidden = !t; } }
      if (noticeUntil && time > noticeUntil) { notice.classList.remove('is-visible'); noticeUntil = 0; }
    }
    // Perf (10/23): while a panel or battle has the world paused, the map behind it redraws about 8 times a second
    // instead of 60, so the panel in front gets the main thread; walking frames are untouched.
    let pausedDrawAt = 0;
    function animate(stamp) { if (destroyed) return; const dt = Math.min(.04, lastTime ? (stamp - lastTime) / 1000 : .016); lastTime = stamp; time = stamp;
      if (paused && stamp - pausedDrawAt < 120) { frame = requestAnimationFrame(animate); return; } if (paused) pausedDrawAt = stamp;
      tick(dt); draw(); frame = requestAnimationFrame(animate); }
    const directions = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
    function editable(target) { return target && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.closest('dialog[open], [role="dialog"]')); }
    listen(window, 'keydown', e => {
      if (paused || editable(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      // Scope movement to this world when it is visible; modal focus never drives the map.
      if (host.getClientRects().length === 0 || (e.target !== document.body && e.target !== canvas && !host.contains(e.target))) return;
      if (directions[e.key]) { e.preventDefault(); keys.add(directions[e.key]); }
      else if ((e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') && (e.target === canvas || e.target === document.body || host.contains(e.target))) { e.preventDefault(); if (!e.repeat) interact(); }
    });
    listen(window, 'keyup', e => { if (e.key === 'Shift') shiftHeld = false; if (directions[e.key]) keys.delete(directions[e.key]); });
    listen(window, 'keydown', e => { if (e.key === 'Shift' && !editable(e.target)) shiftHeld = true; });
    if (runButton) listen(runButton, 'click', () => { setAlwaysRun(!alwaysRun); notify(alwaysRun ? 'Running. Hold Shift to walk.' : 'Walking. Hold Shift to run.'); });
    listen(window, 'blur', clearMovement);
    listen(document, 'visibilitychange', () => { if (document.hidden) { clearMovement(); save(); } lastTime = 0; });
    controls.querySelectorAll('[data-aw-dir]').forEach(button => {
      const direction = button.dataset.awDir;
      listen(button, 'pointerdown', e => { if (paused) return; e.preventDefault(); route = []; routeTarget = null; pointers.set(e.pointerId, direction); touchStarts.set(e.pointerId, { x: player.x, y: player.y, zoneId: zone.id, time: e.timeStamp }); keys.add(direction); button.classList.add('is-held'); if (button.setPointerCapture) button.setPointerCapture(e.pointerId); });
      const release = (e, allowTap = false) => {
        const start = touchStarts.get(e.pointerId); touchStarts.delete(e.pointerId); pointers.delete(e.pointerId);
        if (![...pointers.values()].includes(direction)) { keys.delete(direction); button.classList.remove('is-held'); }
        // A tap can begin and end between frames. Give it a short, collision-checked
        // walking route; a hold that already moved never gets an extra step.
        const elapsed = start && Number.isFinite(start.time) && Number.isFinite(e.timeStamp) ? e.timeStamp - start.time : 0;
        if (allowTap && start && !paused && !document.hidden && !pointers.size && start.zoneId === zone.id && elapsed >= 0 && elapsed <= 220 && Math.hypot(player.x - start.x, player.y - start.y) < .001) {
          const [dx, dy] = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }[direction];
          const target = { x: player.x + dx * .5, y: player.y + dy * .5 };
          if (canStand(target.x, target.y)) { route = [target]; routeTarget = null; }
        }
      };
      listen(button, 'pointerup', e => release(e, true)); listen(button, 'pointercancel', release); listen(button, 'lostpointercapture', release);
      listen(button, 'keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !paused) { e.preventDefault(); e.stopPropagation(); keys.add(direction); button.classList.add('is-held'); } });
      listen(button, 'keyup', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); keys.delete(direction); button.classList.remove('is-held'); } });
      listen(button, 'blur', () => { keys.delete(direction); button.classList.remove('is-held'); });
    });
    listen(interactButton, 'click', () => interact());
    let tapStart = null;
    listen(canvas, 'pointerdown', e => { if (e.isPrimary !== false) tapStart = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
    listen(canvas, 'pointerup', e => { if (tapStart && tapStart.id === e.pointerId && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) < 16) tapAt(e.clientX, e.clientY); tapStart = null; });
    listen(canvas, 'pointercancel', () => { tapStart = null; });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(canvas); else listen(window, 'resize', resize);
    function setState(state) {
      if (!state || typeof state !== 'object') return;
      if (Array.isArray(state.discoveries)) { discoveries.clear(); state.discoveries.filter(x => typeof x === 'string').slice(0, 5000).forEach(x => discoveries.add(x)); }
      loadZone({ kind: 'region', courseId: state.courseId, page: state.page, region: typeof state.region === 'string' ? state.region : undefined }, state);
    }
    function setPaused(value) { paused = !!value; clearMovement(); host.classList.toggle('aw-paused', paused); interactButton.disabled = paused || !nearby; controls.querySelectorAll('[data-aw-dir]').forEach(b => { b.disabled = paused; }); lastTime = 0; }
    resize();
    if (options.initialState) setState(options.initialState); else loadZone({ kind: 'region', courseId: options.course || '' });
    frame = requestAnimationFrame(animate);
    return {
      getState, setState, setPaused,
      travelToRegion(id) { if (!REGION()?.ZONES.includes(id)) return false; loadZone({ kind: 'region', region: id }); return true; },
      refresh() { if (zone && zone.kind === 'region') { const p = { x: player.x, y: player.y, facing: player.facing }; loadZone({ kind: 'region', region: zone.regionId }, p); grassReadyAt = clockNow() + GRASS_AFTER_MS; } },
      // The current zone's objects and the discovery log, for the warden's route checklist.
      zoneObjects() { return zone && Array.isArray(zone.objects) ? zone.objects.map(o => ({ ...o })) : []; },
      isDiscovered(id) { return discoveries.has(String(id)); },
      zoneInfo() { return { id: zone.id, kind: zone.kind, region: zone.regionId || null, session: zone.session || null, music: zone.music || null, name: zone.name }; },
      setPartner(id) { partner = String(id || 'cytrus'); },
      setReducedMotion(value) { reducedMotion = !!value; },
      setAlwaysRun(value) { setAlwaysRun(value); }, alwaysRun() { return alwaysRun; },
      // Auto-path (10/18): walk to the nearest of these map spots ({x, y} object centers) by the shortest
      // collision-checked route, the same pathing a tap uses. Signposts and glints are read or picked up on
      // arrival; anything else (a trainer, a station) waits for A. Returns the spot chosen, or null.
      walkToNearest(points) {
        if (paused || !zone || !Array.isArray(points)) return null; let best = null, bestPath = null, bestObj = null;
        for (const p of points) {
          if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
          const o = zone.objects.find(z => z.x === p.x && z.y === p.y && z.kind !== 'decor' && z.kind !== 'tree') || null;
          if (Math.hypot(player.x - p.x, player.y - p.y) < 1.65) { if (o && (o.action === 'sign' || o.action === 'item')) interact(o); return p; }
          for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
            const path = findPath(player.x, player.y, p.x + dx, p.y + dy);
            if (path.length && (!bestPath || path.length < bestPath.length)) { bestPath = path; best = p; bestObj = o; }
          }
        }
        if (!bestPath) return null;
        route = bestPath; autoWalk = true; routeTarget = bestObj && (bestObj.action === 'sign' || bestObj.action === 'item') ? bestObj : null; return best;
      },
      interact() { interact(); },
      destroy() { if (destroyed) return; save(); destroyed = true; cancelAnimationFrame(frame); clearMovement(); listeners.forEach(fn => fn()); if (observer) observer.disconnect(); [hud, status, notice, nearbyPanel, controls].forEach(el => el.remove()); if (!hadClass) host.classList.remove('atlas-adventure'); host.classList.remove('aw-paused'); delete host.dataset.awCourse; for (const [key, attr] of [['tab', 'tabindex'], ['label', 'aria-label'], ['role', 'role']]) { if (original[key] === null) canvas.removeAttribute(attr); else canvas.setAttribute(attr, original[key]); } canvas.style.touchAction = original.touch; }
    };
  }
  window.AtlasAdventure = Object.freeze({ create, baseTheme: BASE_THEME });
}());