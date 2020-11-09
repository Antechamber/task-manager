// CRUD create read update delete

const { MongoClient, ObjectID } = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!')
    }

    const db = client.db(databaseName)

    db.collection('users').findOne({ _id: new ObjectID("5fa9ae006706396b2efff8e2") }, (error, user) => {
        if (error) {
            return console.log('Unable to fetch document')
        }

        console.log(user)
    })
})