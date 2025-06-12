// 在浏览器控制台中运行此脚本来添加示例球员
// 确保应用正在运行并且页面已加载

const samplePlayers = {
  home: [
    { name: '张伟', number: 23, position: '中锋' },
    { name: '李强', number: 24, position: '前锋' },
    { name: '王磊', number: 10, position: '后卫' },
    { name: '刘军', number: 8, position: '前锋' },
    { name: '陈明', number: 5, position: '后卫' },
  ],
  away: [
    { name: '赵敏', number: 12, position: '中锋' },
    { name: '孙杰', number: 15, position: '前锋' },
    { name: '周涛', number: 7, position: '后卫' },
    { name: '吴斌', number: 9, position: '前锋' },
    { name: '郑华', number: 3, position: '后卫' },
  ]
};

console.log('示例球员数据：');
console.log('主队球员：', samplePlayers.home);
console.log('客队球员：', samplePlayers.away);
console.log('\n使用方法：');
console.log('1. 在计分板页面点击对应队伍的 "+球员" 按钮');
console.log('2. 在弹出的表单中填入上述球员信息');
console.log('3. 重复步骤添加所有球员');
console.log('\n或者，您可以直接点击计分板上的得分按钮来为球员添加得分！'); 