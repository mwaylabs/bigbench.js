desc('Built the docs with docco');
task('doc', [], function (params) {
  jake.exec("docco bin/* modules/*");
  console.log("Successfully built in docs folder")
});