'use strict';

const express = require('express');
const dpkg = require('dpkgjs');
const fs = require('fs');
const zlib = require('zlib');

const router = express.Router();

router.get('/admin', (req, res) => {
  res.render('admin');
});

router.get('/admin/refresh', (req, res) => {
  dpkg.scanDir('./deb', packages => {
    var packagesString = '';
    for (let pkg of packages) {
      for (let line of Object.entries(pkg)) {
        packagesString += line[0] + ': ' + line[1] + '\n';
      }
      packagesString += '\n';
    }
    fs.writeFile('./static/Packages', packagesString, err => {
      if (err) throw err;
    });
    const packagesJson = JSON.stringify(packages, null, 2);
    fs.writeFile('./static/Packages.json', packagesJson, err => {
      if (err) throw err;
    });
    const gzip = zlib.createGzip();
    const infile = fs.createReadStream('./static/Packages');
    const outfile = fs.createWriteStream('./static/Packages.gz');
    infile.pipe(gzip).pipe(outfile);
    res.redirect('/admin');
  });
});

module.exports = router;