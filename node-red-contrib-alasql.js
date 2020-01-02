module.exports = function (RED) {
    var alasql = require('alasql');

    function AlasqlNodeIn(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.query = config.query;
        node.on("input", function (msg) {
            var sql = this.query || msg.query || msg.topic || 'SELECT * FROM ?';
            var bind = Array.isArray(msg.payload) ? msg.payload : [msg.payload];
            alasql.promise(sql, bind)
                .then(function (res) {
                    msg.payload = res;
                    node.status({fill: "green", shape: "dot", text: ' Records: ' + msg.payload.length});
                    node.send(msg);
                }).catch((err) => {
                node.error(err, msg);
            });
        });
        this.on('close', () => {
            node.status({});
        });
    }

    RED.nodes.registerType("alasql", AlasqlNodeIn);
};
