const fs = require('fs');
const path = require('path');
const http = require("http");
const express = require('express')

//globals
let wacc_json_dic;
let forecasts_folder_path = './12hr_forecast_data/'
let historical_data_folder_path = './24hr_historical_data/'
let file_match_up = {}


/* reads all history and forecast files from their respective folders and pairs those that contain data that come from the same date*/
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


/*parses forecast and historical forecast text files from their respective folders into javascript objs; this is where all statistics should be retrieved */
async function associate_data(){
    let json_dic = {}
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
            
            json_dic[hist_file] = [morning_json, evening_json, hist_json]
            // console.log('end')
            
        }
        catch(err){
            console.log('from function -associate_data()- ' + err)
        }
    }
    return json_dic
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

runner()
async function runner(){
    await match_files()
    wacc_json_dic = await associate_data()
    console.log(get_stat(wacc_json_dic, get_temp_stat, "Temperature", 3, '14'))
    
}



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


// runner()
// async function runner(){
//     const dat = await fetch("/wacc_json_data")
//     console.log(get_stat(wacc_json_dic, get_temp_stat, "Temperature", 3, '14'))
    
// }

/* returns a measurement value of a certain weather related statistic based on the passed in function; iterates over all custom made files based on the Accuweather API */
//wacc_json_dic: a dictionary with a key of a custom history file and a value of an array of javascript objects representing Accuweather in a custom format
//stat_func: a function that returns a certain weather related statistic
//stat_name: the name of the weather statistic whose data is being retrieved
function get_stat(wacc_json_dic, stat_func, stat_name){
    let total_stat_values = 0
    let total_num_vals = 0
    for(hist_file of Object.keys(wacc_json_dic)){
        let morning = wacc_json_dic[hist_file][0]
        let evening = wacc_json_dic[hist_file][1]
        let hist =  wacc_json_dic[hist_file][2]
        let func = stat_func
        if(stat_name == 'Temperature' || stat_name == "RealFeelTemperature"){
            let precision = arguments[3]
            let hours = arguments[4]
            func = stat_func( morning, evening, hist, stat_name, precision, hours)
        }
        else if(stat_name == 'Precipitation'){
            let precision = arguments[3]
            func = stat_func(morning, evening, hist, precision)
        }
        else if(stat_name == 'Weather'){
            func = stat_func(morning, evening, hist)
        }
        else if(stat_name == "Hour_Temperature"){
            let precision = arguments[3]
            let hour = arguments[4]
            func = stat_func(morning, evening, hist, precision, "Temperature", hour)
        }
        else if(stat_name == "Hour_Precip"){
            func = stat_func(morning, evening, hist, arguments[3], arguments[4])
        }
        
        if(isNaN(func)){
            total_num_vals--
        }
        else{
            total_stat_values = total_stat_values + func
        }
        total_num_vals++
    }
    return total_stat_values/total_num_vals
}


/*returns the percentage accuracy of a specified temperature statistic, either real feel or normal temperature, given a degree of precision */
//temp_stat: the temperature statistic from the Accuweather API. Can be one of two values: 'RealFeelTemperature' or 'Temperature'
//morning: the morning json object read in from customized files associated with the Accuweather API
//evening: the evening json object read in from customized files associated with the Accuweather API
//hist: the hist json object read in from customized files associated with the Accuweather API
//precison: the number of degrees by which 
function get_temp_stat(morning, evening, hist, temp_stat, precision, forecast_hour){
    let temp_forecast = {}
    let temp_hist = {}
    let accurates = 0
    let total = 0
    let real_feel_percentage = 0

    create_temp_dic(temp_stat, morning, evening, hist, temp_forecast, temp_hist, forecast_hour)
    //console.log('new')
    for(state of Object.keys(temp_hist)){
        //console.log('her it is bois')
        for(hour of Object.keys(temp_hist[state])){
            let hist_temp_val = temp_hist[state][hour]
            let forecast_temp_val = temp_forecast[state][hour]
            //console.log(forecast_temp_val)
            if(forecast_temp_val != undefined && hist_temp_val != undefined){
                let difference = Math.abs(forecast_temp_val - hist_temp_val)
                if(difference <= precision){
                    accurates++
                }
                else if(!(difference > precision)){
                    console.log('possible error: difference= ' + difference)
                }
                total++
            }
        }
    }
    
    real_feel_percentage = accurates/total
    return real_feel_percentage
}

/*creates a dictionary of temperature statistics retrieved from the custom made files based on Accuweather API data*/
function create_temp_dic(temp_stat, morning_data, evening_data, hist_data, forecast_dic, hist_dic, hr){
    let data_files_arr = []
    if(hr == 'all'){
        data_files_arr = [morning_data, evening_data, hist_data]
    }
    else if(parseInt(hr) <= 11){
        hr = parseInt(hr) + 9
        data_files_arr.push(morning_data)
        data_files_arr.push(hist_data)
    }
    else{
        if(parseInt(hr) <= 14){
            hr = parseInt(hr) + 9
        }
        else{
            hr = parseInt(hr) - 15
        }
        data_files_arr.push(evening_data)
        data_files_arr.push(hist_data)
    }
    let temp_dic = {}
    hr.toString()
    for(json_data of data_files_arr){
        for(state of Object.keys(json_data)){
            if(json_data != hist_data){
                temp_dic = forecast_dic
            }
            else{
                temp_dic = hist_dic
            }
            if(json_data != evening_data){
                temp_dic[state] = {}
            }
            let loc_code = Object.keys(json_data[state])[0]
            let hr_statistic_dic = json_data[state][loc_code]
            if(hr == 'all'){
                for(hour of Object.keys(hr_statistic_dic)){
                        temp_dic[state][hour] = json_data[state][loc_code][hour][temp_stat]
                }
            }
            else if(json_data[state][loc_code][hr] != undefined){
                temp_dic[state] = {}
                temp_dic[state][hr] = json_data[state][loc_code][hr][temp_stat]
            }
            else{
                console.log('damn')
            }
        }
    }
}

//TODO: find out why precision is having no effect on this function
/*returns the accuracy of predictions for the amount of precipitation in at most 24 hours; precipitation probability is taken into account when determining percentages */
function get_precip_stat(morning, evening, hist, precision){
    let precip_forecast = {}
    let precip_hist = {}
    let precip_scale_val = 0;
    let total_precip_scale = 0
    let precip_score = 0

    create_precip_dic(morning, evening, hist, precip_forecast, precip_hist)

    for(state of Object.keys(precip_hist)){
        for(hour of Object.keys(precip_hist[state])){
            if(precip_forecast[state][hour] != undefined){
                let rain_val = precip_forecast[state][hour][0]
                let precip_prob = precip_forecast[state][hour][1]
                // console.log(precip_hist[state])
                // console.log('here' + hour)
                let true_precip = precip_hist[state][hour][0]
                let has_precip = precip_hist[state][hour][1]
                total_precip_scale = total_precip_scale + 100
                if(true_precip + precision > rain_val  && true_precip - precision < rain_val){
                    precip_scale_val = precip_scale_val + 100
                    if(has_precip == 'true'){
                        precip_scale_val = precip_scale_val - (100 - precip_prob)
                    }
                    else{
                        precip_scale_val = precip_scale_val - precip_prob
                    }
                }
                else{
                    if(has_precip == 'true'){
                        precip_scale_val = precip_scale_val + (100 - precip_prob)
                    }
                    else{
                        precip_scale_val = precip_scale_val + precip_prob
                    }
                }
            }
        }
    }
    precip_score = precip_scale_val/total_precip_scale

    return precip_score
}

/*creates a dictionary of precipitation statistics retrieved from the custom forecast and history files based on Accuweather API data*/
function create_precip_dic(morning_data, evening_data, hist_data, forecast_dic, hist_dic){
    let data_files_arr = [morning_data, evening_data, hist_data]
    let precip_dic = {}
    for(json_data of data_files_arr){
        for(state of Object.keys(json_data)){
            if(json_data != hist_data){
                precip_dic = forecast_dic
            }
            else{
                precip_dic = hist_dic
            }
            if(json_data != evening_data){
                precip_dic[state] = {}
            }
            let loc_code = Object.keys(json_data[state])[0]
            let hr_statistic_dic = json_data[state][loc_code]
            for(hour of Object.keys(hr_statistic_dic)){
                if(json_data != hist_data){
                    precip_dic[state][hour] = [json_data[state][loc_code][hour]["RainVal"]["Value"], json_data[state][loc_code][hour]["PrecipitationProbability"]]
                }
                else{
                    precip_dic[state][hour] = [json_data[state][loc_code][hour]["Precipitation"]["Value"], json_data[state][loc_code][hour]["HasPrecipitation"]]
                }
            }
        }
    }
}

/*returns the accuracy of predictions for weather statistics for each hour in a 24 hour period */
function get_weather_stat(morning, evening, hist){
    let weather_forecast = {}
    let weather_hist = {}
    let accurates = 0
    let total = 0
    let percentage_accuracy = 0

    create_weather_dic(morning, evening, hist, weather_forecast, weather_hist)

    for(state of Object.keys(weather_hist)){
        for(hour of Object.keys(weather_hist[state])){
            if(weather_forecast[state][hour] != undefined){
                let forecast_weather = weather_forecast[state][hour]
                let hist_weather = weather_hist[state][hour]
                if(forecast_weather == hist_weather){
                    accurates++
                }
                total++
            }
        }
    }
    percentage_accuracy = accurates/total
    return percentage_accuracy
}

/*creates a dictionary of weather statistics retrieved from the custom made files based on Accuweather API data*/
function create_weather_dic(morning_data, evening_data, hist_data, forecast_dic, hist_dic){
    let data_files_arr = [morning_data, evening_data, hist_data]
    let weather_dic = {}
    for(json_data of data_files_arr){
        for(state of Object.keys(json_data)){
            if(json_data != hist_data){
                weather_dic = forecast_dic
            }
            else{
                weather_dic = hist_dic
            }
            if(json_data != evening_data){
                weather_dic[state] = {}
            }
            let loc_code = Object.keys(json_data[state])[0]
            let hr_statistic_dic = json_data[state][loc_code]
            for(hour of Object.keys(hr_statistic_dic)){
                weather_dic[state][hour] = json_data[state][loc_code][hour]["Weather"]
            }
        }
    }
}


function get_hour_precip_stat(morning, evening, hist, precision, hour){
    let precip_forecast = {}
    let precip_hist = {}
    let precip_scale_val = 0;
    let total_precip_scale = 1
    let precip_score = 0

    create_hour_precip_dic(morning, evening, hist, precip_forecast, precip_hist, hour)

    for(state of Object.keys(precip_hist)){
        if(precip_forecast[state][hour] != undefined && precip_hist[state][hour] != undefined){
            let rain_val = precip_forecast[state][hour][0]
            let precip_prob = precip_forecast[state][hour][1]
            let true_precip = precip_hist[state][hour][0]
            let has_precip = precip_hist[state][hour][1]
            total_precip_scale = total_precip_scale + 100
            if(true_precip + precision > rain_val  && true_precip - precision < rain_val){
                precip_scale_val = precip_scale_val + 100
                if(has_precip == 'true'){
                    precip_scale_val = precip_scale_val - (100 - precip_prob)
                }
                else{
                    precip_scale_val = precip_scale_val - precip_prob
                }
            }
            else{
                if(has_precip == 'true'){
                    precip_scale_val = precip_scale_val + (100 - precip_prob)
                }
                else{
                    precip_scale_val = precip_scale_val + precip_prob
                }
            }
        }
    }
    // console.log(precip_scale_val + 'scale')
    // console.log(total_precip_scale + 'total')
    precip_score = precip_scale_val/total_precip_scale

    return precip_score
}

/*creates a dictionary of precipitation statistics retrieved from the custom forecast and history files based on Accuweather API data*/
function create_hour_precip_dic(morning_data, evening_data, hist_data, forecast_dic, hist_dic, hour){
    let data_files_arr = []
    let err = 0
    if(parseInt(hour) >= 9 && parseInt(hour) <= 20){
        data_files_arr.push(morning_data)
    }
    else{
        data_files_arr.push(evening_data)
    }
    data_files_arr.push(hist_data)
    for(json_data of data_files_arr){
        for(state of Object.keys(json_data)){
            if(json_data != hist_data){
                precip_dic = forecast_dic
            }
            else{
                precip_dic = hist_dic
            }
            if(json_data != evening_data){
                precip_dic[state] = {}
            }
            let loc_code = Object.keys(json_data[state])[0]
            if(json_data != hist_data && json_data[state][loc_code][hour] != undefined){
                precip_dic[state][hour] = [json_data[state][loc_code][hour]["RainVal"]["Value"], json_data[state][loc_code][hour]["PrecipitationProbability"]]
            }
            else if(json_data == hist_data && json_data[state][loc_code][hour] != undefined){
                precip_dic[state][hour] = [json_data[state][loc_code][hour]["Precipitation"]["Value"], json_data[state][loc_code][hour]["HasPrecipitation"]]
            }
            else{
                //console.log(Object.keys(json_data[state]))
                err++
            }
        }
    }
}


function test(){
    console.log('imported sir')
}
