// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Amazon Software License
// http://aws.amazon.com/asl/

/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */
const Alexa = require("ask-sdk");
const i18n = require("i18next");
const sprintf = require("i18next-sprintf-postprocessor");
const languageStrings = {
  en: require("./languageStrings"),
};
const AWS = require("aws-sdk");
const {
  getRandomSlots,
  getReward,
  COIN_INPUT,
  DAILY_COINS,
  isNewDay,
  getDate,
} = require("./constants");

const LaunchRequest = {
  canHandle(handlerInput) {
    // launch requests as well as any new session, as games are not saved in progress, which makes
    // no one shots a reasonable idea except for help, and the welcome message provides some help.
    return (
      Alexa.isNewSession(handlerInput.requestEnvelope) ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    let attributes = {};
    try {
      attributes = (await attributesManager.getPersistentAttributes()) || {};
    } catch (e) {
      attributes = {
        debug: true,
        coins: 1337,
      };
    }

    let firstDay = false;

    if (typeof attributes.coins === "undefined") {
      // First open, but not debug
      firstDay = true;
    }

    attributes = {
      // Initialize attributes for first open
      coins: 100,
      gameState: "LOBBY",
      debug: false,
      lastOpened: getDate(),
      ...attributes,
    };

    let newDay = isNewDay(attributes.lastOpened);

    // Set proper speech message
    // newDay: user opens skill on a new day, gets reward
    // firstDay: user opens skill for first time, give extra explanation
    let speechMessage = "LAUNCH_MESSAGE";
    if (newDay) {
      attributes.coins += DAILY_COINS;
      attributes.lastOpened = getDate();
      speechMessage += "_NEW_DAY";
    } else if (firstDay) {
      speechMessage += "_FIRST_DAY";
    }

    // Set session and persistent attributes
    attributesManager.setSessionAttributes(attributes);
    try {
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
    } catch (e) {}

    const coins = attributes.coins.toString();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t(speechMessage, coins))
      .reprompt(requestAttributes.t(speechMessage, coins))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("EXIT_MESSAGE"))
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("HELP_MESSAGE"))
      .reprompt(requestAttributes.t("HELP_MESSAGE"))
      .getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    // only start a new game if yes is said when not playing a game.
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "PLAYING"
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      // !isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
    return spinHandler(handlerInput);
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    // only treat no as an exit when outside a game
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "PLAYING"
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      // !isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent"
    );
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.gameState = "LOBBY";

    try {
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();
    } catch (e) {}

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("EXIT_MESSAGE"))
      .getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("CONTINUE_MESSAGE"))
      .reprompt(requestAttributes.t("CONTINUE_MESSAGE"))
      .getResponse();
  },
};

const SpinIntent = {
  canHandle(handlerInput) {
    // handle spinning only during a game?
    let isCurrentlyPlaying = false;
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (
      sessionAttributes.gameState &&
      sessionAttributes.gameState === "PLAYING"
    ) {
      isCurrentlyPlaying = true;
    }

    return (
      // isCurrentlyPlaying &&
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "SpinIntent"
    );
  },
  handle(handlerInput) {
    return spinHandler(handlerInput);
  },
};

async function spinHandler(handlerInput) {
  const { attributesManager } = handlerInput;
  const requestAttributes = attributesManager.getRequestAttributes();
  const sessionAttributes = attributesManager.getSessionAttributes();

  if (sessionAttributes.coins < COIN_INPUT) {
    // user can't afford to play
    // no reprompt = quit the skill
    return handlerInput.responseBuilder
      .speak(requestAttributes.t("NOT_ENOUGH_COINS"))
      .getResponse();
  }

  const slots = getRandomSlots();
  // const slots = ["lemon", "lemon", "lemon"];
  const reward = getReward(slots);

  if (!slots || !reward) {
    return handlerInput.responseBuilder
      .speak(requestAttributes.t("FALLBACK_MESSAGE"))
      .reprompt(requestAttributes.t("FALLBACK_MESSAGE"))
      .getResponse();
  }

  sessionAttributes.coins += reward.reward - COIN_INPUT;

  try {
    attributesManager.setPersistentAttributes(sessionAttributes);
    await attributesManager.savePersistentAttributes();
  } catch (e) {}

  if (reward.reward > 0) {
    // User won
    return handlerInput.responseBuilder
      .speak(
        requestAttributes.t(
          "SPIN_MESSAGE_WIN",
          slots[0],
          slots[1],
          slots[2],
          reward.message,
          reward.reward.toString(),
          sessionAttributes.coins
        )
      )
      .reprompt(
        requestAttributes.t(
          "SPIN_MESSAGE_WIN",
          slots[0],
          slots[1],
          slots[2],
          reward.message,
          reward.reward.toString(),
          sessionAttributes.coins
        )
      )
      .getResponse();
  } else {
    // User lost
    return handlerInput.responseBuilder
      .speak(
        requestAttributes.t(
          "SPIN_MESSAGE_LOSE",
          slots[0],
          slots[1],
          slots[2],
          sessionAttributes.coins
        )
      )
      .reprompt(
        requestAttributes.t(
          "SPIN_MESSAGE_LOSE",
          slots[0],
          slots[1],
          slots[2],
          sessionAttributes.coins
        )
      )
      .getResponse();
  }
}

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(requestAttributes.t("ERROR_MESSAGE"))
      .reprompt(requestAttributes.t("ERROR_MESSAGE"))
      .getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    // handle fallback intent, yes and no when playing a game
    // for yes and no, will only get here if and not caught by the normal intent handler
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.YesIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent")
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    // currently playing
    return handlerInput.responseBuilder
      .speak(requestAttributes.t("FALLBACK_MESSAGE"))
      .reprompt(requestAttributes.t("FALLBACK_MESSAGE"))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: Alexa.getLocale(handlerInput.requestEnvelope),
      resources: languageStrings,
    });
    localizationClient.localize = function localize() {
      const args = arguments;
      const values = [];
      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: "sprintf",
        sprintf: values,
      });
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    };
  },
};

function getPersistenceAdapter() {
  // Determines persistence adapter to be used based on environment
  const s3Adapter = require("ask-sdk-s3-persistence-adapter");
  return new s3Adapter.S3PersistenceAdapter({
    bucketName: process.env.S3_PERSISTENCE_BUCKET,
    s3Client: new AWS.S3({
      apiVersion: "latest",
      region: process.env.S3_PERSISTENCE_REGION,
    }),
  });
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .withPersistenceAdapter(getPersistenceAdapter())
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    YesIntent,
    NoIntent,
    SpinIntent,
    FallbackHandler,
    UnhandledIntent
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
