const fs = require('fs');
const path = require('path');
const http = require("http");
const express = require('express')
const router = express.Router()
let wacc_json_dic = require("./file_to_json")



// const server = http.createServer((req, res) => {
//     res.writeHead(200, {
//         'Content-Type': 'text/html'
//     });
//       fs.readFile(
//         path.join(__dirname, '../public/homepage.html'),
//         (err, content) => {
//           if (err) throw err;
//           res.write(content);
//           res.end()
//         }
//       );
//     }
// )
// server.listen(5000, () => console.log('running server'))


get_wacc_json_data()
async function get_wacc_json_data(){
    wacc_json_dic = await wacc_json_dic
}


const app = express()
app.use(express.static(path.join(__dirname, '../public')))

// app.get('/homepage.html', (req, res) =>{

// })

app.get('/wacc_json_data', (req, res) =>{
    res.json(wacc_json_dic)
})

app.listen(5000, () => console.log('running server'))
// const server = http.createServer((req, res) => {
    
 


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

