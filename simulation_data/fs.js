const fs = require("fs");

const data = {
    code: 1,
    message: "success"
};

const radomStr = _ => {
    const str = (Math.floor(Math.random() * 255)).toString(16);
    return str.length === 2 ? str : `0${str}`;
}

let arr = [], n = 1, m = 1;
for(var i = 0; i < 512; i++){
    if(i % 64 === 0 && i !== 0){
        n++;
        m = 1;
    }
    arr.push({
        "port_id": n,
        "onu_id": m,
        "onu_name": `ONU0${n}/${m}`,
        "macaddr": `38:3a:21:${radomStr()}:${radomStr()}:${radomStr()}`,
        "status": (Math.random() * 10) > 8 ? "Offline" : 'Online',
        "auth_state": 1,
        "register_time": "2019/03/04 12:29:54",
        "last_down_time":"2000/04/06 22:39:24",
        "last_down_reason":"Power Down"
    });
    m++;
}

data.data = arr;

fs.writeFileSync('onuAllowAll.json', JSON.stringify(data), 'utf-8');
