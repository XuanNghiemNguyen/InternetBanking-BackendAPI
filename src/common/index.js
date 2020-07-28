const getRandomCode = () => {
  let ss = Math.floor(Math.random() * Math.floor(100000))
    .toString()
    .split('')
  while (ss.length < 6) {
    ss.unshift('0')
  }
  return ss.join('')
}
const getRandomPassword = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
module.exports = { getRandomCode, getRandomPassword }