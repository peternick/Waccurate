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
    state_img.style.position = "absolute";
    state_img.style.width = "1390px"
    state_img.style.height = "695px"
    state_img.style.marginLeft = "4.8vw";
    state_img.style.marginTop = "2.9vw";
    state_img.style.zIndex = "20"
    state_img.style.display = "initial"
    $(state_area).hover(function(){
        state_img.style.position = "absolute";
        state_img.style.width = "1390px"
        state_img.style.height = "695px"
        state_img.style.marginLeft = "4.8vw";
        state_img.style.marginTop = "2.9vw";
        state_img.style.zIndex = "20";
        state_img.style.display = "initial";
    }, function(){
        state_img.style.display = "none";
    })
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


/* used for seeing coordinates at location clicked */
window.addEventListener('click', get_clicked_coords);
function get_clicked_coords(e){
    console.log(e);
}
