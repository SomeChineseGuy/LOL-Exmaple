const express = require('express');
const morgan = require('morgan');
const env = require('dotenv').config({
  path: __dirname + '/.env'
})
const port = process.env.PORT;
const app = express();
const axios = require('axios');
app.use(morgan('dev'));

const apiKey = process.env.API_KEY

const getSummonerPuuid = async (name = "doublelift") => {
  let summoner = await axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${apiKey}`)
  .then(data => {
    console.log(data.data.puuid)
    return data.data.puuid
  })
  .catch(err => {
    console.log(err)
    return err
  })

  return summoner;
}

const getListOfMatches = async (id) => {
  let matches = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${id}/ids?start=0&count=20&api_key=${apiKey}`)
  .then(data => {
    return data.data
  })
  .catch(err => {
    return err
  })

  return matches
}

const testAPI = async () => {
  const summonerPuuid = await getSummonerPuuid();
  const matchList = await getListOfMatches(summonerPuuid)
  console.log(matchList)
}

testAPI();


app.get('/', (req, res) => {
  res.send("<h1>Hello</h1>")
})

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
