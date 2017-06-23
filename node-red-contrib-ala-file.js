/**
	Double backslash for Windows paths
	@param path {string} String with path 
	@return {string} Modified path
	@example
		\Program Files\Mysoft => \\Program Files\\Mysoft
*/
function doubleb(path) {
	return path.replace(/\\/g,'\\\\')
}


module.exports = function(RED) {
	var alasql = require('alasql');

	function AlaFileNodeOut(config) {
		RED.nodes.createNode(this,config);
        var node = this;
        node.filename = config.filename;
        node.format = config.format;
        node.columns = config.columns;
        node.headers = config.headers;
		node.on("input", function(msg) {
            var filename = node.filename || msg.filename || "";
            if (filename !== "") {
                node.status({fill:"grey",shape:"dot",text:filename});
            }
            if (filename === "") {
                node.warn(RED._("file.errors.nofilename"));
				node.status({fill:"red",shape:"ring",text:"No filename in node config or msg.filename!"});
            }
            else if (msg.hasOwnProperty("payload") && (typeof msg.payload !== "undefined")) {
				var sql = 'SELECT '+this.columns
						+' INTO '+this.format+'("'+doubleb(filename)
						+'",{headers:'+this.headers+'}) FROM ?';
				var bind = Array.isArray(msg.payload) ? [msg.payload] : [[msg.payload]];
				alasql.promise(sql, bind)
					.then(function(res){
						msg.payload = res;
						node.send(msg);
					}).catch(function(err){
						node.error(err,msg);
					});
			}
			else {
				node.status({fill:"red",shape:"ring",text:"No msg.payload defined with data to output!"});
			}
		});
        this.on('close', function() {
            node.status({});
        });
	}
	RED.nodes.registerType("ala-file out",AlaFileNodeOut);

	function AlaFileNode(config) {
		RED.nodes.createNode(this,config);
        var node = this;
        node.filename = config.filename;
        node.format = config.format;
        node.columns = config.columns;
        node.headers = config.headers;
		node.on("input", function(msg) {
            var filename = node.filename || msg.filename || "";
            if (filename !== "") {
                node.status({fill:"grey",shape:"dot",text:filename});
            }
            if (filename === "") {
                node.warn(RED._("file.errors.nofilename"));
				node.status({fill:"red",shape:"ring",text:"No filename in node config or msg.filename!"});
            }
            else if (msg.hasOwnProperty("payload") && (typeof msg.payload !== "undefined")) {
				var sql = 'SELECT '+this.columns
						+' FROM '+this.format+'("'+doubleb(filename)+'.'+this.format
						+'",{headers:'+this.headers+'})';
				var bind = Array.isArray(msg.payload) ? [msg.payload] : [[msg.payload]];
				alasql.promise(sql, bind)
					.then(function(res){
						msg.payload = res;
						node.send(msg);
					}).catch(function(err){
						node.error(err,msg);
					});
			}
		});
        this.on('close', function() {
            node.status({});
        });
	}
	RED.nodes.registerType("ala-file in",AlaFileNode);
}
