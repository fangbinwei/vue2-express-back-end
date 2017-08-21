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


const articleCategory = new mongoose.Schema({
    articleId: String,
    category: String
})

let models = {
    article: mongoose.model('article', article),
    articleCategory: mongoose.model('articleCategory', articleCategory)
}

module.exports = models
