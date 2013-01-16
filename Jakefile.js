desc('Built the docs with docco');
task('doc', [], function (params) {
  jake.exec("docco api.js actions/* modules/*");
  console.log("Successfully built in docs folder")
});