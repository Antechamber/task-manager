const mongoose = require('mongoose')

// This module just sets up the connection to the Mongo database
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})