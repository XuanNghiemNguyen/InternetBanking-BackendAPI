
const express = require('express')
const router = express.Router()
const Account = require('../models/account')
const NodeRSA = require('node-rsa')
const openpgp = require('openpgp')
const fs = require('fs')
const path = require('path')


router.post("/info", async (req, res) => {
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
    //get content
    const { number, amount, signatureMessage } = req.body;
    const { method, partnerKey } = req.ventureInfo;
    let response = {
      success: false,
      data: {},
    };
    if (isNaN(number) || isNaN(amount)) {
      response = {
        success: false,
        message: "Number or Amount should be a number!",
      };
    } else {
      if (!signatureMessage) {
        response = {
          success: false,
          message: "Signature Message is required!",
        };
      } else {
        // verify signatureMessage with data and publicKey

        const data = {
          number,
          amount
        }
        let valid = false
        switch (method) {
          case 'RSA':
            {
              const publicKey = fs.readFileSync(
                path.resolve(__dirname + '/../utils/security/publicKey.pem'),
                'utf8'
              )
              const key = new NodeRSA(publicKey)
              //Verify lỗi
              const valid = key.verify({ success: true, data: { number: 206244699, username: undefined } },
                signatureMessage, 'utf8', 'base64')
              console.log(valid.valid);
            }
            break
          case 'PGP':
            {
              const verified = await openpgp.verify({
                message: openpgp.cleartext.fromText(JSON.stringify(data)),
                signature: await openpgp.signature.readArmored(signatureMessage),
                publicKeys: (await openpgp.key.readArmored(partnerKey)).keys
              });
              valid = verified.signatures[0].valid
            }
            break
          default:
            break
        }

        if (!valid) {
          response = {
            success: false,
            message: 'Not Verified'
          }
        }
        else{
          console.log('verify')
        }
        //transfer
        const account = await Account.findOne({ number });
        if (account) {
          account.balance = parseInt(amount) + parseInt(account.balance);
          account.save();
          response = {
            success: true,
            data: {
              number: account.number,
              username: account.owner
            }
          }
        } else {
          response = {
            success: false,
            message: "Account not found",
          };
        }
      }
    }

    //return results
    let encryptedMessageResponse = "This is encrypted Message Response!";
    let signatureResponse = "This is signature Response!";
    const privateKey = fs.readFileSync(
      path.resolve(__dirname + '/../utils/security/privateKey.pem'),
      'utf8'
    )
    const data = {
      number,
      amount,
    };
    switch (method) {
      case "PGP":
        openpgp.initWorker({ path: "openpgp.worker.js" });
        encryptedMessageResponse = (
          await openpgp.encrypt({
            message: openpgp.message.fromText(JSON.stringify(response)),
            publicKeys: (await openpgp.key.readArmored(partnerKey)).keys,
          })
        ).data;

        break;
      case "RSA":
        const resultKey = new NodeRSA(partnerKey);
        encryptedMessageResponse = resultKey.encrypt(response, "base64");

        break;

      default:
        break;
    }
    const key = new NodeRSA(privateKey)
    signatureResponse = key.sign(response, 'base64', 'utf8');
    return res.json({
      encryptedMessageResponse,
      signatureResponse
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.toString(),
    });
  }
});

module.exports = router;
