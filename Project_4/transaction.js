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
    star = this.req.body.star;
    if (!data.dec)
      throw new Error(
        "Wrong Input: dec parameter should be non-empty string property"
      );
    if (!data.ra)
      throw new Error(
        "Wrong Input: ra parameter should be non-empty string property"
      );
    if (!data.story)
      throw new Error(
        "Wrong Input: story parameter should be non-empty string property"
      );
  }

  requestValidation() {
    message = `${this.req.address}:${this.req.timestamp}:starRegistry`;
    obj = {
      message: message,
      timestamp: this.req.timestamp,
      validationWindow: 300
    };
    db.put(this.req.account, obj);

    return obj;
  }

  deleteAccount() {
    db.del(this.req.account);
  }

  validateMessage() {
    this.validateCredentials();
    now = new Date()
      .getTime()
      .toString()
      .slice(0, -3);
    obj = db.get(account);
    timestamp = obj.timestamp;
    validationWindow = obj.validationWindow;

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
