        "use strict"
        const express = require("express");
        const bodyParser = require("body-parser");
        const alexa = require("alexa-app");
        var upperCase = require('upper-case')
        var rate;


        const restService = express();

        restService.use(
        bodyParser.urlencoded({
            extended: true
        })
        );

        restService.use(bodyParser.json());

        //Method to fetch currency rate
        function fetchCurrentRate(baseCountry,conversionCountry,callback) {
            var url = "https://api.fixer.io/latest?base="+upperCase(baseCountry)+"&&symbols="+upperCase(baseCountry)+","+upperCase(conversionCountry);
            console.log(url)
            const request = require('request');
        request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var object = JSON.parse(body)
         rate = object.rates[upperCase(conversionCountry)] 
         callback(rate)

        }      
      
        });
        }

        // Method to handle google assistance request
        restService.post("/google",function(req,res){

            var baseCurrency = req.body.result.parameters.baseCountry;
            var conversionCurrency = req.body.result.parameters.conversionCountry
           fetchCurrentRate(baseCurrency,conversionCurrency,function(data){
               rate = data
               return res.json({
                speech: "The conversion rate of "+baseCurrency+" to "+conversionCurrency+" is "+rate,
                displayText: "The conversion rate of "+baseCurrency+" to "+conversionCurrency+" is "+rate,
                source: "MSS-Server"
              });
        })
    });           
        
        // Method to handle alexa request
        restService.post("/alexa",function(req,res){
            
                var baseCurrency = req.body.request.intent.slots.baseCountry.value;
                var conversionCurrency = req.body.request.intent.slots.conversionCountry.value
               fetchCurrentRate(baseCurrency,conversionCurrency,function(data){
                   rate = data
                   res.json({ 
                    version: "1.0",
                        response: {
                            "outputSpeech": {
                        "type": "PlainText",
                        "text": " The conversion rate of "+baseCurrency+" to "+conversionCurrency+" is "+rate,
                        "ssml": "<speak> The conversion rate of "+baseCurrency+" to "+conversionCurrency+" is "+rate+"</speak>"
                        }
                        }
                });
               })
                  

                
               
            // }

        }); 

        restService.listen(process.env.PORT || 3000, function () {
            console.log('App listening on port 3000!')
        });
