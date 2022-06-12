
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function requireDirectory(dirname) {

  var modules: any = require('require-all')({
    dirname,
    filter      :  /(.+)\.ts$/,
    map: function(name, path) {

      return name.split('_').map(p => {

        return capitalizeFirstLetter(p);

      })
      .join('');
    }
  });

  return modules;
}

