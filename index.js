const express = require('express')
const app = express()
const port = 3000

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

app.post( '/login', (req, res) => {
  let data = req.body
  res.send(
    login(
      data.username,
      data.password
    )
  )
});

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