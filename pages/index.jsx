import React, { Fragment, useState } from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Spinner from 'react-bootstrap/Spinner';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import DefaultImage from '../assets/imgs/image-not-available.jpg';

const API_URL = 'http://www.omdbapi.com/';

function Home() {
  const [movies, setMovies] = useState([]);
  const [totalMoviesSoFar, setTotalMoviesSoFar] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [value, setValue] = useState('');
  const [shortTitleEntered, setShortTitleEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [noResults, setNoResults] = useState(false);
  const [prevSort, setPrevSort] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  const handleChange = (event) => {
    setValue(event.target.value.trim());

    if (event.key === 'Enter') {
      setMovies([]);
      setTotalMoviesSoFar(0);
      setCurrentPage(1);
      if (value && value.length > 2) {
        setIsLoading(true);
        updateMovieList(true);
        setShortTitleEntered(false);
      } else {
        setShortTitleEntered(true);
      }
    }
  };

  function handleScroll(e) {
    const element = e.target;
    // initiate loading of data when scrolled to almost the bottom
    if (element.scrollTop > 0.9 * (element.scrollHeight - element.offsetHeight)) {
      if (totalMoviesSoFar < totalResults && !isLoading) {
        setIsLoading(true);
        updateMovieList(false);
      }
    }
  }

  function getPoster(movie) {
    return (movie.Poster !== 'N/A') ? movie.Poster : DefaultImage;
  }

  const checkedHandler = (event, movie) => {
    const fav = favorites ? [...favorites] : [];
    if (!fav.find(j => j.Title === movie.Title)) {
      movie.favoritePosition = fav.length;
      fav.push(movie);
    } else {
      const index = fav.findIndex(i => i.Title === movie.Title);
      fav.splice(index, 1);
    }
    setFavorites(fav);
  };

  function isFavorited(movie) {
    return favorites.find(j => j.Title === movie.Title);
  }


  const handleSort = (sortType) => {
    if (prevSort === sortType) setSortAsc(!sortAsc);
    else setSortAsc(false);
    const fav = favorites ? [...favorites] : [];
    if (sortType === 'Year') {
      fav.sort((a, b) => ((parseInt(a.Year) > parseInt(b.Year)) ? 1 : -1));
    } else {
      fav.sort((a, b) => ((a[sortType] > b[sortType]) ? 1 : -1));
    }
    if (!sortAsc) fav.reverse();
    setPrevSort(sortType);
    setFavorites(fav);
  };

  function updateMovieList(newSearch) {
    let page = currentPage;
    if (newSearch) page = 1;
    const url = `${API_URL}?s=${value}&type=movie&apikey=4bb16985&page=${page}`;
    axios.get(url).then(response => response.data)
      .then((data) => {
        let concatted = [];
        if (newSearch) {
          concatted = (data.Search) ? data.Search : [];
        } else concatted = movies.concat(data.Search);
        setMovies(data ? concatted : []);
        setTotalResults(data.totalResults);
        setCurrentPage((data.Search) ? page + 1 : 1);
        setTotalMoviesSoFar((data.Search) ? totalMoviesSoFar + data.Search.length : 0);
        setIsLoading(false);
        setNoResults(concatted.length === 0);
      });
  }

  return (
    <Fragment>
      <div className={(css(styles.movieList))}>
        <h1 className="h1">Movie List</h1>
        <div className={(css(styles.movieListInputGroup))}>
          <Form.Control
            type="text"
            placeholder="Enter Movie Title"
            onKeyUp={handleChange}
          />

        </div>
      </div>
      <div>
        <div
          className={(css(styles.movieCardListOuter))}
          onScroll={handleScroll}
        >
          <div className={(css(styles.alerts))}>
            {noResults && (
              <Alert variant="danger" class="col-md-6">
                No results found for your search.
              </Alert>
            )}
            {shortTitleEntered && (
              <Alert variant="info" class="col-md-6">
                Enter at least three characters for search results.
              </Alert>
            )}
          </div>
          {isLoading && (
            <div>
              <Spinner animation="border" role="status" className={(css(styles.spinner))}>
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          )}
          <CardDeck>
            <ul>
              {movies && movies.map(movie => (
                <li className={(css(styles.movieCardList))}>
                  <Card className={(css(styles.movieCards))}>
                    <Card.Body>
                      <div>
                        <div className={(css(styles.movieCardTitle))}>
                          <Card.Title>{movie.Title}</Card.Title>
                        </div>
                        <div className={(css(styles.movieCardCheckBox))}>
                          <button
                            type="button"
                            className={isFavorited(movie) ? 'btn btn-outline-danger' : 'btn btn-outline-success'}
                            onClick={event => checkedHandler(event, movie)}
                          >
                            {isFavorited(movie) ? 'Delete' : 'Save'}
                          </button>
                        </div>
                      </div>
                      <Card.Subtitle className="mb-2 text-muted">{movie.Year}</Card.Subtitle>
                      <Card.Img
                        className={(css(styles.movieImage))}
                        variant="bottom"
                        src={getPoster(movie)}
                      />
                    </Card.Body>
                  </Card>
                </li>
              ))}
            </ul>
          </CardDeck>
        </div>
        {favorites.length > 0 && (
          <div className={(css(styles.favoriesContainer))}>
            <div className={css(styles.favoritesHeaderBar)}>
              <h2 className={(css(styles.favoritesHeaderText))}>Favorites</h2>
              <div className={(css(styles.sortButtonGroup))}>
                <ButtonGroup aria-label="Sort-Options">
                  <Button variant="primary" onClick={() => handleSort('favoritePosition')}>Saved Time</Button>
                  <Button variant="primary" onClick={() => handleSort('Title')}>Title</Button>
                  <Button variant="primary" onClick={() => handleSort('Year')}>Year</Button>
                </ButtonGroup>
              </div>
            </div>
            <CardDeck>
              <ul className={(css(styles.favoritesList))}>
                {favorites.map(movie => (
                  <li className={(css(styles.favoritesListInner))}>
                    <Card className={(css(styles.favoriteCards))}>
                      <Card.Body>
                        <div>
                          <div className={(css(styles.movieCardTitle))}>
                            <Card.Title>{movie.Title}</Card.Title>
                          </div>
                          <div className={(css(styles.movieCardCheckBox))}>
                            <button
                              type="button"
                              className={isFavorited(movie) ? 'btn btn-outline-danger' : 'btn btn-outline-success'}
                              onClick={event => checkedHandler(event, movie)}
                            >
                              {isFavorited(movie) ? 'Delete' : 'Save'}
                            </button>
                          </div>
                        </div>
                        <Card.Subtitle className="mb-2 text-muted">{movie.Year}</Card.Subtitle>
                      </Card.Body>
                    </Card>
                  </li>
                ))}
              </ul>
            </CardDeck>
          </div>
        )}
      </div>
    </Fragment>
  );
}

export default Home;

const styles = StyleSheet.create({
  app: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoritesHeaderBar: {
    paddingBottom: '10px',
  },
  favoritesHeaderText: {
    display: 'inline-block',
    width: '25%',
    verticalAlign: 'bottom',
    margin: 0,
  },
  sortButtonGroup: {
    textAlign: 'right',
    width: '75%',
    display: 'inline-block',
  },
  saveButton: {
    outlineColor: 'rgb(0, 181, 236)',
    backgroundColor: 'rgb(0, 181, 236)',
    color: 'white',
    borderColor: 'rgb(0,181,236)',
  },
  favoriesContainer: {
    width: '40%',
    display: 'inline-block',
  },
  favoritesList: {
    width: '100%',
    height: '60em',
    overflow: 'scroll',
  },
  favoritesListInner: {
    width: '100%',
    height: 'auto',
    paddingBottom: '10px',
  },
  movieCardCheckBoxInput: {
    display: 'none',
  },
  roundLabel: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '50%',
    cursor: 'pointer',
    height: '28px',
    left: '0',
    top: '0',
    width: '28px',
    ':after': {
      border: '2px solid #fff',
      borderTop: 'none',
      borderRight: 'none',
      content: '',
      height: '6px',
      left: '7px',
      opacity: '0',
      position: 'absolute',
      top: '8px',
      transform: 'rotate(-45deg)',
      width: '12px',
    },
  },
  spinned: {
    textAlign: 'center',
  },
  movieListInputGroup: {
    paddingLeft: '0',
    width: '50%',
  },
  movieCardTitle: {
    width: '63%',
    height: '100%',
    verticalAlign: 'top',
    display: 'inline-block',
    padding: '2px',
  },
  movieCardCheckBox: {
    textAlign: 'right',
    width: '33%',
    display: 'inline-block',
  },
  movieCardListContainer: {
    width: '100%',
    padding: '15px',
    maxWidth: '100%',
  },
  movieCardListOuter: {
    overflow: 'scroll',
    height: '60em',
    width: '60%',
    display: 'inline-block',
    float: 'left',
  },
  movieList: {
    fontFamily: 'Helvetica Neue',
    paddingBottom: '15px',
  },
  logo: {
    width: '120px',
  },
  movieCards: {
    width: '92%',
    height: '100%',
    borderRadius: '10px!important',
    boxShadow: '0 8px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  favoriteCards: {
    width: '96%',
    height: 'auto',
    borderRadius: '10px!important',
    boxShadow: '0 8px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  movieCardList: {
    width: '24%',
    display: 'inline-block',
    paddingBottom: '15px',
  },
  movieImage: {
    height: 'auto',
    overflow: 'hidden',
  },
  alerts: {
    paddingTop: '15px',
    width: 'fit-content',
  },
});
