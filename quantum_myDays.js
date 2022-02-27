const {
    sendNotify, getUserInfo
} = require('./quantum');


!(async () => {
    var user = await getUserInfo();
    await sendNotify(`到期时间：${user.ExpiryDate}`);
})();