const express = require('express')
require('./db/mongoose')
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

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async() => {
//     // const task = await Task.findById('5fb3065387de2df75936a3f5')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user = await User.findById('5fb3063e87de2df75936a3f3')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()