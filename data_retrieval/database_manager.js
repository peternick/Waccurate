const fs = require('fs');
const path = require('path');

let forecasts_folder_path = './12hr_forecast_data'
let historical_data_folder_path = './24hr_historical_data'
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
match_files().then(() =>{
    //console.log(file_match_up)
    associate_data()
})



async function associate_data(){
    for(hist_file of Object.keys(file_match_up)){
        console.log('outer')
        try{
            if(parseInt(file_match_up[hist_file][1].split('_')[2]) + 1 == parseInt(hist_file.split('_')[2])){
                let str_parsed_forecast = {}
                let forecast_morning = file_match_up[hist_file][0]
                let forecast_evening = file_match_up[hist_file][1]
                let morning_data = new Promise((resolve, reject) =>{
                    fs.readFile(path.join(__dirname, forecasts_folder_path  + '/' + forecast_morning), "utf8", (err, file_text) => {
                        if(err) throw err
                        let parsed_json_forecast_am = JSON.parse(file_text)
                        let file_date = hist_file.split('_')
                        file_date = file_date[0] + '_' + file_date[1] + '_' + parseInt(file_date[2]) - 1 + '_' + '8'
                        parsed_json_forecast_am = parsed_json_forecast_am[file_date]
                        resolve(parsed_json_forecast_am)
                    });
                })
                let evening_data = new Promise((resolve, reject) =>{
                    fs.readFile(path.join(__dirname, forecasts_folder_path  +'/' + forecast_evening), "utf8", (err, file_text) => {
                        if(err) throw err;
                        let parsed_json_forecast_pm = JSON.parse(file_text)
                        let file_date = hist_file.split('_')
                        file_date = file_date[0] + '_' + file_date[1] + '_' + (parseInt(file_date[2]) - 1) + '_' + '20'
                        parsed_json_forecast_pm = parsed_json_forecast_pm[file_date]
                        resolve(parsed_json_forecast_pm)
                    });
                })
                let hist_data = new Promise((resolve, reject) =>{
                    fs.readFile(path.join(__dirname, historical_data_folder_path  +'/' + hist_file), "utf8", (err, file_text) => {
                        if(err) throw err;
                        let parsed_json_hist = JSON.parse(file_text)
                        let file_date = hist_file.split('_')
                        file_date = file_date[0] + '_' + file_date[1] + '_' + file_date[2] + '_' + '9'
                        parsed_json_hist = parsed_json_hist[file_date]
                        resolve(parsed_json_hist)
                    });
                })
                await morning_data
                await evening_data
                await hist_data
                
                console.log('end')
            }
            else{
                console.log('element whose date doesnt go in order')
            }
        }
        catch(err){
            console.log('only one date')
        }
    }
}

