// 一覧の地図を、MapLibre(地図を回転・傾けられる仕組み)で動かすための部品
//   ・これまでの地図(Leaflet)と同じ呼び方(setView・fitBounds・ピン・吹き出し・まとめ表示)で使えるようにしてある
//     (js/app.js などの、地図を使う側のプログラムは、ほとんど変えずに済むように)
//   ・ズームの数字は、これまで(Leaflet)と同じ数え方で受け渡す(MapLibre の内部の数字は、それより 1 小さい)
//   ・MapLibre や WebGL が使えない古い端末では、使わない(js/app.js が、これまでの Leaflet の地図にする)
(function () {
  const ZOOM_SHIFT = 1; // Leaflet のズーム = MapLibre のズーム + 1

  const toLngLat = (ll) => {
    if (Array.isArray(ll)) return [Number(ll[1]), Number(ll[0])];
    return [Number(ll.lng), Number(ll.lat)];
  };
  const toLatLngObj = (lngLat) => makeLatLng(lngLat.lat, lngLat.lng);
  function makeLatLng(lat, lng) {
    return {
      lat,
      lng,
      // 2点の距離(m)
      distanceTo(o) {
        const R = 6371000;
        const toRad = (d) => (d * Math.PI) / 180;
        const oLat = Array.isArray(o) ? o[0] : o.lat;
        const oLng = Array.isArray(o) ? o[1] : o.lng;
        const dLat = toRad(oLat - lat);
        const dLng = toRad(oLng - lng);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(oLat)) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
      },
    };
  }

  // 地図が見えている範囲(回転・傾けていても正しく判定できるよう、画面の四隅を結んだ形で持つ)
  function makeViewBounds(gl) {
    const c = gl.getContainer();
    const w = c.clientWidth;
    const h = c.clientHeight;
    const corners = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ].map((p) => gl.unproject(p));
    const poly = corners.map((ll) => [ll.lng, ll.lat]);
    return {
      contains(latlng) {
        const [x, y] = toLngLat(latlng);
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const [xi, yi] = poly[i];
          const [xj, yj] = poly[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
      },
      getNorthEast: () => {
        const b = gl.getBounds();
        return makeLatLng(b.getNorth(), b.getEast());
      },
      getSouthWest: () => {
        const b = gl.getBounds();
        return makeLatLng(b.getSouth(), b.getWest());
      },
    };
  }

  // Leaflet の fitBounds の余白の指定を、MapLibre の形にする
  function paddingFrom(opts) {
    const p = { top: 0, right: 0, bottom: 0, left: 0 };
    if (opts && opts.padding) {
      const [x, y] = Array.isArray(opts.padding) ? opts.padding : [opts.padding.x, opts.padding.y];
      p.left = p.right = x || 0;
      p.top = p.bottom = y || 0;
    }
    const pt = (v) => (Array.isArray(v) ? { x: v[0], y: v[1] } : v || { x: 0, y: 0 });
    if (opts && opts.paddingTopLeft) {
      const v = pt(opts.paddingTopLeft);
      p.left = v.x;
      p.top = v.y;
    }
    if (opts && opts.paddingBottomRight) {
      const v = pt(opts.paddingBottomRight);
      p.right = v.x;
      p.bottom = v.y;
    }
    return p;
  }

  // ---------------------------------------------------------------------
  // 地図
  // ---------------------------------------------------------------------
  class GLMap {
    constructor(containerId, opts) {
      this.isGL = true;
      this._container = document.getElementById(containerId);
      this._maxZoom = opts.maxZoom || 19;
      this._openPopup = null;
      this.gl = new maplibregl.Map({
        container: this._container,
        style: opts.style,
        center: toLngLat(opts.center),
        zoom: opts.zoom - ZOOM_SHIFT,
        maxZoom: this._maxZoom - ZOOM_SHIFT,
        maxPitch: 60, // 傾けられるのは 60 度まで
        dragRotate: true, // パソコン: 右ドラッグ・Ctrl+ドラッグで回転・傾け
        touchPitch: true, // スマホ: 二本指で上下に動かすと傾く
        pitchWithRotate: true,
        attributionControl: false,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      });
      this.gl.touchZoomRotate.enableRotation(); // スマホ: 二本指で回すと回転する
      this.gl.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: opts.attribution }), "bottom-right");
      this.gl.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
      this.doubleClickZoom = { disable() {}, enable() {} };
    }
    getContainer() {
      return this._container;
    }
    getSize() {
      return { x: this._container.clientWidth, y: this._container.clientHeight };
    }
    getZoom() {
      return this.gl.getZoom() + ZOOM_SHIFT;
    }
    getMaxZoom() {
      return this._maxZoom;
    }
    getCenter() {
      return toLatLngObj(this.gl.getCenter());
    }
    getBounds() {
      return makeViewBounds(this.gl);
    }
    setView(latlng, zoom, opts = {}) {
      const camera = { center: toLngLat(latlng), zoom: (zoom === undefined ? this.getZoom() : zoom) - ZOOM_SHIFT };
      if (opts.animate === false) this.gl.jumpTo(camera);
      else this.gl.easeTo({ ...camera, duration: 500 });
      return this;
    }
    flyTo(latlng, zoom) {
      this.gl.flyTo({ center: toLngLat(latlng), zoom: (zoom === undefined ? this.getZoom() : zoom) - ZOOM_SHIFT, speed: 1.4 });
      return this;
    }
    panTo(latlng, opts = {}) {
      this.gl.easeTo({ center: toLngLat(latlng), duration: opts.animate === false ? 0 : 400 });
      return this;
    }
    panBy(offset, opts = {}) {
      const [dx, dy] = Array.isArray(offset) ? offset : [offset.x, offset.y];
      this.gl.panBy([dx, dy], { duration: opts.animate === false ? 0 : Math.round((opts.duration || 0.25) * 1000) });
      return this;
    }
    fitBounds(points, opts = {}) {
      const list = Array.isArray(points) ? points : [];
      if (!list.length) return this;
      let minLng = Infinity,
        minLat = Infinity,
        maxLng = -Infinity,
        maxLat = -Infinity;
      list.forEach((p) => {
        const [lng, lat] = toLngLat(p);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
      const size = this.getSize();
      if (!size.x || !size.y) return this;
      const padding = paddingFrom(opts);
      // 余白が画面より大きいと、地図が動かせないので、画面に収まるまで減らす
      if (padding.top + padding.bottom > size.y - 20) {
        const k = (size.y - 20) / (padding.top + padding.bottom || 1);
        padding.top *= k;
        padding.bottom *= k;
      }
      if (padding.left + padding.right > size.x - 20) {
        const k = (size.x - 20) / (padding.left + padding.right || 1);
        padding.left *= k;
        padding.right *= k;
      }
      const options = {
        padding,
        bearing: this.gl.getBearing(), // 回転している向きは、そのまま
        maxZoom: (opts.maxZoom || this._maxZoom) - ZOOM_SHIFT,
        duration: opts.animate === false ? 0 : 600,
      };
      try {
        this.gl.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          options
        );
      } catch (e) {
        // 地図の大きさがまだ決まっていないときなどは、何もしない
      }
      return this;
    }
    latLngToContainerPoint(latlng) {
      const p = this.gl.project(toLngLat(latlng));
      return { x: p.x, y: p.y };
    }
    invalidateSize() {
      this.gl.resize();
      return this;
    }
    closePopup() {
      if (this._openPopup) this._openPopup.remove();
      this._openPopup = null;
      return this;
    }
    on(name, fn) {
      this.gl.on(name, fn);
      return this;
    }
    once(name, fn) {
      this.gl.once(name, fn);
      return this;
    }
    off(name, fn) {
      this.gl.off(name, fn);
      return this;
    }
    addLayer(layer) {
      layer.addTo(this);
      return this;
    }
    removeLayer(layer) {
      if (layer && layer.remove) layer.remove();
      return this;
    }
    hasLayer(layer) {
      return !!(layer && layer._map === this);
    }
  }

  // ---------------------------------------------------------------------
  // ピン(DOM の目印)と、吹き出し
  //   icon: L.divIcon(...) の結果(options の className・html・iconSize・iconAnchor・popupAnchor を使う)
  //   element を直接わたすこともできる({ element, anchor })
  // ---------------------------------------------------------------------
  class GLMarker {
    constructor(latlng, opts = {}) {
      this._latlng = toLngLat(latlng);
      this._handlers = {};
      this._map = null;
      const icon = opts.icon && opts.icon.options;
      let el = opts.element;
      let offset = [0, 0];
      this._popupOffset = [0, 0];
      if (!el) {
        el = document.createElement("div");
        el.className = (icon && icon.className) || "";
        el.innerHTML = (icon && icon.html) || "";
        const size = (icon && icon.iconSize) || [20, 20];
        const sx = Array.isArray(size) ? size[0] : size.x;
        const sy = Array.isArray(size) ? size[1] : size.y;
        el.style.width = sx + "px";
        el.style.height = sy + "px";
        const anchor = (icon && icon.iconAnchor) || [sx / 2, sy / 2];
        offset = [sx / 2 - anchor[0], sy / 2 - anchor[1]]; // 真ん中を基準に、ずらす
        const pa = (icon && icon.popupAnchor) || [0, 0];
        this._popupOffset = [pa[0], pa[1]];
      }
      this._el = el;
      this.gl = new maplibregl.Marker({
        element: el,
        anchor: "center",
        offset,
        rotationAlignment: opts.rotationAlignment || "viewport",
        pitchAlignment: opts.pitchAlignment || "viewport",
      }).setLngLat(this._latlng);
      if (opts.interactive === false) el.style.pointerEvents = "none";
      el.addEventListener("click", (e) => {
        if (!this._popup) return;
        e.stopPropagation();
        // 地図の「どこかをクリックしたら吹き出しを閉じる」処理と重ならないよう、少し後で開く
        setTimeout(() => this.openPopup(), 0);
      });
    }
    addTo(map) {
      this._map = map;
      this.gl.addTo(map.gl);
      return this;
    }
    remove() {
      this.gl.remove();
      this._map = null;
      return this;
    }
    getElement() {
      return this._el;
    }
    getLatLng() {
      return makeLatLng(this._latlng[1], this._latlng[0]);
    }
    setLatLng(latlng) {
      this._latlng = toLngLat(latlng);
      this.gl.setLngLat(this._latlng);
      if (this._popup && this._popup.isOpen()) this._popup.setLngLat(this._latlng);
      return this;
    }
    setRotation(deg) {
      this.gl.setRotation(deg);
      return this;
    }
    on(name, fn) {
      (this._handlers[name] = this._handlers[name] || []).push(fn);
      return this;
    }
    _fire(name, data) {
      (this._handlers[name] || []).forEach((fn) => fn(data));
    }
    bindPopup(html) {
      this._popupHtml = html || "";
      this._popup = null;
      this._popupWrapper = document.createElement("div");
      // 中身の見た目(文字の大きさ・余白)は、これまでの吹き出しと同じものを使う
      this._popupWrapper.className = "leaflet-popup-content";
      this._popupWrapper.innerHTML = this._popupHtml;
      this._popup = {
        isOpen: () => !!(this._glPopup && this._glPopup.isOpen()),
        getElement: () => (this._glPopup ? this._glPopup.getElement() : null),
      };
      return this;
    }
    setPopupContent(html) {
      this._popupHtml = html;
      if (this._popupWrapper) this._popupWrapper.innerHTML = html;
      return this;
    }
    getPopup() {
      return this._popup;
    }
    openPopup() {
      const map = this._map || this._clusterMap;
      if (!map || !this._popup) return this;
      if (map._openPopup && map._openPopup !== this._glPopup) map._openPopup.remove();
      if (!this._glPopup) {
        this._glPopup = new maplibregl.Popup({
          anchor: "bottom",
          offset: this._popupOffset,
          closeButton: true,
          closeOnClick: true,
          focusAfterOpen: false,
          maxWidth: "300px",
          className: "vf-popup",
        });
        this._glPopup.setDOMContent(this._popupWrapper);
        this._glPopup.on("close", () => {
          if (map._openPopup === this._glPopup) map._openPopup = null;
          this._fire("popupclose", { popup: this._popup });
        });
      }
      if (this._glPopup.isOpen()) return this;
      this._glPopup.setLngLat(this._latlng).addTo(map.gl);
      map._openPopup = this._glPopup;
      this._fire("popupopen", { popup: this._popup });
      return this;
    }
    closePopup() {
      if (this._glPopup) this._glPopup.remove();
      return this;
    }
  }

  // ---------------------------------------------------------------------
  // まとめ表示(近いピンを、数字つきの丸にまとめる)
  //   ・MapLibre の「まとめる」機能で計算し、見えている丸・ピンだけを、DOM の目印として出す
  //   ・clusterMaxZoom(Leaflet の数え方)より拡大したら、まとめずに、すべてのピンを出す
  // ---------------------------------------------------------------------
  class GLClusterGroup {
    constructor(map, opts = {}) {
      this.map = map;
      this.gl = map.gl;
      this.radius = opts.maxClusterRadius || 60;
      this.disableAt = opts.disableClusteringAtZoom || 12; // この(Leaflet の)ズーム以上は、まとめない
      this.iconCreate = opts.iconCreateFunction;
      this.markers = []; // 地図に出す(候補の)ピン
      this.inGroup = new Set();
      this.shown = new Map(); // いま地図に出しているピン(id → GLMarker)
      this.clusterEls = new Map(); // いま地図に出している丸(id → maplibregl.Marker)
      this.ready = false;
      this._dirty = true;
      const setup = () => {
        if (this.gl.getSource("vf-shops")) return;
        this.gl.addSource("vf-shops", {
          type: "geojson",
          data: this._geojson(),
          cluster: true,
          clusterRadius: this.radius,
          clusterMaxZoom: this.disableAt - ZOOM_SHIFT - 1,
        });
        // 計算のためだけの、見えない層(これが無いと、まとめ表示の計算が行われない)
        this.gl.addLayer({ id: "vf-shops-hidden", type: "circle", source: "vf-shops", paint: { "circle-radius": 0, "circle-opacity": 0 } });
        this.ready = true;
        this._dirty = false;
        this._render();
      };
      if (this.gl.isStyleLoaded()) setup();
      else this.gl.on("load", setup);
      // 地図のスタイルが読み込み直されたとき(まず起きないが、念のため)
      this.gl.on("styledata", () => {
        if (this.ready && !this.gl.getSource("vf-shops")) {
          this.ready = false;
          setup();
        }
      });
      let raf = null;
      const schedule = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          this._render();
        });
      };
      this.gl.on("moveend", schedule);
      this.gl.on("zoomend", schedule);
      this.gl.on("sourcedata", (e) => {
        if (e.sourceId === "vf-shops" && e.isSourceLoaded) schedule();
      });
      this._schedule = schedule;
    }
    _geojson() {
      return {
        type: "FeatureCollection",
        features: [...this.inGroup].map((m) => ({
          type: "Feature",
          properties: { mid: m._mid },
          geometry: { type: "Point", coordinates: m._latlng },
        })),
      };
    }
    _update() {
      if (!this.ready) return;
      const src = this.gl.getSource("vf-shops");
      if (src) src.setData(this._geojson());
      this._schedule();
    }
    _ensureId(m) {
      if (m._mid === undefined) {
        m._mid = this.markers.length;
        this.markers.push(m);
      }
      m._clusterMap = this.map;
    }
    addLayers(list) {
      list.forEach((m) => {
        this._ensureId(m);
        this.inGroup.add(m);
      });
      this._update();
      return this;
    }
    removeLayers(list) {
      list.forEach((m) => {
        this.inGroup.delete(m);
        if (m._glPopup && m._glPopup.isOpen()) m._glPopup.remove();
      });
      this._update();
      return this;
    }
    hasLayer(m) {
      return this.inGroup.has(m);
    }
    // そのピンが見える(まとめられていない)ところまで寄せてから、cb を呼ぶ
    zoomToShowLayer(m, cb) {
      const need = this.disableAt; // Leaflet の数え方
      if (this.map.getZoom() >= need) {
        cb();
        return;
      }
      this.gl.once("moveend", () => cb());
      this.gl.flyTo({ center: m._latlng, zoom: need - ZOOM_SHIFT, speed: 1.4 });
    }
    _render() {
      if (!this.ready || !this.gl.isSourceLoaded("vf-shops")) return;
      const features = this.gl.querySourceFeatures("vf-shops");
      const wantPins = new Set();
      const wantClusters = new Map();
      features.forEach((f) => {
        const p = f.properties || {};
        if (p.cluster) wantClusters.set(p.cluster_id, { count: p.point_count, coords: f.geometry.coordinates });
        else if (p.mid !== undefined) wantPins.add(Number(p.mid));
      });
      // ピン
      this.shown.forEach((m, id) => {
        if (!wantPins.has(id) || !this.inGroup.has(m)) {
          m.gl.remove();
          m._map = null;
          this.shown.delete(id);
        }
      });
      wantPins.forEach((id) => {
        const m = this.markers[id];
        if (!m || !this.inGroup.has(m) || this.shown.has(id)) return;
        m.addTo(this.map);
        this.shown.set(id, m);
      });
      // まとめの丸
      this.clusterEls.forEach((mk, id) => {
        if (!wantClusters.has(id)) {
          mk.remove();
          this.clusterEls.delete(id);
        }
      });
      wantClusters.forEach((c, id) => {
        if (this.clusterEls.has(id)) return;
        const icon = this.iconCreate({ getChildCount: () => c.count });
        const o = icon.options;
        const el = document.createElement("div");
        el.className = o.className || "";
        el.innerHTML = o.html || "";
        const size = o.iconSize || [40, 40];
        el.style.width = (Array.isArray(size) ? size[0] : size.x) + "px";
        el.style.height = (Array.isArray(size) ? size[1] : size.y) + "px";
        el.style.cursor = "pointer";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const src = this.gl.getSource("vf-shops");
          src
            .getClusterExpansionZoom(id)
            .then((z) => this.gl.easeTo({ center: c.coords, zoom: Math.min(z, this.disableAt - ZOOM_SHIFT) + 0.01, duration: 500 }))
            .catch(() => this.gl.easeTo({ center: c.coords, zoom: this.gl.getZoom() + 2, duration: 500 }));
        });
        const mk = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(c.coords).addTo(this.gl);
        this.clusterEls.set(id, mk);
      });
    }
  }

  // MapLibre と WebGL が使えるか
  function canUseGLMap() {
    if (typeof maplibregl === "undefined" || typeof maplibregl.Map !== "function") return false;
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch (e) {
      return false;
    }
  }

  window.GLMap = GLMap;
  window.GLMarker = GLMarker;
  window.GLClusterGroup = GLClusterGroup;
  window.canUseGLMap = canUseGLMap;
})();
