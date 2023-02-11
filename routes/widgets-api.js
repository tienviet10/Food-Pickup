/*
 * All routes for Widget Data are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /api/widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const widgetQueries = require('../db/queries/widgets');

router.get('/', (req, res) => {
  widgetQueries.getWidget().then(data => {
    const widgets = data.rows;
    res.json({ widgets });
  })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

module.exports = router;
