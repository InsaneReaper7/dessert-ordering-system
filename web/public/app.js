let dessertsData = [];
let currentLang = 'en';

// Translation Dictionaries
const i18n = {
  en: {
    logo_subtitle: "Artisan Small-Batch Bakery",
    nav_menu: "Our Desserts",
    nav_order: "Order Now",
    hero_title: "Handcrafted Sweets, Baked with Love.",
    hero_subtitle: "Freshly baked cookies, brownies, blondies, and fruit bars customized to your liking. Made to order for family, friends, and coworkers.",
    hero_btn: "Browse the Menu",
    feature_baked_title: "Baked to Order",
    feature_baked_text: "Every single batch is baked fresh specifically for you. No stale shelf desserts here.",
    feature_ingredients_title: "Premium Ingredients",
    feature_ingredients_text: "From Belgian chocolate chips to fresh lemons, we only use the highest quality ingredients.",
    feature_delivery_title: "Pickup or Delivery",
    feature_delivery_text: "Collect your order directly from us or coordinate a delivery location at work or home.",
    menu_title: "Freshly Baked Menu",
    menu_subtitle: "Select your favorite dessert below to customize its size and choose premium toppings.",
    order_title: "Place Your Order",
    order_subtitle: "Customize your treat. We'll receive a notification instantly and reach out to coordinate payment and pickup/delivery.",
    form_label_dessert: "Select Dessert",
    form_placeholder_dessert: "Choose a dessert...",
    form_label_size: "Choose Pan Size",
    form_size_8x5: "8\" x 5\" Baking Pan",
    form_size_9x9: "9\" x 9\" Baking Pan",
    form_size_pricing_tbd: "Pricing: TBD",
    form_size_lemon_8x5: "Lemon Bars: $12.00 | Others: TBD",
    form_label_toppings: "Choose Toppings / Extra Ingredients",
    form_label_toppings_optional: "(Toppings pricing: TBD)",
    form_toppings_help: "Customize your brownie or blondie! Select all the ingredients you would like mixed in or sprinkled on top.",
    form_label_notes: "Special Requests / Notes",
    form_placeholder_notes: "Any dietary preferences or custom notes? E.g., 'half walnuts, half chocolate chips'",
    form_label_fulfillment: "Pickup or Delivery?",
    form_placeholder_fulfillment: "Select fulfillment method...",
    form_fulfillment_pickup: "Self Pickup",
    form_fulfillment_delivery: "Coordinate Delivery (Friends/Coworkers/Family only)",
    form_label_contact: "Your Contact Details",
    form_label_name: "Full Name",
    form_label_phone: "Phone Number",
    form_label_email: "Email Address",
    summary_title: "Order Summary",
    summary_default_dessert: "Dessert: Select item",
    summary_label_toppings: "Toppings selected:",
    summary_no_toppings: "None",
    summary_label_total: "Estimated Total:",
    summary_total_tbd: "TBD",
    summary_disclaimer: "* Since some prices are TBD, we will confirm the exact price and payment details when we contact you.",
    btn_submit_order: "Place Order",
    btn_submit_loading: "Placing Order...",
    success_modal_title: "Order Placed!",
    success_modal_text_template: "Thank you, {name}! Your order has been successfully sent to the kitchen.",
    success_modal_dessert: "Dessert:",
    success_modal_size: "Size:",
    success_modal_fulfillment: "Fulfillment:",
    success_modal_total: "Total Price:",
    success_modal_subtext_template: "A notification has been pinged to the chef's phone. We will contact you at {phone} shortly to confirm price & delivery!",
    success_modal_close: "Close Window",
    footer_copy: "&copy; 2026 Sugar & Crumb Bakery. Handcrafted goodies.",
    footer_admin: "Admin Portal",
    // Toppings
    topping_walnuts: "Walnuts",
    topping_pecans: "Pecans",
    topping_marshmallow_dots: "Marshmallow Dots",
    topping_caramels_dots: "Caramel Dots",
    topping_chocolate_chips: "Chocolate Chips",
    topping_butterscotch_chips: "Butterscotch Chips",
    topping_white_chocolate_chips: "White Chocolate Chips",
    topping_vanilla_chips: "Vanilla Chips",
    // Miscellaneous
    card_starting_at: "Starting at",
    card_customizable: "Customizable",
    card_customize_btn: "Customize"
  },
  es: {
    logo_subtitle: "Panadería Artesanal en Pequeños Lotes",
    nav_menu: "Nuestros Postres",
    nav_order: "Pedir Ahora",
    hero_title: "Dulces Artesanales, Horneados con Amor.",
    hero_subtitle: "Galletas, brownies, blondies y barras de frutas recién horneados y personalizados a tu gusto. Hechos a pedido para familiares, amigos y compañeros de trabajo.",
    hero_btn: "Ver el Menú",
    feature_baked_title: "Horneado a Pedido",
    feature_baked_text: "Cada lote se hornea fresco específicamente para ti. Aquí no hay postres viejos de estante.",
    feature_ingredients_title: "Ingredientes de Calidad",
    feature_ingredients_text: "Desde chispas de chocolate belga hasta limones frescos, solo usamos ingredientes de la más alta calidad.",
    feature_delivery_title: "Retiro o Entrega",
    feature_delivery_text: "Recoge tu pedido directamente de nosotros o coordina una entrega en tu trabajo u hogar.",
    menu_title: "Menú Recién Horneado",
    menu_subtitle: "Selecciona tu postre favorito a continuación para personalizar su tamaño y elegir ingredientes adicionales.",
    order_title: "Haz tu Pedido",
    order_subtitle: "Personaliza tu dulce. Recibiremos una notificación al instante y nos comunicaremos contigo para coordinar el pago y la entrega.",
    form_label_dessert: "Seleccionar Postre",
    form_placeholder_dessert: "Elige un postre...",
    form_label_size: "Elige el Tamaño del Molde",
    form_size_8x5: "Molde de 8\" x 5\"",
    form_size_9x9: "Molde de 9\" x 9\"",
    form_size_pricing_tbd: "Precio: TBD (Por definir)",
    form_size_lemon_8x5: "Barras de Limón: $12.00 | Otros: TBD",
    form_label_toppings: "Elige los Ingredientes Adicionales",
    form_label_toppings_optional: "(Precio de ingredientes: TBD)",
    form_toppings_help: "¡Personaliza tu brownie o blondie! Selecciona todos los ingredientes que te gustaría mezclar o espolvorear por encima.",
    form_label_notes: "Solicitudes Especiales / Notas",
    form_placeholder_notes: "¿Alguna preferencia alimentaria o nota personalizada? Ej: 'mitad nueces, mitad chispas de chocolate'",
    form_label_fulfillment: "¿Retiro o Entrega?",
    form_placeholder_fulfillment: "Selecciona el método de entrega...",
    form_fulfillment_pickup: "Retiro en Persona",
    form_fulfillment_delivery: "Coordinar Entrega (Solo amigos/compañeros/familia)",
    form_label_contact: "Tus Datos de Contacto",
    form_label_name: "Nombre Completo",
    form_label_phone: "Número de Teléfono",
    form_label_email: "Correo Electrónico",
    summary_title: "Resumen del Pedido",
    summary_default_dessert: "Postre: Selecciona un artículo",
    summary_label_toppings: "Ingredientes seleccionados:",
    summary_no_toppings: "Ninguno",
    summary_label_total: "Total Estimado:",
    summary_total_tbd: "TBD",
    summary_disclaimer: "* Dado que algunos precios están por definirse (TBD), confirmaremos el precio exacto y los detalles de pago cuando nos comuniquemos contigo.",
    btn_submit_order: "Realizar Pedido",
    btn_submit_loading: "Enviando Pedido...",
    success_modal_title: "¡Pedido Realizado!",
    success_modal_text_template: "¡Gracias, {name}! Tu pedido ha sido enviado con éxito a la cocina.",
    success_modal_dessert: "Postre:",
    success_modal_size: "Tamaño:",
    success_modal_fulfillment: "Entrega:",
    success_modal_total: "Precio Total:",
    success_modal_subtext_template: "Se ha enviado una notificación al teléfono del chef. Nos comunicaremos contigo al {phone} en breve para confirmar el precio y la entrega.",
    success_modal_close: "Cerrar Ventana",
    footer_copy: "&copy; 2026 Pastelería Sugar & Crumb. Dulces hechos a mano.",
    footer_admin: "Portal de Administración",
    // Toppings
    topping_walnuts: "Nueces",
    topping_pecans: "Pecanas",
    topping_marshmallow_dots: "Malvaviscos",
    topping_caramels_dots: "Gotas de Caramelo",
    topping_chocolate_chips: "Chispas de Chocolate",
    topping_butterscotch_chips: "Chispas de Butterscotch",
    topping_white_chocolate_chips: "Chispas de Chocolate Blanco",
    topping_vanilla_chips: "Chispas de Vainilla",
    // Miscellaneous
    card_starting_at: "Desde",
    card_customizable: "Personalizable",
    card_customize_btn: "Personalizar"
  }
};

// Database items translation dictionary
const itemTranslations = {
  brownies: {
    name: { en: "Fudge Brownies", es: "Brownies de Chocolate" },
    desc: { 
      en: "Rich, fudgy chocolate brownies made with premium cocoa and a perfectly crackled top.", 
      es: "Brownies de chocolate ricos y melosos hechos con cacao premium y una capa superior crujiente." 
    }
  },
  blondies: {
    name: { en: "Classic Blondies", es: "Blondies Clásicos" },
    desc: { 
      en: "Chewy brown sugar blondies infused with rich vanilla and a buttery caramel undertone.", 
      es: "Blondies masticables de azúcar morena con toques de vainilla y un rico trasfondo de caramelo." 
    }
  },
  lemon_bars: {
    name: { en: "Tangy Lemon Bars", es: "Barras de Limón" },
    desc: { 
      en: "Tangy, sweet freshly squeezed lemon curd on a buttery shortbread crust, dusted with powdered sugar.", 
      es: "Crema de limón fresca, ácida y dulce sobre una base de galleta de mantequilla, espolvoreada con azúcar glass." 
    }
  },
  mango_bars: {
    name: { en: "Tangy Mango Bars", es: "Barras de Mango" },
    desc: { 
      en: "Tangy and sweet tropical mango curd on a buttery shortbread crust, dusted with powdered sugar.", 
      es: "Crema de mango fresca, dulce y tropical sobre una base de galleta de mantequilla, espolvoreada con azúcar glass." 
    }
  },
  pineapple_bars: {
    name: { en: "Sweet Pineapple Bars", es: "Barras de Piña" },
    desc: { 
      en: "Tangy, caramelized golden pineapple curd on a buttery shortbread crust, dusted with powdered sugar.", 
      es: "Crema de piña fresca y caramelizada sobre una base de galleta de mantequilla, espolvoreada con azúcar glass." 
    }
  },
  butterscotch_blondies: {
    name: { en: "Golden Butterscotch Blondies", es: "Blondies de Butterscotch" },
    desc: { 
      en: "Specialty blondies loaded with premium butterscotch chips, giving a rich brown sugar and butterscotch finish.", 
      es: "Blondies especiales cargados con chispas de butterscotch premium, con un rico acabado de azúcar morena y mantequilla tostada." 
    }
  },
  caramel_butterscotch_crunch_blondies: {
    name: { en: "Caramel Butterscotch Crunch Blondies", es: "Blondies Crunch de Caramelo y Butterscotch" },
    desc: { 
      en: "Specialty blondies loaded with butterscotch chips, chewy caramel bits, and toasted walnuts for the ultimate crunch.", 
      es: "Blondies especiales cargados con chispas de butterscotch, trozos de caramelo masticable y nueces tostadas para un crujido inigualable." 
    }
  }
};


document.addEventListener('DOMContentLoaded', () => {
  detectInitialLanguage();
  fetchDesserts();
  setupEventListeners();
});

// Detect browser language or load saved setting
function detectInitialLanguage() {
  const saved = localStorage.getItem('user_lang');
  if (saved && (saved === 'en' || saved === 'es')) {
    currentLang = saved;
  } else {
    const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    currentLang = browserLang.startsWith('es') ? 'es' : 'en';
  }
  updateLanguageUI();
}

// Switch languages and save choice
window.setLanguage = function(lang) {
  if (lang !== 'en' && lang !== 'es') return;
  currentLang = lang;
  localStorage.setItem('user_lang', lang);
  
  updateLanguageUI();
  
  // Re-render components with the new translations
  renderMenuGrid(dessertsData);
  populateDessertSelect(dessertsData);
  updateOrderSummary();
};

// Replace text content based on translation keys
function updateLanguageUI() {
  // Update toggle active classes
  const btnEn = document.getElementById('lang-btn-en');
  const btnEs = document.getElementById('lang-btn-es');
  
  if (currentLang === 'es') {
    btnEs.classList.add('active');
    btnEn.classList.remove('active');
    document.documentElement.lang = 'es';
  } else {
    btnEn.classList.add('active');
    btnEs.classList.remove('active');
    document.documentElement.lang = 'en';
  }

  // Update elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) {
      el.textContent = i18n[currentLang][key];
    }
  });

  // Update elements with placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[currentLang][key]) {
      el.placeholder = i18n[currentLang][key];
    }
  });
}

// Fetch active desserts from server
async function fetchDesserts() {
  try {
    const response = await fetch('/api/desserts');
    if (!response.ok) throw new Error('Failed to fetch menu');
    
    dessertsData = await response.json();
    renderMenuGrid(dessertsData);
    populateDessertSelect(dessertsData);
  } catch (err) {
    console.error(err);
    document.getElementById('desserts-grid').innerHTML = 
      `<div class="loading-spinner">${currentLang === 'es' ? 'Error al cargar los postres. Por favor refresque la página.' : 'Failed to load desserts. Please refresh the page.'}</div>`;
  }
}

// Render dessert cards in the grid
function renderMenuGrid(desserts) {
  const grid = document.getElementById('desserts-grid');
  if (!grid) return;
  grid.innerHTML = '';

  desserts.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    
    // Get translations for item names/descriptions
    const translatedName = itemTranslations[item.id] ? itemTranslations[item.id].name[currentLang] : item.name;
    const translatedDesc = itemTranslations[item.id] ? itemTranslations[item.id].desc[currentLang] : item.description;

    // Check pricing labels
    let priceLabel = '';
    if (item.price_8x5 === null && item.price_9x9 === null) {
      priceLabel = `<span class="menu-card-price tbd">${currentLang === 'es' ? 'Precio: TBD' : 'Pricing: TBD'}</span>`;
    } else {
      const prices = [];
      if (item.price_8x5 !== null) prices.push(`8x5: $${item.price_8x5.toFixed(2)}`);
      if (item.price_9x9 !== null) prices.push(`9x9: $${item.price_9x9.toFixed(2)}`);
      else prices.push(`9x9: ${currentLang === 'es' ? 'TBD' : 'TBD'}`);
      
      priceLabel = `<span class="menu-card-price tbd" style="font-size: 13px;">${prices.join(' | ')}</span>`;
    }

    const customizableText = i18n[currentLang].card_customizable;
    const toppingsBadge = item.has_toppings ? `<span class="menu-card-badge">${customizableText}</span>` : '';
    const customizeBtnText = i18n[currentLang].card_customize_btn;

    card.innerHTML = `
      <div class="menu-card-img-wrapper">
        <img class="menu-card-img" src="${item.image_url}" alt="${translatedName}">
        ${toppingsBadge}
      </div>
      <div class="menu-card-content">
        <h3 class="menu-card-title">${translatedName}</h3>
        <p class="menu-card-desc">${translatedDesc}</p>
        <div class="menu-card-footer">
          <div class="menu-card-price-container">
            <div class="menu-card-price-label">${i18n[currentLang].card_starting_at}</div>
            ${priceLabel}
          </div>
          <a href="#order" class="btn btn-primary" style="padding: 8px 16px; font-size: 14px; border-radius: 8px;" onclick="selectDessertForOrder('${item.id}')">${customizeBtnText}</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Populate the select dropdown inside the order form
function populateDessertSelect(desserts) {
  const select = document.getElementById('dessert-select');
  if (!select) return;
  
  // Save current selection to restore after language switch
  const selectedValue = select.value;
  
  // Clear any existing except default placeholder
  select.innerHTML = '';
  
  const placeholderOption = document.createElement('option');
  placeholderOption.value = "";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  placeholderOption.textContent = i18n[currentLang].form_placeholder_dessert;
  select.appendChild(placeholderOption);
  
  desserts.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = itemTranslations[item.id] ? itemTranslations[item.id].name[currentLang] : item.name;
    select.appendChild(option);
  });

  if (selectedValue) {
    select.value = selectedValue;
  }
}

// Hook options up to DOM events
function setupEventListeners() {
  const select = document.getElementById('dessert-select');
  const form = document.getElementById('order-form');
  const sizeRadios = document.getElementsByName('size');
  const toppingsCheckboxes = document.querySelectorAll('input[name="toppings"]');

  if (select) {
    select.addEventListener('change', (e) => {
      handleDessertChange(e.target.value);
      updateOrderSummary();
    });
  }

  sizeRadios.forEach(radio => {
    radio.addEventListener('change', updateOrderSummary);
  });

  toppingsCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateOrderSummary);
  });

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

// Auto scroll and choose dessert
window.selectDessertForOrder = function(dessertId) {
  const select = document.getElementById('dessert-select');
  if (select) {
    select.value = dessertId;
    handleDessertChange(dessertId);
    updateOrderSummary();
  }
};

// Handle toppings container display when dessert type changes
function handleDessertChange(dessertId) {
  const toppingsContainer = document.getElementById('toppings-container');
  const selectedDessert = dessertsData.find(d => d.id === dessertId);
  if (!toppingsContainer) return;
  
  // Update helper description for 8x5 radio price depending on language
  const price8x5Desc = document.getElementById('price-8x5-desc');
  if (selectedDessert && price8x5Desc) {
    if (selectedDessert.id === 'lemon_bars') {
      price8x5Desc.textContent = i18n[currentLang].form_size_lemon_8x5_only;
    } else {
      price8x5Desc.textContent = i18n[currentLang].form_size_pricing_tbd;
    }
  }

  if (selectedDessert && selectedDessert.has_toppings) {
    toppingsContainer.classList.remove('hidden');
  } else {
    toppingsContainer.classList.add('hidden');
    // Clear checkmarks on hidden checkboxes
    const checkedBoxes = toppingsContainer.querySelectorAll('input[name="toppings"]:checked');
    checkedBoxes.forEach(cb => { cb.checked = false; });
  }
}

// Calculate cost and refresh summary box
function updateOrderSummary() {
  const select = document.getElementById('dessert-select');
  if (!select) return;
  
  const selectedDessert = dessertsData.find(d => d.id === select.value);
  const size = document.querySelector('input[name="size"]:checked')?.value;
  
  const summaryItemName = document.getElementById('summary-item-name');
  const summaryItemPrice = document.getElementById('summary-item-price');
  const summaryToppingsList = document.getElementById('summary-toppings-list');
  const summaryTotalPrice = document.getElementById('summary-total-price');

  if (!selectedDessert) {
    if (summaryItemName) summaryItemName.textContent = i18n[currentLang].summary_default_dessert;
    if (summaryItemPrice) summaryItemPrice.textContent = i18n[currentLang].summary_total_tbd;
    if (summaryToppingsList) summaryToppingsList.textContent = i18n[currentLang].summary_no_toppings;
    if (summaryTotalPrice) summaryTotalPrice.textContent = i18n[currentLang].summary_total_tbd;
    return;
  }

  // Get selected toppings
  const checkedToppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked'))
    .map(cb => cb.value);

  // Get translated dessert name
  const translatedName = itemTranslations[selectedDessert.id] ? itemTranslations[selectedDessert.id].name[currentLang] : selectedDessert.name;
  const sizeText = size === '8x5' ? '8x5' : '9x9';
  if (summaryItemName) summaryItemName.textContent = `${translatedName} (${sizeText})`;

  // Calculate pricing
  let basePrice = size === '9x9' ? selectedDessert.price_9x9 : selectedDessert.price_8x5;
  let hasTBD = basePrice === null || checkedToppings.length > 0;

  // Render individual base price
  if (summaryItemPrice) {
    summaryItemPrice.textContent = basePrice === null ? i18n[currentLang].summary_total_tbd : `$${basePrice.toFixed(2)}`;
  }

  // Render toppings list with translations
  if (summaryToppingsList) {
    if (checkedToppings.length > 0) {
      const formatted = checkedToppings.map(t => {
        // Map local checkbox value to translation key (e.g. 'walnuts' -> 'topping_walnuts')
        const translationKey = 'topping_' + t.toLowerCase().replace(' ', '_');
        return i18n[currentLang][translationKey] || t;
      }).join(', ');
      summaryToppingsList.textContent = `${formatted} (+${i18n[currentLang].summary_total_tbd})`;
    } else {
      summaryToppingsList.textContent = i18n[currentLang].summary_no_toppings;
    }
  }

  // Set final total
  if (summaryTotalPrice) {
    if (hasTBD) {
      summaryTotalPrice.textContent = i18n[currentLang].summary_total_tbd;
    } else {
      summaryTotalPrice.textContent = `$${basePrice.toFixed(2)}`;
    }
  }
}

// POST order to API
async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-order-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = i18n[currentLang].btn_submit_loading;

  const select = document.getElementById('dessert-select');
  const selectedDessert = dessertsData.find(d => d.id === select.value);
  const size = document.querySelector('input[name="size"]:checked').value;
  const pickupDelivery = document.getElementById('pickup-delivery').value;
  const notes = document.getElementById('order-notes').value;
  
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerEmail = document.getElementById('customer-email').value;

  const checkedToppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked'))
    .map(cb => cb.value);

  const orderData = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    dessert_id: selectedDessert.id,
    size: size,
    toppings: checkedToppings,
    notes: notes,
    pickup_delivery: pickupDelivery
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to place order');
    }

    // Set translated success modal descriptions
    const successTemplate = i18n[currentLang].success_modal_text_template;
    document.getElementById('success-message-translated').innerHTML = 
      successTemplate.replace('{name}', `<strong style="font-weight: 700;">${customerName}</strong>`);

    const subtextTemplate = i18n[currentLang].success_modal_subtext_template;
    document.getElementById('success-subtext-translated').innerHTML = 
      subtextTemplate.replace('{phone}', `<strong style="font-weight: 700;">${customerPhone}</strong>`);

    // Get translated dessert name
    const translatedName = itemTranslations[selectedDessert.id] ? itemTranslations[selectedDessert.id].name[currentLang] : selectedDessert.name;

    document.getElementById('success-dessert-name').textContent = translatedName;
    
    // Translate size description
    const translatedSize = size === '8x5' ? i18n[currentLang].form_size_8x5 : i18n[currentLang].form_size_9x9;
    document.getElementById('success-size').textContent = translatedSize;
    
    // Translate fulfillment
    const translatedFulfillment = pickupDelivery === 'pickup' ? i18n[currentLang].form_fulfillment_pickup : i18n[currentLang].form_fulfillment_delivery;
    document.getElementById('success-fulfillment').textContent = translatedFulfillment;
    
    // Total price
    document.getElementById('success-price').textContent = result.total_price === 'TBD' ? `${i18n[currentLang].summary_total_tbd} (${currentLang === 'es' ? 'Por confirmar' : 'To be confirmed'})` : `$${result.total_price.toFixed(2)}`;


    document.getElementById('success-modal').style.display = 'block';

    // Reset form
    document.getElementById('order-form').reset();
    handleDessertChange('');
    updateOrderSummary();

  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = i18n[currentLang].btn_submit_order;
  }
}

// Modal handling
window.closeSuccessModal = function() {
  document.getElementById('success-modal').style.display = 'none';
};
