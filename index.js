const Alexa = require('ask-sdk-core');
const fs = require('fs');

// Handler para el inicio de la skill
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bienvenido a MENTORiment, ¿qué deseas?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const getMentorias = () => {
    const data = fs.readFileSync('mentorias.json');
    return JSON.parse(data);
};

const formatearFecha = (fecha) => {
    const options = { day: '2-digit', month: 'long' }; // Día en 2 dígitos, mes en formato largo
    const fechaFormateada = new Date(fecha);
    return new Intl.DateTimeFormat('es-ES', options).format(fechaFormateada);
};

const ObtenerProximaMentoriaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ObtenerProximaMentoriaIntent';
    },
    handle(handlerInput) {
        const mentorias = getMentorias();  // Cargar el archivo JSON con las mentorías
        const fechaActual = new Date();
        
        // Filtrar las mentorías que ocurren después de la fecha actual
        const proximaMentoria = mentorias
            .filter(mentoria => new Date(mentoria.fecha) > fechaActual)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];  // Ordenar por fecha y obtener la primera

        if (proximaMentoria) {
            const fechaProximaMentoria = formatearFecha(proximaMentoria.fecha);
            const speakOutput = `Tu próxima mentoría es el ${fechaProximaMentoria} y se titula "${proximaMentoria.titulo}".`;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        } else {
            const speakOutput = "No tienes más mentorías programadas.";
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
    }
};

// Otros handlers para los intents básicos
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Puedes decir "Añadir una mentoría el {fecha}" o "¿Cuál es mi próxima mentoría?".';

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
        const speakOutput = 'Hasta luego!';

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
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, hubo un problema. Por favor, inténtalo de nuevo.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Configuración del skill
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ObtenerProximaMentoriaIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/mentorías/v1.0')
    .lambda();
