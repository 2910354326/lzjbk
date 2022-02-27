/**
 *
 * 验证用户拉的新用户是否符合条件，如果符合条件则给邀请者增加 days 天 并通知到邀请者、被邀请者、管理员
 * 注：把 删除无效用户(deleteInvalidUser.js) 脚本禁用掉，防止数据丢失(让韭菜反薅)
 * 条件：
 * 1.邀请者需要至少绑定一个COOKIE账号
 * 2.被邀请者需要绑定至少一个COOKIE账号
 * 3.被邀请者只允许被邀请成功一次
 *
**/
const moment = require('moment');

const {
    sendNotify, getUserInfo, getEnvs, getUser, updateUserInfo
} = require('./quantum');

//增加多少天
let days = 31;

//邀请码
let invitationCode = process.env.invitationCode;


!(async () => {
    //被邀请者
    var invitee_user = await getUserInfo();

    //提取邀请码中的uid
    inviter_user_id = invitationCode.slice(5);

    if (invitee_user.Id == inviter_user_id) {
        console.log("邀请者与被邀请者的邀请码相同！");
        await sendNotify(`不可以发送自己的邀请码哦！`);
        return;
    }

    //判断uid存不存在
    console.log("获取所有用户信息");
    var users = await getUser();
    users = users.Data;
    console.log(`获取${users.length}个。`);
    var i;
    for (i = 0; i < users.length; i++) {
        if (users[i].Id == inviter_user_id) {
            break;
        }
    }
    if (i == users.length) {
        console.log("`邀请码错误！");
        await sendNotify(`邀请码错误！`);
        return;
    }


    //被邀请者需要绑定至少一个COOKIE账号
    var invitee_cks = await getEnvs("JD_COOKIE", "pt_key", 2, invitee_user.Id)
    if (invitee_cks.length == 0) {
        console.log("被邀请没有Cookies信息,结束任务。");
        await sendNotify(`你的账户没有绑定账号，所以无法接受该邀请，请你先绑定账号！`);
        return;
    }

    //邀请者需要至少绑定一个COOKIE账号
    var inviter_cks = await getEnvs("JD_COOKIE", "pt_key", 2, inviter_user_id)
    if (inviter_cks.length == 0) {
        console.log("邀请者没有Cookies信息,结束任务。");
        await sendNotify(`邀请你的用户没有绑定账号，所以无法接受该邀请，请先让对方绑定账号！`);
        return;
    }

    if (invitee_user.remark == null) {
        var ed = users[i].ExpiryDate;
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log("开始更新邀请者时间！");
        if (ed <= now) {
            users[i].ExpiryDate = moment().add(days, 'day').format('YYYY-MM-DD HH:mm:ss');
        } else {
            users[i].ExpiryDate = moment(Date.parse(ed)).add(days, 'day').format('YYYY-MM-DD HH:mm:ss');
        }
        console.log("开始更新邀请标识！");
        invitee_user.remark = `0:${inviter_user_id}`;
        var updateInfo = await updateUserInfo(invitee_user);
        if (updateInfo) {
            console.log("邀请标识更新成功！");
        } else {
            console.log(`更新失败了，请稍后再试。`);
        }
    } else {
        var ss = invitee_user.remark.slice(-1);
        console.log(`${ss}`);
        if (ss == ":") {
            console.log("不是在活动期间注册的账号！");
            await sendNotify(`你的账户不是在活动期间注册的，所有无法接受他人邀请！`);
        } else {
            console.log("已接受其他人邀请！");
            await sendNotify(`你已接受他人邀请！`);
        }
        return;
    }

    console.log("开始提交邀请者时间！");
    var updateInfo = await updateUserInfo(users[i]);
    if (updateInfo) {
        console.log("邀请者时间提交成功！开始通知用户！");
        await sendNotify(`助力成功了！！！`);
        await sendNotify(`你邀请 ${invitee_user.qq || invitee_user.wxname} 成功了。\n本次邀请增加了 ${days} 天。\n 到期时间：${users[i].ExpiryDate}`, false, users[i].Id);
        await sendNotify(`用户：${users[i].qq || users[i].wxname} 邀请 ${invitee_user.qq || invitee_user.wxname} 成功。\n 到期时间：${users[i].ExpiryDate}`, true);
    } else {
        console.log("更新用户信息失败了！");
        await sendNotify("更新到期时间失败了，请稍后在试。");
    }
})();
