const express = require('express')
var jwt = require('jsonwebtoken')
const app = express()
const port = 3000

//LAB1
const bcrypt = required('bcrypt');
const saltRounds = 10;
var hashed;

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

app.get('/hello', verifyToken, (req, res) => {
  console.log(req.user)

  res.send('Welcome!')
})


app.post( '/login', (req, res) => {
  let data = req.body
  //res.send(
    //login(
      //data.username,
      //data.password
    //)
  //)

  //Get the jwt token
    let user = login(data.username, data.password);
    res.send(generateToken(user))
})

//LAB1
app.post( '/login2', (req, res) => {
  let {username, password} = req.body;
  //Bcrypt hash
  bcrypt.genSalt(saltRounds, function(err, salt){
    bcrypt.hash(password, salt, function(err, hash){
      hashed = hash
      console.log('hash: ',hash)
    })
  })
  //Sending username and hashed password to login2 function
  setTimeout(function(){
    login2(username, hashed)
  },500)
  //login2(username, hashed);
  res.send(req.body)
})

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

//FUNCTION

function login(username, password){
  console.log("Someone try to login with", username, password)
  let matched = dbUsers.find(element => element.username == username)
  if(matched){
      if(matched.password == password){
          return matched
      }
       else{
          return "Password not matched"
      }
  }else{
      return "Username not found"
  }
  
}

//LAB1
function login2(username, hashed){
  console.log("Someone try to login with", username, password)
  let matched = dbUsers.find(element => element.username == username)
  if(matched){
    //Bcrypt password verification
    bcrypt.compare(matched.password, hashed, function(err, result){
      if(result == true){
        console.log("Access granted usin bcrypt")
      }
      else{
        console.log("Password not matched")
        console.log(result)
      }
    })
  }
  else{
    console.log("Username not found")
  }
}

function register(newusername, newpassword, newname, newemail){
  //TODO: Check if username exist
  let checked = dbUsers.find(element => element.username == newusername)
  if(checked){
      return "Username has been taken"
  }
  else{
      dbUsers.push({
          username: newusername,
          password: newpassword,
          name: newname,
          email: newemail
      })
  }
  return "Registered Successfully"
}

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