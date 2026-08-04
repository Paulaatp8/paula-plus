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
const streamingFilterBtn = document.getElementById("streamingFilterBtn");
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
let streamingOnly = false;
let releaseDateSort = 0;
let releasedOnly = false;
let allMovies = [];
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
            <p>${movie.release_date?.slice(0,4) || "Unknown year"}</p>
        </div>
        `;
        card.onclick = async () => {
    const providers =
        await getWatchProviders(movie.id);
   const allowedServices = [
    "Netflix",
    "Amazon Prime Video",
    "Disney Plus",
    "Max",
    "SkyShowtime",
    "Movistar Plus+",
    "Filmin"
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
        hasStreaming
    });
    if(!added){
        alert("This movie is already in your watchlist.");
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
    if(streamingOnly){
        movies = movies.filter(
            movie => movie.hasStreaming
        );
    }
    if(sortAZ){
        movies.sort((a,b) =>
            a.title.localeCompare(b.title)
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
        `${movies.length} movie${movies.length !== 1 ? "s" : ""}`;
    renderMovieGrid(movies);
} 
sortAZBtn.addEventListener("click", () => {
    sortAZ = !sortAZ;
    sortAZBtn.textContent =
        sortAZ
            ? "✓ A-Z"
            : "Sort A-Z";
    sortAZBtn.classList.toggle("active", sortAZ);
    renderWatchlist();
});
streamingFilterBtn.addEventListener("click", () => {
    streamingOnly = !streamingOnly;
    streamingFilterBtn.textContent =
        streamingOnly
            ? "✓ Streaming Only"
            : "Streaming Only";
    streamingFilterBtn.classList.toggle(
        "active",
        streamingOnly
    );
    renderWatchlist();
});
releaseDateBtn.addEventListener("click", () => {
    releaseDateSort =
        (releaseDateSort + 1) % 3;
    if(releaseDateSort === 0){
        releaseDateBtn.textContent =
            "Release Date";
        releaseDateBtn.classList.remove(
            "active"
        );
    }
    if(releaseDateSort === 1){
        releaseDateBtn.textContent =
            "↑ Oldest";
        releaseDateBtn.classList.add(
            "active"
        );
    }
    if(releaseDateSort === 2){
        releaseDateBtn.textContent =
            "↓ Newest";
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
            : "Released Only";
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
                Click + to add your first film.
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
    ${(movie.overview || "No synopsis available.")
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
    `Remove "${movie.title}" from Paula+?`;
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
    const [trailer, details, providers] = await Promise.all([
    getTrailer(movie.id),
    getMovieDetails(movie.id),
    getWatchProviders(movie.id)
]);
const runtime =
    details.runtime
        ? `${details.runtime} min`
        : "Unknown runtime";
const genres =
    details.genres
        ?.slice(0,3)
        .map(g => g.name)
        .join(" • ")
    || "Unknown genre";
const year =
    details.release_date
        ? details.release_date.slice(0,4)
        : "Unknown";
const director =
    details.credits?.crew?.find(
        person => person.job === "Director"
    )?.name || "Unknown";
const cast =
    details.credits?.cast
        ?.slice(0,5)
        .map(actor => actor.name)
        .join(", ")
    || "Unknown";
const allowedServices = [
    "Netflix",
    "Amazon Prime Video",
    "Disney Plus",
    "Max",
    "SkyShowtime",
    "Movistar Plus+"
];
const streamingServices = providers?.flatrate
    ?.filter(service =>
        allowedServices.includes(
            service.provider_name
        )
    )
    .map(service => service.provider_name)
    .join(" • ")
    || "Not available on your selected services";
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
    <strong>Director:</strong>
    ${director}
</p>
<p class="cast">
    <strong>Cast:</strong>
    ${cast}
</p>
<p class="streaming">
    ${streamingServices}
</p>
<p class="overview">
    ${movie.overview || "No overview available."}
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
    if(e.key === "Escape"){
        closeMoviePreview();
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
    const movies = getMovies();
    if(movies.length === 0) return;
    const movie =
        movies[
            Math.floor(
                Math.random() *
                movies.length
            )
        ];
        const providers =
    await getWatchProviders(
        movie.id
    );
const backdrop =
    movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
document
    .getElementById(
        "randomMovieBackdrop"
    )
    .style.backgroundImage =
        `url(${backdrop})`;
    randomMovieTitle.textContent =
        movie.title;
    randomMovieOverview.textContent =
        movie.overview ||
        "No synopsis available.";
        const allowedServices = [
    "Netflix",
    "Amazon Prime Video",
    "Disney Plus",
    "Max",
    "SkyShowtime",
    "Movistar Plus+",
    "Filmin"
];
const streamingServices =
    providers?.flatrate
        ?.filter(service =>
            allowedServices.includes(
                service.provider_name
            )
        )
        .map(service =>
            service.provider_name
        )
        .join(" • ")
    || "Not available on your selected services";
if(
    providers?.flatrate
        ?.filter(service =>
            allowedServices.includes(
                service.provider_name
            )
        )
        .length > 0
){
    randomMovieStreaming.textContent =
        `Watch on: ${streamingServices}`;
}else{
    randomMovieStreaming.textContent =
        "";
}
    randomMovieModal.classList.add(
        "show"
    );
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