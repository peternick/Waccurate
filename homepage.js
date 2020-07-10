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











/***                  ***used for seeing coordinates at location clicked***             ***/
// window.addEventListener('click', get_clicked_coords);
// function get_clicked_coords(e){
//     console.log(e);
// }
