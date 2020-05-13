const express = require("express");
const router = express.Router();
const Account = require("../models/account");
const crypto = require("crypto");
const nodersa = require("node-rsa");
const openpgp = require("openpgp");
// const passphrase = `12345`;
const fs = require("fs");
const path = require("path");
const publicKey = fs.readFileSync(
  path.resolve(__dirname + "/../utils/publicKey.pem"),
  "utf8"
);
const privateKey = fs.readFileSync(
  path.resolve(__dirname + "/../utils/privateKey.pem"),
  "utf8"
);

// tạo chữ kí ảo truyền vào post man
const key = new nodersa(publicKey);
const encrypted = key.encrypt(
  {
    number: "206244691",
    amount: "70000",
  },
  "base64"
);
console.log(encrypted); // truyền vào postman encryptedString body

router.post("/info", async (req, res, next) => {
  try {
    const { number } = req.body;
    const account = await Account.findOne({ number });
    if (account) {
      return res.json({
        success: true,
        data: {
          number: account.number,
          balance: account.balance,
        },
      });
    }
    return res.json({
      success: false,
      message: "account not found!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    });
  }
});
router.post("/transfer", async (req, res, next) => {
  try {
    const partnerKey = fs.readFileSync(
      path.resolve(__dirname + `/../utils/partner-key/${req.bankName}-PublicKey.pem`),
      "utf8"
    );
    const { encryptedString } = req.body;
    const original = new nodersa(privateKey).decrypt(encryptedString, "utf8");
    const data = JSON.parse(original);
    const { number, amount } = data;
    const account = await Account.findOne({ number });
    if (account) {
      account.balance = +amount + +account.balance;
      account.save();
      const temp = "Agribank";
      switch (temp) {
        case "Agribank": {
          const respondKey = new nodersa(partnerKey);
          const encrypted = respondKey.encrypt(
            {
              success: true,
              data: {
                number: account.number,
                balance: account.balance,
              },
            },
            "base64"
          );
          return res.json({
            encryptedString: encrypted,
          });
        }
        case "Sacombank":
          const openpgp = require("openpgp");
          (async () => {
            await openpgp.initWorker({ path: "openpgp.worker.js" });
            const publicKeyArmored = partnerKey;
            const dt = {
              number: account.number,
              balance: account.balance,
            };
            const { data: encrypted } = await openpgp.encrypt({
              message: openpgp.message.fromText(JSON.stringify(dt)), // input as Message object
              publicKeys: (await openpgp.key.readArmored(publicKeyArmored))
                .keys, // for encryption
            });
            return res.json({
              encryptedString: encrypted,
            });
          })();
          break;
        default:
          return res.json({
            encryptedString: "encrypted",
          });
      }
      return res.json({
        encryptedString: "acc not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error.toString()",
    });
  }
});
module.exports = router;

// const input = 'Nguyen Xuan Nghiem - 1612427'
// const publicKey = fs.readFileSync(
//   path.resolve(__dirname + '/../utils/publicKey.pem'),
//   'utf8'
// )
// const key = new nodersa(publicKey)
// const encrypted = key.encrypt(input, 'base64')
// const privateKey = fs.readFileSync(
//   path.resolve(__dirname + '/../utils/privateKey.pem'),
//   'utf8'
// )
// const original = new nodersa(privateKey).decrypt(encrypted, 'utf8')
