const express = require('express');
const morgan = require('morgan');
const env = require('dotenv').config({
  path: __dirname + '/.env'
})
const port = process.env.PORT || 9001;
const app = express();
const axios = require('axios');
const { get } = require('express/lib/response');
app.use(morgan('dev'));

app.set('view engine', 'ejs');


app.use(express.static("public"));

const apiKey = process.env.API_KEY

const summerObj = {
  21: "Barrier",
  1: "Cleanse",
  14: "Ignite",
  3: "Exhaust",
  4: "Flash",
  6: "Ghost",
  7: "Heal",
  13: "Clarity",
  30: "To the King!",
  31: "Poro Toss",
  11: "Smite",
  39: "Mark",
  32: "Mark",
  12: "Teleport",
  54: "Placeholder",
  55: "Placeholder and Attack-Smite",
}

const getSummonerPuuid = async (name) => {
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
  console.log("--1-----------",matchId)
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
    let teamKills = teamid === info.info.teams[0].teamId ? info.info.teams[0].objectives.champion.kills : info.info.teams[1].objectives.champion.kills

    // console.log(info.info.teams)
    // console.log(teamKills)

    // for(let team of info.info.teams) {
    //   // console.log(team)
    //   if(team.teamId === teamid) {
    //     teamKills = team.objectives.champion.kills;
    //   }
    // }

    console.log(singleInfo)

    let frontObj = {
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
        summon1: summerObj[singleInfo.summoner1Id],
        summon2: summerObj[singleInfo.summoner2Id]
      },
      items: [
         singleInfo.item0,
         singleInfo.item1,
         singleInfo.item2,
         singleInfo.item3,
         singleInfo.item4,
         singleInfo.item5,
         singleInfo.item6,
      ],
      cs: singleInfo.totalMinionsKilled + singleInfo.neutralMinionsKilled, 
      wards: singleInfo.visionWardsBoughtInGame,
      pKill: `${Math.round((singleInfo.kills + singleInfo.assists) / teamKills * 100)}%`
    }

    // console.log(info.info.teams[0]);
    // console.log(singleInfo)

    // console.log(fontObj)

    return frontObj;
    
  })
  .catch(err => {
    return err
  })

  return single;
}


const getResults = async (summonerName = "Doublelift") => {
  const summonerPuuid = await getSummonerPuuid(summonerName);
  const matchList = await getListOfMatches(summonerPuuid)
  const singleMatch = await getSingleMatch(matchList[0], summonerPuuid)
  // console.log(singleMatch)
  return singleMatch;
}




app.get('/api/:summoner', async (req, res) => {
  const search = req.params.summoner
  const results = await getResults(search);
  console.log(results)
  res.send(results)
})

app.get('/',  (req, res) => {
  res.render("check")
})

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
