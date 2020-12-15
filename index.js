const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch');


var port = process.env.PORT || config.get('PORT');

const metaWeatherApi = "https://www.metaweather.com/api/location/search/";
const locationApi = "https://www.metaweather.com/api/location/";

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

bot.hear(['hi', 'hello'], (payload, chat) => {
  chat.say('Hello. My name is WeatherBot. What city do you want to choose? :)', {typing: true})
});


bot.hear(/city (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const city = data.match[1];
    console.log("You would like to know weather forecast in "+ city);
    fetch(metaWeatherApi + '?query=' + city)
      .then(res => res.json())
      .then(json => {
        console.log(json);
        fetch(locationApi + json[0].woeid)
        .then(res => res.json())
        .then(location => {
          console.log(location);
          conversation.say("The city " + location.title + " has coordinates " + location.latt_long);
          handleFunction(conversation, location);
        });
      })
  });
});

function handleFunction(conversation, location) {
  setTimeout(() => {
    conversation.ask({
      text: "Want to know what the weather forecast will be like tomorrow? :)",
      quickReplies: ["Yes", "No"],
      options: {typing: true}
    }, (payload, conversation) => {
      if (payload.message.text === "Yes") 
      {
        console.log(location.consolidated_weather[1]); 

        conversation.say("In " + location.title + " will be "+ location.consolidated_weather[1].weather_state_name);
         if (location.consolidated_weather[1].weather_state_name === "Heavy Cloud" || location.consolidated_weather[1].weather_state_name === "Heavy Rain"
         || location.consolidated_weather[1].weather_state_name === "Light Rain" || location.consolidated_weather[1].weather_state_name === "Showers") 
         {
            conversation.say("Please take an umbrella. 🌂")
         } 
         else if (location.consolidated_weather[1].weather_state_name === "Snow") 
         {
             conversation.say("Please wear warm ❄️")
             conversation.end();
          } 
          else if (location.consolidated_weather[1].weather_state_name === "Clear") 
          {
            conversation.say("It will be sunny day ☀️, so please take sunglasses :)")
          } 
        }

      else if (payload.message.text === "No") {
        conversation.say("You can chosse another city for wather forecast. If you want exit I wish you nice day :)");
        conversation.end();
        return;
      } 
      
      else {
        conversation.say("In what city would you like to know weather forecast for next day?")
        fetch(metaWeatherApi + '?query=' + city)
      .then(res => res.json())
      .then(json => {
        console.log(json);
        fetch(locationApi + json[0].woeid)
        .then(res => res.json())
        .then(location => {
          console.log(location);
          conversation.say("The city " + location.title + " has coordinates " + location.latt_long);
        })
      })

      } 
  
    handleFunction1(conversation, location);
  
  })
  }, 2000)
}




function handleFunction1(conversation, location) {
  setTimeout(() => {
    conversation.ask({
      text: "Would you like to know temperature?",
      quickReplies: ["Yes", "No"],
      options: {typing: true}
    }, (payload, conversation) => {
      if (payload.message.text === "Yes") {
        conversation.say("In " + location.title + " will be " + String(location.consolidated_weather[1].the_temp) + " °C.", {typing: true});
        // pouzivatel podakuje -thanks- program skonci
        bot.hear(['thanks'], (payload, chat) => {
          chat.say('Have a nice day :)', {typing: true})
        conversation.end();
        });
        conversation.end();
      } else {
        conversation.say("Ok. Have a nice day. :)", {typing: true});
        conversation.end();
      }
    });
  }, 2000)
}

bot.start(port);