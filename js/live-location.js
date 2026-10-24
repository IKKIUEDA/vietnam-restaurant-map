// 地図の「現在地」(リアルタイムで動く青い点)と、右下の2つのボタン(コンパス・現在地)
//   ・現在地: 位置情報の利用を、すでにブラウザで許可している人は、地図を開くと自動で青い点を出す。
//     まだ許可していない人には、勝手に許可の確認を出さない(現在地ボタンを押したときだけ出る)
//   ・動くと青い点も動く(watchPosition)。現在地ボタンを押すと、地図が現在地について行く(地図を指で動かすと、ついて行くのをやめる)
//   ・コンパス: 押すと、端末の向き(方角)を使って、青い点に「向いている方向」を出し、ボタンの針が北を指す
//     (地図はいつも北が上。iPhone は、押したときに方角の利用の確認が出る)
//   ・位置・方角は、この画面の中(メモリ)だけで使い、保存も送信もしない
(function () {
  if (typeof map === "undefined" || typeof L === "undefined") return;
  const T = {
    ja: {
      locate: "現在地を表示",
      compass: "方角(コンパス)を表示",
      denied: "位置情報がオフになっています。ブラウザの設定で、このサイトの位置情報を許可してください",
      failed: "現在地を取得できませんでした",
      noCompass: "この端末では、方角を取得できません",
      resetNorth: "北を上・真上からに戻す",
    },
    en: {
      locate: "Show my location",
      compass: "Show direction (compass)",
      denied: "Location is turned off. Please allow location for this site in your browser settings",
      failed: "Couldn't get your location",
      noCompass: "Direction isn't available on this device",
      resetNorth: "Reset to north-up, top-down view",
    },
    vi: {
      locate: "Hiện vị trí của tôi",
      compass: "Hiện hướng (la bàn)",
      denied: "Vị trí đang tắt. Hãy cho phép vị trí cho trang này trong cài đặt trình duyệt",
      failed: "Không lấy được vị trí hiện tại",
      noCompass: "Thiết bị này không lấy được hướng",
      resetNorth: "Trở về hướng bắc ở trên, nhìn từ trên xuống",
    },
  };
  const tx = () => T[typeof currentLang !== "undefined" && T[currentLang] ? currentLang : "ja"];

  const LOCATE_ICON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M20.5 3.5 3.8 10.6c-.8.3-.7 1.4.1 1.6l6.4 1.6 1.6 6.4c.2.8 1.3.9 1.6.1L20.5 3.5z" fill="currentColor"/></svg>';
  const COMPASS_ICON =
    '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><g class="live-needle"><path d="M12 2.5 15.2 12H8.8z" fill="#d93025"/><path d="M12 21.5 8.8 12h6.4z" fill="#5f6368"/><circle cx="12" cy="12" r="1.8" fill="#ffffff"/></g></svg>';

  const wrap = document.getElementById("map-wrap");
  const box = document.createElement("div");
  box.className = "live-controls";
  box.innerHTML =
    `<button type="button" class="live-btn live-compass" aria-pressed="false">${COMPASS_ICON}</button>` +
    `<button type="button" class="live-btn live-locate" aria-pressed="false">${LOCATE_ICON}</button>` +
    `<p class="live-msg" role="status" hidden></p>`;
  wrap.appendChild(box);
  // ボタンの上で地図が動いたり、拡大したりしないように
  if (!map.isGL) L.DomEvent.disableClickPropagation(box);
  const compassBtn = box.querySelector(".live-compass");
  const locateBtn = box.querySelector(".live-locate");
  const msg = box.querySelector(".live-msg");
  const needle = box.querySelector(".live-needle");

  function setLabels() {
    const x = tx();
    locateBtn.setAttribute("aria-label", x.locate);
    locateBtn.title = x.locate;
    compassBtn.setAttribute("aria-label", x.compass);
    compassBtn.title = x.compass;
  }
  setLabels();
  document.getElementById("lang-select")?.addEventListener("change", () => setTimeout(setLabels, 0));

  let msgTimer = null;
  function say(text) {
    msg.textContent = text;
    msg.hidden = false;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => (msg.hidden = true), 4000);
  }

  // --- 現在地 ---
  // 青い点は、お店のピンより手前に出す(専用の重なり順の層)
  const isGL = !!map.isGL; // 回転・傾けられる地図(MapLibre)か
  if (!isGL) {
    map.createPane("livePane");
    map.getPane("livePane").style.zIndex = 650;
    map.getPane("livePane").style.pointerEvents = "none";
  }
  let watchId = null;
  let pos = null; // { lat, lng, acc, heading }
  let follow = false; // 地図が現在地について行くか
  let marker = null;
  let accCircle = null;
  let firstFixPending = false; // ボタンで始めたとき、最初の位置で地図を寄せる

  function render() {
    if (!pos) return;
    const ll = [pos.lat, pos.lng];
    if (!marker && isGL) {
      const el = document.createElement("div");
      el.className = "live-location";
      el.style.width = "80px";
      el.style.height = "80px";
      el.innerHTML = '<span class="live-cone"></span><span class="live-dot"></span>';
      marker = new GLMarker(ll, { element: el, interactive: false }).addTo(map);
      setAccuracyGL(ll, pos.acc);
    } else if (isGL) {
      marker.setLatLng(ll);
      setAccuracyGL(ll, pos.acc);
    } else if (!marker) {
      marker = L.marker(ll, {
        icon: L.divIcon({
          className: "live-location",
          html: '<span class="live-cone"></span><span class="live-dot"></span>',
          iconSize: [80, 80],
          iconAnchor: [40, 40],
        }),
        interactive: false,
        keyboard: false,
        pane: "livePane",
      }).addTo(map);
      accCircle = L.circle(ll, { radius: pos.acc, interactive: false, stroke: false, fillColor: "#1a73e8", fillOpacity: 0.12 }).addTo(map);
    } else {
      marker.setLatLng(ll);
      accCircle.setLatLng(ll).setRadius(pos.acc);
    }
    updateCone();
  }
  function updateCone() {
    const el = marker && marker.getElement();
    if (!el) return;
    const h = compassHeading !== null ? compassHeading : Number.isFinite(pos && pos.heading) ? pos.heading : null;
    el.classList.toggle("has-heading", h !== null);
    // 地図を回転しているときは、その分を引いて、地図の上で正しい向きにする
    const bearing = isGL ? map.gl.getBearing() : 0;
    if (h !== null) el.style.setProperty("--live-heading", h - bearing + "deg");
  }

  // 位置の誤差の範囲(薄い青の円)。MapLibre の地図では、地図の上に「円の形」を描く(傾けても地面に沿う)
  function setAccuracyGL(ll, meters) {
    const gl = map.gl;
    const draw = () => {
      const [lat, lng] = ll;
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const dLat = (meters / 111320) * Math.sin(a);
        const dLng = (meters / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.cos(a);
        pts.push([lng + dLng, lat + dLat]);
      }
      const data = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [pts] } };
      const src = gl.getSource("vf-live-acc");
      if (src) src.setData(data);
      else {
        gl.addSource("vf-live-acc", { type: "geojson", data });
        gl.addLayer({ id: "vf-live-acc", type: "fill", source: "vf-live-acc", paint: { "fill-color": "#1a73e8", "fill-opacity": 0.12 } });
      }
    };
    if (gl.isStyleLoaded()) draw();
    else gl.once("load", draw);
  }

  // MapLibre の地図: コンパスの針は「地図の上で北がどちらか」を指す(地図を回すと、針も回る)
  function updateNeedle() {
    if (!isGL) return;
    const b = map.gl.getBearing();
    needle.style.transform = `rotate(${-b}deg)`;
    const tilted = Math.abs(b) > 0.5 || map.gl.getPitch() > 0.5;
    compassBtn.classList.toggle("is-rotated", tilted);
    const label = tilted ? tx().resetNorth : tx().compass;
    compassBtn.setAttribute("aria-label", label);
    compassBtn.title = label;
  }
  if (isGL) {
    map.gl.on("rotate", () => {
      updateNeedle();
      updateCone();
    });
    map.gl.on("pitch", updateNeedle);
    updateNeedle();
  }

  function start(fromButton) {
    if (!navigator.geolocation) {
      if (fromButton) say(tx().failed);
      return;
    }
    if (watchId !== null) return;
    firstFixPending = !!fromButton;
    watchId = navigator.geolocation.watchPosition(
      (p) => {
        pos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.min(p.coords.accuracy || 50, 2000), heading: p.coords.heading };
        render();
        if (firstFixPending || follow) {
          firstFixPending = false;
          if (follow) map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 16), { animate: true });
        }
      },
      (err) => {
        if (fromButton || follow) say(err && err.code === 1 ? tx().denied : tx().failed);
        if (err && err.code === 1) stop();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }
  function stop() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    setFollow(false);
  }
  function setFollow(on) {
    follow = on;
    locateBtn.classList.toggle("is-on", on);
    locateBtn.setAttribute("aria-pressed", String(on));
  }

  locateBtn.addEventListener("click", () => {
    setFollow(true);
    if (pos) map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 16), { animate: true });
    start(true);
  });
  // 指で地図を動かしたら、ついて行くのをやめる
  map.on("dragstart", () => {
    if (follow) setFollow(false);
  });

  // すでに許可している人は、最初から現在地を出す(許可の確認は出さない)
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((st) => {
        if (st.state === "granted") start(false);
        st.onchange = () => {
          if (st.state === "granted") start(false);
          else if (st.state === "denied") stop();
        };
      })
      .catch(() => {});
  }

  // --- コンパス(端末の向き) ---
  let compassHeading = null; // 北から時計回りの角度(度)。null = 使っていない
  let compassOn = false;
  function onOrientation(e) {
    let h = null;
    if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading; // iPhone
    else if (e.absolute && typeof e.alpha === "number") h = (360 - e.alpha) % 360; // Android
    if (h === null) return;
    const scr = (screen.orientation && screen.orientation.angle) || 0;
    compassHeading = (h + scr + 360) % 360;
    if (!isGL) needle.style.transform = `rotate(${-compassHeading}deg)`; // 針の赤い先が、いつも北を指す
    updateCone();
  }
  // iPhone は deviceorientation(webkitCompassHeading)、Android は deviceorientationabsolute で方角が届く。両方を聞いておく
  const orientEvents = ["deviceorientation"].concat("ondeviceorientationabsolute" in window ? ["deviceorientationabsolute"] : []);
  async function setCompass(on) {
    if (on) {
      if (typeof DeviceOrientationEvent === "undefined") {
        say(tx().noCompass);
        return;
      }
      try {
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          const r = await DeviceOrientationEvent.requestPermission(); // iPhone: 押したときだけ確認が出る
          if (r !== "granted") {
            say(tx().noCompass);
            return;
          }
        }
      } catch (e) {
        say(tx().noCompass);
        return;
      }
      orientEvents.forEach((name) => window.addEventListener(name, onOrientation));
      // しばらく待っても方角が届かなければ、使えない端末(パソコンなど)
      setTimeout(() => {
        if (compassOn && compassHeading === null) {
          say(tx().noCompass);
          setCompass(false);
        }
      }, 2500);
    } else {
      orientEvents.forEach((name) => window.removeEventListener(name, onOrientation));
      compassHeading = null;
      if (!isGL) needle.style.transform = "";
      updateCone();
    }
    compassOn = on;
    compassBtn.classList.toggle("is-on", on);
    compassBtn.setAttribute("aria-pressed", String(on));
  }
  compassBtn.addEventListener("click", () => {
    // MapLibre の地図で、回転・傾けているときは、まず「北を上・真上から」に戻す
    if (isGL && (Math.abs(map.gl.getBearing()) > 0.5 || map.gl.getPitch() > 0.5)) {
      map.gl.easeTo({ bearing: 0, pitch: 0, duration: 500 });
      return;
    }
    setCompass(!compassOn);
  });
})();
