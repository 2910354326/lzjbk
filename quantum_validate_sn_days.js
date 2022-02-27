const {
    sendNotify, getCustomData, getUserInfo, updateUserInfo, updateCustomData
} = require('./quantum');

const moment = require('moment');

//用户提交的序列号
let sn = process.env.quantum_validate_sn_days;


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
    if (!sn || sn.length != 26) {
        await sendNotify("错误的卡密。");
        return;
    }

    console.log("获取所有的卡密信息");
    var datas = await getCustomData("quantum_sn_days");

    var ts = datas.filter((t) => t.Data1 == sn);
    if (ts.length == 0) {
        console.log("您的卡密错误：" + sn);
        await sendNotify("您的卡密错误。")
        return;
    }

    if (ts[0].Data3 == "1" || ts[0].Data3 == "是") {
        console.log("该卡密已经使用过了：" + sn);
        await sendNotify("该卡密已经使用过了！")
        return;
    }
    
    var user = await getUserInfo();
    if (user) {
	    var ed = user.ExpiryDate;
	    var now = moment().format('YYYY-MM-DD HH:mm:ss');
	    if (ed == null || ed <= now){
		    user.ExpiryDate = moment().add(parseInt(ts[0].Data2), 'day').format('YYYY-MM-DD HH:mm:ss');
	    } else {
		    user.ExpiryDate = moment(Date.parse(ed)).add(parseInt(ts[0].Data2), 'day').format('YYYY-MM-DD HH:mm:ss');
	    }
    } else {
        console.log("获取用户信息失败了：" + JSON.stringify(user));
    }
    
    var updateInfo = await updateUserInfo(user);
    if (updateInfo) {
        ts[0].Data3 = "是"
        ts[0].Data4 = user.Id
        var updateSNInfo = await updateCustomData(ts[0]);
        console.log("更新卡密状态：" + updateSNInfo.Code);
        await sendNotify("提交卡密成功，到期时间：" + user.ExpiryDate);
    } else {
        console.log("更新用户信息失败了！");
        await sendNotify("更新剩余积分失败！");
    }
})();
