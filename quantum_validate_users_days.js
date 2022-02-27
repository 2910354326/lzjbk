/**
 *
 * 删除过期用户环境变量并通知到该用户及管理员，需满足以下条件才会执行
 * ADD_COOKIE_USE_DAYS="true"	需手动添加环境变量，值为 “false” 或 不设置时不运行
 * user.ExpiryDate				用户的过期时间为null，不对其环境变量删除。--如需运行需要 执行一次对所有用户给与过期时间初值（quantum_add_users_days.js）
 *
**/
const moment = require('moment');

const {
    sendNotify, getUser, deleteEnvByIds, syncEnv, getEnvs
} = require('./quantum');


let ADD_COOKIE_USE_DAYS = process.env.ADD_COOKIE_USE_DAYS || "false";

var message = "你的使用期限已到期，以下账号以被删除，请联系管理员续期。";

!(async () => {

    if (ADD_COOKIE_USE_DAYS != "true") {
        console.log("ADD_COOKIE_USE_DAYS值不合规，不执行删除过期用户环境变量");
        return
    }

    console.log("获取所有用户信息");
    var users = await getUser();
    users = users.Data;

    console.log(`获取${users.length}个，开始检索到期用户：`);
    var users_id = [];
    currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    for (var i = 0; i < users.length; i++) {
        if (users[i].ExpiryDate == null) {
            continue;
        }

        if (users[i].ExpiryDate < currentTime) {
            users_id.push(users[i].Id);
        }
    }
    console.log(`检索到到期用户${users_id.length}个`);

    if (users_id.length == 0) {
        console.log("没有检索到过期用户。");
        return
    }

    var ts = [];
    var env_ids = [];
    for (var i = 0; i < users_id.length; i++) {
        console.log(`开始检索 ${users_id[i]} 的环境变量`);
        var envs = await getEnvs("JD_COOKIE", "pt_key", 2, users_id[i]);
        if (envs.length > 0) {
            for (var j = 0; j < envs.length; j++) {
                env_ids.push(envs[j].Id);
                if (ts.length > 0 && ts.filter((t) => t.UserId === envs[j].UserId).length > 0) {
                    ts.filter((t) => t.UserId === envs[j].UserId)[0].List.push(envs[j].UserRemark)
                } else {
                    ts.push({
                        UserId: envs[j].UserId,
                        List: [envs[j].UserRemark]
                    });
                }
            }
            console.log(`过期用户 ${users_id[i]} 检索到 ${envs.length} 个环境变量`);
        } else {
            console.log(`用户 ${users_id[i]} 没有检索到环境变量`);
        }
    }

    if (env_ids.length > 0) {
        console.log(`过期环境变量共 ${env_ids.length} 个，开始删除`);
        var body1 = await deleteEnvByIds(env_ids);
        console.log("删除过期用户环境变量结果：" + JSON.stringify(body1));
        var body2 = await syncEnv();
        console.log("单向同步到青龙结果：" + JSON.stringify(body2));
        sendNotify(`过期用户：${users_id.length} 个，共删除过期用户环境变量：${env_ids.length} 个。`, true);
        console.log("开始给韭菜发通知了。");
        if (ts.length > 0) {
            for (var i = 0; i < ts.length; i++) {
                await sendNotify(message + "\n" + ts[i].List.join(","), false, ts[i].UserId);
            }
        }
    } else {
        console.log(`过期的用户没有账号。`);
        //await sendNotify("过期的用户没有账号。", true);
    }

})();








