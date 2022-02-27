const {
    sendNotify, getUserInfo, getEnvs
} = require('./quantum');


!(async () => {
    var user = await getUserInfo();
    var cks = await getEnvs("JD_COOKIE", "pt_key", 2, user.Id)
    if (cks.length > 0) {
        await sendNotify(`qt8ic${user.Id}`);
    } else {
        await sendNotify(`你没有提交账号，所以无法获取你的邀请码！请先登录账号！`);
    }
})();



