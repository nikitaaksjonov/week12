const express = require('express');
const axios = require('axios');
const app = express();





app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res)=>{

    let url = 'https://api.themoviedb.org/3/movie/493529?api_key=c451f7394ea0722b245b9cc88cea21e2';
    axios.get(url)
    .then(response=>{
        let data = response.data;
        let currentYear=new Date().getFullYear();
        let movieDuration = data.runtime/60-data.runtime%60/60 + 'h '+data.runtime%60+'min';
       
        let date = new Date(data.release_date);
        let releaseDate = date.getDate()+'.'+date.getMonth()+1+'.'+date.getFullYear()+' '+data.production_countries[0].iso_3166_1;
        
        genresLoop = '';
        data.genres.forEach(genre => {
            genresLoop=genresLoop + `${genre.name}, `;
        });
        let genresLoopUpdate= genresLoop.slice(0, -2) + '.';

        let posterPath = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2' + data.poster_path;
        

    
        res.render('index',{dataTorender: data, year: currentYear,runTime: movieDuration, releasedate: releaseDate, genres: genresLoopUpdate, poster: posterPath });
    });


});
app.get('/search', (req, res)=>{
    res.render('search',  {movieDetails: ''});
    
        
});
app.post('/search', (req, res)=>{
    let userMovieTitle = req.body.movieTitle;
    console.log(userMovieTitle);
    let movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=c451f7394ea0722b245b9cc88cea21e2&query=${userMovieTitle}`;
    let genresUrl = 'https://api.themoviedb.org/3/genre/movie/list?api_key=c451f7394ea0722b245b9cc88cea21e2&query>>&language=en-US';
    let endpoints = [movieUrl,genresUrl];


    
    axios.all(endpoints.map((endpoint)=>axios.get(endpoint)))
    .then(axios.spread((movie,genres)=>{

        /* console.log(movie.data.results); */
        const [movieRaw] = movie.data.results;
        let backgoundUrl = `https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces${movieRaw.backdrop_path}`;
        console.log(backgoundUrl);
        
        let movieGenresIds = movieRaw.genre_ids;
        let movieGenres = genres.data.genres;

        let movieGenresArray = [];

        for(i=0; i< movieGenresIds.length; i++){
            for ( let j=0; j<movieGenres.length;j++){
                if (movieGenresIds[i]=== movieGenres[j].id){
                    movieGenresArray.push(movieGenres[j].name)
                }
            }

        };
        let genresLoop = '';
        movieGenresArray.forEach(genre => {
            genresLoop=genresLoop + `${genre}, `;
        });
        let genresLoopUpdate= genresLoop.slice(0, -2) + '.';

        console.log(genresLoopUpdate);
        let movieData = {
            title: movieRaw.title,
            year: new Date(movieRaw.release_date).getFullYear(),
            genres: genresLoopUpdate,
            overview: movieRaw.overview,
            posterUrl: `https://image.tmdb.org/t/p/w500${movieRaw.poster_path}`
        };
        res.render('search', {movieDetails: movieData});

        

    }));

    
});


app.listen(process.env.PORT ||3000, ()=>{
    console.log('Server is running on Port 3000.');
});