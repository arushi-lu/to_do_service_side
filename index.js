const express = require("express");
const mongodb = require("mongodb")

const {connectToDB, getDB} = require("./bd");
const { double } = require("webidl-conversions");

const PORT = 3000;
const app = express();

let db;

connectToDB((err) => {
    if(!err){
        app.listen(PORT, (err)=>{
            err ? console.log(err) : console.log(`Listening PORT ${PORT}`);
        })
        
        db = getDB();
       
    }else{
        console.log(`DB connection error: ${err}`)
    }
})
app.use(express.json());

app.get('/todo', async(req, res) => {
   
    let collection = await db.collection("ToDo");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
})
app.get('/trash', async(req, res) => {
   
    let collection = await db.collection("Trash");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
})
app.get('/done', async(req, res) => {
   
    let collection = await db.collection("Done");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
})

app.post('/todo', async(req, res) => {
    let collection = await db.collection("ToDo");
    collection.insertOne(req.body);  
    res.status(200).send(req.body);
})

// imitate filter in ToDo project 
// change a status in todo list -> the task goes to done list 
// change a inTrash param -> task from todo goes to trash list


  app.put('/todo/:task/:action', async (req, res) => {
    try {
      const collection_todo = await db.collection('ToDo');
      const taskname = req.params.task;
      const action = req.params.action;
  
      if (action === 'trash') {
        const result = await collection_todo.updateOne(
            { title: taskname },
            { $set: { inTrash: true } }
          );

        const document = await collection_todo.findOne({ title: taskname });
  
        const collection_trash = await db.collection('Trash');
        const insertResult = await collection_trash.insertOne(document);
  
        const deleteResult = await collection_todo.deleteOne({ title: taskname });
  
      
  
        res.status(200).send();
      } else if (action === 'done') {
        
        const result = await collection_todo.updateOne(
          { title: taskname },
          { $set: { status: 'done' } }
        );
  
        const updatedDocument = await collection_todo.findOne({ title: taskname });
  
        const collection_done = await db.collection('Done');
        const insertResult = await collection_done.insertOne(updatedDocument);
        const updToDo = await db.collection('ToDo').deleteOne({title: taskname})
  
        res.status(200).send();
      } else {
        console.error('Invalid action:', action);
        res.status(400).send('Invalid action');
      }
    } catch (err) {
      console.error('Failed to update or move document:', err);
      res.status(500).send('Internal server error');
    }
  });
  
  app.put('/done/:task/:action', async (req, res) => {
    try {
      const collection_done = await db.collection('Done');
      const taskname = req.params.task;
      const action = req.params.action;
  
      if (action === 'trash') {
        const result = await collection_done.updateOne(
            { title: taskname },
            { $set: { inTrash: true } }
          );

        const document = await collection_done.findOne({ title: taskname });
  
        const collection_trash = await db.collection('Trash');
        const insertResult = await collection_trash.insertOne(document);
  
        const deleteResult = await collection_done.deleteOne({ title: taskname });
  
        res.status(200).send();
      } else if (action === 'not_done') {
        
        const result = await collection_done.updateOne(
            { title: taskname },
            { $set: { status: 'Not Done' } }
        );
  
        const updatedDocument = await collection_done.findOne({ title: taskname });
  
        const collection_todo = await db.collection('ToDo');
        const insertResult = await collection_todo.insertOne(updatedDocument);
        const updToDo = await db.collection('Done').deleteOne({title: taskname})
  
        res.status(200).send();
      } else {
        console.error('Invalid action:', action);
        res.status(400).send('Invalid action');
      }
    } catch (err) {
      console.error('Failed to update or move document:', err);
      res.status(500).send('Internal server error');
    }
  });

  app.put('/trash/:task/:action', async (req, res) => {
    try {
      const collection_trash = await db.collection('Trash');
      const taskname = req.params.task;
      const action = req.params.action;
  
      if (action === 'delete') {

        const deleteResult = await collection_trash.deleteOne({ title: taskname });
        res.status(200).send();
      } else if (action === 'no_trash') {
        
        const result = await collection_trash.updateOne(
            { title: taskname },
            { $set: { inTrash: false } }
        );
  
        const updatedDocument = await collection_trash.findOne({ title: taskname });
  
        const collection_todo = await db.collection('ToDo');
        const insertResult = await collection_todo.insertOne(updatedDocument);
        const updTrash = await db.collection('Trash').deleteOne({title: taskname})
  
        res.status(200).send();
      } else {
        console.error('Invalid action:', action);
        res.status(400).send('Invalid action');
      }
    } catch (err) {
      console.error('Failed to update or move document:', err);
      res.status(500).send('Internal server error');
    }
  });

  
  

app.delete("/todo/:id", async(req, res) => {
    const collection = await db.collection("ToDo");
    collection.deleteOne({"_id": new mongodb.ObjectId(req.params)});  
    res.status(200).send(`Deleted object with Id: ${req.params.id}`);
  });



