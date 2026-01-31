/**
 * 砍一刀活动 (PDD) 外挂配置文件
 * 修改后保存并刷新浏览器即可生效，无需重新编译
 */
window.PDD_CONFIG = {
    // 活动开关
    enabled: true,

    // 目标砍价刀数 (即邀请人数)
    targetCount: 10,

    // 有效天数限制 (只有最近 X 天内注册的好友才算数)
    validDays: 3,

    // 循环周期 (领完奖后多少天可以再次参与，设为 0 则终身只能参加一次)
    repeatCycle: 30,

    // 达标后发放的优惠码
    couponCode: 'HAPPY50',

    // 弹窗大标题
    title: '助力砍价赢折扣',

    // 弹窗子标题 ({target} 会被自动替换为上面的目标刀数)
    subtitle: '仅需完成 <strong>{target}</strong> 刀，即可领取 5 折优惠券！',

    // 按钮文案
    buttonText: '邀请好友助力',

    // 底部小字提示
    footerTip: '每邀请一位好友注册（3天内），进度 +1'
};
