const Alexa = require('ask-sdk-core');
const { recommend, listCategories } = require('./recommendation-engine');
const { addToCartDirective } = require('./shopping-actions');

const associatesEnabled = () => process.env.ASSOCIATES_ENABLED === 'true';

function disclosure() {
  return associatesEnabled()
    ? 'This skill earns from qualifying purchases. '
    : '';
}

function slotValue(handlerInput, slotName) {
  return handlerInput.requestEnvelope.request.intent?.slots?.[slotName]?.value || '';
}

function event(name, payload = {}) {
  console.log(JSON.stringify({
    event: name,
    at: new Date().toISOString(),
    ...payload,
  }));
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const categories = listCategories().map(x => x.displayName).join(', ');
    return handlerInput.responseBuilder
      .speak(`${disclosure()}I can help compare products across ${categories}. Tell me what you are shopping for.`)
      .reprompt('What are you shopping for?')
      .getResponse();
  },
};

const BrowseCategoriesIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BrowseCategoriesIntent';
  },
  handle(handlerInput) {
    const names = listCategories().map(x => x.displayName);
    return handlerInput.responseBuilder
      .speak(`I currently support ${names.join(', ')}.`)
      .reprompt('Which category should I help with?')
      .getResponse();
  },
};

const FindProductIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FindProductIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if (request.dialogState && request.dialogState !== 'COMPLETED') {
      return handlerInput.responseBuilder.addDelegateDirective().getResponse();
    }

    const result = recommend({
      category: slotValue(handlerInput, 'category'),
      budget: slotValue(handlerInput, 'budget'),
      priority: slotValue(handlerInput, 'priority'),
      household: slotValue(handlerInput, 'household'),
    });

    if (result.error) {
      return handlerInput.responseBuilder
        .speak('I do not support that category yet. Say, what categories do you support?')
        .reprompt('Ask what categories I support.')
        .getResponse();
    }

    const attrs = handlerInput.attributesManager.getSessionAttributes();
    attrs.recommendation = result;
    attrs.awaitingCartConfirmation = true;
    handlerInput.attributesManager.setSessionAttributes(attrs);

    event('recommendation_made', {
      category: result.categoryKey,
      productKey: result.product.key,
      asin: result.product.asin,
      priceTier: result.product.priceTier,
    });

    return handlerInput.responseBuilder
      .speak(
        `${disclosure()}My pick is ${result.product.name}, because ${result.reason}. ` +
        'Would you like me to hand this to Amazon so Alexa can show the current offer and ask whether to add it to your cart?'
      )
      .reprompt('Would you like me to hand this to Amazon for the cart step?')
      .getResponse();
  },
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
      && Boolean(handlerInput.attributesManager.getSessionAttributes().awaitingCartConfirmation);
  },
  handle(handlerInput) {
    const attrs = handlerInput.attributesManager.getSessionAttributes();
    const result = attrs.recommendation;
    if (!result?.product?.asin) {
      return handlerInput.responseBuilder
        .speak('I lost the recommendation. Tell me what you are shopping for and we can start again.')
        .getResponse();
    }

    const token = `add-to-cart:${result.categoryKey}:${result.product.key}`;
    event('cart_handoff_started', {
      category: result.categoryKey,
      productKey: result.product.key,
      asin: result.product.asin,
      associatesEnabled: associatesEnabled(),
    });

    attrs.awaitingCartConfirmation = false;
    attrs.lastShoppingToken = token;
    handlerInput.attributesManager.setSessionAttributes(attrs);

    return handlerInput.responseBuilder
      .speak('Opening the Amazon cart step.')
      .addDirective(addToCartDirective(result.product, token))
      .getResponse();
  },
};

const NoIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const attrs = handlerInput.attributesManager.getSessionAttributes();
    attrs.awaitingCartConfirmation = false;
    handlerInput.attributesManager.setSessionAttributes(attrs);
    event('recommendation_declined', {
      category: attrs.recommendation?.categoryKey || null,
      productKey: attrs.recommendation?.product?.key || null,
    });
    return handlerInput.responseBuilder
      .speak('Okay. Tell me another category or preference when you are ready.')
      .reprompt('What are you shopping for?')
      .getResponse();
  },
};

const SessionResumedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionResumedRequest';
  },
  handle(handlerInput) {
    const cause = handlerInput.requestEnvelope.request.cause || {};
    const result = cause.result || null;
    const statusCode = cause.status?.code || null;

    event('shopping_action_resumed', {
      token: cause.token || null,
      statusCode,
      resultCode: result?.code || null,
    });

    if (statusCode === '200' && !result) {
      return handlerInput.responseBuilder
        .speak('Amazon finished the cart step. You can ask me to compare another product.')
        .reprompt('What else are you shopping for?')
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak('Amazon could not finish that shopping step. You can try again later or ask for another recommendation.')
      .reprompt('What else are you shopping for?')
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Tell me a product category, your budget preference, what matters most, and who or what the product is for. I will recommend a matching option.')
      .reprompt('What are you shopping for?')
      .getResponse();
  },
};

const StopIntentHandler = {
  canHandle(handlerInput) {
    if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest') return false;
    const name = Alexa.getIntentName(handlerInput.requestEnvelope);
    return name === 'AMAZON.StopIntent' || name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak('Goodbye.').getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('I can help compare products. Tell me what you are shopping for.')
      .reprompt('What are you shopping for?')
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() { return true; },
  handle(handlerInput, error) {
    console.error(error);
    return handlerInput.responseBuilder
      .speak('Something went wrong. Please try again.')
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    BrowseCategoriesIntentHandler,
    FindProductIntentHandler,
    YesIntentHandler,
    NoIntentHandler,
    SessionResumedRequestHandler,
    HelpIntentHandler,
    StopIntentHandler,
    FallbackIntentHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
