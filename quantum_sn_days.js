// 生成卡密

const {
    sendNotify, uuid, addCustomData, getCustomDataTitle, addCustomDataTitle
} = require('./quantum');


//一个序列号多少个积分
let sn_days = process.env.sn_days;

//一次生成多少个序列号
let sn_count = process.env.sn_count;

var custom_data_type = "quantum_sn_days"

!(async () => {
    /**
     *
     * 自定义数据 type: quantum_sn_days
     * Data1 序列号
     * Data2 积分
     * Data3 是否使用
     * Data4 被谁使用.用户id
     *
     **/


    if (sn_days && sn_count) {
        if (sn_count * 1 < 1) {
            await sendNotify("卡密积分必须大于0")
            return;
        }
        var sns = [];
        for (var i = 0; i < sn_count; i++) {
            var sss = "QTSD" + uuid(22, 16)
            sns.push({
                Type: custom_data_type,
                Data1: sss,
                Data2: sn_days,
                Data3: "否"
            });
            console.log(sss);
        }
        try {
            var dataTitleInfo = await getCustomDataTitle(custom_data_type);
            if (!dataTitleInfo) {
                await addCustomDataTitle(new {
                    Type: custom_data_type,
                    TypeName: "天数卡密",
                    Title1: "卡密",
                    Title2: "天数",
                    Title3: "是否使用"
                })
            }
        } catch (e) { }

        result = await addCustomData(sns);
        if (result.Code == 200) {
            var tt = `[CQ:face,id=66]创建 ${sn_count} 个卡密，每个 ${sn_days} 天`;
            for (var i = 0; i < result.Data.length; i++) {
                tt += "\n" + result.Data[i].Data1;
                if (i + 1 % 30 == 0) {
                    await sendNotify(tt);
                    tt = "";
                }
            }
            await sendNotify(tt);
        } else {
            await sendNotify("创建卡密失败：" + result.Message);
        }
    } else if (sn_count) {
        if (sn_count * 1 < 1) {
            await sendNotify("卡密个数必须大于0")
            return;
        }
        await sendNotify("请回复每个卡密多少天数：")
    } else {
        await sendNotify("请回复生成卡密个数：")
    }
})();
