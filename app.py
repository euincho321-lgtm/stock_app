
# -*- coding: utf-8 -*-
import os
import pandas as pd
import streamlit as st
import yfinance as yf
import feedparser
from urllib.parse import quote
from google import genai

st.set_page_config(page_title="Stock Helper", layout="centered")
st.title("📈 Stock Helper")

def get_google_news(query: str, limit: int = 5):
    encoded_query = quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=ko&gl=KR&ceid=KR:ko"
    feed = feedparser.parse(url)

    results = []
    for entry in feed.entries[:limit]:
        results.append({
            "title": entry.get("title", "제목 없음"),
            "link": entry.get("link", ""),
            "publisher": entry.get("source", {}).get("title", "출처 없음") if hasattr(entry, "get") else "출처 없음"
        })
    return results

def get_benchmark_and_sector_etf(ticker: str, sector: str):

    market_ticker = "SPY"
    sector_ticker = "XLK"

    if ticker.endswith(".KS") or ticker.endswith(".KQ"):
        market_ticker = "^KS11"
        sector_ticker = "^KS11"

    sector_map = {
        "Technology": "XLK",
        "Financial Services": "XLF",
        "Healthcare": "XLV",
        "Consumer Cyclical": "XLY",
        "Consumer Defensive": "XLP",
        "Energy": "XLE",
        "Industrials": "XLI",
        "Communication Services": "XLC",
        "Utilities": "XLU",
        "Real Estate": "XLRE",
        "Basic Materials": "XLB",
    }

    if sector in sector_map:
        sector_ticker = sector_map[sector]

    return market_ticker, sector_ticker

ticker = st.text_input(
    "티커 입력 (예: AAPL, TSLA, NVDA, 005930.KS)",
    value="AAPL"
).strip().upper()

compare_tickers = st.text_input(
    "비교 종목 입력 (쉼표로 구분, 예: AAPL, TSLA, NVDA)",
    value="AAPL, TSLA, NVDA"
)
period_option = st.selectbox(
    "분석 기간 선택",
    ["1mo", "3mo", "6mo", "1y"],
    index=1
)

if ticker:
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key) if api_key else None
    t = yf.Ticker(ticker)
    
    info = t.info if hasattr(t, "info") else {}

    def safe_number(value, multiply_100=False):
        if value is None:
            return None
        try:
            value = float(value)
            if multiply_100:
                value *= 100
            return value
        except Exception:
            return None

    company_name = info.get("longName", ticker)
    sector = info.get("sector", "정보 없음")
    per = safe_number(info.get("trailingPE"))
    pbr = safe_number(info.get("priceToBook"))
    roe = safe_number(info.get("returnOnEquity"), multiply_100=True)
    market_cap = safe_number(info.get("marketCap"))
    hist = t.history(period="6mo")

    if hist.empty:
        st.error("데이터가 비어있어. 티커가 맞는지 확인해줘. (한국: 005930.KS)")
        st.stop()

    close = hist["Close"].copy()

    latest = float(close.iloc[-1])
    prev = float(close.iloc[-2]) if len(close) >= 2 else latest
    change_pct = (latest / prev - 1) * 100 if prev else 0.0

    st.metric("현재가(종가)", f"{latest:,.2f}", f"{change_pct:+.2f}%")
    
    st.subheader("🧾 기본 재무 지표")

    f1, f2, f3, f4 = st.columns(4)
    f1.metric("PER", f"{per:.2f}" if per is not None else "N/A")
    f2.metric("PBR", f"{pbr:.2f}" if pbr is not None else "N/A")
    f3.metric("ROE", f"{roe:.2f}%" if roe is not None else "N/A")

    if market_cap is not None:
        market_cap_text = f"{market_cap:,.0f}"
    else:
        market_cap_text = "N/A"

    f4.metric("시가총액", market_cap_text)

    st.caption(f"기업명: {company_name} | 업종: {sector}")
    # 이동평균선
    hist["MA5"] = close.rolling(5).mean()
    hist["MA20"] = close.rolling(20).mean()

    st.subheader("📊 가격 + 이동평균선")

    import plotly.graph_objects as go

    fig = go.Figure()

    fig.add_trace(go.Candlestick(
        x=hist.index,
        open=hist["Open"],
        high=hist["High"],
        low=hist["Low"],
        close=hist["Close"],
        name="캔들"
    ))

    fig.add_trace(go.Scatter(
        x=hist.index,
        y=hist["MA5"],
        mode="lines",
        name="MA5"
    ))

    fig.add_trace(go.Scatter(
        x=hist.index,
        y=hist["MA20"],
        mode="lines",
        name="MA20"
    ))

    fig.update_layout(
        xaxis_title="날짜",
        yaxis_title="가격",
        xaxis_rangeslider_visible=False,
        height=600
    )

    st.plotly_chart(fig, use_container_width=True)

    # 신호 계산
    ma5 = hist["MA5"]
    ma20 = hist["MA20"]

    trend = "횡보"
    if pd.notna(ma20.iloc[-1]):
        if latest > float(ma20.iloc[-1]) * 1.01:
            trend = "상승추세"
        elif latest < float(ma20.iloc[-1]) * 0.99:
            trend = "하락추세"

    cross = "신호 없음"
    if (
        len(hist) >= 2
        and pd.notna(ma5.iloc[-1])
        and pd.notna(ma20.iloc[-1])
        and pd.notna(ma5.iloc[-2])
        and pd.notna(ma20.iloc[-2])
    ):
        prev_diff = float(ma5.iloc[-2] - ma20.iloc[-2])
        now_diff = float(ma5.iloc[-1] - ma20.iloc[-1])

        if prev_diff <= 0 and now_diff > 0:
            cross = "🟢 골든크로스 (단기 > 중기)"
        elif prev_diff >= 0 and now_diff < 0:
            cross = "🔴 데드크로스 (단기 < 중기)"

    # 변동성
    returns = close.pct_change().dropna()
    vol5 = float(returns.tail(5).std()) if len(returns) >= 5 else 0.0

    c1, c2, c3 = st.columns(3)
    c1.metric("추세", trend)
    c2.metric("크로스", cross)
    c3.metric("최근 5일 변동성", f"{vol5*100:.2f}%")

    if vol5 > 0.03:
        st.warning("⚠️ 최근 변동성이 높은 편이야. (단기 급등락 가능)")

    # 참고 지표
    st.subheader("📌 참고 지표")
    last20 = returns.tail(20)
    if len(last20) >= 5:
        st.write(f"- 최근 20일 평균 수익률: {last20.mean()*100:.2f}%")
        st.write(f"- 최근 20일 변동성(표준편차): {last20.std()*100:.2f}%")

    with st.expander("원본 데이터(최근 60개)"):
        st.dataframe(hist.tail(60))
    
    # 매수 / 매도 신호
    st.subheader("🔥 매수 / 매도 신호")

    signal_score = 0
    signal_reasons = []

    # 1. 현재가 vs MA20
    if pd.notna(ma20.iloc[-1]):
        if latest > float(ma20.iloc[-1]):
            signal_score += 1
            signal_reasons.append("현재가가 MA20 위에 있음")
        else:
            signal_score -= 1
            signal_reasons.append("현재가가 MA20 아래에 있음")

    # 2. MA5 vs MA20
    if pd.notna(ma5.iloc[-1]) and pd.notna(ma20.iloc[-1]):
        if float(ma5.iloc[-1]) > float(ma20.iloc[-1]):
            signal_score += 1
            signal_reasons.append("MA5가 MA20 위에 있음")
        else:
            signal_score -= 1
            signal_reasons.append("MA5가 MA20 아래에 있음")

    # 3. 크로스 반영
    if "골든크로스" in cross:
        signal_score += 1
        signal_reasons.append("최근 골든크로스 발생")
    elif "데드크로스" in cross:
        signal_score -= 1
        signal_reasons.append("최근 데드크로스 발생")

    # 최종 판정
    if signal_score >= 2:
        signal_text = "🟢 매수 우위"
        signal_desc = "단기 흐름이 상대적으로 강한 편이야."
    elif signal_score <= -2:
        signal_text = "🔴 매도 주의"
        signal_desc = "단기 흐름이 약해서 보수적으로 보는 구간이야."
    else:
        signal_text = "🟡 중립"
        signal_desc = "방향성이 애매해서 관망 성격이 강해."

    st.success(f"AI 신호: {signal_text}")
    st.write(signal_desc)

    st.write("판단 근거:")
    for reason in signal_reasons:
        st.write(f"- {reason}")

    st.caption("※ 이 신호는 단순 참고용 로직이며, 실제 투자 판단을 대신하지 않음")

    st.subheader("🎯 AI 투자 점수")

    ai_score = 50
    score_reasons = []

    # 기술적 분석 반영
    if signal_score >= 2:
        ai_score += 15
        score_reasons.append("기술적 흐름이 비교적 강함")
    elif signal_score <= -2:
        ai_score -= 15
        score_reasons.append("기술적 흐름이 약한 편")

    if trend == "상승추세":
        ai_score += 10
        score_reasons.append("상승추세 유지")
    elif trend == "하락추세":
        ai_score -= 10
        score_reasons.append("하락추세 구간")

    if vol5 > 0.03:
        ai_score -= 5
        score_reasons.append("단기 변동성이 높음")

    # 재무 지표 반영
    if roe is not None:
        if roe >= 15:
            ai_score += 10
            score_reasons.append("ROE가 높아 수익성이 양호")
        elif roe < 5:
            ai_score -= 10
            score_reasons.append("ROE가 낮아 수익성이 약함")

    if per is not None:
        if 5 <= per <= 25:
            ai_score += 5
            score_reasons.append("PER이 극단적이지 않음")
        elif per > 40:
            ai_score -= 5
            score_reasons.append("PER이 높아 밸류에이션 부담 가능")

    if pbr is not None:
        if 0.8 <= pbr <= 3:
            ai_score += 5
            score_reasons.append("PBR이 무난한 범위")
        elif pbr > 5:
            ai_score -= 5
            score_reasons.append("PBR이 높아 밸류 부담 가능")

    # 점수 범위 제한
    ai_score = max(0, min(100, ai_score))

    s1, s2 = st.columns([1, 2])
    s1.metric("AI Score", f"{ai_score}/100")

    if ai_score >= 70:
        score_label = "🟢 긍정적"
    elif ai_score >= 50:
        score_label = "🟡 중립"
    else:
        score_label = "🔴 보수적"

    s2.metric("판정", score_label)

    st.write("점수 반영 요인:")
    for reason in score_reasons:
        st.write(f"- {reason}")

    st.caption("※ AI 투자 점수는 기술적/재무적 요소를 단순화한 참고용 점수야.")    
    # 뉴스
    st.subheader("📰 최신 뉴스")

    if ticker.endswith(".KS") or ticker.endswith(".KQ"):
        search_query = f"{company_name} 주식"
    else:
        search_query = f"{ticker} stock"
    news = get_google_news(search_query, limit=5)

    news_text = ""
    news_summary_lines = []

    if news:
        for idx, article in enumerate(news, start=1):
            title = article.get("title", "제목 없음")
            publisher = article.get("publisher", "출처 없음")
            link = article.get("link", "")

            st.markdown(f"### {idx}. {title}")
            st.write(f"출처: {publisher}")
            if link:
                st.write(link)
            st.write("---")

            news_text += f"- {title} ({publisher})\n"
            if idx <= 3:
                news_summary_lines.append(f"- {title}")
    else:
        st.write("뉴스 없음")
        news_text = "뉴스 없음"
        news_summary_lines.append("- 뉴스 없음")

    st.subheader("📝 뉴스 참고 요약")
    for line in news_summary_lines:
        st.write(line)
    
    st.subheader("📌 뉴스 기반 빠른 해석")

    if news and len(news) > 0:
        st.write("최근 뉴스 헤드라인 기준으로 보면, 시장은 아래 이슈들을 주목하고 있을 가능성이 있어.")
        for article in news[:3]:
            st.write(f"- {article.get('title', '제목 없음')}")
    else:
        st.write("현재 참고할 뉴스가 부족해서 뉴스 기반 해석은 제한적이야.")
    st.subheader("🤖 AI 투자 분석")

    if not api_key:
        st.info("GEMINI_API_KEY가 없어서 AI 분석은 비활성화됨")
    elif st.button("AI 분석 실행"):
        with st.spinner("AI가 분석 중..."):
            try:
                prompt = f"""
너는 초보 투자자도 쉽게 이해할 수 있게 설명하는 한국어 주식 분석 AI다.
반드시 한국어로만 답하고, markdown 형식으로 가독성 좋게 정리해라.

아래 정보를 바탕으로 분석하라.

[기업 정보]
- 기업명: {company_name}
- 티커: {ticker}
- 업종: {sector}

[주가 정보]
- 현재가: {latest:.2f}
- 전일 대비: {change_pct:.2f}%
- 추세: {trend}
- 크로스: {cross}
- 최근 5일 변동성: {vol5*100:.2f}%

[재무 지표]
- PER: {per if per is not None else 'N/A'}
- PBR: {pbr if pbr is not None else 'N/A'}
- ROE: {f"{roe:.2f}%" if roe is not None else 'N/A'}
- 시가총액: {market_cap_text}

[뉴스 참고]
{news_text}

아래 형식으로 답하라.

## 1. 한줄 요약
한 문장으로 핵심 정리

## 2. 재무 관점
- PER 해석
- PBR 해석
- ROE 해석
- 현재 재무적으로 어떤 인상인지 간단히 설명

## 3. 기술적 관점
- 추세
- 이동평균선/크로스
- 변동성 해석

## 4. 뉴스 참고 해석
- 최근 뉴스 2~3개를 바탕으로
- 지금 주가에 어떤 기대/우려가 반영되는지 쉽게 설명

## 5. 긍정 요인 3개
불릿 포인트 3개

## 6. 부정 요인 3개
불릿 포인트 3개

## 7. 단기 관점
초보 투자자도 이해하기 쉽게 3~4문장

## 8. 체크포인트
앞으로 봐야 할 포인트 3개

## 9. 결론
- 공격적 관점 / 중립 관점 / 보수적 관점 중 어떤 느낌인지
- 마지막 줄에는 반드시 다음 문장을 넣어라:
투자 권유가 아닌 참고용 분석입니다.
"""

                response = client.models.generate_content(
                    model="gemini-3-flash-preview",
                    contents=prompt,
                )

                st.markdown(response.text)

            except Exception as e:
                st.error(f"AI 분석 중 오류 발생: {e}")

st.subheader("📈 기간별 시장/산업 비교 분석")

market_ticker, sector_ticker = get_benchmark_and_sector_etf(ticker, sector)

compare_targets = {
    "내 종목": ticker,
    "시장": market_ticker,
    "산업": sector_ticker,
}

benchmark_data = pd.DataFrame()

for label, tk in compare_targets.items():
    try:
        df_bm = yf.Ticker(tk).history(period=period_option)
        if not df_bm.empty:
            benchmark_data[label] = df_bm["Close"]
    except Exception:
        pass

if not benchmark_data.empty and len(benchmark_data.columns) >= 2:

    normalized_bm = benchmark_data / benchmark_data.iloc[0] * 100

    st.write("기준값 100으로 맞춘 성과 비교")
    st.line_chart(normalized_bm)

    perf_bm = ((benchmark_data.iloc[-1] / benchmark_data.iloc[0]) - 1) * 100

    b1, b2, b3 = st.columns(3)

    my_perf = perf_bm.get("내 종목", None)
    market_perf = perf_bm.get("시장", None)
    sector_perf = perf_bm.get("산업", None)

    b1.metric("내 종목 수익률", f"{my_perf:.2f}%" if my_perf else "N/A")
    b2.metric("시장 수익률", f"{market_perf:.2f}%" if market_perf else "N/A")
    b3.metric("산업 수익률", f"{sector_perf:.2f}%" if sector_perf else "N/A")

    st.subheader("🧠 비교 해석")

    if my_perf and market_perf:
        if my_perf > market_perf:
            st.write("이 종목은 시장보다 강한 흐름을 보였어.")
        else:
            st.write("이 종목은 시장보다 약한 흐름을 보였어.")

    if my_perf and sector_perf:
        if my_perf > sector_perf:
            st.write("같은 산업 대비 강한 편이야.")
        else:
            st.write("같은 산업 대비 약한 편이야.")

else:
    st.warning("시장/산업 비교 데이터를 가져오지 못했어.")

    st.subheader("📊 여러 종목 비교")

    tickers_list = [x.strip().upper() for x in compare_tickers.split(",") if x.strip()]

    if len(tickers_list) >= 2:
        compare_data = pd.DataFrame()

        for tk in tickers_list:
            try:
                df_compare = yf.Ticker(tk).history(period="3mo")

                if not df_compare.empty:
                    compare_data[tk] = df_compare["Close"]
            except Exception:
                pass

        if not compare_data.empty and len(compare_data.columns) >= 2:
            # 시작값을 100으로 맞춰서 성과 비교
            normalized = compare_data / compare_data.iloc[0] * 100

            st.write("기준값 100으로 맞춘 성과 비교")
            st.line_chart(normalized)

            perf = ((compare_data.iloc[-1] / compare_data.iloc[0]) - 1) * 100
            perf = perf.sort_values(ascending=False)

            st.subheader("🏆 수익률 순위")
            for name, value in perf.items():
                st.write(f"- {name}: {value:.2f}%")

            winner = perf.index[0]
            st.success(f"가장 강한 종목: {winner} ({perf.iloc[0]:.2f}%)")

        else:
            st.warning("비교 가능한 종목 데이터가 부족해.")
    else:
        st.info("비교 종목을 2개 이상 입력해줘.")

    