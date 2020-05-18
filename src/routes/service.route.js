const express = require("express");
const router = express.Router();
const Account = require("../models/account");
const nodersa = require("node-rsa");
const openpgp = require("openpgp");
const partnerEncryptMethod = require("../utils/partner-Encrypt-Method");
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.resolve(__dirname + "/../utils/privateKey.pem"),
  "utf8"
);

// tạo chữ ký, dữ liệu của đối tác để truyền vào post man
// const publicKey = fs.readFileSync(
//   path.resolve(__dirname + "/../utils/publicKey.pem"),
//   "utf8"
// );
// const key = new nodersa(publicKey);
// const encrypted = key.encrypt(
//   {
//     number: "206244699",
//     amount: "75000",
//   },
//   "base64"
// );
// console.log(encrypted);

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
router.post("/transfer", async (req, res) => {
  try {
    const { encryptedString } = req.body;
    const original = new nodersa(privateKey).decrypt(encryptedString, "utf8");
    const data = JSON.parse(original);
    const { number, amount } = data;
    console.log(number, amount);
    const account = await Account.findOne({ number });
    console.log(account);
    if (account) {
      console.log(req.bankName);
      const partnerKey = fs.readFileSync(
        path.resolve(
          __dirname + `/../utils/partner-key/${req.bankName}-PublicKey.pem`
        ),
        "utf8"
      );
      account.balance = parseInt(amount) + parseInt(account.balance);
      account.save();
      console.log(partnerEncryptMethod[req.bankName]);
      if (partnerEncryptMethod[req.bankName] === "PGP") {
        openpgp.initWorker({ path: "openpgp.worker.js" });
        const publicKeyArmored = partnerKey;
        const privateKeyArmored =fs.readFileSync(
          path.resolve(
            __dirname + `/../utils/partner-key/${req.bankName}-PrivateKey.pem`
          ),
          "utf8"
        );
        const dt = {
          success: true,
          data: {
            number: account.number,
            balance: account.balance,
          },
        };
        const { data: encrypted } = await openpgp.encrypt({
          message: openpgp.message.fromText(JSON.stringify(dt)), // input as Message object
          publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for encryption
        });

        const {
          keys: [privateKey],
        } = await openpgp.key.readArmored(privateKeyArmored);
        await privateKey.decrypt("12345");

        const { data: decrypted } = await openpgp.decrypt({
          message: await openpgp.message.readArmored(encrypted), // parse armored message
          privateKeys: [privateKey], // for decryption
        });
        console.log(decrypted);

        return res.json({
          encryptedString: encrypted,
        });
      } else {
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
    }
    return res.json({
      encryptedString: "Account not found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    });
  }
});

// line 67: vì sao phải chuyển thành hàm?
// RSA và PGP có thể dùng chung key?
// line 71 k có field success?
// trình bày mã hóa step by step

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

//test return rsa
// const p = fs.readFileSync(
//   path.resolve(__dirname + "/../utils/partner-key/agribank-PrivateKey.pem"),
//   "utf8"
// );
// const original = new nodersa(p).decrypt(encrypted, "utf8");
// console.log(original);
