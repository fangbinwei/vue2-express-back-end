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

const comment = new mongoose.Schema({
    articleId: String,
    replyId: String,
    //回复人姓名
    name: String,
    replyTime: {
        type: Date,
        default: Date.now
    },
    content: String,
    // 评论是否通过审核
    state: {
        type: Boolean,
        default: false
    }
})

const user = new mongoose.Schema({
    userName: String,
    password: String
})

let models = {
    article: mongoose.model('article', article),
    user: mongoose.model('user', user),
    comment: mongoose.model('comment', comment)
}

module.exports = models
