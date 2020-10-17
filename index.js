const fs = require('fs');
const path = require('path');
const http = require("http");
const express = require('express')
const router = express.Router()
let wacc_json_dic = require("./data_retrieval/file_to_json")



get_wacc_json_data()
async function get_wacc_json_data(){
    wacc_json_dic = await wacc_json_dic
}


const app = express()
app.use(express.static(path.join(__dirname, './public')))


app.get('/wacc_json_data', (req, res) =>{
    res.json(wacc_json_dic)
})

app.listen(5000, () => console.log('running server'))

