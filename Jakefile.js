task('default', function(){ jake.Task['test'].invoke(); });

desc('Built the docs with docco');
task('doc', [], function (params) {
  jake.exec("docco -o pages/docs bin/* modules/*", { printStdout: true });
});

desc('Runs the Tests');
task('test', { async: true }, function () {
  jake.exec("NODE_ENV=test mocha --colors", { printStdout: true });
});

desc('Release');
task('release', { async: true }, function () {
  var meta      = require("./package.json"),
      commands  = [
        "git tag v" + meta.version,
        "git push origin master --tags",
        "npm publish"
      ];
  jake.exec(commands, { printStdout: true });
});
