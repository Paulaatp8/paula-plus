const STORAGE_KEY = "paulaPlusMovies";
function getMovies() {
    const movies = localStorage.getItem(STORAGE_KEY);
    if (!movies) {
        return [];
    }
    return JSON.parse(movies);
}
function saveMovies(movies) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}
function addMovie(movie) {
    const movies = getMovies();
    // Prevent duplicates
    if (movies.some(m => m.id === movie.id)) {
        return false;
    }
   movies.push({
    id:movie.id,
    title:movie.title,
    overview:movie.overview,
    poster_path:movie.poster_path,
    backdrop_path:movie.backdrop_path,
    release_date:movie.release_date,
    vote_average:movie.vote_average,
    original_language:movie.original_language,
    genres: (movie.genre_ids || [])
    .map(id => GENRES[id])
    .filter(Boolean),
    hasStreaming: movie.hasStreaming
});
    saveMovies(movies);
    return true;
}
function deleteMovie(id){
    const movies = getMovies().filter(movie => movie.id !== id);
    saveMovies(movies);
}
const STREAMING_KEY =
    "paulaStreamingServices";
function getStreamingServices(){
    return JSON.parse(
        localStorage.getItem(
            STREAMING_KEY
        ) || "[]"
    );
}
function saveStreamingServices(
    services
){
    localStorage.setItem(
        STREAMING_KEY,
        JSON.stringify(services)
    );
}