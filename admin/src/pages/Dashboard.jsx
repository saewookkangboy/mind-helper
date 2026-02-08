import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Card, Title, Text, DonutChart, BarChart, Metric } from '@tremor/react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    totalLogs: 0,
    satisfactionRate: 0,
    topKeywords: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 총 사용자 수
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // 오늘 가입한 사용자
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUsersSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('created_at', '>=', today)
        )
      );
      const todayUsers = todayUsersSnapshot.size;

      // 총 로그 수
      const logsSnapshot = await getDocs(collection(db, 'saju_logs'));
      const totalLogs = logsSnapshot.size;

      // 만족도 계산
      const positiveLogs = await getDocs(
        query(
          collection(db, 'saju_logs'),
          where('user_feedback', '==', 'positive')
        )
      );
      const negativeLogs = await getDocs(
        query(
          collection(db, 'saju_logs'),
          where('user_feedback', '==', 'negative')
        )
      );
      const totalFeedback = positiveLogs.size + negativeLogs.size;
      const satisfactionRate = totalFeedback > 0
        ? Math.round((positiveLogs.size / totalFeedback) * 100)
        : 0;

      // 인기 키워드
      const topKeywords = await getTopKeywords();

      setStats({
        totalUsers,
        todayUsers,
        totalLogs,
        satisfactionRate,
        topKeywords,
      });
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopKeywords = async () => {
    try {
      const logsSnapshot = await getDocs(
        query(
          collection(db, 'saju_logs'),
          orderBy('timestamp', 'desc'),
          limit(100)
        )
      );

      const keywordCount = {};
      logsSnapshot.forEach(doc => {
        const query = doc.data().user_query || '';
        const words = query.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 2) {
            keywordCount[word] = (keywordCount[word] || 0) + 1;
          }
        });
      });

      return Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));
    } catch (error) {
      console.error('키워드 분석 실패:', error);
      return [];
    }
  };

  const satisfactionData = [
    { name: '긍정', value: stats.satisfactionRate },
    { name: '부정', value: 100 - stats.satisfactionRate },
  ];

  const keywordData = stats.topKeywords.map(k => ({
    name: k.keyword,
    value: k.count,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Control Tower</h1>

        {/* 실시간 메트릭 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <Text className="text-gray-400">총 사용자</Text>
            <Metric className="text-white">{stats.totalUsers.toLocaleString()}</Metric>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <Text className="text-gray-400">금일 가입자</Text>
            <Metric className="text-white">{stats.todayUsers.toLocaleString()}</Metric>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <Text className="text-gray-400">총 상담 로그</Text>
            <Metric className="text-white">{stats.totalLogs.toLocaleString()}</Metric>
          </Card>
        </div>

        {/* 만족도 차트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <Title className="text-white mb-4">AI 응답 만족도</Title>
            <DonutChart
              data={satisfactionData}
              category="value"
              index="name"
              colors={['green', 'red']}
              valueFormatter={(value) => `${value}%`}
            />
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <Title className="text-white mb-4">인기 키워드 Top 10</Title>
            <BarChart
              data={keywordData}
              index="name"
              categories={['value']}
              colors={['blue']}
              yAxisWidth={48}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
