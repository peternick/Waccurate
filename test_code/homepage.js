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

/*  draws the outline of a state */
function state_hovered(state_img, state_area){
    /*state_img.style.position = "absolute";
    state_img.style.width = "1392px"
    state_img.style.height = "695px"
    state_img.style.marginLeft = "4.7vw";
    state_img.style.marginTop = "2.9vw";
    state_img.style.zIndex = "20"
    state_img.style.display = "initial"
    var hovd = false;*/
    
    /*$(state_area).hover(function hovering(){       
            hovd = true
            state_img.style.position = "absolute";
            state_img.style.width = "1400px"
            state_img.style.height = "695px"
            state_img.style.marginLeft = "4.4vw";
            state_img.style.marginTop = "2.9vw";
            state_img.style.zIndex = "20";
            state_img.style.display = "initial";
        }, function non_hover(){
        var refresh = window.setInterval(checkbound, 3);
        function checkbound(){
            if(cnt % 2 == 0 && state_img.style.display == "initial"){
                state_img.style.display = "none"
                clearInterval(refresh);
            }
        }  
            state_img.style.display = "none";
            $(state_area).off('mouseenter mouseleave');
            hovd=false;
        })
    
    var hoving = window.setInterval(checkhov, 20);
    function checkhov(){
        if(hovd == false){
            state_img.style.display = "none";
            window.clearInterval(hoving);
        }
    }*/
}

/*function state_hovered(state_area_ele){
    const canvas = document.querySelector('#map_canvas');
    canvas.style.display = "initial"
    const cxt = canvas.getContext('2d');
    cxt.beginPath();
    var i = 2;
    const state_coords = state_coords_dict[state_area_ele.id];
    const coord_arr_len = state_coords.length;
    cxt.moveTo(state_coords[0], state_coords[1]);
    while(i < coord_arr_len){
        cxt.lineTo(state_coords[i], state_coords[i+1]);
        i = i + 2;
    }
    cxt.lineTo(state_coords[0], state_coords[1]);
    cxt.stroke()
}*/



/*                  *** accuweather API ***             */
/*var cities = {'Alabama': ['Montgomery'], 'Alaska': ['Juneau'], 'Arizona': ['Phoenix'], 'Arkansas': ['Little Rock'], 'Connecticut': ['Hartford'], 'Delaware': ['Dover'], 'Florida': ['Tallahassee'], 'Georgia': ['Atlanta'], 'Indiana': ['Indianapolis'], 'Kentucky': ['Frankfort'], 'Maine': ['Augusta'], 'Maryland': ['Annapolis'], 'Massachusetts': ['Boston'], 'Mississippi': ['Jackson'], 'New Hampshire': ['Concord'], 'New Jersey': ['Trenton'], 'New York': ['Albany'], 'North Carolina': ['Raleigh'], 'Ohio': ['Columbus'], 'Pennsylvania': ['Harrisburg'], 'Rhode Island': ['Providence'], 'South Carolina': ['Pierre'], 'Tennessee': ['Nashville'], 'Vermont': ['Montpelier'], 'Virginia': ['Richmond'], 'West Virginia': ['Charleston']}
getdata()
async function getdata(){
    var all_states_api = await fetch('http://dataservice.accuweather.com/locations/v1/adminareas/US?apikey=8iaBpn2Bl4GZtA9cgdXZT0dtpW30DGiB')
    var all_states = await all_states_api.json();
    console.log(all_states)
}*/


/*              *** icons map overlay ***               */
var states_map = document.querySelector('#background-map')
var state_icon = {}
for (area of states_map.children){
    state_icon[area.getAttribute('alt')] = mid_point_state(area.getAttribute('coords')); 
}
const LEFT_OFFSET = 73;
const TOP_OFFSET = 913
var icn = document.querySelector('#test-icon');
var width = state_icon['Tenessee'][0]
var height = state_icon['Tenessee'][1]
width = width + LEFT_OFFSET
height = height + TOP_OFFSET
icn.style.position = "absolute"
icn.style.left = toString(width) + 'px'
icn.style.top = toString(height) + 'px'
icn.style.width = '45px'
icn.style.height = '30px'

console.log(state_icon)
function mid_point_state(coords){
    var arr_coords = coords.split(',');
    var i = 0;
    for(str of arr_coords){
        arr_coords[i] = parseInt(arr_coords[i])
        i++;
    }
    var inc = 0;
    var mid_point= [];
    var total_x = 0;
    var total_y = 0;
    while(inc < arr_coords.length/2){
        total_x = total_x + arr_coords[inc * 2];
        inc++;
    }
    inc = 1;
    while(inc < arr_coords.length/2 + 1){
        total_y = total_y + arr_coords[(inc * 2) - 1];
        inc++;
    }
    mid_point.push(total_x/(arr_coords.length/2));
    mid_point.push(total_y/(arr_coords.length/2));
    return mid_point;
}

/* used for seeing coordinates at location clicked */
window.addEventListener('click', get_clicked_coords);
function get_clicked_coords(e){
    console.log(e);
}
