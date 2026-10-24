// プロフィールのアイコン画像: 選んだ画像を、丸い枠の中で「位置」と「大きさ」を調整してから決める
//   ・指(マウス)でドラッグ = 位置を動かす / 2本指で広げる・下のつまみ = 大きさを変える
//   ・「この範囲で決定」を押すと、枠の中だけを 256×256 の画像にして返す(写真の位置情報などのデータは、ここで消える)
//   ・「キャンセル」なら null を返す(アップロードしない)
function openAvatarCropper(file) {
  const T = {
    ja: { title: "アイコンの位置を調整", hint: "ドラッグで位置、つまみ(2本指)で大きさを調整できます", zoom: "大きさ", cancel: "キャンセル", ok: "この範囲で決定", error: "画像を開けませんでした。別の画像でお試しください。" },
    en: { title: "Adjust your icon", hint: "Drag to move, use the slider (or two fingers) to resize", zoom: "Size", cancel: "Cancel", ok: "Use this area", error: "Couldn't open this image. Please try another one." },
    vi: { title: "Điều chỉnh ảnh đại diện", hint: "Kéo để di chuyển, dùng thanh trượt (hoặc hai ngón tay) để đổi kích thước", zoom: "Kích thước", cancel: "Hủy", ok: "Dùng vùng này", error: "Không mở được ảnh này. Vui lòng thử ảnh khác." },
  };
  const x = T[typeof currentLang !== "undefined" && T[currentLang] ? currentLang : "ja"];
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alertBox(x.error);
      resolve(null);
    };
    img.onload = () => {
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const wrap = document.createElement("div");
      wrap.className = "crop-modal";
      wrap.setAttribute("role", "dialog");
      wrap.setAttribute("aria-modal", "true");
      wrap.setAttribute("aria-labelledby", "crop-title");
      wrap.innerHTML =
        `<div class="crop-card">` +
        `<h2 id="crop-title">${esc(x.title)}</h2>` +
        `<div class="crop-stage"><img class="crop-img" alt="" draggable="false"><span class="crop-ring" aria-hidden="true"></span></div>` +
        `<p class="crop-hint">${esc(x.hint)}</p>` +
        `<label class="crop-zoom"><span>${esc(x.zoom)}</span><input type="range" min="1" max="4" step="0.01" value="1"></label>` +
        `<div class="crop-actions"><button type="button" class="crop-cancel">${esc(x.cancel)}</button>` +
        `<button type="button" class="crop-ok">${esc(x.ok)}</button></div>` +
        `</div>`;
      document.body.appendChild(wrap);
      const stage = wrap.querySelector(".crop-stage");
      const view = wrap.querySelector(".crop-img");
      const range = wrap.querySelector('input[type="range"]');
      view.src = url;

      // 枠(丸)の大きさ = 表示の正方形の大きさ。base = 枠をちょうど埋める倍率
      const S = () => stage.clientWidth;
      let zoom = 1; // base に対する倍率(1〜4)
      let cx = W / 2; // 枠の真ん中に来る、元の画像の上の点
      let cy = H / 2;
      const base = () => Math.max(S() / W, S() / H);
      const scale = () => base() * zoom;
      // 枠の外に、画像の無いところが出ないようにする
      const clamp = () => {
        const half = S() / 2 / scale();
        cx = Math.min(W - half, Math.max(half, cx));
        cy = Math.min(H - half, Math.max(half, cy));
      };
      const draw = () => {
        clamp();
        const s = scale();
        view.style.width = W * s + "px";
        view.style.height = H * s + "px";
        view.style.transform = `translate(${S() / 2 - cx * s}px, ${S() / 2 - cy * s}px)`;
      };
      draw();

      // ドラッグ(1本指・マウス)と、2本指で広げる・縮める
      const pointers = new Map();
      let last = null; // { x, y, dist }
      const snapshot = () => {
        const ps = [...pointers.values()];
        if (ps.length === 1) return { x: ps[0].x, y: ps[0].y, dist: 0 };
        const [a, b] = ps;
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) };
      };
      stage.addEventListener("pointerdown", (e) => {
        stage.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        last = snapshot();
      });
      stage.addEventListener("pointermove", (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const now = snapshot();
        if (last) {
          const s = scale();
          cx -= (now.x - last.x) / s;
          cy -= (now.y - last.y) / s;
          if (now.dist && last.dist) {
            zoom = Math.min(4, Math.max(1, (zoom * now.dist) / last.dist));
            range.value = String(zoom);
          }
        }
        last = now;
        draw();
      });
      const up = (e) => {
        pointers.delete(e.pointerId);
        last = pointers.size ? snapshot() : null;
      };
      stage.addEventListener("pointerup", up);
      stage.addEventListener("pointercancel", up);
      // マウスのホイールでも、大きさを変えられる(パソコン)
      stage.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          zoom = Math.min(4, Math.max(1, zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));
          range.value = String(zoom);
          draw();
        },
        { passive: false }
      );
      range.addEventListener("input", () => {
        zoom = Number(range.value) || 1;
        draw();
      });

      const finish = (result) => {
        URL.revokeObjectURL(url);
        wrap.remove();
        resolve(result);
      };
      wrap.querySelector(".crop-cancel").addEventListener("click", () => finish(null));
      wrap.querySelector(".crop-ok").addEventListener("click", () => {
        // 枠の中(元の画像の上の正方形)を、256×256 に描き出す
        const side = S() / scale();
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        canvas.getContext("2d").drawImage(img, cx - side / 2, cy - side / 2, side, side, 0, 0, 256, 256);
        canvas.toBlob((blob) => finish(blob || null), "image/jpeg", 0.85);
      });
      wrap.querySelector(".crop-ok").focus();
    };
    img.src = url;
  });

  function alertBox(text) {
    const p = document.createElement("div");
    p.className = "crop-modal";
    p.innerHTML = `<div class="crop-card"><p>${esc(text)}</p><div class="crop-actions"><button type="button" class="crop-ok">OK</button></div></div>`;
    document.body.appendChild(p);
    p.querySelector(".crop-ok").addEventListener("click", () => p.remove());
  }
}
