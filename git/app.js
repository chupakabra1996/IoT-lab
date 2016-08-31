const gitLocal = require('./local-git')
const gitApi = require('./github-api')


/**
* Example of usage
*/
gitApi.getRepo()
  .then( repo => {

    gitApi.getAllBranches()
      .then( branches => {

          gitApi.getCommits()
            .then(commits => {

              //for example show repo name, owner, commits count and branches name and count
              console.log(`Repository name : ${repo.name}`);
              console.log(`User login : ${repo.owner.login}`);
              console.log(`${commits.length} commits`);
              let branchesStr = [];
              branches.forEach( branch => {
                branchesStr.push(`${branch.name}`);
              });
              console.log(`${branches.length} branches (${branchesStr.join(', ')})`);

              return commits;
            })
            .then( commits => {
              //show commit info

              gitApi.getCommit(commits[0].sha)
                .then(commit => {
                  _commit = commit;
                  console.log('Commit info\n=========');
                  console.log(`sha : ${commit.sha}`);
                  console.log(`${commit.author.login} at ${commit.author.date}`);
                  console.log(`Message : ${commit.message}`);
                })

              return gitApi.getTree(commits[0].sha);
            })
            .then(tree => {

              let path = tree.tree[5].path; //we also can travel within tree, use getTree (tree sha)
              let ref = branches[0].name; //or some commit.sha

              path = '';

              gitApi.getContent(path, ref)
                .then( content => {
                  console.log("Content\n================");
                  if (Array.isArray(content)) {
                    content.forEach(file => {
                      console.log(`${file.name}\t path : ${file.path}  (${file.type == 'dir' ? 'directory' : 'file'})`);
                    })
                  } else {
                    console.log(`\n\n${path} file's content :\n============\n${content.content}`);
                  }
                })
            })

      })

  });
