'use strict'

var gitHubApi = require('github');
var cred = require('./credentials.json');

//config object
let config = {
  user : cred.user.login,
  repo : cred.repo.name,
  page : 1, //min
  per_page : 100, //max
}

//init github object to work with
var github = new gitHubApi({
  debug : cred.api.debug
});


// Basic authentication (NOTE : it's sync, it only stores credentials)
github.authenticate({
  type : 'basic',
  username : cred.user.login,
  password : cred.user.password
});

//functions

/**
* Get all branches array ( {name, sha} )
* @return Promise
*/
function getAllBranches () {
  return new Promise( (resolve, reject) => {
    github.repos.getBranches( config, (err, bs) => {
      if (err) reject(err);
      else resolve( bs.map( b => {
          return { name : b.name, sha : b.commit.sha }
      }));
    });
  });
}



/**
* Get commit's info (author, tree, parents, stats, changed files, patches)
* @param sha - commit's sha string value
* @return Promise
*/
function getCommit (sha) {
  return new Promise( (resolve, reject) => {
    let conf = config;
    conf.sha = sha;
    github.repos.getCommit( conf, (err, c) => {
      if (err) reject(err);
      resolve({
        sha : c.sha, //commit sha
        author : {
          name : c.commit.author.name, //author's name
          email : c.commit.author.email, //email
          date : c.commit.author.date, //published date
          login : c.author.login,
          id : c.author.id, //author id
          type : c.author.type // type User/Organization
        },
        tree : {
          sha : c.commit.tree.sha //commit's tree sha
        },
        message : c.commit.message, //commit's message
        parents : c.parents.map( p => { //commit's parents sha
          return p.sha;
        }),
        stats : c.stats, //total, additions, deletions
        files : c.files.map( f => {
          return {
            sha : f.sha, //file's sha
            filename : f.filename,
            status : f.status, //modified, deleted, etc.
            additions : f.additions, //additions count
            deletions : f.deletions,
            changes : f.changes, //changes count
            patch : f.patch
          }
        })
      });
    })
  });
}



/**
* Get a tree's sha value, tree ( {path, mode, type, sha, size})
* Trees can be of type blob and tree
* If sha represents blob, it doesn't have tree info and will be rejected
* Tree has other trees and blobs in them
* So we can walk throughout tree and see repo structure at the appropriate commit
* @param sha - tree's sha value
* @return Promise
* getting a tree sha and get sha of files and other trees
*/
function getTree (sha) {
  return new Promise( (resolve, reject) => {
    let conf = config;
    conf.sha = sha;
    github.gitdata.getTree( conf, (err, t) => {
      if (err || (typeof t === 'undefined') ) reject(err);
      else resolve({
        sha : t.sha, //tree's sha
        tree : t.tree.map( o => {
          return {
            path : o.path, //path to file/directory
            mode : o.mode, //file mode
            type : o.type, //blob or tree
            sha : o.sha, // blob or tree sha
            size : o.size //size of file / undefined to tree
          }
        })
      });
    });
  });
}

/**
* Get the repository information
* such as name, owner, url, ssh, dates, size, stars, etc.
* @return Promise
*/
function getRepo () {
  return new Promise( (resolve, reject) => {
    console.log('Start get repo');
    github.repos.get(config, (err, r) => {
      if (err) reject(err);
      else resolve({
        id : r.id, // repo id
        name : r.name,
        fullName : r.full_name, //full name like a login/name
        owner : {
          login : r.owner.login,
          id : r.owner.id, //id of owner
          type : r.owner.type //type User / Organization
        },
        private : r.private,
        description : r.description,
        isForked : r.fork, //is this repo was forked
        url : r.url,
        sshUrl : r.ssh_url,
        cloneUrl : r.clone_url,
        created : r.created_at,
        updated : r.updated_at,
        pushed : r.pushed_at,
        size : r.size,
        stars : r.stargazers_count,
        watchers : r.watchers_count,
        language : r.language,
        forks : r.forks_count,
        subscribers :r. subscribers_count
      })
    })
  });
}



/**
* Get branch information
* Branch's name, commit state
* @param branch - string branch name (ex. 'master', 'dev')
* @return Promise
*/
function getBranch (branch) {
  return new Promise( (resolve, reject) => {
    let conf = config;
    conf.branch = branch;
    github.repos.getBranch( conf, (err, b) => {
      if (err) reject(err);
      else resolve({
        name : b.name,
        commit : { //commit that master referenced to
          sha : b.commit.sha, //commit's sha
          date : b.commit.commit.author.date,
          message : b.commit.commit.message,
          author : {
            name : b.commit.commit.author.name,
            login : b.commit.author.login,
            id : b.commit.author.id,
            email : b.commit.commit.author.email,
            type : b.commit.author.type //User or Organization
          },
          tree : {
            sha : b.commit.commit.tree.sha
          },
          parents : b.commit.parents.map(
            p => { return p.sha; }
          )
        }
      })
    })
  });
}


/**
* Get commits matches to the pattern
* @param params (optional) - parameters {sha, path, author} where
* sha (optional) - commit's sha/branch name to start from first to this commits
* path (optional) - the path to file or directory where commits were
* author (optional) - owner of commit, it's his blame=) lol
* @return Promise
*/
function getCommits (params) {
  let conf = config;
  if (params) {
    let {sha, path, author} = params;

    if (sha) conf.sha = sha;
    if (path) conf.path = path;
    if (author) conf.author = author;
  }

  return new Promise( (resolve, reject) => {
    github.repos.getCommits( config, (err, cs) => {
      if (err) reject(err);
      let result = cs.map( c => {
        let author = (c.author) ? c.author : {};
        return {
          sha : c.sha,
          date : c.commit.author.date,
          message : c.commit.message,
          author : {
            name : c.commit.author.name,
            email : c.commit.author.email,
            login : author.login,
            id : author.id,
            type : author.type
          },
          tree : {
            sha : c.commit.tree.sha
          },
          parents : c.parents.map( p => {
            return p.sha;
          })
        }
      });
      resolve(result);
    })
  });
}


/**
* Get file or directory content depends on path and ref
* If it's a file then returns file info and it's content blob
* Otherwise returns directory structure {files, directories with info:
* path, sha, size, type}
* @param path (optional) - path in repository (default initial directory)
* @param ref (optional) - commit, branch, tag (default 'master' branch)
* @return Promise
*/
function getContent (path, ref) {
  let conf = config;
  conf.path = path || '';
  conf.ref = ref || 'master';

  return new Promise( (resolve, reject) => {
    github.repos.getContent( conf, (err, c) => {
      if (err) {
        reject(err);
      } else {
        if ( Array.isArray(c) ) resolve( _dirContentToArray(c) );
        else resolve( _fileToObject(c) );
      }
    })
  });
}

/** gitdata getBlob, use a tree to read blob
getTree('a7265ec907129b487f7b4dec9e18e6f1844fe72e')
  .then(t => {
    return t.tree[0].sha;
  })
  .then(sha => {
    let conf = config;
    conf.sha = sha;
    github.gitdata.getBlob( conf, (err, resp) => {
        console.log(_blobToString(resp.content));
    });
  })
*/


/**
* Convert blob with some base into string
* @param blob - blob to convert to string
* @param base (optional) - base like a base64, for example
* @return converted string
*/
function _blobToString (blob, base) {
  base = base || 'base64';
  return new Buffer(blob, base).toString();
}



/**
* Convert directory content info object into simple object
* @param content -  dir content object
* @return converted dir content
*/
function _dirContentToArray (content) {
  return content.map( c => {
    if ( Array.isArray(c) ) return _fileToObject(c);
    return {
      name : c.name,
      path : c.path,
      sha : c.sha,
      size : c.size, //0
      type : c.type // dir
    };
  });
}

/**
* Convert file content info object  into simple object
* @param content - file content object
* @return converted file content
*/
function _fileToObject (content) {
  return {
    name : content.name, //file name
    path : content.path,
    sha : content.sha,
    size : content.size,
    type : content.type, //file
    content : _blobToString(content.content) //string content
  };
}

module.exports = {
  getRepo,
  getAllBranches,
  getBranch,
  getCommits,
  getCommit,
  getTree,
  getContent
}
