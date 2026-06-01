const worksContainer = document.getElementById("works-container");

works.forEach((work) => {
    const card = document.createElement("div");
    card.className = "work-card";

    card.innerHTML = `
        <img src="${work.image}" alt="${work.title}">
        <div class="work-info">
            <h3>${work.title}</h3>
            <p>${work.description}</p>
            <a href="${work.link}" target="_blank">
                詳細を見る
            </a>
        </div>
    `;

    worksContainer.appendChild(card);
});

const musicList = document.getElementById("music-list");

favoriteMusic.forEach((music) => {
    const li = document.createElement("li");

    li.innerHTML = `
        <a href="${music.link}" target="_blank">
            ${music.title} - ${music.artist}
        </a>
    `;

    musicList.appendChild(li);
});
