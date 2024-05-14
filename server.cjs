// include dependencies
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()

app.use(
  '/_next',
  createProxyMiddleware({
    target: 'http://localhost:3000/_next',
  }),
)
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:3000/api',
  }),
)
app.use(
  '/admin',
  createProxyMiddleware({
    target: 'http://localhost:3000/admin',
  }),
)

app.listen(4000)
