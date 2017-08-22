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
    draft: String,
    category: String,
    visit: {
        type: Number,
        default: 0
    }

})


let models = {
    article: mongoose.model('article', article)
}

module.exports = models
