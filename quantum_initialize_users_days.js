/**
 *
 *	对所有用户的到期时间进行初始化
 *  初始化的规则：
 *  1.如果用户的ExpiryDate为 null 则在当前时间的基础上加上 QUANTUM_INITIALIZE_USERS_DAYS
 *  2.QUANTUM_INITIALIZE_USERS_DAYS 需手动设置，天数 ，默认为 31 天
 *  3.如果用户的ExpiryDate不为 null 则不对其赋初值
 *
**/
const moment = require('moment');

const {
    getUser, updateUserInfo
} = require('./quantum');

//加多少天
let days = process.env.QUANTUM_INITIALIZE_USERS_DAYS || 31;

!(async () => {

    console.log("获取所有用户信息");
    var users = await getUser();
    users = users.Data;
    console.log(`获取${users.length}个。`);

    for (var i = 0; i < users.length; i++) {

        if (!users[i].ExpiryDate) {
            users[i].ExpiryDate = moment().add(days, "day").format('YYYY-MM-DD HH:mm:ss');
            var updateInfo = await updateUserInfo(users[i]);
            if (updateInfo) {
                console.log(`用户：${users[i].Id}增加 ${days} 天成功！到期时间：${users[i].ExpiryDate}`);
            } else {
                console.log(`用户：${users[i].Id}增加 ${days} 天失败了！！！！`);
            }
        }
    }
})();
