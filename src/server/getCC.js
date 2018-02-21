
const url     = require('./url');
const debug  = require('debug')('app:getCC');

module.exports = function(req, res, serverData, wordsOfCountry) {    
        
    var CC = req.params.CC; //ISO 2 letter Country Code
    var languageCode    = serverData.languagesCountries[CC]; //ISO language code (ex: pt-PT)
    var isThisLocalhost = url.isThisLocalhost(req); //returns bool
    var isThisATest     = url.isThisATest(req); //returns bool
    var httpProtocol    = url.getProtocol(req, serverData.settings.switches.https);
    
    debug("Country code: "  + CC);
    debug("Language code: " + languageCode);
    
    //data to be rendered embedded in the HTML file
    var data = {};    
    
    //Object with all the expressions for each country
    data.words = wordsOfCountry;
    data.words.word_per += "&#32;" //add non-breaking space    
        
    //use Local files or CDN?
    debug("isThisLocalhost ", isThisLocalhost);
    if(isThisLocalhost){
        serverData.fileNames.client.jquery.uri    = serverData.fileNames.client.jquery.local;
        serverData.fileNames.client.pdfmake.uri   = serverData.fileNames.client.pdfmake.local;
        serverData.fileNames.client.vfs_fonts.uri = serverData.fileNames.client.vfs_fonts.local;
    }
    else{
        serverData.fileNames.client.jquery.uri    = serverData.fileNames.client.jquery.cdn;
        serverData.fileNames.client.pdfmake.uri   = serverData.fileNames.client.pdfmake.cdn;
        serverData.fileNames.client.vfs_fonts.uri = serverData.fileNames.client.vfs_fonts.cdn;    
    }
    
    //global constant data for every request, and that was already loaded when the server app was initialized
    data.serverData = serverData;
    delete data.serverData.availableCountries.XX;
    
    //information depending on this request from the client    
    var clientData = {
        "languageCode" : languageCode,     //ISO 2 letter Language Code  
        "isThisATest"  : isThisATest,      //boolean variable regarding if present request is a test
        "notLocalhost" : !isThisLocalhost, //boolean variable regarding if present request is from localhost
        "httpProtocol" : httpProtocol
    }    
    data.clientData = clientData;
    
    //ISO 2 letter Country Code
    data.CC = data.words.CC = data.clientData.CC = CC;
    
    data.emptyChar = ""; //empty character to be used in handlebars for whitespace trimming
    data.layout = false; //doesn't use handlebars default template
    
    var fileToRender = serverData.directories.index + "views/main.hbs";
    res.render(fileToRender, data);
    
}

