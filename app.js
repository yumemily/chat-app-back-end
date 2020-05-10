const Room = require('./src/models/room');
const express = require('express');
const app = express();
const router = new express.Router();


app.use(router)


router.route("/").get((req,res)=> {
  res.send("ok")
})

router.route("/create-rooms").get(async (req, res) => {
  try {
    await Room.insertMany([
      {
        name: "Chrome",
        members: []
      },
      {
        name: "Safari",
        members: []
      },
      {
        name: "FireFox",
        members: []
      },
      {
        name: "Opera",
        members: []
      },
      {
        name: "Coccoc",
        members: []
      }
    ]);
    res.send("ok");
  } catch (err) {
    console.log("ERROR",err.message);
  };
})

/* write this api in routes directory  */
router.post('/addDocuments', async function (req, res) {
    const data = [{
        name: "Chrome",
        members: []
      },
      {
        name: "Safari",
        members: []
      },
      {
        name: "FireFox",
        members: []
      },
      {
        name: "Opera",
        members: []
      },
      {
        name: "Coccoc",
        members: []
      }];

    await Room.insertMany(data)  
    console.log(data)
    .then((result) => {
            console.log("result ", result);
            res.status(200).json({'success': 'new documents added!', 'data': result});
    })
    .catch(err => {
            console.error("error ", err);
            res.status(400).json({err});
    });
})


// then GET request "/" once to create these 5 rooms.

// ... more code incoming

module.exports = app;