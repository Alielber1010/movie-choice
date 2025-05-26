import { useEffect, useState } from 'react'
import './App.css'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'

// API BASE URL 

const API_BASE_URL = "https://api.themoviedb.org/3"

// API KEY ACCESS 

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;


// API OPTIONS  

const API_OPTIONS = {
  method : 'GET', 
  headers: {
    accept:'application/json', 
    Authorization: `Bearer ${API_KEY}` //who is trying to make the Request 
  }
}

// MAIN APP FUNCTION 

const App = () => {

// HOOKS 
      
const [Movies , setMovies] = useState([]);
const [searchTerm, setsearchTerm] = useState(''); 

const [currentPage, setcurrentPage] = useState(1); 
const [totalPage, settotalPage]= useState(0); 

const [errorMessage , seterrorMessage]= useState(''); 
const [Isloading, setIsloading] = useState(false); 


// FETCH FUNCTION

const fetchMovies = async (query = '', page = 1) => {
  setIsloading(true); 
  seterrorMessage('');
      try {   
          
          // fetch movie list 
          let endpoint = query?
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}` 
          :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

          const response = await fetch(endpoint, API_OPTIONS); 
              console.log('Response status:', response.status); // Check this!
              console.log('Response ok:', response.ok); // Check this!
          
          // Receive json object
          const data = await response.json(); 
              console.log(data);

          // Check response Error  
          if(!response.ok) {
             throw new Error('Failed to connect movies');
           }
           // Check Data Error
           if (data.response == "false"){
            seterrorMessage(data.Error || 'Failed to fetch movies');
            setMovies([]); 
            return ;
          }
          // Load Data into Movie list 
          setMovies(data.results || []);
          // load currentpage into 
          setcurrentPage(data.page || 1); 
          //load pages into total Page
          settotalPage(data.total_pages || 0); 

          

  } catch (error){
    console.error(`Error fetching movies: ${error}` ); 
    seterrorMessage('Error connecting to movies DB again later ');
  } finally {
    setIsloading(false); 
  }; 
}

// USE-EFFECT HOOK 

useEffect(()=> {
    fetchMovies(searchTerm , 1); // API fetchin function, will be called once some 
}, [searchTerm]) // component that once runed the fetching will start(useffect dependency) 
  

// Handle Pageination
const HandlNextPage = () => {
 if(currentPage < totalPage){ 
  fetchMovies(searchTerm, currentPage+1);
 }
}
 
const HandlPrevPage = () =>{ 
  if (currentPage > 1 ) { 
    fetchMovies(searchTerm, currentPage - 1); 
  } 
}


const HandlPageClick = (pageNumber) => {
  fetchMovies(searchTerm, pageNumber)
}
const getpageNumber = () => {
  const delta = 2;
  const range= [];
  const rangeWithDots = []; 

  for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPage - 1, currentPage + delta); 
         i++) {
      range.push(i);
    
}

 if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPage - 1) {
      rangeWithDots.push('...', totalPage);
    } else {
      rangeWithDots.push(totalPage);
    }

    return rangeWithDots;
}

return (
   <main>
    
   <div className='pattern'/>
    
    <div className='wrapper'>
      <header>
        <img src="./hero.png" alt="Hero Banner" />
        <h1> Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>

        <Search searchTerm ={searchTerm} setsearchTerm={setsearchTerm}/>
      
      </header>

<section className='all-movies'>
        <h2 className='mt-[20px]'>All Movies</h2>
        
        {Isloading ? (
          <p className='text-white'><Spinner/></p>
        ) : errorMessage ? (
          <p className='text-red-500'>{errorMessage}</p>
        ) : (
          <ul>
            {Movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie}/>
            ))}
          </ul>
        )}
      </section>

        <div className='fancy-text'>

           {!Isloading && !errorMessage && Movies.length > 0 && (
  <div className="pagination">
    <button onClick={HandlPrevPage} disabled={currentPage === 1}>
      Previous
    </button>
    
    {getpageNumber().map((page, index) => (
      page === '...' ? (
        <span key={index}>...</span>
      ) : (
        <button
          key={page}
          onClick={() => HandlPageClick(page)}
          className={currentPage === page ? 'active' : ''}
        >
          {page}
        </button>
      )
    ))}
    
    <button onClick={HandlNextPage} disabled={currentPage === totalPage}>
      Next
    </button>
  </div>
)}
        </div>
    </div>
    
  </main>
)

}
export default App