import React, { useEffect, useState } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieComponent from './components/MovieComponent.jsx';
import { useDebounce } from 'react-use';
import { getTrendMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_Key = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_Key}`,
    },
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Debounce logic
    useDebounce(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 500, [searchTerm]);

    // Fetch movies from TMDb
    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            const data = await response.json();

            if (data.Response === 'False') {
                setErrorMessage('No movies found');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }

            console.log(`Fetched movies for ${query}`, data);
        } catch (error) {
            console.log(`Error fetching movies:`, error);
            setErrorMessage('Error fetching movies');
        } finally {
            setIsLoading(false);
        }
    };

    // Load top searches from Appwrite
    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendMovies();
            console.log("🔥 Trending from Appwrite:", movies); // Debug
            setTrendingMovies(movies);
        } catch (error) {
            console.log(`Error fetching trending movies:`, error);
        }
    };

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
                <header>
                    <img src="/hero.png" alt="hero-banner" />
                    <h1>
                        Find <span className="text-gradient">Movies</span> You will enjoy without Hassle
                    </h1>
                    <Search SearchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {/* Top Searches */}
                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h1>Top Searches</h1>
                        <ul>
                        {trendingMovies.map((movie,index) => (
                            <li key = {movie.$id}>
                            <p>{index+1}</p>
                            <img src={movie.poster_url} alt={movie.title}/>
                            </li>
                        ))}
                        </ul>
                    </section>
                )}

                {/* Main Movie Section */}
                <section className="all-movies">
                    <h1>Trending Now</h1>
                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieComponent key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
};

export default App;
