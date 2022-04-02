const express = require("express");
const recordRoutes = express.Router();
const axios = require('axios');
var parse = require('parse-link-header');


async function fetchSumm(token) {

    const summary = {"correct":"yes"}
    return summary
}

recordRoutes.route("/belvo/auth/:token").get(async function (req, res) {
    const token = req.params.token;
    try {
        const summary = await fetchSumm(token);
        return res.send({ summary });
    } catch (error) {
        console.log(error);
    }

});

module.exports = recordRoutes;