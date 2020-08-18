
/*                  *** input area ***                  */
function radio_btn_switch(checkbox, parent){
    checkbox.addEventListener('click', click_check);
    function click_check(){
        for (box of parent.children){
            if(box.getAttribute('class') == 'form-check-inline'){
                for (ele of box.children){
                    if (ele.getAttribute('class') == 'form-check-input'){
                        ele.checked = false;
                        box.style.borderColor = box.style.backgroundColor;
                    }
                }
            }
        }
        for(ele of checkbox.children){
            console.log(ele)
            if(ele.getAttribute('class') == 'form-check-input'){
                ele.checked = true;
                checkbox.style.borderColor = "grey";
            }
        }
    }
 
}

/* creates a dictionary of state:coord_arr values */
var areas_arr = document.querySelectorAll('area');
var state_coords_dict = {}
var parsed_coords;
var j = 0;
for (ele of areas_arr){
    parsed_coords = parse_coords(areas_arr[j].coords)
    state_coords_dict[areas_arr[j].title] = parsed_coords;
    j++;
}
function parse_coords(coord_string){
    var coord_arr = coord_string.split(',')
    var i = 0;
    for (val of coord_arr){
        coord_arr[i] = parseInt(val);
        i++
    }
    return coord_arr;
}

/*populates label for weather statistic selection*/
var drop = document.querySelector('.dropdown-menu')
console.log(drop.children)
    for(option of drop.children){
        option.onclick = function (option){
            let output = document.querySelector('#weather-stat .dropdown-btn .form-control')
            output.defaultValue = option.srcElement.innerText
        }
    }

/*populates label for state selection*/
var drpdn_options = document.querySelector('#mySelect')
drpdn_options.onchange = function() {
    for(option of drpdn_options.children){
        if(option.selected == true){
            populate_state_box(option.outerText)
        }
    }
};
function populate_state_box(option){
    let drpdwn_output = document.querySelector('#states-dropdown .dropdown-btn .form-control')
    drpdwn_output.defaultValue = option
}


/*                       *** map ***                              */
/*  draws the outline of a state */
function state_hovered(state_img, state_area){
    state_img.style.position = "absolute";
    state_img.style.width = "1400px"
    state_img.style.height = "695px"
    state_img.style.marginLeft = "4.4vw";
    state_img.style.marginTop = "2.9vw";
    state_img.style.zIndex = "20"
    state_img.style.display = "initial"
    var hovd = false;
    
    $(state_area).hover(function hovering(){       
            hovd = true
            state_img.style.position = "absolute";
            state_img.style.width = "1400px"
            state_img.style.height = "695px"
            state_img.style.marginLeft = "4.4vw";
            state_img.style.marginTop = "2.9vw";
            state_img.style.zIndex = "20";
            state_img.style.display = "initial";
        }, function non_hover(){
            state_img.style.display = "none";
            $(state_area).off('mouseenter mouseleave');
            hovd=false;
        })
    
    var hoving = window.setInterval(checkhov, 100);
    function checkhov(){
        if(hovd == false){
            state_img.style.display = "none";
            window.clearInterval(hoving);
        }
    }
}



/*              *** icons map overlay ***               */
var bg_map = document.querySelector('#background-map')
var state_areas = bg_map.children;
//console.log(state_areas)





/******                                                    ***DATA MANAGER***           *********/


runner()
async function runner(){
    let wacc_json_dic = {}
    await fetch("/wacc_json_data").then((res) => res.json()).then((res) => wacc_json_dic = res)
    let weather_statistic = document.querySelector('')
    console.log(get_stat(wacc_json_dic, get_temp_stat, "Temperature", 3, '14'))
}

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
            console.log(forecast_temp_val)
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







/***                  ***used for seeing coordinates at location clicked***             ***/
// window.addEventListener('click', get_clicked_coords);
// function get_clicked_coords(e){
//     console.log(e);
// }
