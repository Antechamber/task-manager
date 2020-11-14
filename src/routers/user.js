const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

// get all
router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})

// create/sign up
router.post('/users', async(req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// login
router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// read
router.get('/users/:id', async(req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// update
router.patch('/users/:id', async(req, res) => {
    // get array of requested updates
    const updates = Object.keys(req.body)
        // array of accepted updates
    const allowedUpdates = ['name', 'email', 'password', 'age']
        // use array.every to check that callback function returns true for every array element
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
        // if any updates are not in allowedUpdates, return error and status code 400 (bad request)
    if (!isValidUpdate) {
        res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.params.id)
            // loop through updates array and apply all updates to user
        updates.forEach((update) => user[update] = req.body[update])
            // asyncronously save user
        await user.save()
        if (!user) {
            return res.status(404).send()
        }

        res.status(201).send(user)

    } catch (e) {
        res.status(400).send(e)
    }
})

// delete
router.delete('/users/:id', async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router