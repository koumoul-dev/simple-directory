const config = require('config')
const path = require('path')
const util = require('util')
const { exec } = require('child_process')
const execAsync = util.promisify(exec)
const fs = require('fs')
const readFileAsync = util.promisify(fs.readFile)
const accessAsync = util.promisify(fs.access)
const express = require('express')
const jwt = require('jsonwebtoken')
const asyncVerify = util.promisify(jwt.verify)
const JSONWebKey = require('json-web-key')
const mkdirp = require('mkdirp-promise')

exports.init = async () => {
  const keys = {}
  const privateKeyPath = path.resolve(__dirname, '../..', config.secret.private)
  const publicKeyPath = path.resolve(__dirname, '../..', config.secret.public)
  try {
    accessAsync(privateKeyPath, fs.constants.R_OK)
  } catch (err) {
    console.log(err)
    console.log(`Private key ${privateKeyPath} doesn't exist. Try to create it with openssl...`)
    await mkdirp(path.dirname(privateKeyPath))
    await execAsync(`openssl genpkey -algorithm RSA -out ${privateKeyPath} -pkeyopt rsa_keygen_bits:2048`)
    await execAsync(`openssl rsa -in ${privateKeyPath} -outform PEM -pubout -out  ${publicKeyPath}`)
  }
  keys.private = await readFileAsync(privateKeyPath)
  keys.public = await readFileAsync(publicKeyPath)
  return keys
}

exports.router = (keys) => {
  const router = express.Router()
  const publicKey = JSONWebKey.fromPEM(keys.public)
  publicKey.kid = config.kid
  publicKey.alg = 'RS256'
  publicKey.use = 'sig'
  router.get('/.well-known/jwks.json', (req, res) => {
    res.json({'keys': [publicKey.toJSON()]})
  })
  return router
}

exports.sign = (keys, payload, expiresIn) => jwt.sign(payload, keys.private, {
  algorithm: 'RS256',
  expiresIn,
  keyid: config.kid
})

exports.verify = async (keys, token) => asyncVerify(token, keys.public)