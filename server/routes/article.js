const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const db = require('./../models/db')
const moment = require('moment')
const article = db.article
const jwt = require('jsonwebtoken')
const secret = 'fang-SleepWalker'
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
// verify token
function decodeToken(token, callback) {
    jwt.verify(token, secret, function (err, decoded) {
        // token过期
        if (!decoded) {
            callback(false)
        } else {
            // console.log('token 未过期')
            callback(true)
        }
    })

}
const tokenMiddleware = (req, res, next) => {
    let token = req.headers['access-token']
    decodeToken(token, (auth) => {
        if (auth) {
            next()
        } else {
            res.json({
                status: '02',
                msg: '暂无权限,请登入',
                result: ''
            })
        }
    })
}

// 获取文章列表
router.get('/getArticleList', getArticleList)
// 草稿箱
router.get('/getDraftArticleList', tokenMiddleware, getDraftArticleList)
// 用于归档
router.get('/getArticleListByDate', getArticleListByDate)
// 用于类别页
router.get('/getArticleListByCate', getArticleListByCate)

// 查询文章 要编辑文章时用到
router.post('/queryArticleById', queryArticleById)
router.post('/queryDraftArticleById', tokenMiddleware, queryDraftArticleById)

// 获取类别标签 包括 草稿的类别 暂时先不加token限制
router.get('/getAllArticleCategory', getAllArticleCategory)
// 获取非草稿文章的类别
router.get('/getArticleCategory', getArticleCategory)

// 修改指定文章的分类
router.post('/updateCategoryById', tokenMiddleware, updateCategoryById)
// 修改类别
router.post('/updateCategory', tokenMiddleware, updateCategory)
// 提交文章\ 修改文章
router.post('/saveArticle', tokenMiddleware, saveArticle)
//删除文章
router.post('/delArticle', tokenMiddleware, delArticle)


// queryDraftArticle getDraftArticleList

// -----------function
async function getArticleList (req, res, next){
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)
        let skip = (page - 1) * pageSize
        let articleModel
        let doc
        if (!page || !pageSize) {
            doc = await article.find({draft: false}).sort({createTime: -1}).lean()
        } else {
            doc = await article.find({draft: false}).sort({createTime: -1}).skip(skip).limit(pageSize).lean()
        }

        let total = await article.count({draft: false})
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
    } catch (err) {
        console.log(err)
        res.json({
            status: '0',
            msg: '服务器出错,查询文章列表失败',
            result: ''
        })
    }
}
async function getArticleListByDate (req, res, next){
    try {
        let total = await article.count({draft: false})
        let doc = await article.aggregate(
            {
                $match: {draft: false}
            },
            {
                $sort: {createTime: -1}
            },
            {
                $group: {
                    _id: {year: {$year: '$createTime'},},
                    articleList: {$push: '$$ROOT'}
                }
            },
            {
                $sort: {_id: -1} // 1升序
            })
        res.json({
            status: '1',
            msg: '',
            result: doc,
            total: total
        })
    } catch (err) {
        res.json({
            status: '0',
            msg: '服务器出错,查询文章列表失败',
            result: ''
        })
    }
}
async function getArticleListByCate (req, res, next){
    try {
        let reqCategory = req.query.category
        let doc = await article.find({draft: false, category: reqCategory}).sort({createTime: -1})

        let total = await article.count({draft: false, category: reqCategory})

        res.json({
            status: '1',
            msg: '',
            result: {
                total: total,
                list: doc
            }
        })
    } catch (err) {
        console.log(err)
        res.json({
            status: '0',
            msg: '服务器出错,查询文章列表失败',
            result: ''
        })
    }
}
async function getDraftArticleList (req, res, next){
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)
        let skip = (page - 1) * pageSize

        let doc = await article.find({draft: true}).sort({createTime: -1}).skip(skip).limit(pageSize).lean()
        let total = await article.count({draft: true})
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
    } catch (err) {
        console.log(err)
        res.json({
            status: '0',
            msg: '服务器出错,查询草稿列表失败',
            result: ''
        })
    }
}

async function queryArticleById (req, res, next) {
    try {
        let doc = await article.findOne({_id: req.body.id, draft: false}).lean()
        let form = {
            title: doc.title,
            createTime: doc.createTime,
            abstract: doc.abstract,
            content: doc.content,
            rawContent: doc.rawContent,
            draft: doc.rawContent,
            category: doc.category
        }
        res.json({
            status: '1',
            msg: '查询文章成功',
            result: form
        })
    } catch (err) {
        console.log(err)
        res.json({
            status: '0',
            msg: '服务器出错,所查询的文章不存在',
            result: ''
        })
    }
}

async function queryDraftArticleById (req, res, next) {
    try {
        let doc = await article.findOne({_id: req.body.id, draft: true}).lean()
        // 时间直接不转换,用utc时间 前端DatePicker能识别
        // doc.showCreateTime = moment(doc.createTime).format('YYYY-MM-DD HH:mm')
        let form = {
            title: doc.title,
            createTime: doc.createTime,
            abstract: doc.abstract,
            content: doc.content,
            rawContent: doc.rawContent,
            draft: doc.rawContent,
            category: doc.category
        }
        res.json({
            status: '1',
            msg: '查询文章成功',
            result: form
        })
    } catch (err) {
        res.json({
            status: '0',
            msg: '服务器出错,没有所查询的草稿',
            result: ''
        })
    }
}

async function getArticleCategory (req, res, next) {
    try {
        let doc = await article.aggregate(
            {
              $match: {draft: false}
            },
            {
                $group: {_id: '$category',count: {$sum: 1}}
            },
            {
                $sort: {count: -1} // 1升序
            })
        res.json({
            status: '1',
            msg: '',
            result: doc
        })
    } catch (err) {
        res.json({
            status: '0',
            msg: '服务器出错,获取文章类别失败',
            result: ''
        })
    }
}
async function getAllArticleCategory (req, res, next) {
    try {
        // let categoryModel = articleCategory.distinct('category')
        let doc = await article.aggregate(
            {
                $group: {_id: '$category',count: {$sum: 1}}
            },
            {
                $sort: {count: -1} // 1升序
            })
        res.json({
            status: '1',
            msg: '获取文章和草稿类别成功',
            result: doc
        })
    } catch (err) {
        res.json({
            status: '0',
            msg: '服务器出错,获取文章和草稿类别失败',
            result: ''
        })
    }
}

async function updateCategoryById (req, res, next) {
    try {
        let body = req.body
        let id = body.id
        let category = body.categoryAfter
        await article.findByIdAndUpdate(id, {category: category})
        res.json({
            status: '1',
            msg: '修改类别成功',
            result: ''
        })
    } catch (err) {
        res.json({
            status: '0',
            msg: '服务器错误,修改类别失败',
            result: ''
        })
    }
}

async function updateCategory (req, res, next) {
    try {
        let body = req.body
        let cateBefore = body.categoryBefore
        let cateUpdate = body.categoryUpdate
        let query = {category: cateBefore}
        await article.updateMany(query, {category: cateUpdate})
        res.json({
            status: '1',
            msg: '修改类别成功',
            result: ''
        })
    } catch (err) {
        console.log('express err', err)
        res.json({
            status: '0',
            msg: '服务器错误,修改类别失败',
            result: ''
        })
    }
}

async function saveArticle (req, res, next) {
    try {
        let body = req.body
        let id = body.id
        let data = {
            createTime: body.createTime,
            title: body.title,
            category: body.category,
            abstract: body.abstract,
            content: body.content,
            rawContent: body.rawContent,
            draft: body.draft
        }
        //修改文章
        if (id) {
            // console.log('id存在')
            data.modifyTime = Date.now()
            await article.findByIdAndUpdate(id, data)
            res.json({
                status: '1',
                msg: '修改成功',
                result: ''
            })
            //新建文章
        } else {
            await new article(data).save()
            res.json({
                status: '1',
                msg: '保存成功',
                result: ''
            })
            // 获取文章id
            // let articleId = item._id
        }
    } catch (err) {
        console.log('express err', err)
        res.json({
            status: '0',
            msg: '服务器错误',
            result: ''
        })
    }
}

async function delArticle (req, res, next) {
    try {
        await article.findByIdAndRemove(req.body.id)
        res.json({
            status: '1',
            msg: '删除文章成功',
            result: ''
        })
    } catch (err) {
        console.log('err', err)
        res.json({
            status: '0',
            msg: '服务器错误,删除文章失败',
            result: ''
        })
    }
}
module.exports = router