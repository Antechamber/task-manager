const express = require('express')
const router = new express.Router()
const Task = require('../models/task')

// get all
router.get('/tasks', async(req, res) => {
    try {
        const users = await Task.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

// create
router.post('/tasks', async(req, res) => {
    const task = new Task(req.body)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// read
router.get('/tasks/:id', async(req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findById(_id)
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

// update
router.patch('/tasks/:id', async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const areUpdatesValid = updates.every((update) => allowedUpdates.includes(update))
    if (!areUpdatesValid) {
        res.status(400).send('Invalid updates!')
    }
    try {
        const task = await Task.findById(req.params.id)
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        if (!task) {
            return res.status(404).send('Task with given id not found.')
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }


})

// delete
router.delete('/tasks/:id', async(req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router