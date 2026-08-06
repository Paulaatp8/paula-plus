async function getTranslatedMovie(movieId){
    async function getMovieBothLanguages(movieId){
    const [es, en] = await Promise.all([
        fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?language=es-ES`,
            {
                headers:{
                    Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                    "Content-Type":"application/json"
                }
            }
        ).then(r => r.json()),
        fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
            {
                headers:{
                    Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                    "Content-Type":"application/json"
                }
            }
        ).then(r => r.json())
    ]);
    return { es, en };
}
    const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?language=${getCurrentTMDbLanguage()}`,
        {
            headers:{
                Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                "Content-Type":"application/json"
            }
        }
    );
    return await response.json();
}
async function searchMovies(query) {
    const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=${getCurrentTMDbLanguage()}`,
        {
            headers: {
                Authorization: `Bearer ${CONFIG.TMDB_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
    const data = await response.json();
    return data.results;
}
async function getTrailer(movieId){
    const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?language=${getCurrentTMDbLanguage()}`,
        {
            headers:{
                Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                "Content-Type":"application/json"
            }
        }
    );
    const data = await response.json();
    const trailer =
    data.results.find(
        video =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.iso_639_1 ===
            getCurrentLanguage()
    )
    ||
    data.results.find(
        video =>
            video.site === "YouTube" &&
            video.type === "Trailer"
    );
   console.log("Videos:", data.results);
console.log("Selected trailer:", trailer);
return trailer || null;
}
async function getMovieDetails(movieId){
    const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits&language=${getCurrentTMDbLanguage()}`,
        {
            headers:{
                Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                "Content-Type":"application/json"
            }
        }
    );
    return await response.json();
}
async function getWatchProviders(movieId){
    const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`,
        {
            headers:{
                Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                "Content-Type":"application/json"
            }
        }
    );
    const data = await response.json();
    return data.results.ES || null;
}