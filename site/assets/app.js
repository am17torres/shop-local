/* Shared client-side logic for the demo. State lives in localStorage so the
   storefront -> cart -> merchant dashboard flow connects without a server. */

(function () {
  "use strict";

  const CART_KEY = "bh_cart";     // { productId: qty }
  const ORDERS_KEY = "bh_orders"; // [ order ]

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
    // migrate legacy order-level delivery / pickedUp -> per-store mo.delivery
    orders.forEach((o) => (o.merchantOrders || []).forEach((mo) => {
      if (mo.delivery === undefined) {
        mo.delivery = o.delivery === "delivered" ? "delivered"
          : mo.pickedUp ? "out_for_delivery" : "scheduled";
      }
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
      distanceMi: mockDistanceMi(address || "12 Lakehill Rd, Burnt Hills"),  // snapshot at order time
      merchantOrders: Object.entries(byShop).map(([shopId, items]) => ({
        shopId,
        status: "authorized",     // authorize-and-hold; capture on confirm
        delivery: "scheduled",    // per-store lifecycle: scheduled -> out_for_delivery -> delivered
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

  /* ---- distance-based delivery fee ---- */
  const DELIVERY_RATE = 1.0; // dollars per mile
  // Deterministic mock distance from the delivery address (no geocoding in the demo).
  function mockDistanceMi(address) {
    const s = String(address || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return Math.round((0.6 + (h % 880) / 100) * 10) / 10; // ~0.6–9.4 mi, stable per address
  }
  function feeForDistance(mi) { return Math.round(mi * DELIVERY_RATE * 100) / 100; }
  function deliveryDistance(order) {
    return order.distanceMi != null ? order.distanceMi : mockDistanceMi(order.address);
  }
  function deliveryFee(order) { return feeForDistance(deliveryDistance(order)); }

  /* expose */
  window.BHApp = {
    money, toast, notImplemented,
    getCart, addToCart, setQty, setFulfillment, cartCount, clearCart, updateCartCount,
    getOrders, placeOrder, setMerchantOrderStatus, moTotal,
    setMODelivery, confirmedMOs, deliveryItems, pickupItems, orderHasDelivery, isDeliverable,
    DELIVERY_RATE, mockDistanceMi, feeForDistance, deliveryDistance, deliveryFee,
  };

  /* keep cart badge + any live order views in sync across tabs */
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) updateCartCount();
    if (e.key === ORDERS_KEY && typeof window.BHRefresh === "function") window.BHRefresh();
  });

  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
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
