const express = require('express');
const morgan = require('morgan');
const env = require('dotenv').config({
  path: __dirname + '/.env'
})
const port = process.env.PORT;
const app = express();
const axios = require('axios');
const { get } = require('express/lib/response');
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

const getSingleMatch = async (matchId, puuid, matchNum) => {
  const frontObj = {};
  let single = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`)
  .then(data => {
    let numOfPosition = null
    for(let i = 0; i < data.data.metadata.participants.length; i++) {
      if(puuid === data.data.metadata.participants[i]) {
         numOfPosition = i
      }
    }
    console.log(data.data.info.participants[numOfPosition])
    console.log(numOfPosition)
    
  })
  .catch(err => {
    return err
  })

  return single;
}


const testAPI = async () => {
  const summonerPuuid = await getSummonerPuuid();
  const matchList = await getListOfMatches(summonerPuuid)
  const singleMatch = await getSingleMatch(matchList[0], summonerPuuid)
  console.log(singleMatch)
}

testAPI();


app.get('/', (req, res) => {
  res.send("<h1>Hello</h1>")
})

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
