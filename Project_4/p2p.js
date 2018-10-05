const express = require("express");
const parse = require("url-parse");
const app = express();
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const requests = require("request");

// Blockchain class
const Blockchain = require("./simpleChain");
const Block = require("./block");

// Transaction class
const Transaction = require("./transaction");

let blockchain = new Blockchain();

app.get("/block/:height", async (req, res) => {
  try {
    const response = await blockchain.getBlock(req.params.height);
    res.status(200).json(response);
  } catch (err) {
    res.status(404).json({
      status: 404,
      message: "Block not found"
    });
  }
});

app.get("/height", async (req, res) => {
  const response = await blockchain.getBlockHeight();
  res.status(200).json(response);
});

app.post("/block", async (req, res) => {
  if (req.body.body === "" || req.body.body === undefined) {
    res.status(400).json({
      status: 400,
      message: "Invalid Input: Fill the body parameter"
    });
    return;
  } else {
    await blockchain.addBlock(new Block(req.body.body));
    const height = await blockchain.getBlockHeight();
    const response = await blockchain.getBlock(height);
    res.status(200).json(response);
    return;
  }
});

app.post("/requestValidation", async (req, res) => {
  tx = new Transaction(req);
  response = tx.requestValidation();
  res.status(200).json(response);
});

app.post("/message-signature/validate", async (req, res) => {
  tx = new Transaction(req);
  try {
    response = tx.validateMessage();
  } catch (err) {
    response = err.message;
  }
  res.status(200).json(response);
});

app.get("/stars/:hash", async (req, res) => {
  try {
    const response = await blockchain.getBlockByHash(req.body.hash);
    res.status(200).json(response);
  } catch (err) {
    res.status(404).json({
      status: 404,
      message: "Block not found"
    });
  }
});

app.get("/stars/:address", async (req, res) => {
  try {
    const response = await blockchain.getBlocksByAddress(req.body.address);
    res.status(200).json(response);
  } catch (err) {
    res.status(404).json({
      status: 404,
      message: "Block not found"
    });
  }
});

app.listen(8000);
