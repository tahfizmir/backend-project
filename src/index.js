
import dotenv from 'dotenv'

import connectDB from './db/index.js';
import { app } from './app.js';
dotenv.config({
    path:'./.env'
});
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log('app listening on : ',process.env.PORT);
        
    })

}).catch((error)=>{
    console.log('src/index.js db connection failed with error :',error);
    
})

































// import express from 'express'

// const app=express();
// // iife
// (async ()=>{
//     try {
//      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
     
//      app.on("error",(error)=>{
//         console.log(`error is : `,error);
//         throw error;
//      });
//      app.listen(process.env.PORT,()=>{
//         console.log(`app is listening on ${process.env.PORT}`)
//      })
        
//     } catch (error) {
//         console.log("error is : ",error);
//         throw error;
//     }
// })()