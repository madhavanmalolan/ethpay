import {INFURA_KEY} from './Secrets'
exports.infura = "https://mainnet.infura.io/v3/"+INFURA_KEY;
exports.Theme = {
    text : "#203145",
    accent: "#203145",
    accentText : "#ffffff",
    bg : "#F4F8FF"
}
exports.getJsonFromUrl = function(url) {
    if(url.indexOf("?") == -1)
        return {};
    var query=url.split("?")[1];
    var result = {};
    query.split("&").forEach(function(part) {
      if(!part) return;
      part = part.split("+").join(" "); // replace every + with space, regexp-free version
      var eq = part.indexOf("=");
      var key = eq>-1 ? part.substr(0,eq) : part;
      var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
      var from = key.indexOf("[");
      if(from==-1) result[decodeURIComponent(key)] = val;
      else {
        var to = key.indexOf("]",from);
        var index = decodeURIComponent(key.substring(from+1,to));
        key = decodeURIComponent(key.substring(0,from));
        if(!result[key]) result[key] = [];
        if(!index) result[key].push(val);
        else result[key][index] = val;
      }
    });
    return result;
  }

  exports.DB = "ethinvest.db.v02";