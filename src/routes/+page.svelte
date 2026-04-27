<script>
    export let data;
    const { config, role, userId } = data;
    const isManager = role === "manager";

    // Состояние формы с проверкой на наличие данных
    let pairId =
        config.pairs && config.pairs.length > 0 ? config.pairs[0].id : null;
    let giveAmount = "";
    let getAmount = "";
    let paymentMethod = config.paymentMethods[0]; // Наличные / Банк
    let fromBankName = "";
    let deliveryMethod = config.deliveryMethods[0]; // Курьер / Счет / АТМ

    // Доп. поля для Курьера
    let address = "";
    let deliveryTimeType = "asap"; // asap / custom
    let deliveryTime = "";

    // Доп. поля для Перевода
    let requisites = "";
    let comment = "";

    // Ошибки
    let errors = {};
    let status = "";
    let loading = false;

    $: selectedPair = config.pairs.find((p) => p.id === pairId);
    $: rate = selectedPair ? selectedPair.rate : 1;

    // Логика пересчета для клиента
    function handleGiveInput(val) {
        giveAmount = val;
        if (!isManager && val) {
            getAmount = (Number(val) * rate).toFixed(2);
        }
    }

    function handleGetInput(val) {
        getAmount = val;
        if (!isManager && val) {
            giveAmount = (Number(val) / rate).toFixed(2);
        }
    }

    // Логика менеджера: если поле пустое, заполняем по курсу, иначе не трогаем
    $: if (isManager) {
        if (giveAmount && !getAmount)
            getAmount = (Number(giveAmount) * rate).toFixed(2);
        if (getAmount && !giveAmount)
            giveAmount = (Number(getAmount) / rate).toFixed(2);
    }

    async function validateAndSubmit() {
        errors = {};
        if (!giveAmount || Number(giveAmount) < selectedPair.min) {
            errors.giveAmount = `Мин. сумма: ${selectedPair.min}`;
        }
        if (paymentMethod === "Перевод с банка" && !fromBankName) {
            errors.fromBankName = "Укажите банк";
        }
        if (deliveryMethod === "Курьером") {
            if (!address) errors.address = "Укажите адрес";
            if (deliveryTimeType === "custom" && !deliveryTime)
                errors.deliveryTime = "Укажите время";
        }
        if (deliveryMethod === "Переводом на счет" && !requisites) {
            errors.requisites = "Нужны реквизиты";
        }

        if (Object.keys(errors).length > 0) return;

        loading = true;
        status = "Оформление...";

        const payload = {
            userId,
            pair: `${selectedPair.from} -> ${selectedPair.to}`,
            giveAmount,
            getAmount,
            paymentMethod:
                paymentMethod === "Перевод с банка"
                    ? `Банк: ${fromBankName}`
                    : "Наличные",
            deliveryMethod,
            details: {
                address,
                deliveryTime:
                    deliveryTimeType === "asap"
                        ? "Как можно скорее"
                        : deliveryTime,
                requisites,
                comment,
            },
            isManagerCreated: isManager,
        };

        try {
            const res = await fetch(`${data.apiBase}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) status = "✅ Заявка успешно оформлена!";
            else status = "❌ Ошибка сервера";
        } catch (e) {
            status = "❌ Ошибка сети";
        } finally {
            loading = false;
        }
    }
</script>

<div class="card">
    {#if isManager}
        <div class="badge" style="background: #f59e0b; margin-bottom: 10px;">
            МЕНЕДЖЕР
        </div>
    {/if}

    <h2>Оформление заявки</h2>

    <div class="form-group">
        <label>Направление обмена</label>
        <select bind:value={pairId}>
            {#each config.pairs as p}
                <option value={p.id}>
                    {p.name || `${p.from} → ${p.to}`}
                </option>
            {/each}
        </select>
    </div>

    <div class="flex-row">
        <div class="form-group">
            <label>Отдаю ({selectedPair.from})</label>
            <input
                type="number"
                step="any"
                placeholder="0.00"
                value={giveAmount}
                on:input={(e) => handleGiveInput(e.target.value)}
                class:error={errors.giveAmount}
            />
            {#if errors.giveAmount}<small class="err-text"
                    >{errors.giveAmount}</small
                >{/if}
        </div>
        <div class="form-group">
            <label>Получаю ({selectedPair.to})</label>
            <input
                type="number"
                step="any"
                placeholder="0.00"
                value={getAmount}
                on:input={(e) => handleGetInput(e.target.value)}
            />
        </div>
    </div>

    <div class="form-group">
        <label>Как вы отдаете?</label>
        <select bind:value={paymentMethod}>
            {#each config.paymentMethods as m}
                <option value={m}>{m}</option>
            {/each}
        </select>
    </div>

    {#if paymentMethod === "Перевод с банка"}
        <div class="form-group">
            <label>Название вашего банка</label>
            <input
                type="text"
                placeholder="Например: Сбербанк"
                bind:value={fromBankName}
                class:error={errors.fromBankName}
            />
        </div>
    {/if}

    <div class="form-group">
        <label>Способ получения</label>
        <select bind:value={deliveryMethod}>
            {#each config.deliveryMethods as m}
                <option value={m}>{m}</option>
            {/each}
        </select>
    </div>

    {#if deliveryMethod === "Курьером"}
        <div class="form-group">
            <label>Адрес доставки</label>
            <input
                type="text"
                placeholder="Улица, дом, кв/номер"
                bind:value={address}
                class:error={errors.address}
            />
        </div>
        <div class="form-group">
            <label>Время получения</label>
            <div class="radio-group">
                <label
                    ><input
                        type="radio"
                        value="asap"
                        bind:group={deliveryTimeType}
                    /> Как можно скорее</label
                >
                <label
                    ><input
                        type="radio"
                        value="custom"
                        bind:group={deliveryTimeType}
                    /> Ко времени</label
                >
            </div>
            {#if deliveryTimeType === "custom"}
                <input
                    type="time"
                    bind:value={deliveryTime}
                    style="margin-top: 8px;"
                    class:error={errors.deliveryTime}
                />
            {/if}
        </div>
    {/if}

    {#if deliveryMethod === "Переводом на счет"}
        <div class="form-group">
            <label>Реквизиты получателя</label>
            <textarea
                placeholder="Номер карты или счета, ФИО"
                bind:value={requisites}
                class:error={errors.requisites}
            ></textarea>
        </div>
    {/if}

    <div class="form-group">
        <label>Комментарий (необязательно)</label>
        <input type="text" placeholder="..." bind:value={comment} />
    </div>

    <button on:click={validateAndSubmit} disabled={loading}>
        {loading ? "Секунду..." : "Оформить заявку"}
    </button>

    {#if status}<p class="status-msg">{status}</p>{/if}
</div>

<style>
    .flex-row {
        display: flex;
        gap: 10px;
    }
    .flex-row > div {
        flex: 1;
    }
    .error {
        border-color: #ef4444 !important;
    }
    .err-text {
        color: #ef4444;
        font-size: 0.7rem;
    }
    .radio-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.9rem;
        margin-top: 5px;
    }
    .radio-group input {
        width: auto;
        margin-right: 8px;
    }
    textarea {
        width: 100%;
        padding: 12px;
        background: var(--input-bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        color: white;
        min-height: 80px;
    }
    h2 {
        text-align: center;
        margin-bottom: 20px;
        font-size: 1.3rem;
    }
    .status-msg {
        text-align: center;
        margin-top: 15px;
        font-weight: 500;
    }
</style>
