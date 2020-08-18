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

let get_data = runner()
async function runner(){
    await match_files()
    wacc_json_dic = await associate_data()
    return wacc_json_dic
    //console.log(get_stat(wacc_json_dic, get_temp_stat, "Temperature", 3, '14'))
    
}

module.exports = get_data;