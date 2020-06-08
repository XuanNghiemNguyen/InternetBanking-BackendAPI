const getRandomCode = () => {
  let ss = Math.floor(Math.random() * Math.floor(100000))
    .toString()
    .split('')
  while (ss.length < 6) {
    ss.unshift('0')
  }
  return ss.join('')
}

module.exports = { getRandomCode }