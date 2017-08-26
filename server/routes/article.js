const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const db = require('./../models/db')
const moment = require('moment')
const article = db.article
//连接MongoDB数据库
mongoose.Promise = global.Promise
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
            msg: '服务器出错',
            result: ''
        })
    }
})
// 获取类别标签
router.get('/getArticleCategory', (req, res) => {
    try {
        // let categoryModel = articleCategory.distinct('category')
        article.aggregate(
            {
                $group: {_id: '$category',count: {$sum: 1}}
            },
            {
                $sort: {count: -1} // 1升序
            },
            (err, doc) => {
                res.json({
                    status: '1',
                    msg: '',
                    result: doc
                })
            })
    } catch (err) {
        res.json({
            status: '0',
            msg: '服务器出错',
            result: ''
        })
    }
})
// 修改类别
router.post('/updateCategory',(req,res) => {
    try {
        let body = req.body
        let cateBefore = body.categoryBefore
        let cateUpdate = body.categoryUpdate
        let query = {category: cateBefore}
        article.updateMany(query, {category: cateUpdate}, (err,doc) => {
            res.json({
                status: '1',
                msg: '修改类别成功',
                result: ''
            })
        })

    } catch (err) {
        console.log('express err', err)
        res.json({
            status: '0',
            msg: '服务器错误,修改类别失败',
            result: ''
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
            rawContent: body.rawContent,
            draft: body.draft
        }
        new article(data).save((err, item) => {
            res.json({
                status: '1',
                msg: '保存成功',
                result: ''
            })
            // 获取文章id
            // let articleId = item._id
        })
    } catch (err) {
        console.log('express err', err)
        res.json({
            status: '0',
            msg: '服务器错误',
            result: ''
        })
    }
})
//删除文章
router.post('/delArticle', (req, res) => {
    try {
        article.findByIdAndRemove(req.body.id, (err, doc) => {
            res.json({
                status: '1',
                msg: '删除文章成功',
                result: ''
            })
        })

    } catch (err) {
        console.log('err', err)
        res.json({
            status: '0',
            msg: '服务器错误',
            result: ''
        })
    }
})
module.exports = router