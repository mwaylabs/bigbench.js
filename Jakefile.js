task('default', function(){ jake.Task['test'].invoke(); });

desc('Built the docs with docco');
task('doc', [], function (params) {
  jake.exec("docco bin/* modules/*");
  console.log("Successfully built in docs folder")
});

desc('Runs the Tests');
task('test', { async: true }, function () {
  jake.exec("NODE_ENV=test mocha --colors", { printStdout: true });
});