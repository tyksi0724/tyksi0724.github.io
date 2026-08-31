/* ============================================================
   ★ 出演履歴（LIVE / DJ）自動描画スクリプト ★

   仕組み:
     1. lives/manifest.json を読み込む（出演ファイルの一覧）
     2. 一覧に書かれた lives/〇〇.json をそれぞれ読み込む
     3. .lives-list の中に行を自動生成する（クリックでツイートへ遷移）

   並び順:
     manifest.json は「古い順（下が最新）」で追記していけばOK。
     表示は自動で「新しい順」に並べ替えます。

   表示件数の制限:
     <div class="lives-list" data-limit="3"></div>
       → 最新3件だけ表示（メインページ用）
     <div class="lives-list"></div>
       → 全件を新しい順で表示（出演履歴ページ lives.html 用）

   ★ 出演を追加する手順 ★
     1. lives/ フォルダに新しい 〇〇.json を作る
        （既存の lives/live20260524.json をコピーすると楽）
     2. lives/manifest.json の "items" の一番下にファイル名を足す

   1出演の .json で使える項目:
     date   … 日付（例 "2026.05.24"）
     title  … イベント名（必須）
     venue  … 会場・場所
     role   … 出演形態（例 "DJ" / "VJ" / "LIVE"）
     url    … クリックで開く特定のツイートURL
   ============================================================ */

(function () {
    "use strict";

    const list = document.querySelector(".lives-list");
    if (!list) return;

    const limit = parseInt(list.getAttribute("data-limit") || "0", 10);

    list.innerHTML = '<div class="lives-loading blink">⏳ 出演履歴を読み込み中…</div>';

    function buildRow(live) {
        const row = document.createElement("a");
        row.className = "live-item";
        if (live.url) {
            row.href = live.url;
            row.target = "_blank";
            row.rel = "noopener";
        }

        const date = document.createElement("span");
        date.className = "live-date";
        date.textContent = live.date || "----.--.--";
        row.appendChild(date);

        const body = document.createElement("span");
        body.className = "live-body";

        const title = document.createElement("span");
        title.className = "live-title";
        title.textContent = live.title || "(無題)";
        body.appendChild(title);

        const meta = [];
        if (live.venue) meta.push(live.venue);
        if (live.role) meta.push(live.role);
        if (meta.length) {
            const sub = document.createElement("span");
            sub.className = "live-venue";
            sub.textContent = meta.join(" / ");
            body.appendChild(sub);
        }
        row.appendChild(body);

        if (live.url) {
            const arrow = document.createElement("span");
            arrow.className = "live-arrow";
            arrow.textContent = "▶";
            row.appendChild(arrow);
        }

        return row;
    }

    fetch("lives/manifest.json", { cache: "no-cache" })
        .then(function (res) {
            if (!res.ok) throw new Error("manifest.json が読み込めません");
            return res.json();
        })
        .then(function (manifest) {
            let files = (manifest && manifest.items) || [];
            // manifest は古い順（下が最新）なので、表示は新しい順に並べ替える
            files = files.slice().reverse();
            // 最新から limit 件だけに絞る（メインページ）
            if (limit > 0) files = files.slice(0, limit);
            return Promise.all(
                files.map(function (file) {
                    return fetch("lives/" + file, { cache: "no-cache" })
                        .then(function (res) {
                            if (!res.ok) throw new Error(file);
                            return res.json();
                        })
                        .catch(function () {
                            console.warn("出演ファイルを読み込めませんでした:", file);
                            return null;
                        });
                }),
            );
        })
        .then(function (lives) {
            list.innerHTML = "";
            const valid = lives.filter(Boolean);
            if (valid.length === 0) {
                list.innerHTML =
                    '<div class="lives-loading blink">🚧 出演予定／履歴は準備中 🚧</div>';
                return;
            }
            valid.forEach(function (live) {
                list.appendChild(buildRow(live));
            });
        })
        .catch(function (err) {
            console.error("出演履歴の読み込みに失敗:", err);
            list.innerHTML =
                '<div class="lives-loading">⚠ 出演履歴を読み込めませんでした</div>';
        });
})();
