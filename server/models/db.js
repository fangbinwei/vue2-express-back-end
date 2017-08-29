const mongoose = require('mongoose')

const article = new mongoose.Schema({
    title: String,
    createTime: Date,
    modifyTime: {
        type: Date,
        default: Date.now
    },
    abstract: String,
    content: String,
    rawContent: String,
    draft: Boolean,
    category: String,
    visit: {
        type: Number,
        default: 0
    }

})

const user = new mongoose.Schema({
    userName: String,
    password: String
})

let models = {
    article: mongoose.model('article', article),
    user: mongoose.model('user', user)
}

module.exports = models
