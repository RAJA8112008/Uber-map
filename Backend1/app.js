 const express=require("express");
const app=express();
const cors=require("cors");
const userRoutes=require("./routes/user.routes");
const connectdb=require("./db/db");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
connectdb();
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Hello world");
});

module.exports=app;