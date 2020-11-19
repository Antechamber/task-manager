const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const multer = require('multer')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

// get current logged in profile
router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})

// create/sign up
router.post('/users', async(req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// upload profile avatar
const uploadAvatar = multer({
        limits: {
            fileSize: 1000000
        },
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                cb(new Error('Please upload a jpg, jpeg or png file.'))
            }
            cb(undefined, true)
        }
    })
    // uploadAvatar.single() takes a binary image file from the request body with given key name,
    // applies some validation checks and then adds it to the req object if it passes (req.file)
router.post('/users/me/avatar', auth, uploadAvatar.single('avatar'), async(req, res) => {
    // use sharp to convert avatar image to small png file
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
        // attach processed image to user document in db
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// delete profile avatar
router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// fetch avatar
router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
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

// log out
router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// log out all sessions
router.post('/users/logoutALL', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// update
router.patch('/users/me', auth, async(req, res) => {
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
        // loop through updates array and apply all updates to user
        updates.forEach((update) => req.user[update] = req.body[update])
            // asyncronously save user
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// delete
router.delete('/users/me', auth, async(req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router