const express=require('express');
const bodyParser = require('body-parser')
const app=express();
const router=express.Router();
const config=require('./config/database');
const path=require('path');
const authentication=require('./routes/authentication')(router);
const blogs=require('./routes/blogs')(router);
const mongoose=require('mongoose');
const cors=require('cors');
mongoose.connect(config.uri,(err)=>{
if(err){
console.log('could not connect to db',err);
}else{

console.log('connected to database'+ config.db);
}
});
mongoose.Promise=global.Promise;
const port=8080;
// parse application/x-www-form-urlencoded
app.use(cors({
    origin:'http://localhost:4200'
}))
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client/dist/'));
app.use('/authentication',authentication);
app.use('/blogs',blogs);

app.get('*',(req,res)=>{
res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});


app.listen(port,()=>{
console.log('server listening on port 8080');
});