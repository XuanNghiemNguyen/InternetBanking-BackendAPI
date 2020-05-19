const input = 'Nguyen Xuan Nghiem - 1612427'
const publicKey = fs.readFileSync(
  path.resolve(__dirname + '/../utils/publicKey.pem'),
  'utf8'
)
const key = new nodersa(publicKey)
const encrypted = key.encrypt(input, 'base64')
const privateKey = fs.readFileSync(
  path.resolve(__dirname + '/../utils/privateKey.pem'),
  'utf8'
)
const original = new nodersa(privateKey).decrypt(encrypted, 'utf8')

// tạo chữ ký, dữ liệu của đối tác để truyền vào post man
const publicKey = fs.readFileSync(
  path.resolve(__dirname + '/../utils/publicKey.pem'),
  'utf8'
)
const key = new nodersa(publicKey)
const encrypted = key.encrypt(
  {
    number: '206244699',
    amount: '75000'
  },
  'base64'
)
console.log(encrypted)

//test return rsa
const p = fs.readFileSync(
  path.resolve(__dirname + '/../utils/partner-key/agribank-PrivateKey.pem'),
  'utf8'
)
const original = new nodersa(p).decrypt(encrypted, 'utf8')
console.log(original)

// test return pgp
const privateKeyArmored = fs.readFileSync(
  path.resolve(
    __dirname + `/../utils/partner-key/${req.bankName}-PrivateKey.pem`
  ),
  'utf8'
)

const {
  keys: [privateKey]
} = await openpgp.key.readArmored(privateKeyArmored)
await privateKey.decrypt('12345')

const { data: decrypted } = await openpgp.decrypt({
  message: await openpgp.message.readArmored(encrypted), // parse armored message
  privateKeys: [privateKey] // for decryption
})
console.log(decrypted)
