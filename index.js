// Reference the packages we require so that we can use them in creating the bot
var restify = require('restify');
var builder = require('botbuilder');
var timekit = require('timekit-sdk');
var sql = require('mysql');
var rp = require('request-promise');
var BINGNEWSKEY = 'f2d953db69994bd1bd0ef8d393ef00a2';
var comvisionKey = '89fb221864a540e99064d6e4f6789a0e';
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
// Listen for any activity on port 3978 of our local server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
// If a Post request is made to /api/messages on port 3978 of our local server, then we pass it to the bot connector to handle
server.post('/api/messages', connector.listen());

const LuisUrl = "https://api.projectoxford.ai/luis/v2.0/apps/b5fcee56-93a3-44b4-8e97-ab5ac545e38c?subscription-key=d1e59dd6c4fe41ea8db9bbd4315d52a8&verbose=true";

//"https://api.projectoxford.ai/luis/v2.0/apps/eb385207-a1f7-4e85-ac69-4879878b3df0?subscription-key=\
//17dc6ebbe28e4907ab33186b9830f559&verbose=true";
var recognizer = new builder.LuisRecognizer(LuisUrl);
var intentDialog = new builder.IntentDialog({recognizers:[recognizer]});
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
.matches('book-appointment', '/book-appointment')
    .matches('confirm-time', '/confirm-time')
    .matches('upcoming-events', '/events')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));
//=========================================================
// Bots Dialogs
//=========================================================

// This is called the root dialog. It is the first point of entry for any message the bot receives
bot.dialog('/', intentDialog);

bot.dialog('/events', [
function (session, args, next) {
var time = builder.EntityRecognizer.resolveTime(args.entities);
if (!time) {
builder.Prompts.time(session, 'Here is what you have on tomorrow:');
timekit.getEvents({
start: new Date(),
end: new Date().setDate(dat.getDate() + 1)
})
} else {
// Saving date as a timestamp between turns as session.dialogData could get serialized.
session.dialogData.timestamp = time.getTime();
next();
}
}
]);
// bot.dialog('/topNews', [
//     function (session){
//         // Ask the user which category they would like
//         // Choices are separated by |
//         var cards = [];
//         var btnText = ["Technology","Science","Sports","Business","Entertainment","Politics","Health","World","(quit)"]
//         var mybtns =[];
//         // Iterate through all 10 articles returned by the API
//         for (var i = 0; i < 9; i++){
//             // Create a card for the article and add it to the list of cards we want to send
//             mybtns.push(builder.CardAction.imBack(session, (i+1).toString(), btnText[i]));
//         }
//         cards.push(new builder.HeroCard(session)
//                 .title( "Which category would you like?")
//                 .buttons(mybtns));
//         var msg = new builder.Message(session)
//             .textFormat(builder.TextFormat.plain)
//             .attachmentLayout(builder.AttachmentLayout.carousel)
//             .attachments(cards);
//             //session.send(msg);
//         builder.Prompts.choice(session,msg, "Technology|Science|Sports|Business|Entertainment|Politics|Health|World|(quit)");
//     }, function (session, results){
//         console.log("come into search?")
//         if (results.response && results.response.entity !== '(quit)') {
//             //Show user that we're processing their request by sending the typing indicator
//             session.sendTyping();
//             // Build the url we'll be calling to get top news
//             var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/?" 
//                 + "category=" + results.response.entity + "&count=10&mkt=en-US&originalImg=true";
//             // Build options for the request
//             var options = {
//                 uri: url,
//                 headers: {
//                     'Ocp-Apim-Subscription-Key': BINGNEWSKEY
//                 },
//                 json: true // Returns the response in json
//             }
//             //Make the call
//             rp(options).then(function (body){
//                 // The request is successful
//                 // console.log(body); // Prints the body out to the console in json format
//                 // session.send("Managed to get your news.");
//                 sendTopNews(session, results, body);
//             }).catch(function (err){
//                 // An error occurred and the request failed
//                 console.log(err.message);
//                 session.send("Argh, something went wrong. :( Try again?");
//             }).finally(function () {
//                 // This is executed at the end, regardless of whether the request is successful or not
//                 session.endDialog();
//             });
//         } else {
//             session.endDialog("Ok. Mission Aborted.");
//         }
//     }
// ]);
// bot.dialog('/analyseImage', [
//     function (session){
//         // Ask the user which category they would like
//         // Choices are separated by |
        
//         builder.Prompts.text(session,"Please Scan your image");
//     }, function (session, results){
//         console.log(results.response);
//             session.sendTyping();
//             // Build the url we'll be calling to get top news
//             var url = "https://api.projectoxford.ai/vision/v1.0/describe?maxCandidates=1";
//             // Build options for the request
//             var options = {
//                 method: 'POST',
//                 uri: url,
//                 headers: {
//                     'Ocp-Apim-Subscription-Key': comvisionKey,
//                     'Content-Type':'application/json'
//                 },
//                 body: {
//                     url: results.response
//                 },
//                 json: true // Returns the response in json
//             }
//             //Make the call
//             rp(options).then(function (body){
//                 // The request is successful
//              console.log("response body: "+body); // Prints the body out to the console in json format

//                 session.send("this is "+ body.description.captions[0].text);
                
//             }).catch(function (err){
//                 // An error occurred and the request failed
//                 console.log(err.message);
//                 session.send("Argh, something went wrong. :( Try again?");
//             }).finally(function () {
//                 // This is executed at the end, regardless of whether the request is successful or not
//                 session.endDialog();
//             });
//     }
// ]);
bot.dialog('/confirm-time', [function (session) {
    session.send("Hi, I'm Jarvis, I'm your personal asistant");
    session.send("Before I can start servicing you, I will need some input from you.");
    // Send 'hello world' to the user
    builder.Prompts.text(session, "What's your name?");
},function(session, results, next){
    session.send("Nice to meet you " + results.response);
    next();
}]);
bot.dialog('/book-appointment', [function (session) {
    builder.Prompts.text(session, "please provide the user's email account you wish you make appointment with:");
},function(session, results, next){
    session.endDialog("Thank you, the available timing for today are 18:00, 20:00 and 22:00" );
    session.beginDialog('/what');
}]);
bot.dialog('/what',[function(session){
    builder.Prompts.text(session, "which time do you like to book?");
},function(session, results, next){
    session.send("I'd updated the other party on your preferred timeslot." );
    session.send("The other party has agreed on your preferred timeslot and I have created an event on your calendar ");
}])
bot.dialog('/email', [function(session){
    builder.Prompts.text(session,"Thanks for authorize, what is your email?");
},function(session, results){
    session.endDialog("Thank you. What do you like to do?");
}]);
bot.dialog('/sayHi', [function (session) {
    session.send("Hi, I'm Jarvis, I'm your personal asistant");
    session.send("Before I can start servicing you, I will need some input from you.");
    // Send 'hello world' to the user
    builder.Prompts.text(session, "What's your name?");
},function(session, results, next){
    session.send("Nice to meet you " + results.response);
    next();
},function(session, results, next){
    builder.Prompts.text(session, "Can I have your permission to sync up your google account?");
},function(session, results, next){
    //console.log(results.response);
    if(results.response=='yes'){
        var cards = [];
        var mybtns = [];
        
        //mybtns.push(builder.CardAction.postBack(session, "https://api.timekit.io/v2/accounts/google/signup?callback=http://localhost:3978/api/messages&Timekit-App=azurenaut", "Sign In"));
        cards.push(new builder.SigninCard(session)
                .text( "Please sign-in your google account")
                .button("Sign in", "https://api.timekit.io/v2/accounts/google/signup?callback=http://localhost:82/botresult.php&Timekit-App=azurenaut"));
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.plain)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);

            session.send(msg);
            session.beginDialog('/email');
    }
    else{
        session.endDialog("sorry, I can't help you then.");
    }
}]);
// This function processes the results from the API call to category news and sends it as cards
// function sendTopNews(session, results, body){
//     session.send("Top news in " + results.response.entity + ": ");
//     //Show user that we're processing by sending the typing indicator
//     session.sendTyping();
//     // The value property in body contains an array of all the returned articles
//     var allArticles = body.value;
//     var cards = [];
//     // Iterate through all 10 articles returned by the API
//     for (var i = 0; i < 10; i++){
//         var article = allArticles[i];
//         // Create a card for the article and add it to the list of cards we want to send
//         cards.push(new builder.HeroCard(session)
//             .title(article.name)
//             .subtitle(article.datePublished)
//             .images([
//                 //handle if thumbnail is empty
//                 builder.CardImage.create(session, article.image.contentUrl)
//             ])
//             .buttons([
//                 // Pressing this button opens a url to the actual article
//                 builder.CardAction.openUrl(session, article.url, "Full article")
//             ]));
//     }
//     var msg = new builder.Message(session)
//         .textFormat(builder.TextFormat.xml)
//         .attachmentLayout(builder.AttachmentLayout.carousel)
//         .attachments(cards);
//     session.send(msg);
// }