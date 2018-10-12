const bitcoinMessage = require("bitcoinjs-message");
const bitcoin = require("bitcoinjs-lib");
const Storage = require("./storage");

const chainDB = "./chaindata";

let storage = new Storage(chainDB);

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

  async requestValidation() {
    let address = this.req.body.address;
    let timestamp = new Date()
      .getTime()
      .toString()
      .slice(0, -3);

    let value = await storage.getLevelDBData(address).catch(function(err) {
      let obj = {
        address: address,
        timestamp: timestamp,
        message: `${address}:${timestamp}:starRegistry`,
        validationWindow: 300,
        isValid: "requested"
      };
      storage.putLevelDBData(address, obj);
      return obj;
    });
    if (value !== undefined) {
      let elapsed =
        300 - (timestamp - value.timestamp) > 0
          ? 300 - (timestamp - value.timestamp)
          : 300;

      value["validationWindow"] = elapsed;
      return value;
    }
  }

  async validateMessage() {
    this.validateCredentials();
    let now = new Date()
      .getTime()
      .toString()
      .slice(0, -3);
    let value = await storage.getLevelDBData(this.req.body.address);
    let timestamp = obj.timestamp;
    let validationWindow = obj.validationWindow;

    if (now < timestamp + validationWindow)
      throw new Error("Too late for Registration");

    if (
      bitcoinMessage.verify(
        value.message,
        this.req.body.address,
        this.req.body.signature
      )
    ) {
      let elapsed =
        300 - (now - value.timestamp) > 0 ? 300 - (now - value.timestamp) : 300;
      value.isValid = true;
      await storage.putLevelDBData(this.req.body.address, value);
      obj = {
        registerStar: true,
        status: {
          address: this.req.body.address,
          requestTimeStamp: value.timestamp,
          message: value.message,
          validationWindow: elapsed,
          messageSignature: "valid"
        }
      };

      return obj;
    } else {
      throw new Error("Invalid Account");
    }
  }
}

module.exports = Transaction;
