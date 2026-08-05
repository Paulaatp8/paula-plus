const addButton = document.getElementById("addMovieButton");
const overlay = document.getElementById("modalOverlay");
const closeButton = document.getElementById("closeModal");
const modalSearch = document.getElementById("modalSearch");
const results = document.getElementById("searchResults");
const grid = document.getElementById("movieGrid");
const counter = document.getElementById("movieCounter");
const searchInput = document.getElementById("searchInput");
const deleteBanner = document.getElementById("deleteBanner");
const deleteText = document.getElementById("deleteText");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");
const moviePreviewOverlay = document.getElementById("moviePreviewOverlay");
const moviePreviewContent = document.getElementById("moviePreviewContent");
const sortAZBtn = document.getElementById("sortAZBtn");
const platformFilter = document.getElementById("platformFilter");
const releaseDateBtn = document.getElementById("releaseDateBtn");
const movieCounter = document.getElementById("movieCounter");
const releasedFilterBtn = document.getElementById("releasedFilterBtn");
const scrollTopButton = document.getElementById("scrollTopButton");
const randomMovieButton = document.getElementById("randomMovieButton");
const randomMovieModal = document.getElementById("randomMovieModal");
const randomMoviePoster = document.getElementById("randomMoviePoster");
const randomMovieTitle = document.getElementById("randomMovieTitle");
const randomMovieOverview = document.getElementById("randomMovieOverview");
const randomMovieStreaming = document.getElementById("randomMovieStreaming");
const closeRandomMovie = document.getElementById("closeRandomMovie");
const rerollMovie = document.getElementById("rerollMovie");
const settingsBtn = document.getElementById("settingsBtn")
const settingsModal = document.getElementById("settingsModal")
const servicesList = document.getElementById("servicesList")
const saveServicesBtn = document.getElementById("saveServices");
const closeSettings = document.getElementById("closeSettings");
let selectedServices = getStreamingServices();
const ALL_SERVICES = [
    "Netflix",
    "Amazon Prime Video",
    "Disney Plus",
    "Max",
    "SkyShowtime",
    "Movistar Plus+",
    "Filmin",
    "Apple TV Plus",
    "MUBI",
    "Rakuten TV"
];
searchInput.placeholder = t("search");
modalSearch.placeholder = t("addMovie");
if(
    getStreamingServices()
        .length === 0
){
    saveStreamingServices([
        "Netflix",
        "Amazon Prime Video",
        "Disney Plus",
        "Max",
        "SkyShowtime"
    ]);
selectedServices =
    getStreamingServices();}
function getMovieAccent(movie){
    const hash =
        movie.poster_path
            .split("")
            .reduce(
                (acc, char) =>
                    acc + char.charCodeAt(0),
                0
            );
    const hue = hash % 360;
    return `hsl(${hue}, 75%, 55%)`;
}
let pendingDeleteId = null;
let sortAZ = false;
let releaseDateSort = 0;
let releasedOnly = false;
let allMovies = [];
let selectedPlatform = "all";
function openSettings(){
    servicesList.innerHTML = "";
    ALL_SERVICES.forEach(service => {
        servicesList.innerHTML += `
            <label class="serviceOption">
                <input
                    type="checkbox"
                    value="${service}"
                    ${
                        selectedServices.includes(
                            service
                        )
                        ? "checked"
                        : ""
                    }
                >
                ${service}
            </label>
        `;
    });
    settingsModal.classList.remove(
        "hidden"
    );
}
function closeSettingsModal(){
    settingsModal.classList.add(
    "hidden"
);
}
closeSettings.addEventListener(
    "click",
    closeSettingsModal
);
settingsModal.addEventListener(
    "click",
    (e) => {
        if(
            e.target === settingsModal
        ){
            closeSettingsModal();
        }
    }
);
    function populatePlatformFilter(){
    platformFilter.innerHTML = `
        <option value="all">
    ${t("allMovies")}
</option>
<option value="subscriptions">
    ${t("myPlatforms")}
</option>
    `;
    selectedServices.forEach(service => {
        platformFilter.innerHTML += `
            <option value="${service}">
                ${service}
            </option>
        `;
    });
}
// OPEN MODAL
addButton.onclick = () => {
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
    modalSearch.focus();
};
// CLOSE MODAL
function closeModal(){
    overlay.classList.remove("show");
    overlay.classList.add("hidden");
    modalSearch.value="";
    results.innerHTML="";
}
closeButton.onclick = closeModal;
overlay.onclick = e => {
    if(e.target === overlay){
        closeModal();
    }
};
// SEARCH TMDB
let timer;
modalSearch.addEventListener("input",()=>{
    clearTimeout(timer);
    timer=setTimeout(search,350);
});
async function search(){
    const query=modalSearch.value.trim();
    if(query.length < 2){
        results.innerHTML="";
        return;
    }
    const movies = await searchMovies(query);
    renderResults(movies);
}
// SEARCH RESULTS
function renderResults(movies){
    results.innerHTML="";
    movies.forEach(movie=>{
        const card=document.createElement("div");
        card.className="search-card";
        const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
        : "https://placehold.co/90x135/222/888?text=No+Poster";
        card.innerHTML=`
        <img src="${poster}">
        <div class="search-info">
            <h3>${movie.title}</h3>
            <p>${movie.release_date?.slice(0,4) || t("Unknown year")}</p>
        </div>
        `;
        card.onclick = async () => {
   const providers =
    await getWatchProviders(
        movie.id
    );
    const allowedServices = [
    "Netflix",
    "Amazon Prime Video",
    "Disney Plus",
    "Max",
    "SkyShowtime",
    "Movistar Plus+",
    "Filmin",
    "Apple TV Plus",
    "MUBI"
];
const availableServices =
    providers?.flatrate?.filter(
        service =>
            allowedServices.includes(
                service.provider_name
            )
    ) || [];
const hasStreaming =
    availableServices.length > 0;
    const added = addMovie({
        ...movie,
        hasStreaming,
        streamingServices:
        availableServices.map(
            service =>
                service.provider_name
        )
    });
    if(!added){
        alert(t("duplicateMovie"));
        return;
    }
    closeModal();
    renderWatchlist();

};
        results.appendChild(card);
    });
}
// MAIN WATCHLIST
function renderWatchlist(){
    let movies = getMovies();
    allMovies = movies;
    if(releasedOnly){
    const today = new Date();
    movies = movies.filter(movie =>
        movie.release_date &&
        new Date(movie.release_date) <= today
    );
}
    if(sortAZ){
        movies.sort((a,b) =>
            a.title.localeCompare(b.title)
        );
    }
    if(selectedPlatform === "subscriptions"){
    movies = movies.filter(
        movie =>
            movie.streamingServices?.some(
                service =>
                    selectedServices.includes(
                        service
                    )
            )
    );
}
else if(selectedPlatform !== "all"){

    movies = movies.filter(
        movie =>
            movie.streamingServices?.includes(
                selectedPlatform
            )
    );

}
    if(releaseDateSort === 1){
    movies.sort((a,b) =>
        new Date(a.release_date)
        -
        new Date(b.release_date)
    );
}
if(releaseDateSort === 2){
    movies.sort((a,b) =>
        new Date(b.release_date)
        -
        new Date(a.release_date)
    );
}
    movieCounter.textContent =
movies.length === 1
    ? `1 ${t("movie")}`
    : `${movies.length} ${t("movies")}`;
    renderMovieGrid(movies);
} 
sortAZBtn.addEventListener("click", () => {
    sortAZ = !sortAZ;
    sortAZBtn.textContent =
        sortAZ
            ? "✓ A-Z"
            : t("sortAZ");
    sortAZBtn.classList.toggle("active", sortAZ);
    renderWatchlist();
});
settingsBtn.addEventListener(
    "click",
    openSettings
);
saveServicesBtn.addEventListener(
    "click",
    () => {
        selectedServices = [
            ...document.querySelectorAll(
                "#servicesList input:checked"
            )
        ].map(
            checkbox =>
                checkbox.value
        );
        saveStreamingServices(
            selectedServices
        );
        selectedPlatform = "all";
platformFilter.value =
    "all";
        populatePlatformFilter();
        settingsModal.classList.add(
            "hidden"
        );
        renderWatchlist();
    }
);
releaseDateBtn.addEventListener("click", () => {
    releaseDateSort =
        (releaseDateSort + 1) % 3;
    if(releaseDateSort === 0){
        releaseDateBtn.textContent =
            t("releaseDate");
        releaseDateBtn.classList.remove(
            "active"
        );
    }
    if(releaseDateSort === 1){
        releaseDateBtn.textContent =
            t("oldest");
        releaseDateBtn.classList.add(
            "active"
        );
    }
    if(releaseDateSort === 2){
        releaseDateBtn.textContent =
            t("newest");
        releaseDateBtn.classList.add(
            "active"
        );
    }
    renderWatchlist();
});
releasedFilterBtn.addEventListener("click", () => {
    releasedOnly = !releasedOnly;
    releasedFilterBtn.textContent =
        releasedOnly
            ? "✓ Released Only"
            : t("Released Only");
    releasedFilterBtn.classList.toggle(
        "active",
        releasedOnly
    );
    renderWatchlist();
});
function renderMovieGrid(movies){
    grid.innerHTML = "";
    if(movies.length === 0){
        grid.innerHTML = `
            <div class="empty-state">
                ${t("emptyState")}
            </div>
        `;
        return;
    }
    movies.forEach(movie => {
        const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://placehold.co/500x750/222/888?text=No+Poster";
        const card = document.createElement("div");
        const accent =
    getMovieAccent(movie);
card.style.setProperty(
    "--card-accent",
    accent
);
        card.dataset.backdrop =
    movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : "";
        card.className = "movie-card";
        card.innerHTML = `
            <img
                class="movie-poster"
                src="${poster}"
                loading="lazy"
            >
            <div class="movieNoise"></div>
            <div class="movieSynopsis">
    ${(movie.overview || t("noSynopsis"))
        .slice(0, 240)}
    ${(movie.overview?.length > 240 ? "..." : "")}
</div>
            <div class="movie-gradient">
                <h3>${movie.title}</h3>
                <p>
                    ${movie.release_date?.slice(0,4) || ""}
                </p>
                <div class="genres">
    ${(movie.genres || []).slice(0,2).join(" • ")}
</div>
            </div>
            <button class="deleteButton">
                ✕
            </button>
        `;
        card.querySelector(".deleteButton").onclick = (e) => {
            e.stopPropagation();
           pendingDeleteId = movie.id;
deleteText.textContent =
    `${t("removeMovie")} "${movie.title}" from Paula+?`;
deleteBanner.classList.remove("hidden");
        };
card.addEventListener("click", () => {
    openMoviePreview(movie);
});
card.addEventListener(
    "mouseenter",
    () => {
        console.log("hover");
        if(!card.dataset.backdrop) return;
         console.log(card.dataset.backdrop);
        document.body.style.setProperty(
            "--active-backdrop",
            `url(${card.dataset.backdrop})`
        );
        document.body.style.setProperty(
            "--backdrop-opacity",
            ".14"
        );
        document.body.classList.add(
            "movie-background-active"
        );
    }
);
card.addEventListener(
    "mouseleave",
    () => {
        document.body.classList.remove(
            "movie-background-active"
        );
    }
);
        grid.appendChild(card);
    });
}
// WATCHLIST SEARCH
searchInput.addEventListener("input",()=>{
    const query=searchInput.value.toLowerCase();
    const filtered = allMovies.filter(movie=>
        movie.title.toLowerCase().includes(query)
    );
    renderMovieGrid(filtered);
});
confirmDelete.onclick = () => {
    if(pendingDeleteId){
        deleteMovie(pendingDeleteId);
        pendingDeleteId = null;
        deleteBanner.classList.add("hidden");
        renderWatchlist();
    }
};      
async function openMoviePreview(movie){
    moviePreviewOverlay.classList.remove("hidden");
    const [trailer, details] = await Promise.all([
    getTrailer(movie.id),
    getMovieDetails(movie.id)
]);
const runtime =
    details.runtime
        ? `${details.runtime} min`
        : t("unknownRuntime");
const genres =
    details.genres
        ?.slice(0,3)
        .map(g => g.name)
        .join(" • ")
    || t("unknownGenre");
const year =
    details.release_date
        ? details.release_date.slice(0,4)
        : t("unknown");
const director =
    details.credits?.crew?.find(
        person => person.job === "Director"
    )?.name || t("unknown");
const cast =
    details.credits?.cast
        ?.slice(0,5)
        .map(actor => actor.name)
        .join(", ")
    || t("unknown");
    const streamingServices =
    movie.streamingServices?.join(" • ")
    || t("noStreaming");
    let trailerHTML = "";
    if(trailer){
        trailerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=1&rel=0"
                allow="autoplay"
                allowfullscreen
            ></iframe>
        `;
    }
    moviePreviewContent.innerHTML = `
        <button id="closePreview">
            ✕
        </button>
        <div class="previewTrailer">
            ${trailerHTML}
        </div>
        <div class="previewInfo">
    <h1>${movie.title}</h1>
    <div class="previewMeta">
        <span>${year}</span>
        <span>${runtime}</span>
        <span>${genres}</span>
    </div>
   <p class="director">
    <strong>${t("director")}:</strong>
    ${director}
</p>
<p class="cast">
    <strong>${t("cast")}:</strong>
    ${cast}
</p>
<p class="streaming">
    ${streamingServices}
</p>
<p class="overview">
    ${movie.overview || t("noOverview")}
</p>
</div>
    `;
    document
        .getElementById("closePreview")
        .onclick = closeMoviePreview;
}
function closeMoviePreview(){
    moviePreviewOverlay.classList.add("hidden");
    moviePreviewContent.innerHTML = "";
}
moviePreviewOverlay.addEventListener("click", (e) => {
    if(e.target === moviePreviewOverlay){
        closeMoviePreview();
    }
});
cancelDelete.onclick = () => {
    pendingDeleteId = null;
    deleteBanner.classList.add("hidden");
};
document.addEventListener("keydown", (e) => {
    if(e.key !== "Escape") return;
    // Movie preview
    if(!moviePreviewOverlay.classList.contains("hidden")){
        closeMoviePreview();
        return;
    }
    // Add movie modal
    if(overlay.classList.contains("show")){
        closeModal();
        return;
    }
    // Random movie modal
    if(randomMovieModal.classList.contains("show")){
        randomMovieModal.classList.remove("show");
        return;
    }
    if(
    !settingsModal.classList.contains("hidden")){
    closeSettingsModal();
    return;
}
});
renderWatchlist();
window.addEventListener("scroll", () => {
    if(window.scrollY > 400){
        scrollTopButton.classList.add(
            "show"
        );
    }else{
        scrollTopButton.classList.remove(
            "show"
        );
    }
});
scrollTopButton.addEventListener(
    "click",
    () => {
        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    }
);
async function showRandomMovie(){
    console.time("pick");
    const today = new Date();
const movies = getMovies().filter(
    movie =>
        movie.release_date &&
        new Date(movie.release_date) <= today
);
console.timeLog("pick", "movies loaded");
console.timeLog("pick", "movie selected");
    if(movies.length === 0) return;
    const movie =
        movies[
            Math.floor(
                Math.random() *
                movies.length
            )
        ];
        const backdrop =
    movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
const randomMovieBackdrop =
    document.getElementById(
        "randomMovieBackdrop"
    );
randomMovieBackdrop.style.opacity = "0";
const img = new Image();
img.onload = () => {
    randomMovieBackdrop.style.backgroundImage =
        `url(${backdrop})`;
    randomMovieTitle.textContent =
        movie.title;
    randomMovieOverview.textContent =
        movie.overview ||
        t("noSynopsis");
    if(movie.streamingServices?.length){
        randomMovieStreaming.textContent =
            `${t("watchOn")} ${
                movie.streamingServices.join(
                    " • "
                )
            }`;
    }else{
        randomMovieStreaming.textContent =
            "";
    }
    requestAnimationFrame(() => {
        randomMovieBackdrop.style.opacity =
            "1";
    });
};
img.src = backdrop;
    randomMovieModal.classList.add(
        "show"
    );
    console.timeLog("pick", "modal shown");
console.timeEnd("pick");
}
randomMovieButton.addEventListener(
    "click",
    showRandomMovie
);
rerollMovie.addEventListener(
    "click",
    showRandomMovie
);
closeRandomMovie.addEventListener(
    "click",
    () => {
        randomMovieModal.classList.remove(
            "show"
        );
    }
);
platformFilter.addEventListener(
    "change",
    () => {
        selectedPlatform =
            platformFilter.value;
        renderWatchlist();
    }
);
function t(key){
    return LANGUAGES[
        getCurrentLanguage()
    ][key];
}
function applyTranslations(){
    searchInput.placeholder =
        t("search");
    modalSearch.placeholder =
        t("addMovie");
    if(!sortAZ){
        sortAZBtn.textContent =
            t("sortAZ");
    }
    if(!releasedOnly){
        releasedFilterBtn.textContent =
            t("releasedOnly");
    }
    if(releaseDateSort === 0){
        releaseDateBtn.textContent =
            t("releaseDate");
    }
    document.getElementById(
    "settingsTitle"
).textContent =
    t("myStreamingServices");
    saveServicesBtn.textContent =
    t("save");
}
applyTranslations();
populatePlatformFilter();
renderWatchlist();