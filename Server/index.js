const express= require('express')
const wbm= require('wbm')


const app= express()
PORT= process.env.PORT || 8000


app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post("/api/csv",async (req,res)=>{
    const { csvData }= req.body 
    
    wbm
    .start({qrCodeData:true, session:false, showBrowser:false})
    .then(async (qrCodeData)=> {
        res.send(qrCodeData)
        
        console.log(csvData)
        await wbm.waitQRCode();
        
        const message = 'Hi {{name}}, Hello world ';
        await wbm.send(csvData , message);
        await wbm.end();

    })
    .catch(err => console.log(err));
 
})

app.listen(PORT, ()=> {
    console.log(`Server is running at ${PORT} PORT`)
})
