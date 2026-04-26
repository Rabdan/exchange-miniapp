<script>
  /** @type {import('./$types').PageData} */
  export let data;

  const { config, role, userId } = data;
  const isManager = role === 'manager';
  const referral = config.referral;

  let city = config.cities[0];
  let currencyId = config.currencies[0].id;
  let method = config.methods[0];
  let giveAmount = '';
  let getAmount = '';
  let loading = false;
  let status = '';

  $: selectedCurrency = config.currencies.find(c => c.id === currencyId);
  $: rate = selectedCurrency ? selectedCurrency.rate : 0;

  $: if (!isManager && giveAmount && rate) {
    getAmount = Math.round(Number(giveAmount) * rate).toLocaleString();
  }

  async function handleSubmit() {
    loading = true;
    status = 'Отправка...';

    const orderData = {
      userId,
      city,
      currency: selectedCurrency.name,
      giveAmount,
      getAmount,
      method,
      isManagerCreated: isManager
    };

    try {
      const res = await fetch('http://localhost:5173/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        status = '✅ Заявка создана! Информация отправлена в бот.';
      } else {
        status = '❌ Ошибка. Попробуйте снова.';
      }
    } catch (err) {
      status = '❌ Ошибка сети.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card">
  {#if isManager}
    <div class="badge" style="background: #f59e0b;">Режим Менеджера</div>
  {/if}

  <!-- Блок приветственного бонуса -->
  {#if referral.enabled && referral.isFirstOrder && !isManager}
    <div class="bonus-banner">
      🎁 <b>Первый заказ!</b><br/>
      По нашей программе лояльности вы получите бонус
      <span style="color: #22c55e;">{referral.bonusAmount.toLocaleString()} VND</span>
      при совершении этой сделки.
    </div>
  {/if}

  <h2>{isManager ? 'Создать заявку' : 'Обмен валюты'}</h2>

  <div class="form-group">
    <label>Локация</label>
    <select bind:value={city}>
      {#each config.cities as c}
        <option value={c}>{c}</option>
      {each}
    </select>
  </div>

  <div class="form-group">
    <label>Отдаю ({selectedCurrency.name})</label>
    <input type="number" inputmode="decimal" placeholder="0.00" bind:value={giveAmount} />
  </div>

  <div class="form-group">
    <label>Получаю (VND)</label>
    <input
      type="text"
      bind:value={getAmount}
      disabled={!isManager}
      placeholder="0"
    />
    {#if isManager}
      <small class="hint">* Вы можете скорректировать сумму для клиента</small>
    {/if}
  </div>

  <div class="form-group">
    <label>Валюта и актуальный курс</label>
    <select bind:value={currencyId}>
      {#each config.currencies as c}
        <option value={c.id}>{c.name} (1:{c.rate.toLocaleString()})</option>
      {each}
    </select>
  </div>

  <div class="form-group">
    <label>Способ передачи</label>
    <select bind:value={method}>
      {#each config.methods as m}
        <option value={m}>{m}</option>
      {each}
    </select>
  </div>

  <button on:click={handleSubmit} disabled={loading || !giveAmount}>
    {loading ? 'Секунду...' : 'Подтвердить обмен'}
  </button>

  {#if status}
    <div class="status-msg">{status}</div>
  {/if}
</div>

<style>
  h2 { margin-bottom: 20px; font-size: 1.5rem; text-align: center; }

  .bonus-banner {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 20px;
    font-size: 0.85rem;
    line-height: 1.4;
    color: #e2e8f0;
  }

  .hint { font-size: 0.7rem; color: #94a3b8; margin-top: 4px; display: block; }

  .status-msg {
    text-align: center;
    margin-top: 16px;
    font-size: 0.9rem;
    font-weight: 500;
  }
</style>
