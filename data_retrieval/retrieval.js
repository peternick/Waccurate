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
//                     console.log('error! ' + loc[0]['Country']['ID'] + ' or ' + loc[0]['AdministrativeArea']['LocalizedName']+ ' is not in the dictionary')
//                 }
//             })
//             .then(res =>{
//                 intialize_forecast_data(state, city);
//             })
//         }
//     }
// }

// function intialize_forecast_data(state, city){
//     fetch('http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/' + cities_forecast_dict[state][city] + '?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB&details=true')
//     .then(res => res.json())
//     .then(forecast =>{
//         var loc_key = cities_forecast_dict[state][city]
//         cities_forecast_dict[state][loc_key] = forecast
//     })
//     .then(good =>{
//         fs.writeFile(
//             path.join(__dirname, './', 'hello.txt'),
//             JSON.stringify(cities_forecast_dict),
//             err => {
//               if (err) throw err;
//               console.log('File written');
//             }
//         );
//     })
//     .then(print =>{
//         after();
//     })
// }

// function after(){
//     console.log(cities_forecast_dict)
// }





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

