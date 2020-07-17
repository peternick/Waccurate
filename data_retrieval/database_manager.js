const fs = require('fs');
const path = require('path');

//globals
let forecasts_folder_path = './12hr_forecast_data/'
let historical_data_folder_path = './24hr_historical_data/'
let file_match_up = {}


// function test_asy(){
//     let h_files = 'incorrect'
//     var data = fs.readdirSync(historical_data_folder_path, (err, history_files) =>{
//         if(err) throw err
//         h_files = history_files
//     })
//     console.log(data)
//     console.log(h_files)
// }
// test_asy()

//                  this function worked 
// async function testf(){
//     let prom = new Promise((resolve, reject) =>{
//         fs.readFile(path.join(__dirname, forecasts_folder_path  + '/2020_7_7_20_12hr_forecast.txt'), "utf8", (err, file_text) => {
//         if(err) throw err
//         console.log(file_text.substring(0, 7))
//         resolve(file_text)
//         })
//     })
//     let res = await prom
//     console.log(prom)
//     console.log('hiya')
// }
// testf()

/* reads all history and forecast files from their respective folders and pairs those that contain data that come from the same date */
async function match_files(){
    let h_files = fs.readdirSync(historical_data_folder_path, (err, history_files) =>{
        if(err) throw err
    })
    let f_files = fs.readdirSync(forecasts_folder_path, (err, forecast_files) =>{
        if(err) throw err
    })
    for(hist_file of h_files){
        let i = 0;
        file_match_up[hist_file] = [];
        while(i < f_files.length){
            if(f_files[i].split('_')[2] == parseInt(hist_file.split('_')[2]) - 1 || f_files[i].split('_')[2]  == parseInt(hist_file.split('_')[2]) - 2){
                file_match_up[hist_file].push(f_files[i])
            }
            i++;
        }
    } 
}

//runner
match_files().then(() =>{
    associate_data()
})

/*parses forecast and historical forecast text files from their respective folders into javascript objs; this is where all statistics should be retrieved */
async function associate_data(){
    for(hist_file of Object.keys(file_match_up)){
        console.log('outer')
        try{
            let forecast_morning = ''
            let forecast_evening = ''
            if(parseInt(file_match_up[hist_file][1].split('_')[2]) + 1 == parseInt(hist_file.split('_')[2])){
                forecast_morning = file_match_up[hist_file][0]
                forecast_evening = file_match_up[hist_file][1]         
            }
            else{
                console.log('element whose date is out of order')
                forecast_morning = file_match_up[hist_file][1]
                forecast_evening = file_match_up[hist_file][0]
            }
            let morning_json = await parse_file_text(forecast_morning, hist_file, 'am')
            let evening_json = await parse_file_text(forecast_evening, hist_file, '')
            let hist_json = await parse_file_text(hist_file, hist_file, '')
            
            console.log(get_real_feel_temp_stat(morning_json, evening_json, hist_json, 4))
            console.log('end')
            
        }
        catch(err){
            console.log('from function -associate_data()- ' + err)
        }
    }
}

/*helper function that takes a text file which gets parsed into a JS object and retrieves data from a certain date of a forecast*/
// text_data: a text file representing a customized json file consisting of either forecast or historical forecast data
// history_file: the file containing historical forecasts of certain forecast text files
async function parse_file_text(text_data, history_file, period){
    let hour = ''
    let date = 0
    let file_date = history_file.split('_')
    let folder_path = ''
    if(text_data != hist_file){
        if(period == 'am'){
            hour = '8'
        }
        else{
            hour = '20'
        }
        date = (parseInt(file_date[2]) - 1)
        folder_path = forecasts_folder_path
    }
    else{
        hour = '9'
        date = file_date[2]
        folder_path = historical_data_folder_path
    }
    return await new Promise((resolve, reject) =>{
        fs.readFile(path.join(__dirname, folder_path  + text_data), "utf8", (err, file_text) => {
            if(err) {
                reject(err)
                return;
            }
            let parsed_json_forecast_am = JSON.parse(file_text)
            file_date = file_date[0] + '_' + file_date[1] + '_' + date + '_' + hour
            parsed_json_forecast_am = parsed_json_forecast_am[file_date]
            resolve(parsed_json_forecast_am)
        });
    })
}


function get_real_feel_temp_stat(morning, evening, hist, precision){
    let real_feel_forecast = {}
    let real_feel_hist = {}

    create_real_feel_dic(morning, real_feel_forecast, true)
    create_real_feel_dic(evening, real_feel_forecast, false)
    create_real_feel_dic(hist, real_feel_hist, true)
    
    let precision_accuracy = []
    for(state of Object.keys(real_feel_hist)){
        for(hour of Object.keys(real_feel_hist[state])){
            let hist_real_feel_val = real_feel_hist[state][hour]
            let forecast_real_feel_val = real_feel_forecast[state][hour]
            let difference = Math.abs(forecast_real_feel_val - hist_real_feel_val)
            if(difference > precision){
                precision_accuracy.push('inaccurate')
            }
            else if(difference <= precision){
                precision_accuracy.push('accurate')
            }
            else{
                console.log('possible error: difference= ' + difference + ' precison =' + precision)
            }
        }
    }
    let accurates = 0
    let total = 0
    let real_feel_percentage = 0
    for(statistic of precision_accuracy){
        if(statistic == 'accurate'){
            accurates++
        }
        total++
    }
    real_feel_percentage = accurates/total
    return real_feel_percentage
}

/*creates a dictionary of real feel temperature statistics retrieved from the custom made files based on Accuweather API data*/
function create_real_feel_dic(json_data, real_feel_dic, bool_new_dic){
    for(state of Object.keys(json_data)){
        if(bool_new_dic){
            real_feel_dic[state] = {}
        }
        let loc_code = Object.keys(json_data[state])[0]
        let hr_statistic_dic = json_data[state][loc_code]
        for(hour of Object.keys(hr_statistic_dic)){
            real_feel_dic[state][hour] = json_data[state][loc_code][hour]["RealFeelTemperature"]
        }
    }
}