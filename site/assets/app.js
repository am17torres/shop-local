/* Shared client-side logic for the demo. State lives in localStorage so the
   storefront -> cart -> merchant dashboard flow connects without a server. */

(function () {
  "use strict";

  const CART_KEY = "bh_cart";     // { productId: qty }
  const ORDERS_KEY = "bh_orders"; // [ order ]

  /* ---------- partner sign-up config ----------
     Sign-ups POST to a Google Apps Script web app that appends a row to a
     Google Sheet. Paste your deployed /exec URL into PARTNER_ENDPOINT after
     following docs/PARTNER_INTAKE.md. Empty = not wired up yet (the form then
     shows a friendly "opening soon" note instead of failing). */
  const PARTNER_ENDPOINT = "https://script.google.com/macros/s/AKfycbz1wcLFTaf-0zEsuO87Vb-nZMngYQzyd6Lnhf3oKXVgbDuPbbTGqm3c2hc3i1JTdd0/exec";
  const PARTNER_TOKEN = "bh-partner-2026"; // page token the script checks (a deterrent, not a wall)
  const MIN_FILL_MS = 3000;                // time-trap: anything submitted faster is treated as a bot

  // Tests (and a future config) can override these on window without a rebuild.
  const partnerEndpoint = () => (typeof window !== "undefined" && window.BH_PARTNER_ENDPOINT) || PARTNER_ENDPOINT;
  const minFillMs = () => (typeof window !== "undefined" && window.BH_MIN_FILL_MS != null) ? window.BH_MIN_FILL_MS : MIN_FILL_MS;

  const money = (n) => "$" + n.toFixed(2);

  /* ---------- toast ---------- */
  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function notImplemented(what) {
    toast((what ? what + " — " : "") + "not yet implemented in this demo");
  }

  /* ---------- cart store ----------
     Each entry: { qty, fulfillment: "delivery" | "pickup" } */
  function getCart() {
    let c;
    try { c = JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
    // normalize any legacy numeric entries
    for (const k in c) if (typeof c[k] === "number") c[k] = { qty: c[k], fulfillment: "delivery" };
    return c;
  }
  function setCart(c) {
    localStorage.setItem(CART_KEY, JSON.stringify(c));
    updateCartCount();
  }
  function addToCart(id, qty) {
    const c = getCart();
    const cur = c[id] || { qty: 0, fulfillment: "delivery" };
    cur.qty += qty || 1;
    c[id] = cur;
    setCart(c);
  }
  function setQty(id, qty) {
    const c = getCart();
    if (qty <= 0) { delete c[id]; }
    else { const cur = c[id] || { qty: 0, fulfillment: "delivery" }; cur.qty = qty; c[id] = cur; }
    setCart(c);
  }
  function setFulfillment(id, fulfillment) {
    const c = getCart();
    if (c[id]) { c[id].fulfillment = fulfillment; setCart(c); }
  }
  function cartCount() {
    return Object.values(getCart()).reduce((a, v) => a + (v.qty || 0), 0);
  }
  function clearCart() { setCart({}); }

  function updateCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const n = cartCount();
      el.textContent = n;
      el.style.display = n > 0 ? "" : "none";
    });
  }

  /* ---------- orders store ---------- */
  function getOrders() {
    let orders;
    try { orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
    catch (e) { return []; }
    // migrate legacy fields -> per-store mo.delivery + mo.distanceMi
    orders.forEach((o) => (o.merchantOrders || []).forEach((mo) => {
      if (mo.delivery === undefined) {
        mo.delivery = o.delivery === "delivered" ? "delivered"
          : mo.pickedUp ? "out_for_delivery" : "scheduled";
      }
      if (mo.distanceMi == null) mo.distanceMi = mockDistanceMi(mo.shopId, o.address);
    }));
    return orders;
  }
  function saveOrders(o) { localStorage.setItem(ORDERS_KEY, JSON.stringify(o)); }

  /* Build per-merchant sub-orders from the cart and persist as one order. */
  function placeOrder(windowId, address) {
    const cart = getCart();
    const byShop = {};
    Object.entries(cart).forEach(([pid, v]) => {
      const p = BH.lookups.product(pid);
      if (!p) return;
      (byShop[p.shopId] = byShop[p.shopId] || []).push({
        productId: pid,
        nameSnapshot: p.name,
        priceSnapshot: p.price,   // snapshot price at order time
        emoji: p.emoji,
        qty: v.qty,
        fulfillment: v.fulfillment || "delivery",  // per-item: delivery | pickup
      });
    });

    const order = {
      id: "BH-" + Date.now().toString().slice(-6),
      placedAt: Date.now(),
      windowId,
      address: address || "12 Lakehill Rd, Burnt Hills",
      merchantOrders: Object.entries(byShop).map(([shopId, items]) => ({
        shopId,
        status: "authorized",     // authorize-and-hold; capture on confirm
        delivery: "scheduled",    // per-store lifecycle: scheduled -> out_for_delivery -> delivered
        distanceMi: mockDistanceMi(shopId, address || "12 Lakehill Rd, Burnt Hills"), // store -> address, snapshot
        items,
      })),
    };
    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);
    clearCart();
    return order;
  }

  function setMerchantOrderStatus(orderId, shopId, status) {
    const orders = getOrders();
    const o = orders.find((x) => x.id === orderId);
    if (!o) return;
    const mo = o.merchantOrders.find((m) => m.shopId === shopId);
    if (mo) mo.status = status;
    saveOrders(orders);
  }

  function moTotal(mo) {
    return mo.items.reduce((a, it) => a + it.priceSnapshot * it.qty, 0);
  }

  /* ---- delivery (driver workflow) ---- per store sub-order ---- */
  function setMODelivery(orderId, shopId, status) {
    const orders = getOrders();
    const o = orders.find((x) => x.id === orderId);
    if (!o) return;
    const mo = o.merchantOrders.find((m) => m.shopId === shopId);
    if (mo) mo.delivery = status;  // "scheduled" | "out_for_delivery" | "delivered"
    saveOrders(orders);
  }
  // confirmed merchant_orders are what the driver actually carries
  function confirmedMOs(order) {
    return order.merchantOrders.filter((m) => m.status === "confirmed");
  }
  // only delivery items end up on a driver's route; pickup items the customer collects
  function deliveryItems(mo) {
    return mo.items.filter((it) => (it.fulfillment || "delivery") === "delivery");
  }
  function pickupItems(mo) {
    return mo.items.filter((it) => it.fulfillment === "pickup");
  }
  function orderHasDelivery(order) {
    return confirmedMOs(order).some((mo) => deliveryItems(mo).length);
  }
  // a confirmed store sub-order is "on a route" once it has delivery items
  function isDeliverable(mo) {
    return mo.status === "confirmed" && deliveryItems(mo).length > 0;
  }

  /* ---- distance-based delivery fee ---- per store sub-order ----
     Each store sits its own distance from the delivery address, so the fee is
     priced per merchant_order, not once for the whole cart. */
  const DELIVERY_RATE = 1.0; // dollars per mile
  // Deterministic mock distance (1–10 mi) from a given store to a given address.
  function mockDistanceMi(shopId, address) {
    const s = String(shopId || "") + "|" + String(address || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return Math.round((1 + (h % 901) / 100) * 10) / 10; // ~1.0–10.0 mi, stable per (store, address)
  }
  function feeForDistance(mi) { return Math.round(mi * DELIVERY_RATE * 100) / 100; }
  // Distance/fee for one store sub-order. Fee is 0 if the store has only pickup items.
  function moDistance(mo) { return mo.distanceMi != null ? mo.distanceMi : 0; }
  function moDeliveryFee(mo) { return deliveryItems(mo).length ? feeForDistance(moDistance(mo)) : 0; }

  /* ---------- partner sign-up (merchant / driver intake) ----------
     A static site can't process a form, so we POST to the Apps Script endpoint.
     A text/plain body keeps it a "simple" request (no CORS preflight, which
     Apps Script doesn't answer). Input validation lives server-side; see the
     repo's docs/ (not deployed) for the full intake + anti-abuse notes. */
  async function submitPartner(payload) {
    const url = partnerEndpoint();
    if (!url) return { ok: false, reason: "unconfigured" };
    // no-cors: the Apps Script response is opaque, so we can't read it — a
    // completed request is treated as success (the server still validates and
    // drops anything bad). fetch only rejects on a real network failure.
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return { ok: true };
  }

  /* Wire every <form data-partner="merchant|driver">. Submissions that fail the
     client-side checks are accepted in the UI but never sent (we don't surface
     which check tripped). */
  function wirePartnerForms() {
    document.querySelectorAll("form[data-partner]").forEach((form) => {
      const kind = form.getAttribute("data-partner");
      const renderedAt = Date.now();
      const okEl = form.parentElement.querySelector("[data-partner-ok]");
      const hp = form.querySelector("[data-x]");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;

        const btn = form.querySelector('[type="submit"]');
        const elapsed = Date.now() - renderedAt;
        const drop = (hp && hp.value.trim() !== "") || elapsed < minFillMs();

        const fields = {};
        new FormData(form).forEach((v, k) => {
          v = typeof v === "string" ? v.trim() : v;
          fields[k] = (k in fields) ? [].concat(fields[k], v).join(", ") : v; // join repeated checkboxes
        });
        if (hp) delete fields[hp.name];

        if (btn) { btn.dataset.label = btn.textContent; btn.disabled = true; btn.textContent = "Sending…"; }

        let result = { ok: true }; // dropped submissions look successful but send nothing
        if (!drop) {
          result = await submitPartner({
            kind, token: PARTNER_TOKEN, page: location.pathname, elapsedMs: elapsed, source: 'inbound:website', ...fields,
          }).catch(() => ({ ok: false, reason: "network" }));
        }

        if (result.ok) {
          if (okEl) { form.hidden = true; okEl.hidden = false; }
          toast("Thanks — we'll be in touch.");
        } else {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Submit"; }
          toast(result.reason === "unconfigured"
            ? "Sign-ups open soon — check back shortly."
            : "Something went wrong — please try again.");
        }
      });
    });
  }

  /* expose */
  window.BHApp = {
    money, toast, notImplemented,
    getCart, addToCart, setQty, setFulfillment, cartCount, clearCart, updateCartCount,
    getOrders, placeOrder, setMerchantOrderStatus, moTotal,
    setMODelivery, confirmedMOs, deliveryItems, pickupItems, orderHasDelivery, isDeliverable,
    DELIVERY_RATE, mockDistanceMi, feeForDistance, moDistance, moDeliveryFee,
    submitPartner,
  };

  /* keep cart badge + any live order views in sync across tabs */
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) updateCartCount();
    if (e.key === ORDERS_KEY && typeof window.BHRefresh === "function") window.BHRefresh();
  });

  /* Mobile nav: the hamburger toggles the dropdown on narrow screens. */
  function wireNavToggle() {
    const btn = document.querySelector(".nav-toggle");
    const nav = document.getElementById("nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    wireNavToggle();
    wirePartnerForms();
    // Wire any element with data-not-implemented to show the toast.
    document.body.addEventListener("click", (e) => {
      const t = e.target.closest("[data-not-implemented]");
      if (t) {
        e.preventDefault();
        notImplemented(t.getAttribute("data-not-implemented"));
      }
    });
  });
})();
