const LANGUAGES = {
    en: {
        search: "Search my watchlist...",
        addMovie: "Add movie...",
        noPoster: "No Poster",
        unknownYear: "Unknown year",
        duplicateMovie: "This movie is already in your watchlist.",
        sortAZ: "Sort A-Z",
        streamingOnly: "Streaming Only",
        releasedOnly: "Released Only",
        releaseDate: "Release Date",
        oldest: "↑ Oldest",
        newest: "↓ Newest",
        emptyState: "Click + to add your first film.",
        noSynopsis: "No synopsis available.",
        removeMovie: "Remove",
        director: "Director",
        cast: "Cast",
        unknownRuntime: "Unknown runtime",
        unknownGenre: "Unknown genre",
        unknown: "Unknown",
        noOverview: "No overview available.",
        watchOn: "Watch on:",
        noStreaming: "Not available on your selected services",
        movie: "movie",
        movies: "movies",
        allMovies: "All Movies",
        myPlatforms: "My Platforms",
        myStreamingServices:
            "My Streaming",
        save: "Save"
    },
    es: {
        search: "Buscar en mi lista...",
        addMovie: "Añadir película...",
        noPoster: "Sin póster",
        unknownYear: "Año desconocido",
        duplicateMovie: "Esta película ya está en tu lista.",
        sortAZ: "Orden A-Z",
        releasedOnly: "Solo estrenadas",
        releaseDate: "Fecha",
        oldest: "↑ Más antiguas",
        newest: "↓ Más recientes",
        emptyState: "Pulsa + para añadir tu primera película.",
        noSynopsis: "Sinopsis no disponible.",
        removeMovie: "Eliminar",
        director: "Director",
        cast: "Reparto",
        unknownRuntime: "Duración desconocida",
        unknownGenre: "Género desconocido",
        unknown: "Desconocido",
        noOverview: "Sin descripción disponible.",
        watchOn: "Dónde ver:",
        noStreaming: "No disponible en tus plataformas",
        movie: "película",
        movies: "películas",
        allMovies: "Todas las películas",
        myPlatforms: "Mis Platformas",
        myStreamingServices:
            "Mi Streaming",
        save: "Guardar"
    }
};
function getCurrentLanguage(){
    return localStorage.getItem("paulaLanguage")
        || "en";
}
function setLanguage(lang){
    localStorage.setItem(
        "paulaLanguage",
        lang
    );
}
function getCurrentTMDbLanguage(){
    return getCurrentLanguage() === "es"
        ? "es-ES"
        : "en-US";
}
const englishBtn =
    document.getElementById(
        "englishBtn"
    );
const spanishBtn =
    document.getElementById(
        "spanishBtn"
    );
englishBtn.addEventListener(
    "click",
    () => {
        setLanguage("en");
        location.reload();
    }
);
spanishBtn.addEventListener(
    "click",
    () => {
        setLanguage("es");
        location.reload();
    }
);
function updateLanguageButtons(){
    const current =
        getCurrentLanguage();
    englishBtn.classList.remove(
        "active"
    );
    spanishBtn.classList.remove(
        "active"
    );
    if(current === "en"){
        englishBtn.classList.add(
            "active"
        );
    }else{
        spanishBtn.classList.add(
            "active"
        );
    }
}
updateLanguageButtons();