// 篮球计分器快速演示设置
// 在浏览器控制台中粘贴并运行此代码

console.log('🏀 篮球计分器演示设置开始...');

// 示例球员数据
const demoPlayers = {
  home: [
    { name: '张伟', number: 23, position: 'C' },
    { name: '李强', number: 24, position: 'PF' },
    { name: '王磊', number: 10, position: 'PG' },
    { name: '刘军', number: 8, position: 'SF' },
    { name: '陈明', number: 5, position: 'SG' },
    { name: '赵华', number: 15, position: 'C' },
    { name: '孙杰', number: 7, position: 'PF' },
    { name: '周涛', number: 12, position: 'SG' },
  ],
  away: [
    { name: '马云', number: 6, position: 'C' },
    { name: '李彦宏', number: 9, position: 'PF' },
    { name: '王兴', number: 11, position: 'PG' },
    { name: '张一鸣', number: 3, position: 'SF' },
    { name: '程维', number: 14, position: 'SG' },
    { name: '黄峥', number: 22, position: 'C' },
    { name: '张勇', number: 16, position: 'PF' },
    { name: '沈抖', number: 19, position: 'SG' },
  ]
};

console.log('📝 使用说明：');
console.log('1. 确保篮球计分器应用已打开');
console.log('2. 点击对应队伍的"+球员"按钮');
console.log('3. 使用上述球员信息填写表单');
console.log('4. 添加完球员后，您可以：');
console.log('   - 点击"开始"按钮启动12分钟倒计时');
console.log('   - 点击球员卡片上的"+1/+2/+3"按钮直接为球员得分');
console.log('   - 点击顶部快速得分按钮为队伍得分');
console.log('   - 使用各种统计按钮记录篮板、助攻等数据');

console.log('\n🏀 主队球员（' + demoPlayers.home.length + '人）：');
demoPlayers.home.forEach((player, index) => {
  console.log(`${index + 1}. #${player.number} ${player.name} (${player.position})`);
});

console.log('\n🏀 客队球员（' + demoPlayers.away.length + '人）：');
demoPlayers.away.forEach((player, index) => {
  console.log(`${index + 1}. #${player.number} ${player.name} (${player.position})`);
});

console.log('\n🎯 新功能亮点：');
console.log('✅ 球员得分直接计入队伍总分');
console.log('✅ 简化的计时器控制（单一倒计时）');
console.log('✅ 紧凑的双栏布局，支持8-10名球员');
console.log('✅ 彩色编码的统计按钮');
console.log('✅ 无滚动条的优雅界面');

console.log('\n�� 现在开始使用新的篮球计分器吧！'); 