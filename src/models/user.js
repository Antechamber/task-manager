const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email not valid...')
            }
        }
    },
    age: {
        type: Number,
        required: false,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be greater than zero...')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password') | value.includes(' ')) {
                throw new Error('Password invalid...')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, { expiresIn: '2 hours' })
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function() {
    const user = this
    const userPublicInfo = user.toObject()
    delete userPublicInfo.password
    delete userPublicInfo.tokens
    delete userPublicInfo.avatar
    return userPublicInfo
}

userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to log in. Plaese try again.')
    }
    const isMatchingPass = await bcrypt.compare(password, user.password)
    if (!isMatchingPass) {
        throw new Error('Unable to log in. Please try again.')
    }
    return user
}

// user specific middleware
// hash plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    // hash password
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    // end Schema.pre()
    next()
})

// delete a user's tasks when deleting user
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User