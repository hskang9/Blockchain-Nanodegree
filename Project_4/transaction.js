const bitcoinMessage = require("bitcoinjs-message");
const bitcoin = require("bitcoinjs-lib");
const db = require("level")("./chaindata");

class Transaction {
  constructor(req) {
    this.req = req;
  }

  validateCredentials() {
    if (!this.req.body.address) throw new Error("Missing address parameter");
    if (!this.req.body.signature)
      throw new Error("Missing signature parameter");
  }

  validateStar() {
    let star = this.req.body.star;
    if (!star.dec)
      throw new Error(
        "Wrong Input: dec parameter should be non-empty string property"
      );
    if (!star.ra)
      throw new Error(
        "Wrong Input: ra parameter should be non-empty string property"
      );
    if (!star.story)
      throw new Error(
        "Wrong Input: story parameter should be non-empty string property"
      );
  }

  requestValidation() {
    let timestamp = new Date()
        .getTime()
        .toString()
        .slice(0, -3);
    let message = `${this.req.body.address}:${timestamp}:starRegistry`;
    let obj = {
      message: message,
      timestamp: timestamp,
      validationWindow: 300
    };
    db.put(this.req.body.address, obj);

    return obj;
  }

  deleteAccount() {
    db.del(this.req.body.address);
  }

  validateMessage() {
    this.validateCredentials();
    let now = new Date()
      .getTime()
      .toString()
      .slice(0, -3);
    let obj = db.get(this.req.body.address);
    let timestamp = obj.timestamp;
    let validationWindow = obj.validationWindow;

    if (timestamp + validationWindow < now)
      throw new Error("Too late for Registration");

    if (
      bitcoinMessage.verify(
        message,
        this.req.body.address,
        this.req.body.signature
      )
    ) {
      return {
        registerStar: true,
        status: {
          address: this.req.body.address,
          requestTimeStamp: obj.timestamp,
          message: obj.message,
          validationWindow: 300,
          messageSignature: "valid"
        }
      };
    } else {
      throw new Error("Invalid Account");
    }
  }
}

module.exports = Transaction;
