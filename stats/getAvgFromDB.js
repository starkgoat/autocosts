/*Node script which populates the average DB tables for each country*/

//includes
var fs    = require('fs');
var path  = require("path");
var async = require('async'); //module to allow to execute the queries in series
var mysql = require('mysql'); //module to get info from DB

var HOME_DIR = path.resolve(__dirname, '..') + "/"; //parent directory of current file directory
var SRC_DIR = HOME_DIR + "src" + "/";

eval(fs.readFileSync(SRC_DIR + 'client/conversionFunctions.js')+'');
eval(fs.readFileSync(SRC_DIR + 'client/core/coreFunctions.js')+'');
eval(fs.readFileSync(SRC_DIR + 'client/getData.js')+'');
eval(fs.readFileSync('./statsFunctions.js')+'');

var REL; //release shall be 'work' or 'prod', it's 'work' by default
if(process.argv.length == 2){    
    REL = "work";
}
else if (process.argv.length > 3){
    console.log("Just one argument is accepted \n");
    process.exit();
}
else{
    if (process.argv[2]!="work" && process.argv[2]!="prod"){
        console.log("work or prod must be chosen \n");
        process.exit();
    }
    REL = process.argv[2];
}
console.log("chosen '" + REL + "'");
//process.exit();

//include credentials object
var DB_INFO = JSON.parse(fs.readFileSync(HOME_DIR + 'keys/' + REL + '/db_credentials.json'));
console.log(DB_INFO);

//database variable
var db;

var countries = [];       //array of objects with countries information
var unique_users = [];    //array of objects having unique_users IDs and respective countries
var AllUserInputDb = [];  //array of objects with all the data from the inputs users DB
var queryInsert = "";     //string to where all the average data will be inserted

//string with the date DD/MM/YYYY
var d = new Date();
var date_string = "'"+d.getFullYear().toString()+"-"+(d.getMonth()+1).toString()+"-"+d.getDate().toString()+"'";
//console.log(date_string);

//method that forces several methods to run synchronously
async.series([

    //get the set of different countries and set them in array countries[]
    function(callback) {
        //console.log("DB login data: "); console.log(DB_INFO);

        db = mysql.createConnection(DB_INFO);
        console.log('\nGetting the set of different countries from ' +
                    'DB table ' + DB_INFO.database + '->' + DB_INFO.db_tables.country_specs);
        
        db.connect(function(err){
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            console.log('User ' + DB_INFO.user + 
                        ' connected successfully to DB ' + DB_INFO.database + 
                        ' at ' + DB_INFO.host);
        });

        db.query('SELECT * FROM ' + DB_INFO.db_tables.country_specs, function(err, results, fields) {
            if (err) {console.log(err); throw err;}
            //Check that a user was found
            for (var i=0; i<results.length; i++){
                if (results[i].Country){
                    countries.push(results[i]);
                }
            }
            //console.log(countries);
            db.end();
            callback();
        });
    },

    //Get users unique ID
    function(callback) {
        console.log('\nGetting users unique IDs from ' +
                    'DB table ' + DB_INFO.database + '->' + DB_INFO.db_tables.users_insertions);
        db = mysql.createConnection(DB_INFO);

        db.connect(function(err){
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            console.log('User ' + DB_INFO.user + 
                        ' connected successfully to DB ' + DB_INFO.database + 
                        ' at ' + DB_INFO.host);
        });

        db.query('SELECT DISTINCT uuid_client, country FROM ' + DB_INFO.db_tables.users_insertions, function(err, results, fields) {
            if (err) return callback(err);
            for (var i=0; i<results.length; i++){
                unique_users.push(results[i]);
            }
            //console.log(unique_users);
            db.end();
            callback();
        });
    },

    //Get all data from users input DB
    function(callback) {
        console.log('\nGetting all user insertion data from ' +
                    'DB table ' + DB_INFO.database + '->' + DB_INFO.db_tables.users_insertions);
        db = mysql.createConnection(DB_INFO);

        db.connect(function(err){
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            console.log('User ' + DB_INFO.user + 
                        ' connected successfully to DB ' + DB_INFO.database + 
                        ' at ' + DB_INFO.host);
        });

        db.query('SELECT * FROM ' + DB_INFO.db_tables.users_insertions, function(err, results, fields) {
            if (err) return callback(err);

            for (var i=0; i<results.length; i++){
                AllUserInputDb.push(results[i]);
            }
            //console.log(AllUserInputDb);
            db.end();
            callback();
        });
    },

    //calculate data and builds query
    function(callback) {
        console.log('\nCalculating data and building DB insertion data for ' + 
                    'DB table ' + DB_INFO.database + '->' + DB_INFO.db_tables.monthly_costs_statistics);
        var country_users = []; //array with unique users for one specific country
        var country_data  = []; //array where all data for one specific country is inserted

        //query header
        queryInsert += "INSERT INTO " + DB_INFO.db_tables.monthly_costs_statistics + " (\
            country,\
            Date_of_calculation,\
            \
            Depreciation,\
            Insurance,\
            Loan_interests,\
            Inspection,\
            Car_tax,\
            Maintenance,\
            Fuel,\
            Repairs,\
            Parking,\
            Tolls,\
            Fines,\
            Washing,\
            \
            standing_costs,\
            running_costs,\
            total_costs,\
            \
            running_costs_dist,\
            total_costs_dist,\
            \
            kinetic_speed,\
            virtual_speed,\
            \
            total_costs_year,\
            \
            valid_users,\
            total_users,\
            global_total_users)\
            \
            VALUES ";

        //builds the query to insert all the vaules for each country
        //sql query:... VALUES (PT, value1, value2,...),(BR, value1, value2,...),etc.
        for (var i = 0; i < countries.length; i++){
            process.stdout.write(countries[i].Country + " ");

            country_users = []; //array with unique_users for selected countries[i]
            country_data  = []; //array with everything for selected countries[i]

            for (var j=0; j<unique_users.length; j++){
                if (unique_users[j].country==countries[i].Country)
                    country_users.push(unique_users[j]);
            }
            //if(true) {console.log("country_users:");console.log(country_users);}

            for (j=0; j<AllUserInputDb.length; j++){
                if (AllUserInputDb[j].country==countries[i].Country)
                    country_data.push(AllUserInputDb[j]);
            }
            //if(true) {console.log("country_data:");console.log(country_data);}

            var country_object = {
                code: countries[i].Country,
                currency: countries[i].currency,
                distance_std: countries[i].distance_std,
                fuel_efficiency_std: countries[i].fuel_efficiency_std,
                fuel_price_volume_std: countries[i].fuel_price_volume_std
            };
            //if(true) {console.log("country_object:");console.log(country_object);}

            var stats_results = CalculateStatistics(country_users, country_data, country_object);

            //add computed data to countries array of objects
            countries[i].valid_users = stats_results.users_counter;
            countries[i].total_users = country_users.length;
            countries[i].total_costs = stats_results.totCos.toFixed(1);

            queryInsert += "('" + countries[i].Country + "', " +
                date_string                       + ", " +
                stats_results.dep.toFixed(1)      + ", " +
                stats_results.ins.toFixed(1)      + ", " +
                stats_results.cred.toFixed(1)     + ", " +
                stats_results.insp.toFixed(1)     + ", " +
                stats_results.carTax.toFixed(1)   + ", " +
                stats_results.maint.toFixed(1)    + ", " +
                stats_results.fuel.toFixed(1)     + ", " +
                stats_results.rep.toFixed(1)      + ", " +
                stats_results.park.toFixed(1)     + ", " +
                stats_results.tolls.toFixed(1)    + ", " +
                stats_results.fines.toFixed(1)    + ", " +
                stats_results.wash.toFixed(1)     + ", " +
                stats_results.standCos.toFixed(0) + ", " +
                stats_results.runnCos.toFixed(0)  + ", " +
                stats_results.totCos.toFixed(0)   + ", " +
                stats_results.runCostsProDist.toFixed(2) + ", " +
                stats_results.totCostsProDist.toFixed(2) + ", " +
                stats_results.kinetic_speed.toFixed(0)   + ", " +
                stats_results.virtual_speed.toFixed(0)   + ", " +
                (((stats_results.totCostsPerYear/100).toFixed(0))*100) + ", " +
                countries[i].valid_users + ", " +
                countries[i].total_users + ", " +
                unique_users.length + " )";

            if (i!=countries.length-1)//doesn't add "," on the last set of values
                queryInsert +=", ";
            //console.log(countries[i].Country);
        }
        //console.log(queryInsert);

        //console.log(countries);
        //prints in the shell a sorted list of the computed countries
        countries.sort(function(a, b) {//sorts the array by the valid users field
            return parseFloat(b.valid_users) - parseFloat(a.valid_users);
        });
        var total_valid_users=0;
        var total_users=0;
        for (i=0; i<countries.length; i++) {
            total_valid_users += countries[i].valid_users;
            total_users += countries[i].total_users;
        }
        console.log("\nTotal users: " + total_users);
        console.log("Total valid users: " + total_valid_users);

        console.log("\nCountry | Total costs | Valid users | Total users | Valid ratio | % of total valid users");
        for (i=0; i<countries.length; i++) {
            console.log("\n" + ("        " + countries[i].Country).slice(-5) + "  " +
                " | " + ("        " + countries[i].total_costs).slice(-7) + " " + countries[i].currency +
                " | " + ("            " + countries[i].valid_users).slice(-11) +
                " | " + ("            " + countries[i].total_users).slice(-11) +
                " | " + ("            " + (countries[i].valid_users/countries[i].total_users*100).toFixed(1) + "%").slice(-11) +
                " | " + ("               " + (countries[i].valid_users/total_valid_users*100).toFixed(1) + "%").slice(-14));
        }
        console.log("\nData calculated and DB query built");
        callback();
    },

    //erase content of monthly_costs_statistics table DB
    function(callback) {
        console.log("\nDeleting previous data from DB");
        db = mysql.createConnection(DB_INFO);

        db.connect(function(err){
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            console.log('User ' + DB_INFO.user + 
                        ' connected successfully to DB ' + DB_INFO.database + 
                        ' at ' + DB_INFO.host);
        });

        db.query('DELETE FROM ' + DB_INFO.db_tables.monthly_costs_statistics, function(err, results, fields) {
            if (err){console.log(err); return callback(err);}
            db.end();
            console.error('Previous data deleted from ' +
                          'DB table ' + DB_INFO.database + '->' + DB_INFO.db_tables.monthly_costs_statistics);
            callback();
        });
    },

    //insert data into DB
    function(callback) {
        console.log("\nInserting new calculated data into DB");
        db = mysql.createConnection(DB_INFO);

        db.connect(function(err){
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            console.log('User ' + DB_INFO.user + 
                        ' connected successfully to DB ' + DB_INFO.database + 
                        ' at ' + DB_INFO.host);
        });

        db.query(queryInsert, function(err, results, fields) {
            if (err){console.log(err); return callback(err);}
            console.log('All new data successfully added into ' +
                        'DB table ' + DB_INFO.database + '->' + DB_INFO.db_tables.monthly_costs_statistics + '\n\n');
            db.end();
            callback();
        });
    }
]);




