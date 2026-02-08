#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
만세력 기반 사주(四柱) 계산 — KST 기준, 양력/음력·만자시 정교화
korean-lunar-calendar(KARI 음력 데이터) 사용. 모든 사주 산출은 KST(한국 표준시) 기준으로 합니다.

- 양력: 입력 일시를 지정 타임존으로 해석 후 KST로 변환하여 사용
- 음력: KST 기준 양력 일자로 setSolarDate 후 음력 연·월·일 간지 산출
- 만자시(晚子時): 00:00~00:59 KST는 전일(前日) 일주(日柱) + 자시(子時)로 처리

사용법: python saju_manseryeok.py YYYY-MM-DD HH:MM [TIMEZONE]
  TIMEZONE 기본값: Asia/Seoul (KST)
출력: JSON (stdout)
"""

import sys
import json
from datetime import datetime, timedelta

# 천간(天干) · 지지(地支) 한글
CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']

# 오행 (천간/지지 → 오행)
OHENG_MAP = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토',
    '경': '금', '신': '금', '임': '수', '계': '수',
    '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
    '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수',
}

KST_ZONE = 'Asia/Seoul'


def get_tz():
    """ZoneInfo 사용 (Python 3.9+). 없으면 None."""
    try:
        from zoneinfo import ZoneInfo
        return ZoneInfo
    except ImportError:
        try:
            import pytz
            return lambda z: pytz.timezone(z)
        except ImportError:
            return None


def to_kst_naive(dt_local):
    """timezone-aware datetime을 KST로 변환 후 naive datetime 반환 (KST 기준 시각)."""
    tz_factory = get_tz()
    if tz_factory is None:
        return dt_local
    kst = tz_factory(KST_ZONE)
    if dt_local.tzinfo is None:
        # naive면 입력을 KST로 간주
        return dt_local.replace(tzinfo=kst).astimezone(kst).replace(tzinfo=None)
    return dt_local.astimezone(kst).replace(tzinfo=None)


def parse_birth_to_kst(birth_date_str, birth_time_str, timezone_str):
    """
    생년월일·시를 지정 타임존으로 해석한 뒤 KST(naive)로 변환.
    만자시(0시대)일 경우 일주용 날짜는 전일로, 시주는 자시(0)로 사용.
    Returns: (date_for_calendar, hour_for_siju, kst_datetime_str)
    """
    try:
        y, m, d = map(int, birth_date_str.strip().split('-'))
    except Exception:
        return None, None, 'parse_error'

    time_part = birth_time_str.strip().split(':')
    hour = int(time_part[0]) if time_part else 0
    minute = int(time_part[1]) if len(time_part) > 1 else 0
    second = int(time_part[2]) if len(time_part) > 2 else 0
    hour = max(0, min(23, hour))

    tz_factory = get_tz()
    if tz_factory:
        tz = tz_factory(timezone_str)
        dt_input = datetime(y, m, d, hour, minute, second, tzinfo=tz)
        dt_kst = to_kst_naive(dt_input)
    else:
        # zoneinfo/pytz 없으면 입력을 KST로 간주
        dt_kst = datetime(y, m, d, hour, minute, second)

    kst_date = dt_kst.date()
    kst_hour = dt_kst.hour

    # 만자시(晚子時): 00:00~00:59 KST → 전일 일주 + 자시
    if 0 <= kst_hour < 1:
        date_for_calendar = kst_date - timedelta(days=1)
        hour_for_siju = 0  # 子時
    else:
        date_for_calendar = kst_date
        hour_for_siju = kst_hour

    kst_str = dt_kst.strftime('%Y-%m-%d %H:%M:%S') + ' KST'
    return date_for_calendar, hour_for_siju, kst_str


def get_hour_ji_index(hour_24):
    """24시간을 시지(時支) 인덱스로 변환. 자시=23~01, 축시=01~03, ..."""
    if hour_24 == 0:
        return 0  # 0시 = 자시(子時)
    h = hour_24
    if 1 <= h < 3:
        return 1
    if 3 <= h < 5:
        return 2
    if 5 <= h < 7:
        return 3
    if 7 <= h < 9:
        return 4
    if 9 <= h < 11:
        return 5
    if 11 <= h < 13:
        return 6
    if 13 <= h < 15:
        return 7
    if 15 <= h < 17:
        return 8
    if 17 <= h < 19:
        return 9
    if 19 <= h < 21:
        return 10
    if 21 <= h < 23:
        return 11
    return 0  # 23시 = 자시


def compute_hour_pillar(day_gan_index, hour_24):
    """일간(日干)과 24시간으로 시주(時柱) 계산. 甲己日 甲子時, 乙庚日 丙子時, ..."""
    ji_index = get_hour_ji_index(hour_24)
    zi_gan_index = (day_gan_index % 5) * 2
    gan_index = (zi_gan_index + ji_index) % 10
    return {'gan': CHEONGAN[gan_index], 'ji': JIJI[ji_index]}


def parse_gapja_string(gapja_str):
    """getGapJaString() 결과 '갑자년 을축월 병인일' 파싱 → 연·월·일 주"""
    parts = gapja_str.strip().split()
    result = []
    for part in parts:
        if part in ('년', '월', '일') or part.startswith('('):
            continue
        if len(part) >= 2 and part[0] in CHEONGAN and part[1] in JIJI:
            result.append({'gan': part[0], 'ji': part[1]})
    if len(result) >= 3:
        return {'year': result[0], 'month': result[1], 'day': result[2]}
    return None


def calculate_saju(birth_date_str, birth_time_str, timezone_str='Asia/Seoul'):
    """
    생년월일시를 KST 기준으로 해석해 만세력 사주 계산.
    - timezone_str: 입력 일시의 타임존(IANA, 예: Asia/Seoul, UTC). 기본값 KST.
    """
    try:
        from korean_lunar_calendar import KoreanLunarCalendar
    except ImportError:
        return {'error': 'korean_lunar_calendar 패키지가 필요합니다. pip install korean-lunar-calendar'}

    date_for_calendar, hour_for_siju, kst_datetime_str = parse_birth_to_kst(
        birth_date_str, birth_time_str, timezone_str
    )
    if date_for_calendar is None:
        return {'error': '생년월일 형식: YYYY-MM-DD'}
    if kst_datetime_str == 'parse_error':
        return {'error': '생년월일 형식: YYYY-MM-DD'}

    y = date_for_calendar.year
    m = date_for_calendar.month
    d = date_for_calendar.day

    cal = KoreanLunarCalendar()
    if not cal.setSolarDate(y, m, d):
        return {'error': f'지원하지 않는 날짜입니다: {birth_date_str} (1000-02-13 ~ 2050-12-31)'}

    gapja_str = cal.getGapJaString()
    parsed = parse_gapja_string(gapja_str)
    if not parsed:
        return {'error': '만세력 간지 파싱 실패'}

    day_gan = parsed['day']['gan']
    day_gan_index = CHEONGAN.index(day_gan)
    hour_pillar = compute_hour_pillar(day_gan_index, hour_for_siju)

    year = parsed['year']
    month = parsed['month']
    day = parsed['day']
    hour = hour_pillar

    oheng = {
        'year': OHENG_MAP.get(year['gan'], ''),
        'month': OHENG_MAP.get(month['gan'], ''),
        'day': OHENG_MAP.get(day['gan'], ''),
        'hour': OHENG_MAP.get(hour['gan'], ''),
    }

    return {
        'year': year,
        'month': month,
        'day': day,
        'hour': hour,
        'oheng': oheng,
        'kstBirth': kst_datetime_str,
        'solarDateUsed': f'{y:04d}-{m:02d}-{d:02d}',
        'hourUsedForSiju': hour_for_siju,
    }


def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            'error': '사용법: python saju_manseryeok.py YYYY-MM-DD HH:MM [TIMEZONE]',
            'timezone_default': KST_ZONE,
        }, ensure_ascii=False))
        sys.exit(1)

    birth_date = sys.argv[1]
    birth_time = sys.argv[2]
    timezone_str = sys.argv[3] if len(sys.argv) > 3 else 'Asia/Seoul'

    result = calculate_saju(birth_date, birth_time, timezone_str)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
