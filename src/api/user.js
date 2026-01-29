

import request from './request';





export function getUserInfo() {

    return request({

        url: '/user/info',

        method: 'get'

    });

}





export function getIpLocationInfo() {

    return request({

        url: 'https://myip.ipip.net/json',

        method: 'get',

        baseURL: '',
        
        // 显式移除 Authorization 头，防止触发第三方 API 的 CORS 报错
        headers: {
            Authorization: ''
        },
        
        // 也可以尝试配置 skipTokenCheck: true (取决于 request.js 封装逻辑，但上面的 headers 覆盖最保险)
    });

}





export function redeemGiftCard(giftcard) {

    return request({

        url: '/user/redeemgiftcard',

        method: 'post',

        data: { giftcard }

    });

}





export function changePassword(data) {

    return request({

        url: '/user/changePassword',

        method: 'post',

        data

    });

}





export function resetSecurity() {

    return request({

        url: '/user/resetSecurity',

        method: 'get'

    });

}





export function updateRemindSettings(data) {

    return request({

        url: '/user/update',

        method: 'post',

        data

    });

}





export function getActiveSession() {

    return request({

        url: '/user/getActiveSession',

        method: 'get'

    });

}





export function getCommConfig() {

    return request({

        url: '/user/comm/config',

        method: 'get'

    });

}





export function getTelegramBotInfo() {

    return request({

        url: '/user/telegram/getBotInfo',

        method: 'get'

    });

}





export function getUserSubscribe() {

    return request({

        url: '/user/getSubscribe',

        method: 'get'

    });

}
