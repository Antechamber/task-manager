const express = require('express')
require('./db/mongoose')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
    // create express app and specify port
const app = express()
const port = process.env.PORT | 3000

// set express app to expect requests obects as JSON
app.use(express.json())
    // routers
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is listening on port ' + port)
})


// const jwt = require('jsonwebtoken')

// const myFunction = async() => {
//     const token = jwt.sign({ _id: 'abc123' }, 'This is the secret value', { expiresIn: '2 hours' })
//     console.log(token)

//     const data = jwt.verify(token, 'This is the secret value')
//     console.log(data)
// }

// myFunction()