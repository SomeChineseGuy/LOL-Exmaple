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

  return matches;
}

const getSingleMatch = async (matchId, puuid, matchNum) => {
  
  let single = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`)
  .then(data => {
    let numOfPosition = null
    for(let i = 0; i < data.data.metadata.participants.length; i++) {
      if(puuid === data.data.metadata.participants[i]) {
         numOfPosition = i
      }
    }
    const singleInfo = data.data.info.participants[numOfPosition]
    const info = data.data;

    const teamid = singleInfo.teamId;
    let teamKills = null

    for(let team of info.info.teams) {
      // console.log(team)
      if(team.teamId === teamid) {
        teamKills = team.objectives.champion.kills;
      }
    }

    console.log(teamKills)

    let fontObj = {
      name: singleInfo.championName,
      gameEnd: info.info.gameEndTimestamp,
      gameDuration: info.info.gameDuration,
      win: singleInfo.win,
      kda: {
        kills: singleInfo.kills,
        deaths: singleInfo.deaths,
        assists: singleInfo.assists,
        ratio: `${Math.round((singleInfo.kills + singleInfo.assists)/singleInfo.deaths * 100) / 100}: 1 KDA`
      },
      summonerSpells: {
        summon1: singleInfo.summoner1Id,
        summon2: singleInfo.summoner2Id
      },
      items: {
        item0: singleInfo.item0,
        item1: singleInfo.item1,
        item2: singleInfo.item2,
        item3: singleInfo.item3,
        item4: singleInfo.item4,
        item5: singleInfo.item5,
        item6: singleInfo.item6,
      },
      cs: singleInfo.totalMinionsKilled + singleInfo.neutralMinionsKilled, 
      wards: singleInfo.visionWardsBoughtInGame,
      pKill: `${Math.round((singleInfo.kills + singleInfo.assists) / teamKills * 100)}%`
    }

    // console.log(info.info.teams[0]);
    // console.log(singleInfo)

    console.log(fontObj)
    
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
  // console.log(singleMatch)
}

testAPI();


app.get('/', (req, res) => {
  res.send("<h1>Hello</h1>")
})

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
