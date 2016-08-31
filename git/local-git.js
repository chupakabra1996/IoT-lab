'use strict'

/*
* Git's local repository functionalities
*/

let git = require('nodegit');
let url = require('url');
let cred = require('./credentials.json');
let path = require('path').resolve(cred.repo.path);
let git2 = require('simple-git')(path);
let gitApi = require('./' + cred.api.github);


//print util for debug purposes
function _toArray (obj, print) {
  if (obj === 'undefined' || !obj) console.error('Printed obj is null or undefined');
  var result = [];
  for (var prop in obj) {
    result.push(prop);
  }
  if (print) console.log(result);
  return result;
}

function _toJSON (obj) {
  var data = _toArray(obj, false);
  var jsonObj = {};
  if (!data && data === 'undefined') console.log('null or undefined');
  data.forEach(d => {
    jsonObj[d] = '';
  });
  console.log(JSON.stringify(jsonObj,'',4).replace(/: ""(,|)/g, '')
    .replace(/"/g, ''));
}


/**
* Get clone url depends on global settings in credentials.json
* @return either github or bitbucket or gitlab repository clone url
*/
function getRepoCloneUrl () {
  var gitExt = '.git';
  var urlConfig = {
    protocol : 'https',
    hostname : cred.repo.hostname,
    auth : cred.repo.auth,
    pathname : '/' + cred.user.login + '/' + cred.repo.name + gitExt
  };
  return url.format(urlConfig);
}


/**
* Clone repository to the appropriate path
* @param repoUrl
* @param pathToClone - path where repository should be cloned (../path/to/repo)
* @return Promise
*/
function cloneRepo (repoUrl, pathToClone) {
  return git.Clone(repoUrl, pathToClone);
}

/**
* Open repository and make it available for using
* @param pathToRepo - path where repository is placed (../path/to/repo)
* @return Promise
*/
function openRepo () {
  return git.Repository.open(path);
}


/**
* Read file at the appropriate commit state
* @param sha - commit's sha
* @param path - path to file in repository
* @return file object {name, sha, size , content}
*/
function readFile (sha, path) {
  let _entry;
  return openRepo(path)
    .then( repo => {
      return repo.getCommit(sha);
    })
    .then( c => {
      return c.getEntry(path);
    })
    .then( entry => {
      _entry = entry;
      return entry.getBlob();
    })
    .then( blob => {

      return {
        name : _entry.name(),
        sha : _entry.sha(),
        size : blob.rawsize(),
        content : blob.toString()
      };
    });
}



/**
* Get status (added, deleted, etc...)
* @return Promise
*/
function status () {
  return new Promise(function(resolve, reject) {
    git2.status( (err, status) => {
      resolve(status);
    });
  });
}


/**
* Pull branch
* @param branch - branch's name
*/
function pull (branch) {
  git.checkout(branch)
  .pull( (err, update) => {
    if (update && update.summary.changes) {
      // require('child_process').exec('npm restart');
    }
  });
}

/**
* Update repository
* Pull all branches like git pull --all command
*/
function update () {
  return gitApi.getBranches()
    .then( branches => {
      branches.forEach( branch => {
        pull(branch.name);
      });
    });
}



module.exports = {
  getRepoCloneUrl,
  cloneRepo,
  openRepo,
  readFile,
  status,
  pull,
  update
}
