const Alexa = require('ask-sdk-core');
var https = require('https');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Olá, eu sou o seu bot assistente de League of Legends, o que você quer saber?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


async function httpGetAll() {
  return new Promise(((resolve, reject) => {
    var options = {
        host: "br1.api.riotgames.com",
        path: "/lol/spectator/v4/active-games/by-summoner/1Xk3z3jJbQoBMfzRkX9WisM2gptsXJV5TkUUrrpADte-eFc",
        headers: {'X-Riot-Token': 'RGAPI-f2a2920e-6261-44a2-b6e8-53117c737ab2'},
        method: 'GET'
    };
    
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {returnData += chunk;});
      response.on('end', () => {resolve(JSON.parse(returnData));});
      response.on('error', (error) => {reject(error);});
      
    });
    request.end();
  }));
}

async function httpGetWinrate(summonerId) {
  var path = "/lol/league/v4/entries/by-summoner/"+summonerId+"?api_key=RGAPI-f2a2920e-6261-44a2-b6e8-53117c737ab2";
  return new Promise(((resolve, reject) => {
    var options = {
        host: "br1.api.riotgames.com",
        path: path,
        headers: {'X-Riot-Token': 'RGAPI-f2a2920e-6261-44a2-b6e8-53117c737ab2'},
        method: 'GET'
    };
    
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {returnData += chunk;});
      response.on('end', () => {resolve(JSON.parse(returnData));});
      response.on('error', (error) => {reject(error);});
      
    });
    request.end();
  }));
}


const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'HelloWorldIntent';
  },
  async handle(handlerInput) {
    var response = await GetAll();
    var speak = " ";
    
    for(var i=0; i<10; i++){
        var winrate = await GetWinRate(response.participants[i].summonerId);

    
        for(var j=0; j<2; j++){
            if(winrate[j]){
                if(winrate[j].queueType === "RANKED_SOLO_5x5"){
                     if((winrate[j].wins / winrate[j].losses) > 1.2)
                    {
                     speak += "O Jogador " + winrate[j].summonerName + ", é um possível smurf";
                       
                    }
                }
            }
        }

    }
    
    return handlerInput.responseBuilder
            .speak(speak)
            .reprompt("Você deseja ouvir mais?")
            .getResponse();
  },
};

async function GetAll(){
    var array = await httpGetAll();
    var response = array;
    return response;
}

async function GetWinRate(summonerId){
    var array = await httpGetWinrate(summonerId);
    var response = array;
    return response;
}






////////////////////////
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Você pode dizer olá!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Desculpa, eu não entendi, diga novamente.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
