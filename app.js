require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

let selectedArtist = null;

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body['access_token']))
  .catch((error) =>
    console.log('Something went wrong when retrieving an access token', error)
  );

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/artist-search-results', (req, res) => {
  const artist = req.query.artist;
  selectedArtist = artist;
  console.log(artist);
  spotifyApi
    .searchArtists(artist)
    .then((data) => {
      console.log('The received Artist from the API: ', data.body.artists.items);
      res.render('artist-search-results', { data: data.body.artists.items });
    })
    .catch((err) => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:artistId', (req, res) => {
  const artistId = req.params.artistId;
  console.log(selectedArtist);
  spotifyApi.getArtistAlbums(artistId).then(
    function (data) {
      console.log('Artist albums', data.body);
      res.render('albums', { data: data.body.items, artist: selectedArtist });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get('/tracks/:albumId', (req, res) => {
  const albumId = req.params.albumId;
  console.log(albumId);
  spotifyApi.getAlbumTracks(albumId, { limit: 10, offset: 1 }).then(
    function (data) {
      console.log('Tracks', data.body);
      res.render('tracks', { data: data.body.items });
    },
    function (err) {
      console.log('Something went wrong!', err);
    }
  );
});

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊')
);
