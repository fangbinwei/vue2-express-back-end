const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const db = require('./../models/db')
const moment = require('moment')
const article = db.article,
    categoryArticle = db.articleCategory
//连接MongoDB数据库
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/blog', {
    useMongoClient: true
})

mongoose.connection.on('connected', function () {
    console.log('MongoDB connected success.')
})

mongoose.connection.on('error', function () {
    console.log('MongoDB connected fail.')
})

mongoose.connection.on("disconnected", function () {
    console.log('MongoDB connected disconnected.')
})

// 获取文章列表
router.get('/getArticleList', async (req, res, next) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)
        let skip = (page - 1) * pageSize
        let total = await article.count()
        let articleModel = article.find().sort({createTime: -1}).skip(skip).limit(pageSize).lean()
        console.log('articleModel', typeof articleModel)
        articleModel.exec((err,doc) => {
            doc.forEach((item, index, array) => {
                item.showCreateTime = moment(item.createTime).format('YYYY-MM-DD HH:mm')
            })
            res.json({
                status: '1',
                msg: '',
                result: {
                    total: total,
                    count: doc.length,
                    list: doc
                }
            })
        })
    } catch (err) {
        console.log(err)
        res.json({
            status: '0',
            msg: '服务器出错'
        })
    }
})
// 发表文章页面,获取类别标签
router.get('/getArticleCategory', (req, res) => {
    try {
        let categoryModel = categoryArticle.distinct('category')
        categoryModel.exec((err,doc) => {
            res.json({
                status: '1',
                msg: doc
            })
        })
    } catch (err) {
        res.json({
            status: '0',
            msg: '服务器出错'
        })

    }
})
// 提交文章
router.post('/saveArticle', (req,res) => {
    try {
        let body = req.body
        let data = {
            createTime: body.createTime,
            title: body.title,
            category: body.category,
            abstract: body.abstract,
            content: body.content,
            draft: body.draft
        }
        new article(data).save((err, item) => {
            // 获取文章id
            let articleId = item._id

            // 保存分类标签
            let categoryData = {
                articleId: articleId,
                category: body.category
            }
            new categoryArticle(categoryData).save((err, item) => {
                console.log('保存成功')
                res.json({
                    status: '1',
                    msg: '保存成功'
                })
            })
        })
    } catch (err) {
        console.log('express err', err)
        res.json({
            status: '0',
            msg: '服务器错误'
        })
    }
})
module.exports = router