const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const db = require('./../models/db')
const user = db.user
const jwt = require('jsonwebtoken')
const secret = 'fang-SleepWalker'

router.post('/login', (req,res) => {
    try {
        let body = req.body
        let userName = body.userName
        let password = body.password
        let userModel = user.find({
            userName: userName,
            password: password
        })
        userModel.exec((err,doc) => {
            if (doc.length === 1) {
                let token = jwt.sign({
                    // token 10小时
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 *10),
                    name: userName,
                    password: password
                }, secret)
                res.json({
                    status: '1',
                    msg: '登入成功',
                    result: '',
                    token: token
                })
            } else {
                res.json({
                    status: '2',
                    msg: '密码错误',
                    result: ''
                })
            }
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
// 退出功能
router.post('/logout', (req, res, next) => {
    res.cookie('userId', '', {
        path: '/',
        maxAge: -1
    })
    res.json({
        status: '1',
        msg: '成功退出',
        result: ''
    })
})
module.exports = router
