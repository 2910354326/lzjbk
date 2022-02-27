const moment = require('moment');

const {
    sendNotify, getUser, updateUserInfo
} = require('./quantum');

let user_name = process.env.user_name;
let time = process.env.point_in_time;

!(async () => {

    if (user_name && time) {
        console.log("获取所有用户信息");
        var users = await getUser();
        users = users.Data;
        console.log(`获取${users.length}个。`);
        var i;

        for (i = 0; i < users.length; i++) {
            if (user_name == users[i].qq || user_name == users[i].wxname) {
                users[i].ExpiryDate = moment(Date.parse(time)).format('YYYY-MM-DD HH:mm:ss');
                var updateInfo = await updateUserInfo(users[i]);
                if (updateInfo) {
                    console.log(`强制修改 ${user_name} 到期时间为：${users[i].ExpiryDate} 成功！`);
                    await sendNotify(`你到期时间被管理员强制修改到：${users[i].ExpiryDate}`, false, users[i].Id);
                    await sendNotify(`强制修改 ${user_name} 到期时间为：${users[i].ExpiryDate} 成功！`);
                } else {
                    console.log(`强制修改失败了！！！`);
                    await sendNotify(`强制修改失败了！！！`);
                }
                return
            }
        }
        if (i == users.length) {
            await sendNotify(`没有找到 ${user_name} 对应的账号！`);
        }
    } else if (!user_name) {
        await sendNotify(`请输入你要修改到期时间的QQ号或微信昵称：`);
    } else {
        await sendNotify(`请输入到期时间点：
例：
2022-03-28 15:04:17
注：全英文格式！`);
    }
})();



