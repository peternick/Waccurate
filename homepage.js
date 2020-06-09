var mouse_coord = document.querySelector('#image-map');
window.addEventListener('click', get_clicked_coords);
function get_clicked_coords(e){
    console.log(e);
}

var coord = document.querySelector('#Lousisiana').coords;
var coord_arr = coord.split(',')
var i = 0;
for (val in coord_arr){
    coord_arr[i] = parseInt(val);
    i++
}

console.log(coord_arr);