const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, configureDatabase } = require('./fixtures/db')

beforeEach(configureDatabase)

test('User: should create valid user', async() => {
    // create new user
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Brian',
            email: 'brian@rocketmail.com',
            password: 'Hjingadingadergen',
        }).expect(201)

    // make sure created user in db matches info provided and has matching token
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // response assertions
    expect(response.body)
        .toMatchObject({
            user: {
                name: 'Brian',
                email: 'brian@rocketmail.com'
            },
            token: user.tokens[0].token
        })
})

test('User: should log in existing user', async() => {

    // log in user, creating .tokens[1].token
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        }).expect(200)

    // check that tokens match
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test("User: shouldn't log in nonexistent user", async() => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'notanemail@fake.com',
            password: 'notapass'
        }).expect(400)
})

test("User: shouldn't log in, missing password", async() => {
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email
        }).expect(400)
})

test("User: should return logged in user's profile", async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("User: shouldn't return user's profile, invalid auth token provided", async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('User: should delete authenticated user', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test("User: shouldn't delete user, invalid auth token provided", async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
    const user = await User.findById(userOneId)
    expect(user).not.toBeNull()
})

test("User: Should upload user avatar", async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("User: Should update user's name", async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "He was number one!"
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toBe('He was number one!')
})

test("User: Shouldn't update invalid user field", async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            hatSize: "big af"
        })
        .expect(400)
})

//