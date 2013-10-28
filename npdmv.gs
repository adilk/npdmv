

/**     A  N O W  P L A Y I N G  T W I T T E R   B O T   **/
/**     ==============================================   **/

/**     Written by Adil Kadir on 09/22/2013              **/

/**     Referencing this tutorial link: 
/**                    http://www.labnol.org/?p=27902    **/






function start() {
  
  var TWITTER_CONSUMER_KEY     = "";
  
  var TWITTER_CONSUMER_SECRET  = "";
  
  var TWITTER_HANDLE           = "";  
  
  // Store variables
  
  ScriptProperties.setProperty("TWITTER_CONSUMER_KEY",    TWITTER_CONSUMER_KEY);

  ScriptProperties.setProperty("TWITTER_CONSUMER_SECRET", TWITTER_CONSUMER_SECRET);

  ScriptProperties.setProperty("TWITTER_HANDLE",          TWITTER_HANDLE);

  ScriptProperties.setProperty("MAX_TWITTER_ID",          0);
    
  // Delete exiting triggers, if any
  
  var triggers = ScriptApp.getScriptTriggers();
  
  for(var i=0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
    
  // Setup trigger to read Tweets every 10 minutes
  fetchTweets();
  ScriptApp.newTrigger("fetchTweets")
           .timeBased()
           .everyMinutes(10)
           .create();
     
}

function oAuth() {

  var oauthConfig = UrlFetchApp.addOAuthService("twitter");
  oauthConfig.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
  oauthConfig.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
  oauthConfig.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");
  oauthConfig.setConsumerKey(ScriptProperties.getProperty("TWITTER_CONSUMER_KEY"));
  oauthConfig.setConsumerSecret(ScriptProperties.getProperty("TWITTER_CONSUMER_SECRET"));
 
}

function fetchTweets() {

  oAuth();
  
  var twitter_handle = ScriptProperties.getProperty("TWITTER_HANDLE");
  // English languate tweets with #np or #nowplaying in the DC area
  var phrase = "-RT+#np"; 
  var search = "https://api.twitter.com/1.1/search/tweets.json?q="; 
  search = search + encodeString(phrase) 
  + "&geocode=38.898748%2C-77.037684%2C30km&lang=en&result_type=recent&count=5&include_entities=false"
  + "&since_id=" + ScriptProperties.getProperty("MAX_TWITTER_ID");
  
  
  var options =
  {
    "method":"GET",
    "oAuthServiceName":"twitter",
    "oAuthUseToken":"always"
  };
  
  try {

    var result = UrlFetchApp.fetch(search, options);    

    if (result.getResponseCode() === 200) {
      
      var data = Utilities.jsonParse(result.getContentText());
      
      if (data) {
        
        var tweets = data.statuses;
        
        for (var i=tweets.length-1; i>=0; i--) {   
          sendTweet(tweets[i].id_str);          
        }
      }
    }
  } catch (e) {
    Logger.log(e.toString());
  }
}

function sendTweet(tweetId) {

  var options =
  {
    "method": "POST",
    "oAuthServiceName":"twitter",
    "oAuthUseToken":"always"    
  };
  
  var status = "https://api.twitter.com/1.1/statuses/retweet/";
  
  status += tweetId + ".json";
  
  try {
    var result = UrlFetchApp.fetch(status, options);
    // sets the max twitter id 
    ScriptProperties.setProperty("MAX_TWITTER_ID", tweetId);
    Logger.log(result.getContentText());    
  }  
  catch (e) {
    Logger.log(e.toString());
  }
}

function encodeString (q) {
  
  // Update: 09/06/2013
  
  // Google Apps Script is having issues storing oAuth tokens with the Twitter API 1.1 due to some encoding issues.
  // Hence this workaround to remove all the problematic characters from the status message.
  
  var str = q.replace(/\(/g,'{').replace(/\)/g,'}').replace(/\[/g,'{').replace(/\]/g,'}').replace(/\!/g, '|').replace(/\*/g, 'x').replace(/\'/g, '');
  return encodeURIComponent(str);

//   var str =  encodeURIComponent(q);
//   str = str.replace(/!/g,'%21');
//   str = str.replace(/\*/g,'%2A');
//   str = str.replace(/\(/g,'%28');
//   str = str.replace(/\)/g,'%29');
//   str = str.replace(/'/g,'%27');
//   return str;

}
