
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
  
//adding database
const mongoose = require('mongoose');
const mySecret = process.env['MONGO_URI']
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

//Create a model called exercise from exerciseSchema
let exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: Date,
  _id : {id:false}
});
//let Exercise = mongoose.model('Exercise', exerciseSchema);

//Now, create a model called user from the userSchema.
let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  exercises: [exerciseSchema]
});

let User = mongoose.model('User', userSchema);


//add body parser
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(bodyParser.urlencoded({extended: false}));

//You can POST to /api/users with form data username to create a new user.
//The returned response from POST /api/users with form data username will be an object with username and _id properties.
app.post("/api/users", function(req, res){
  User.deleteMany({});
  
  const username = req.body.username;
  let newUser = new User({
    username: username
  });

  newUser.save(function(err, user) {
    if(err){
      return console.error(err);
    }
    res.json(user);
  });
});


//You can make a GET request to /api/users to get a list of all users.
//The GET request to /api/users returns an array.
//Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
app.get('/api/users', function(req, res){
  User.find({}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  }).select({"__v": 0}).select({"exercises": 0});
});

//You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
//The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.
app.post("/api/users/:_id/exercises", function(req, res){
  User.findOne({'_id': req.params._id}, function(err, user){
    if(err){
      console.error(err);
    }else{
      var date;
      if(req.body.date){
        date = new Date(req.body.date);
      }else{
        date = new Date();
      }

      exerciseSchema = {
        description: req.body.description,
        duration: req.body.duration,
        date: date.toDateString()
      };
      
      user.exercises.push(exerciseSchema);
      user.save((err, updatedUser) => {
        if(err) return console.error(err);
        res.json({
          username: user.username,
          description: exerciseSchema.description,
          duration: parseInt(exerciseSchema.duration),
          date: exerciseSchema.date,
          _id: user._id
        });
      })
    }
  });
  
});

//You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
//A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user
//A GET request to /api/users/:_id/logs will return the user object with a log array of all the exercises added.
//Each item in the log array that is returned from GET /api/users/:_id/logs is an object that should have a description, duration, and date properties.
//The description property of any object in the log array that is returned from GET /api/users/:_id/logs should be a string.
//The duration property of any object in the log array that is returned from GET /api/users/:_id/logs should be a number.
//The date property of any object in the log array that is returned from GET /api/users/:_id/logs should be a string. Use the dateString format of the Date API.
//You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
app.get("/api/users/:_id/logs", function(req, res){
  
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
