const mongoose=require('mongoose');
const connectdb=()=>{
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("Connected to mongoDB");
    }).catch((error)=>{
        console.error("Error connecting to mongoDB:", error);
    })
}
module.exports=connectdb;