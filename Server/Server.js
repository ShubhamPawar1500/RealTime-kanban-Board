const express = require('express')

const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const cors = require('cors');
const port = 8080;

const io = new Server(server,{
  cors: {
    origin: "*",
    methods:['GET','POST']
  }
});

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;
const bodyParser = require('body-parser');

app.use(express.json());

app.use(cors('*'))
app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('update card',(msg)=>{
    socket.broadcast.emit('update card',msg)
  })
});

const Notes = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required:true
    },
    status:{
        type: String,
        required:true
    }
});

const notedb = mongoose.model('notes', Notes);

mongoose.connect('mongodb://localhost:27017/kanban', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


app.get('/', async (req, res) => {
    try {
        const n = await notedb.find(); // Assuming notedb.find() returns a Promise
        res.send(n);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the notes');
    }
});

app.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const n = await notedb.findById(id);
        res.send(n);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the notes');
    }
});

app.post('/',(req,res)=>{
    const newItem = new notedb(req.body);
    newItem.save().then(item => {
        res.send({'status':'success','msg':'Note Saved'})
    }).catch(err=>{
        console.log(err);
        res.send({'status':'error','msg':'Something Went Wrong'})
    })
})

app.delete('/:id',async(req,res)=>{
    try {
        const {id} = req.params;
        const n = await notedb.deleteOne({_id:new ObjectId(id)})
        if(n.deletedCount == 1){
            res.send({"status":"success","msg":"Note Deleted Successfully"});
        }else{
            res.send({"error":"Document Not Found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while Deleting the notes');
    }
})

app.put('/:id/:status',async(req,res)=>{
    try {
        const { id, status } = req.params;

        // Ensure notedb.updateOne returns a promise
        const updateResult = await notedb.updateOne({ _id: new ObjectId(id) },{$set:{status:status}},{ new: true });

        // Check if the document was actually updated
        // if (updateResult.modifiedCount === 0) {
        //     return res.status(404).send('Document not found');
        // }

        res.status(200).send({"success":"Document Updated","status":"success"});
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while updating the note');
    }
    
})

app.put('/:id',async(req,res)=>{
    try {
        const { id } = req.params;
        const note = req.body;

        // Ensure notedb.updateOne returns a promise
        const updateResult = await notedb.updateOne({ _id: new ObjectId(id) },{$set:note});

        // Check if the document was actually updated
        if (updateResult.matchedCount === 0) {
            return res.send({"success":"Document not found","status":"error"});
        }else{
            return res.send({"success":"Document Updated","status":"success"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while updating the note');
    }   
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})