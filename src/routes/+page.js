/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  const userId = url.searchParams.get("user_id") || "guest";
  const API_BASE = "http://localhost:3000";

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
    return {
      config: {
        pairs: [
          {
            id: "usdt_vnd",
            name: "USDT на донги",
            from: "USDT",
            to: "VND",
            rate: 25000,
            min: 100,
          },
          {
            id: "vnd_usdt",
            name: "Донги на USDT",
            from: "VND",
            to: "USDT",
            rate: 0.00004,
            min: 2500000,
          },
        ],
        paymentMethods: ["Наличные", "Перевод с банка"],
        deliveryMethods: ["Курьером", "Переводом на счет", "По АТМ"],
        referral: { enabled: true, bonusAmount: 50000, isFirstOrder: true },
      },
      role: url.searchParams.get("role") || "user",
      userId: userId,
      apiBase: API_BASE,
    };
  }
}
