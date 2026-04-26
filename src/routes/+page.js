/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  const userId = url.searchParams.get("user_id") || "guest";

  // В продакшене тут будет полный URL админки (VPS)
  const API_BASE = "http://localhost:5173";

  try {
    const response = await fetch(`${API_BASE}/api/config?user_id=${userId}`);
    const config = await response.json();

    return {
      config,
      role: url.searchParams.get("role") || "user",
      userId: userId,
    };
  } catch (err) {
    return {
      config: {
        cities: ["Нячанг (оффлайн)"],
        currencies: [{ id: "usdt", name: "USDT", rate: 25000, symbol: "₮" }],
        methods: ["Наличные"],
        referral: { enabled: false },
      },
      role: "user",
      userId: userId,
    };
  }
}
