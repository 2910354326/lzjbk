/**
 * 
 * 不赋初值默认可以被邀请
 * 为防止现有用户相互邀请刷时间，所以初始化邀请标记，使用邀请功能前手动运行一次。
 * 注意： 邀请标记 会占用用户列表的 备注(remark) 字段的内容
 * 字段值解析：
 * 默认初始化值为  0:用户id （ : 前的 0 表示不可以在被邀请
 *							：后的 用户id 表示邀请者）
 * 
**/

const {
    getUser, updateUserInfo
} = require('./quantum');

//表示不可在被邀请
let initialValue = "0:";

!(async () => {

    console.log("获取所有用户信息");
    var users = await getUser();
    users = users.Data;
    console.log(`获取${users.length}个。`);

    for (var i = 0; i < users.length; i++) {
        users[i].remark = initialValue
        var updateInfo = await updateUserInfo(users[i]);
        if (updateInfo) {
            console.log(`初始化 ${users[i].Id} 邀请标记：${users[i].remark} 成功！`);
        } else {
            console.log(`初始化 ${users[i].Id} 邀请标记：${users[i].remark} 失败了！！！`);
        }
    }
})();







