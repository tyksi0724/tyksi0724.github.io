/* ============================================================
   ★ 作品ギャラリー 自動描画スクリプト ★

   仕組み:
     1. works/manifest.json を読み込む（表示する作品ファイルの一覧）
     2. 一覧に書かれた works/〇〇.json をそれぞれ読み込む
     3. .works-grid の中にカードを自動生成する

   表示件数の制限:
     <div class="works-grid" data-limit="3"></div>
       → 最新3件だけ表示（メインページ用）
     <div class="works-grid"></div>
       → 全件表示（作品一覧ページ works.html 用）

   ★ 作品を追加する手順（index.html を触る必要はありません）★
     1. works/ フォルダに新しい 〇〇.json を作る
        （既存の works/works20260524.json をコピーすると楽）
     2. works/manifest.json の "items" にそのファイル名を1行足す

   1作品の .json で使える項目:
     title  … タイトル（必須）
     desc   … 下に出る小さい説明（例 "2026 / bootleg"）
     url    … クリックで開くリンク先
     image  … サムネイル画像のパス（例 "works/xxxx.png"）。無ければ NO IMAGE 表示
     newTab … true なら別タブで開く（省略時は同じタブ）
   ============================================================ */

(function () {
    "use strict";

    const grid = document.querySelector(".works-grid");
    if (!grid) return;

    const limit = parseInt(grid.getAttribute("data-limit") || "0", 10);

    // 読み込み中はメッセージを出しておく
    grid.innerHTML = '<div class="works-loading blink">⏳ 作品を読み込み中…</div>';

    function buildCard(work) {
        const link = document.createElement("a");
        link.className = "work-item";
        if (work.url) link.href = work.url;
        if (work.newTab) {
            link.target = "_blank";
            link.rel = "noopener";
        }

        const img = document.createElement("img");
        img.src = work.image || "";
        img.alt = work.title || "作品";
        // 画像が無い／読めない場合のフォールバック
        img.onerror = function () {
            this.style.background = "#0a0a2a";
            this.alt = "[ NO IMAGE ]";
        };
        link.appendChild(img);

        const title = document.createElement("div");
        title.className = "work-item-title";
        title.textContent = work.title || "(無題)";
        link.appendChild(title);

        if (work.desc) {
            const desc = document.createElement("div");
            desc.className = "work-item-desc";
            desc.textContent = work.desc;
            link.appendChild(desc);
        }

        return link;
    }

    fetch("works/manifest.json", { cache: "no-cache" })
        .then(function (res) {
            if (!res.ok) throw new Error("manifest.json が読み込めません");
            return res.json();
        })
        .then(function (manifest) {
            let files = (manifest && manifest.items) || [];
            if (limit > 0) files = files.slice(0, limit);
            // 各作品ファイルを並び順を保ったまま読み込む
            return Promise.all(
                files.map(function (file) {
                    return fetch("works/" + file, { cache: "no-cache" })
                        .then(function (res) {
                            if (!res.ok) throw new Error(file);
                            return res.json();
                        })
                        .catch(function () {
                            console.warn("作品ファイルを読み込めませんでした:", file);
                            return null;
                        });
                }),
            );
        })
        .then(function (works) {
            grid.innerHTML = "";
            const valid = works.filter(Boolean);
            if (valid.length === 0) {
                grid.innerHTML =
                    '<div class="works-loading blink">🚧 作品準備中 🚧</div>';
                return;
            }
            valid.forEach(function (work) {
                grid.appendChild(buildCard(work));
            });
        })
        .catch(function (err) {
            console.error("作品の読み込みに失敗:", err);
            grid.innerHTML =
                '<div class="works-loading">⚠ 作品を読み込めませんでした</div>';
        });
})();
