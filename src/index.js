const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

// create express app and specify port
const app = express()
const port = process.env.PORT

// set express app to expect requests obects as JSON
app.use(express.json())

// routers
app.use(userRouter)
app.use(taskRouter)



app.listen(port, () => {
    console.log('Server is listening on port ' + port)
})