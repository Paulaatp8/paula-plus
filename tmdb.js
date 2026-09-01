async function getTranslatedMovie(movieId){
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
// SEARCH MOVIES
async function searchMovies(query){
    const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=${getCurrentTMDbLanguage()}`,
        {
            headers:{
                Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                "Content-Type":"application/json"
            }
        }
    );
    if(!response.ok){
        console.error(
            "TMDB search error:",
            response.status
        );
        return [];
    }
    const data = await response.json();
    return data.results || [];
}
// GET TRAILER
async function getTrailer(movieId){
    const selectedLanguage =
        getCurrentTMDbLanguage();
    const currentLanguage =
        getCurrentLanguage();
    /*
        First try the currently selected language.
        Example:
        Spanish → es-ES
        English → en-US
    */
    let response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?language=${selectedLanguage}`,
        {
            headers:{
                Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                "Content-Type":"application/json"
            }
        }
    );
    let data = await response.json();
    let videos = data.results || [];
    /*
        Look for a trailer in the selected language.
    */
    let trailer =
        videos.find(video =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.iso_639_1 === currentLanguage
        );
    /*
        If there isn't one, look for ANY trailer
        returned by the selected-language request.
    */
    if(!trailer){
        trailer =
            videos.find(video =>
                video.site === "YouTube" &&
                video.type === "Trailer"
            );
    }
    /*
        If there still isn't a trailer, request the
        videos WITHOUT a language restriction.

        This is the important fallback.
        It lets us find trailers in the movie's
        original language.
    */
    if(!trailer){
        response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos`,
            {
                headers:{
                    Authorization:`Bearer ${CONFIG.TMDB_TOKEN}`,
                    "Content-Type":"application/json"
                }
            }
        );
        data = await response.json();
        videos = data.results || [];
        /*
            Prefer a trailer in the original/default
            language returned by TMDB.
        */
        trailer =
            videos.find(video =>
                video.site === "YouTube" &&
                video.type === "Trailer" &&
                video.iso_639_1 === currentLanguage
            );
        /*
            Otherwise take any YouTube trailer.
        */
        if(!trailer){
            trailer =
                videos.find(video =>
                    video.site === "YouTube" &&
                    video.type === "Trailer"
                );
        }
    }
    console.log(
        "Selected language:",
        selectedLanguage
    );
    console.log(
        "Current language:",
        currentLanguage
    );
    console.log(
        "Trailer:",
        trailer
    );
    return trailer || null;
}
// GET MOVIE DETAILS
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
// GET STREAMING PROVIDERS
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
    return data.results?.ES || null;
}