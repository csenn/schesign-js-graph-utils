const all = [
  require('./graph'),
  require('./labels'),
  require('./uids')
]

/* Combine all functions into a single export */
module.exports = all.reduce((prev, next) => {
  Object.keys(next).forEach(key => {
    if (prev[key]) {
      throw new Error(`Two functions were named the same: ${key}`)
    }
    prev[key] = next[key]
  })
  return prev
}, {})
