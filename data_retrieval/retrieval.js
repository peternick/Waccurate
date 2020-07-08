const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch')


//iterates through all given states and their respective cities obtaining the correct id
async function load(cities_forecast_dic){
    for(state of Object.keys(cities_forecast_dic)){
         for(city of Object.keys(cities_forecast_dic[state])){
          cities_forecast_dic[state][city] = await init_loc_key(city,state);
          await intialize_forecast_data(cities_forecast_dic, state, city)
        }        
    }
}

//initializes the location key of a city with its respective state; the location key is a unique id used by the Accuweather API to identify a specific location
async function init_loc_key(city, state){
    const res = await fetch('https://dataservice.accuweather.com/locations/v1/cities/US/search?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&q=' + city);
    const loc = await res.json();
    var country_id = loc[0]['Country']['ID']
    var state_local_name = loc[0]['AdministrativeArea']['LocalizedName'];
    var list_index = 0
    while(list_index < loc.length){
        if (country_id == 'US' && state_local_name == state){

            return loc[list_index]['Key']
        }
        else{
            list_index++
            country_id = loc[list_index]['Country']['ID']
            state_local_name = loc[list_index]['AdministrativeArea']['LocalizedName'];
        }   
    }
}


//obtains 12 hour forecast data for a city 
async function intialize_forecast_data(cities_forecast_dic, state, city){
    const res = await fetch('http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/' + cities_forecast_dic[state][city] + '?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&details=true')
    const weath = await res.json();
    const loc_key = cities_forecast_dic[state][city]
    cities_forecast_dic[state][loc_key] = initialize_weather_map(weath)
}

//takes certain weather statistics for each city and compiles it into a dictionary to be associated with the city code key of the cities_forecast_dic dictionary
function initialize_weather_map(forecast_data){
    var wacc_forecast = {}
    let date_type = ''
    if(forecast_data[0]['DateTime']){
        date_type = 'DateTime'
        for(data_hr of forecast_data){
            var date_code = new Date(data_hr[date_type])
            date_code = '' + date_code.getHours();
            wacc_forecast[date_code] = {};
            wacc_forecast[date_code]['Temperature'] = data_hr['Temperature']['Value']
            wacc_forecast[date_code]['Weather'] = data_hr['IconPhrase']
            wacc_forecast[date_code]['RealFeelTemperature'] = data_hr['RealFeelTemperature']['Value']
            wacc_forecast[date_code]['PrecipitationProbability'] = data_hr['PrecipitationProbability']
            wacc_forecast[date_code]['RainProbability'] = data_hr['RainProbability']
            wacc_forecast[date_code]['SnowProbability'] = data_hr['SnowProbability']
            wacc_forecast[date_code]['RainVal'] = data_hr['Rain']
            wacc_forecast[date_code]['SnowVal'] = data_hr['Snow']
        }
    }
    else{
        date_type = 'LocalObservationDateTime'
        for(data_hr of forecast_data){
            var date_code = new Date(data_hr[date_type])
            date_code = '' + date_code.getHours();
            wacc_forecast[date_code] = {};
            wacc_forecast[date_code]['Temperature'] = data_hr['Temperature']['Imperial']['Value']
            wacc_forecast[date_code]['Weather'] = data_hr['WeatherText']
            wacc_forecast[date_code]['RealFeelTemperature'] = data_hr['RealFeelTemperature']['Imperial']['Value']
            wacc_forecast[date_code]['HasPrecipitation'] = data_hr['HasPrecipitation']
            wacc_forecast[date_code]['Precipitation'] = data_hr['PrecipitationSummary']['Precipitation']['Imperial']
            wacc_forecast[date_code]['Precipitation_total_24hrs'] = data_hr['PrecipitationSummary']['Past24Hours']
        }
    }
    return wacc_forecast
}

//writes the whole cities_forecast_dic dictionary to a file to be stored
function write_file(cities_forecast_dic, api_meta){
    var curr_date_id = new Date()
    curr_date_id = '' + curr_date_id.getFullYear() + '_' + (curr_date_id.getMonth() + 1) + '_' + curr_date_id.getDate() + '_' + curr_date_id.getHours()
    var wacc_dict = {};
    wacc_dict[curr_date_id] = cities_forecast_dic; 
    let file = './' + curr_date_id
    let append = false;

    if(api_meta == 'forecast'){
        if(curr_date_id.getHours() == 8 || curr_date_id.getHours() == 9){
            append = true
            var prev_date_id = new Date()
            prev_date_id = '' + curr_date_id.getFullYear() + '_' + (curr_date_id.getMonth() + 1) + '_' + curr_date_id.getDate() - 1 + '_' + curr_date_id.getHours()
            file = './' + prev_date_id
        }
        file =  './12hr_forecast_data/' + file + '_12hr_forecast.txt'
    }
    else if(api_meta == 'hist'){
        file =  './24hr_historical_data/' + file + '_24hr_hist.txt'
    }

    if(append == true){
        fs.readFile(path.join(__dirname, file), "utf8", (err, file_text) => {
            file_text = file_text.substring(0, file_text.length - 1)
            file_text = file_text + ','
            var added_dictionary = (JSON.stringify(wacc_dict))
            added_dictionary = added_dictionary.substring(1, added_dictionary.length);
            file_text = file_text + added_dictionary;
        })
    }
    fs.writeFile(
        path.join(__dirname, file),
        file_text,
        err => {
        if (err) throw err;
        console.log('File appended');
        }
    ); 
}

/*              ***24 hour historical data***           */
async function load_historic_forecast(cities_forecast_dic){
    for(state of Object.keys(cities_forecast_dic)){
         for(city of Object.keys(cities_forecast_dic[state])){
          cities_forecast_dic[state][city] = await init_loc_key(city,state);
          await intialize_forecast_data_hist(cities_forecast_dic, state, city)
        }        
    }
}
async function intialize_forecast_data_hist(cities_forecast_dic, state, city){
    const res = await fetch('http://dataservice.accuweather.com/currentconditions/v1/' + cities_forecast_dic[state][city] + '/historical/24?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&details=true')
    const weath = await res.json();
    const loc_key = cities_forecast_dic[state][city]
    cities_forecast_dic[state][loc_key] = initialize_weather_map(weath)
}



async function run_retrieval(){
 var cities_forecast_dic = {'Alabama': {'Montgomery':''}, 'Alaska': {'Juneau': ''}, 'Arizona': {'Phoenix': ''}, 'Arkansas': {'Little Rock': ''}, 'California': {'Sacramento': ''},    
 'Connecticut': {'Hartford': ''},'Colorado': {'Denver': ''}, 'Delaware': {'Dover': ''}, 'Florida': {'Tallahassee': ''}, 'Georgia': {'Atlanta': ''},'Hawaii': {'Honolulu': ''}, 'Idaho': {'Boise': ''},'Illinois': {'Springfield': ''}, 'Indiana': {'Indianapolis': ''}, 'Iowa': {'Des Moines': ''}, 'Kansas': {'Topeka': ''},  'Kentucky': {'Frankfort': ''}, 'Louisiana': {'Baton Rouge': ''}, 'Maine': {'Augusta': ''}, 'Maryland': {'Annapolis': ''}, 'Massachusetts': {'Boston': ''}, 'Michigan': {'Lansing': ''}, 'Minnesota': {'St. Paul': ''}, 'Mississippi': {'Jackson': ''}, 
 'Missouri': {'Jefferson City': ''}, 'Montana': {'Helena': ''}, 'Nebraska': {'Lincoln': ''}, 'Nevada': {'Carson City': ''},
 'New Hampshire': {'Concord': ''}, 'New Jersey': {'Trenton': ''}, 'New Mexico': {'Santa Fe': ''}, 'New York': {'Albany': ''}, 'North Carolina': {'Raleigh': ''}, 'North Dakota': {'Bismarck': ''},'Ohio': {'Columbus': ''}, 'Oklahoma': {'Oklahoma City': ''}, 'Oregon': {'Salem': ''}, 'Pennsylvania': {'Harrisburg': ''}, 'Rhode Island': {'Providence': ''}, 'South Carolina': {'Columbia': ''}, 'South Dakota': {'Pierre': ''},'Tennessee': {'Nashville': ''}, 'Texas': {'Austin': ''}, 'Utah': {'Salt Lake City': ''},'Vermont': {'Montpelier': ''}, 'Virginia': {'Richmond': ''},'Washington': {'Olympia': ''}, 'West Virginia': {'Charleston': ''}, 'Wisconsin': {'Madison': ''}, 'Wyoming': {'Cheyenne': ''}};
 //await load(cities_forecast_dic);
 await load_historic_forecast(cities_forecast_dic)
 await write_file(cities_forecast_dic, 'hist');

}

run_retrieval()


// var promises = []

// intialize_location_id()
// .then(() =>{
//     console.log(cities_forecast_dict)
// })
// function intialize_location_id(){
//     for(state of Object.keys(cities_forecast_dict)){
//         for(city of Object.keys(cities_forecast_dict[state])){
            
//             promises.push(fetch('http://dataservice.accuweather.com/locations/v1/cities/US/search?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&q=' + city)
//             .then(response => response.json())
//             .then(loc => { 
//                 var country_id = ''
//                 var state_local_name = ''
//                 country_id = loc[0]['Country']['ID']
//                 state_local_name = loc[0]['AdministrativeArea']['LocalizedName']
//                 if (country_id == 'US' && state_local_name == state){
//                     cities_forecast_dict[state][city] = loc[0]['Key']
//                 }
//                 else{
//                     console.log('error! ' + loc[0]['Country']['ID'] + ' or ' + loc[0]['AdministrativeArea']['LocalizedName']+ 'or'+ city+ ' is not in the dictionary')
//                 }
//             })
//             // .then(res =>{
//             //     //intialize_forecast_data(state, city);
//             // })
//             )
//         }
//     }
//     return Promise.all(promises);
// }

// intialize_location_id()
// function intialize_location_id(){
//     for(state of Object.keys(cities_forecast_dict)){
//         for(city of Object.keys(cities_forecast_dict[state])){
//             var country_id = ''
//             var state_local_name = ''
//             fetch('http://dataservice.accuweather.com/locations/v1/cities/US/search?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&q=' + city)
//             .then(response => response.json())
//             .then(loc => { 
//                 country_id = loc[0]['Country']['ID']
//                 state_local_name = loc[0]['AdministrativeArea']['LocalizedName']
//                 if (country_id == 'US' && state_local_name == state){
//                     cities_forecast_dict[state][city] = loc[0]['Key']
//                 }
//                 else{
//                     console.log('error! ' + loc[0]['Country']['ID'] + ' or ' + loc[0]['AdministrativeArea']['LocalizedName']+ 'or'+ city+ ' is not in the dictionary')
//                 }
//             })
//             .then(res =>{
//                 //intialize_forecast_data(state, city);
//             })
//         }
//     }
// }

// function intialize_forecast_data(state, city){
//     fetch('http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/' + cities_forecast_dict[state][city] + '?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&details=true')
//     .then(res => res.json())
//     .then(forecast_data =>{
//        var loc_key = cities_forecast_dict[state][city]
//         cities_forecast_dict[state][loc_key] = initialize_weather_map(forecast_data)
//     })
//     .then(res =>{
//         fs.readFile(path.join(__dirname, "./new_format.txt"), "utf8", (err, file_text) => {
//             if (err) throw err;
        
//             if(file_text.length == 0){
//                 var curr_date_id = new Date()
//                 curr_date_id = '' + curr_date_id.getFullYear() + '_' + (curr_date_id.getMonth() + 1) + '_' + curr_date_id.getDate() + '_' + curr_date_id.getHours()
//                 var wacc_dict = {};
//                 wacc_dict[curr_date_id] = cities_forecast_dict; 
//                 fs.appendFile(
//                     path.join(__dirname, './', 'new_format.txt'),
//                     JSON.stringify(wacc_dict),
//                     err => {
//                     if (err) throw err;
//                     console.log('File written');
//                     }
//                 );
//             }
//             else{
//                 file_text = file_text.substring(0, file_text.length - 1)
//                 file_text = file_text + ','
//                 var curr_date_id = new Date()
//                 curr_date_id = '' + curr_date_id.getFullYear() + '_' + (curr_date_id.getMonth() + 1) + '_' + curr_date_id.getDate() + '_' + curr_date_id.getHours()
//                 var wacc_dict = {};
//                 wacc_dict[curr_date_id] = cities_forecast_dict; 
//                 var added_dictionary = (JSON.stringify(wacc_dict))
//                 added_dictionary = added_dictionary.substring(1, added_dictionary.length);
//                 file_text = file_text + added_dictionary;
//                 fs.writeFile(
//                     path.join(__dirname, './', 'new_format.txt'),
//                     file_text,
//                     err => {
//                     if (err) throw err;
//                     console.log('File appended');
//                     }
//                 );
                
//             }
//         });
//     })
//     .then(print =>{
//         //after();
//     })
// }



// function after(){
//     console.log(cities_forecast_dict)
// }



  

