//mongoDB
const { MongoClient} = require("mongodb");
const uri = "mongodb://172.24.74.118:27017/"
const  client = new MongoClient(uri)
//express
const express = require('express')
var jwt = require('jsonwebtoken')
const app = express()
const port = 3000
//bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;
var hashed;
var checkpassword;

let dbUsers = [
  {
    username: "saiful",
    password: "012345",
    name: "Saiful Azree Bin Saiful Azmi",
    email: "azreeayie24@gmail.com"
  },
  {
    username: "peng",
    password: "777777",
    name: "Peng Xia Jiang",
    email: "xiajiang@gmail.com"
  }
]

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//authorization
app.post('/visitor', verifyToken, (req, res) => {
  if(req.user.role == 'user'){
    //insertOne visitor to database
  insertOne({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    email: req.body.email,
    user: req.user._id
  })
  }
  //console.log(req.user)
  //res.send('Welcome!')
})

app.get('/visitor', verifyToken, (req, res) => {
  if(req.user.role == 'security'){
    //get all visitors from database
    find({ date: { $eq: new Date() } })
  }

  if(req.user.role == 'user'){
    //get own visitors from database
    find({user: { $eq: req.user._id } })
  }
  //res.send('Hello World!')
})

//login
app.post( '/login',async function (req, res) {
  let {username, password} = req.body
  //BCRYPT hash
  const salt = await bcrypt.genSalt(saltRounds)
  hashed = await bcrypt.hash(password, salt)
  console.log(hashed)
  //login(username,hashed)
  res.send(req.body)
  //Get the jwt token
    //let user = login(data.username, data.password);
    //res.send(generateToken(user))
})
//register
app.post( '/register', (req, res) => {
  let data = req.body
  res.send(
    register(
      data.username,
      data.password,
      data.name,
      data.email
    )
  )
});
//change password
app.post('/changePassword', async function (req, res){
  const {username, newpassword} = req.body
  await changePassword(username, newpassword)
  res.send(req.body)
})
//delete account
app.post('/deleteAccount', async function (req, res){
  const {username, password} = req.body
  await deleteAccount(username, password)
  res.send(req.body)
})

app.post( '/', (req, res) => {
  const { username, password } = req.body;
  const user = dbUsers.find(user => user.username === username && user.password === password);
  if (user){
    res.send(user);
  } else {
    res.send({ error: "User not found"});
  }
})

app.get('/bye', (req, res) => {
    res.send('See You Again!')
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//////////FUNCTION//////////

//CREATE(createListing)
async function createListing(client, newListing){
  const result = await client.db("lab").collection("Visitor").insertOne(newListing);
  console.log(`New listing created with the following id: ${result.insertedId}`);
}
//READ(login)
async function login(username, hashed){
  await client.connect()
  const result = await client.db("lab").collection("Visitor").findOne({ username: username });

  if (result) {
    //BCRYPT verify password
    bcrypt.compare(result.password, hashed, function(err, result){
      if(result == true){
        console.log("Access granted. Welcome")
      }else{
        console.log("Wrong password")
        console.log(result)
      }
    });
  } 
  else {
      console.log("Username not registered")
  }
}
//CREATE(register)
async function register(newusername, newpassword, newname, newemail){
  //TODO: Check if username exist
  await client.connect()
  const exist = await client.db("lab").collection("Visitor").findOne({username: newusername})
  if(exist){
      console.log("Username as been")
  }else{
      await createListing(client,
        {
          username: newusername,
          password: newpassword,
          name: newname,
          email: newemail
        }
      );
      console.log("Registered successfully!")
  }
} 
//UPDATE(change password)
async function changePassword(savedusername, newpassword){
  await client.connect()
  const exist = await client.db("lab").collection("Visitor").findOne({username: savedusername})
  if(exist){
    await client.db("lab").collection("Visitor").updateOne({username: savedusername}, {$set: {password: newpassword}})
    console.log("Your password has changed successfuly.")
  }else{
    console.log("Username does not exist.")
  }
}
//DELETE(delete account)
async function deleteAccount(oldusername, oldpassword){
  await client.connect()
  const exist = await client.db("lab").collection("Visitor").findOne({username: oldusername})
  if(exist){
    checkpassword = await exist.password;
    if(oldpassword == checkpassword){
      await client.db("lab").collection("Visitor").deleteOne({username: oldusername})
      console.log("Account deleted successfully.")
    }else{
      console.log("Password is incorrect")
    }
  }else{
    console.log("Username does not exist.")
  }
}

//AUTHORIZATION(jwt token)
function generateToken(userProfile){
  return jwt.sign(
    userProfile,
    'SiapaCuriDiaBerdosa',  { expiresIn: 60 * 60 });
}
function verifyToken(req, res, next){
  let header = req.headers.authorization
  console.log(header)

  let token = header.split(' ')[1]

  jwt.verify(token, 'SiapaCuriDiaBerdosa', function(err, decoded) {
    if (err) {
      res.send("Invalid Token")
    }
    req.user = decoded

    next()
  });
}