$(document).ready(() =>{
  $('.search-form').on('submit', (event)=> {
    event.preventDefault();
    const val = $(".summoner").val()
    console.log(val)

    $.ajax({
      url: `/api/${val}`,
      type: 'GET',
    })
    .then(data => {
      console.log(data)
      $('.results').append(showResults(data));
    })
    .catch(err => {
      console.log(err)
    })
  })
})

const items = (arr) => {
  return arr.map(data => {
    return `<img src="./img/item/${data}.png" >`
  })
}


const showResults = (lolData) => {
  // const date = new Date(lolData.gameEnd * 1000);
  // const currentTime = Date()
  // const time = timeago.format(currentTime)
  // console.log(time)

  return `
    <section>
      ${lolData.name}
      time: 
      <div class="summoner-main-info-container"> 

        <img class="character-img" src="./img/champion/${lolData.name}.png">
        <div>
          <img src="./img/summonerspells/Summoner${lolData.summonerSpells.summon1}.png" >
          <img src="./img/summonerspells/Summoner${lolData.summonerSpells.summon2}.png" >
        </div>
        <div>
          <p>${lolData.kda.kills} / <span class="red">${lolData.kda.deaths}</span> / ${lolData.kda.assists} </p>
          <p>${lolData.kda.ratio}</p>
        
        </div>
      </div>
      <div>
        ${items(lolData.items)}
      </div>
      <div>

    </section>
  `
}