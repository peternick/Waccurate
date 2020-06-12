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
function state_hovered(state_area_ele){
    state_area_ele.style.position = "absolute";
    state_area_ele.style.width = "1410px"
    state_area_ele.style.height = "705px"
    state_area_ele.style.marginLeft = "3.4vw";
    state_area_ele.style.marginTop = "2.3vw";
    state_area_ele.style.zIndex = "20"
    state_area_ele.style.display = "initial"

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
