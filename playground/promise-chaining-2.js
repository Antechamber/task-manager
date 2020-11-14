require('../src/db/mongoose')
const Task = require('../src/models/task')

// Task.deleteMany({ description: 'This is a new test task 1' }).then(() => {
//     return Task.countDocuments({ completed: false })
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })


const deleteTaskAndCount = async(id) => {
    await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ completed: false })
    return count
}

deleteTaskAndCount('5fab8479463106d9700b0c50').then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})