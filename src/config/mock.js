import Mock, { Random } from "mockjs";

console.log("mock load success !");

Mock.setup({
    timeout: "200-600"
});

const _hex = () => {
    const n = Random.natural(0, 255).toString(16);
    return n.length < 2 ? "0" + n : n;
};

Random.extend({
    mac() {
        return `38:3a:21:${_hex()}:${_hex()}:${_hex()}`;
    }
});

Mock.mock("/onu_allow_list", "get", () => {
    const data = Array.from({ length: 8 }).reduce((pre, item, index) => {
        pre.push(
            ...Array.from({ length: 64 }).map((sub, idx) => ({
                port_id: index + 1,
                onu_id: idx + 1,
                onu_name: "ONU01/1",
                macaddr: Random.mac(),
                status: Random.pick([
                    "Initial",
                    "Offline",
                    "Register",
                    "Auth-Fail",
                    "Unauth",
                    "Auth Limit",
                    "Online"
                ]),
                receive_power: `-${Random.float(1, 30).toFixed(2)} dBm`,
                dev_type: Random.pick(["HGU", "SFU"]),
                auth_state: Random.pick([0, 1]),
                register_time: "2019/03/04 12:29:54",
                last_down_time: "2000/04/06 22:39:24",
                last_down_reason: "Power Down",
                parent: Random.pick([1, 2, 3, 4, 5, 6, 8, 7])
            }))
        );
        return pre;
    }, []);
    return {
        code: 1,
        message: "success",
        data
    };
});

Mock.mock(/\/onumgmt\?form=upgrade_status&port_id=\d+/, "get", ({ url }) => {
    const port_id = url.match(/(?<=port_id=)\d+/) >>> 0,
        data = Array.from({ length: Random.natural(0, 64) }).map(
            (item, index) => ({
                port_id,
                onu_id: index + 1,
                onu_name: `ONU${port_id}/${index + 1}`,
                macaddr: Random.mac(),
                status: "Wait Upgrade Queue",
                totallen: 12345,
                sendlen: Random.natural(0, 12345),
                block: 12,
                upgrade_type: "realtek"
            })
        );
    return {
        code: 1,
        message: "success",
        data
    };
});

Mock.mock(/\/ponmgmt\?form=splitter&port_id=\d+/, "get", ({ url }) => {
    const port_id = url.match(/(?<=port_id=)\d+/) >>> 0,
        data = Array.from({ length: 97 /* Random.natural(1, 8) */ }).map(
            (item, index) => ({
                port_id,
                splitter_id: index + 1,
                name: Random.word(1, 32),
                description: Random.word(0, 64),
                parent: index === 0 ? 0 : index < 33 ? 1 : 2
            })
        );
    return {
        code: 1,
        message: "success",
        data
    };
});

Mock.mock("/ponmgmt?form=splitter", "post", () => ({
    code: 1,
    message: "success"
}));
