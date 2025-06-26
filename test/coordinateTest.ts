// 测试坐标修复功能
import { geocodeAddress, extractLocationName, isValidCoordinate } from '../services/geocodingService';

// 测试函数
export const testCoordinateFixes = async () => {
  console.log('开始测试坐标修复功能...');
  
  // 测试地点名称清理
  const testCases = [
    '09:00-10:00 天安门广场',
    '北京故宫（参观）',
    '上海外滩 - 观景',
    '西湖断桥',
    '杭州西湖'
  ];
  
  console.log('\n=== 测试地点名称清理 ===');
  testCases.forEach(testCase => {
    const cleaned = extractLocationName(testCase);
    console.log(`原始: "${testCase}" -> 清理后: "${cleaned}"`);
  });
  
  // 测试坐标验证
  console.log('\n=== 测试坐标验证 ===');
  const coordTests = [
    { lng: 120.1551, lat: 30.2741, expected: true }, // 杭州
    { lng: NaN, lat: 30.2741, expected: false },
    { lng: 120.1551, lat: NaN, expected: false },
    { lng: 200, lat: 30.2741, expected: false }, // 超出范围
    { lng: 120.1551, lat: 100, expected: false }, // 超出范围
  ];
  
  coordTests.forEach(test => {
    const result = isValidCoordinate(test.lng, test.lat);
    console.log(`坐标(${test.lng}, ${test.lat}): ${result} (期望: ${test.expected}) ${result === test.expected ? '✓' : '✗'}`);
  });
  
  // 测试地理编码（注意：这会调用真实API）
  console.log('\n=== 测试地理编码 ===');
  const locations = ['杭州西湖', '北京天安门', '上海外滩'];
  
  for (const location of locations) {
    try {
      console.log(`正在获取"${location}"的坐标...`);
      const result = await geocodeAddress(location);
      if (result) {
        console.log(`✓ ${location}: (${result.longitude}, ${result.latitude}) - ${result.formattedAddress || ''}`);
      } else {
        console.log(`✗ ${location}: 获取失败`);
      }
      // 添加延迟避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ ${location}: 错误 -`, error);
    }
  }
  
  console.log('\n测试完成！');
};

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中，将测试函数添加到全局对象以便手动调用
  (window as any).testCoordinateFixes = testCoordinateFixes;
  console.log('坐标修复测试函数已加载，可以在控制台中调用 testCoordinateFixes() 运行测试');
}
