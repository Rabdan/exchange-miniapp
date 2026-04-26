/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  const userId = url.searchParams.get("user_id") || "guest";

  // Пытаемся взять URL из заголовка или параметров (для гибкости)
  // В Vercel лучше всего прописать PUBLIC_API_URL в Environment Variables
  const API_BASE = "https://ваша-админка-на-vps.com"; // Замените на реальный адрес VPS

  try {
    const response = await fetch(`${API_BASE}/api/config?user_id=${userId}`);
    if (!response.ok) throw new Error();
    const config = await response.json();

    return {
      config,
      role: url.searchParams.get("role") || "user",
      userId: userId,
      apiBase: API_BASE,
    };
  } catch (err) {
    console.error("API Error, using fallbacks");
    return {
      config: {
        cities: ["Нячанг (Заглушка)"],
        currencies: [{ id: "usdt", name: "USDT", rate: 25000, symbol: "₮" }],
        methods: ["Наличные"],
        referral: { enabled: true, bonusAmount: 50000, isFirstOrder: true },
      },
      role: url.searchParams.get("role") || "user",
      userId: userId,
      apiBase: API_BASE,
    };
  }
}
