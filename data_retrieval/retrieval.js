const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch')


var cities_forecast_dict = {'Alabama': {'Montgomery':''}/*, 'Alaska': {'Juneau': ''}, 'Arizona': {'Phoenix': ''}, 'Arkansas': {'Little Rock': ''}, 
'Connecticut': {'Hartford': ''}, 'Delaware': {'Dover': ''}, 'Florida': {'Tallahassee': ''}, 'Georgia': {'Atlanta': ''}, 
'Indiana': {'Indianapolis': ''}, 'Kentucky': {'Frankfort': ''}, 'Maine': {'Augusta': ''}, 'Maryland': {'Annapolis': ''}, 'Massachusetts': {'Boston': ''}, 
'Mississippi': {'Jackson': ''}, 'New Hampshire': {'Concord': ''}, 'New Jersey': {'Trenton': ''}, 'New York': {'Albany': ''}, 'North Carolina': {'Raleigh': ''}, 
'Ohio': {'Columbus': ''}, 'Pennsylvania': {'Harrisburg': ''}, 'Rhode Island': {'Providence': ''}, 'South Carolina': {'Pierre': ''}, 'Tennessee': {'Nashville': ''}, 
'Vermont': {'Montpelier': ''}, 'Virginia': {'Richmond': ''}, 'West Virginia': {'Charleston': ''}*/};

/*initialize_city_requests()
function initialize_city_requests(){
    for(state of Object.keys(cities_forecast_dict)){
        for(city of Object.keys(cities_forecast_dict[state])){
            var country_id = ''
            var state_local_name = ''
            var location_data = ''
            fetch('http://dataservice.accuweather.com/locations/v1/cities/US/search?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&q=' + city)
            .then(response => response.json())
            .then(loc => { 
                country_id = loc[0]['Country']['ID']
                location_data = loc
                state_local_name = loc[0]['AdministrativeArea']['LocalizedName']
                if (country_id == 'US' && state_local_name == state){
                    cities_forecast_dict[state][city] = loc[0]['Key']
                    return fetch('http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/' + cities_forecast_dict[state][city] + '?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&details=true')
                }
                else{
                    console.log('error! ' + loc[0]['Country']['ID'] + ' or ' + loc[0]['AdministrativeArea']['LocalizedName']+ ' is not in the dictionary')
                }
            }).then(res => res.json())
            .then(forecast =>{
                cities_forecast_dict[state][location_data[0]['Key']] = JSON.stringify(forecast)
            })
            .then(good =>{
                fs.writeFile(
                    path.join(__dirname, './', 'hello.txt'),
                    JSON.stringify(cities_forecast_dict),
                    err => {
                      if (err) throw err;
                      console.log('File written to...');
                    }
                );
            } )
        } 
    }
    
}*/




intialize_location_id()
function intialize_location_id(){
    for(state of Object.keys(cities_forecast_dict)){
        for(city of Object.keys(cities_forecast_dict[state])){
            var country_id = ''
            var state_local_name = ''
            fetch('http://dataservice.accuweather.com/locations/v1/cities/US/search?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&q=' + city)
            .then(response => response.json())
            .then(loc => { 
                country_id = loc[0]['Country']['ID']
                state_local_name = loc[0]['AdministrativeArea']['LocalizedName']
                if (country_id == 'US' && state_local_name == state){
                    cities_forecast_dict[state][city] = loc[0]['Key']
                }
                else{
                    console.log('error! ' + loc[0]['Country']['ID'] + ' or ' + loc[0]['AdministrativeArea']['LocalizedName']+ ' is not in the dictionary')
                }
            })
            .then(res =>{
                intialize_forecast_data(state, city);
            })
        }
    }
}

function intialize_forecast_data(state, city){
    fetch('http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/' + cities_forecast_dict[state][city] + '?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&details=true')
    .then(res => res.json())
    .then(forecast_data =>{
       var loc_key = cities_forecast_dict[state][city]
        cities_forecast_dict[state][loc_key] = initialize_weather_map(forecast_data)
    })
    .then(res =>{
        fs.readFile(path.join(__dirname, "./new_format.txt"), "utf8", (err, file_text) => {
            if (err) throw err;
        
            if(file_text.length == 0){
                var curr_date_id = new Date()
                curr_date_id = '' + curr_date_id.getFullYear() + '_' + (curr_date_id.getMonth() + 1) + '_' + curr_date_id.getDate() + '_' + curr_date_id.getHours()
                var wacc_dict = {};
                wacc_dict[curr_date_id] = cities_forecast_dict; 
                fs.appendFile(
                    path.join(__dirname, './', 'new_format.txt'),
                    JSON.stringify(wacc_dict),
                    err => {
                    if (err) throw err;
                    console.log('File written');
                    }
                );
            }
            else{
                file_text = file_text.substring(0, file_text.length - 1)
                file_text = file_text + ','
                var curr_date_id = new Date()
                curr_date_id = '' + curr_date_id.getFullYear() + '_' + (curr_date_id.getMonth() + 1) + '_' + curr_date_id.getDate() + '_' + curr_date_id.getHours()
                var wacc_dict = {};
                wacc_dict[curr_date_id] = cities_forecast_dict; 
                var added_dictionary = (JSON.stringify(wacc_dict))
                added_dictionary = added_dictionary.substring(1, added_dictionary.length);
                file_text = file_text + added_dictionary;
                fs.writeFile(
                    path.join(__dirname, './', 'new_format.txt'),
                    file_text,
                    err => {
                    if (err) throw err;
                    console.log('File appended');
                    }
                );
                
            }
        });
    })
    .then(print =>{
        //after();
    })
}

function initialize_weather_map(forecast_data){
    var wacc_forecast = {}
    for(data_hr of forecast_data){
        var date_code = new Date(data_hr['DateTime'])
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
    return wacc_forecast
}

function after(){
    console.log(cities_forecast_dict)
}


/*fetch('http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/329551?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB')
    .then(response => response.json())
    .then(data => {
        fs.writeFile(
          path.join(__dirname, './', 'hello.txt'),
          JSON.stringify(data),
          err => {
            if (err) throw err;
            console.log('File written to...');

            fs.appendFile(
              path.join(__dirname, './', 'hello.txt'),
              ' I love Node.js',
              err => {
                if (err) throw err;
                console.log('File written to...');
              }
            );
          }
        );
        console.log(data)
    }).catch(err => console.log('err'))*/


  

