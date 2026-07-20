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
    form_size_8x8: "8\" x 8\" Baking Pan",
    form_size_pricing_tbd: "Pricing: TBD",
    form_size_lemon_8x5: "Lemon Bars: $12.00 | Others: TBD",
    form_label_icing: "Icing Selection",
    form_icing_help: "Choose how you'd like your carrot cake bars iced:",
    option_with_icing: "With Icing (Default)",
    option_no_icing: "No Icing",
    option_icing_side: "Icing on the Side",
    summary_label_icing: "Icing Option:",
    form_label_toppings: "Choose Toppings / Extra Ingredients",
    form_label_toppings_optional: "(Included: free | Extras: +$0.75 each)",
    form_toppings_help: "Customize your brownie or blondie! Select all the ingredients you would like mixed in or sprinkled on top.",
    form_label_notes: "Special Requests / Notes",
    form_placeholder_notes: "Any dietary preferences or custom notes? E.g., 'half walnuts, half chocolate chips'",
    form_label_fulfillment: "Pickup or Delivery?",
    form_label_requested_date: "Requested Delivery/Pickup Date",
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
    btn_add_to_cart: "Add to Cart",
    cart_title: "Your Order Cart",
    cart_empty: "Your cart is empty. Add a dessert above to start!",
    btn_remove: "Remove",
    cart_total: "Cart Total:",
    success_modal_items: "Items Ordered:",
    btn_submit_loading: "Placing Order...",
    success_modal_title: "Order Placed!",
    success_modal_text_template: "Thank you, {name}! Your order has been successfully sent to the kitchen.",
    success_modal_dessert: "Dessert:",
    success_modal_size: "Size:",
    success_modal_fulfillment: "Fulfillment:",
    success_modal_date: "Requested Date:",
    success_modal_total: "Total Price:",
    success_modal_subtext_template: "A notification has been pinged to the chef's phone. We will contact you at {phone} shortly to confirm price & delivery!",
    success_modal_close: "Close Window",
    footer_copy: "&copy; 2026 Sugar & Crumb Bakery. Handcrafted goodies.",
    footer_admin: "Admin Portal",
    // Toppings
    topping_walnuts: "Walnuts",
    topping_pecans: "Pecans",
    topping_marshmallow: "Marshmallow",
    topping_caramels_dots: "Caramel Dots",
    topping_chocolate_chips: "Chocolate Chips",
    topping_butterscotch_chips: "Butterscotch Chips",
    topping_reeses_peanut_butter_chips: "Reese's Peanut Butter Chips",
    topping_vanilla_chips: "Vanilla Chips",
    topping_honey_butter: "Honey Butter on the side",
    // Miscellaneous
    card_starting_at: "Starting at",
    card_customizable: "Customizable",
    card_customize_btn: "Customize",
    size_1_roll_title: "Single Cinnamon Roll",
    size_1_roll_desc: "Pricing: TBD",
    size_4_pack_title: "Pack of 4 Rolls",
    size_4_pack_desc: "Pricing: TBD",
    size_6_pack_title: "Pack of 6 Rolls",
    size_6_pack_desc: "Pricing: TBD",
    size_full_tray_title: "Full Tray (12 Rolls)",
    size_full_tray_desc: "Pricing: TBD"
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
    form_size_8x8: "Molde de 8\" x 8\"",
    form_size_pricing_tbd: "Precio: TBD (Por definir)",
    form_size_lemon_8x5: "Barras de Limón: $12.00 | Otros: TBD",
    form_label_icing: "Selección de Glaseado",
    form_icing_help: "Elige cómo te gustaría el glaseado de tus barras de pastel de zanahoria:",
    option_with_icing: "Con Glaseado (Predeterminado)",
    option_no_icing: "Sin Glaseado",
    option_icing_side: "Glaseado Aparte",
    summary_label_icing: "Opción de Glaseado:",
    form_label_toppings: "Elige los Ingredientes Adicionales",
    form_label_toppings_optional: "(Incluidos: gratis | Extras: +$0.75 c/u)",
    form_toppings_help: "¡Personaliza tu brownie o blondie! Selecciona todos los ingredientes que te gustaría mezclar o espolvorear por encima.",
    form_label_notes: "Solicitudes Especiales / Notas",
    form_placeholder_notes: "¿Alguna preferencia alimentaria o nota personalizada? Ej: 'mitad nueces, mitad chispas de chocolate'",
    form_label_fulfillment: "¿Retiro o Entrega?",
    form_label_requested_date: "Fecha Solicitada de Entrega/Retiro",
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
    btn_add_to_cart: "Añadir al Carrito",
    cart_title: "Tu Carrito de Pedido",
    cart_empty: "Tu carrito está vacío. ¡Añade un postre arriba para comenzar!",
    btn_remove: "Eliminar",
    cart_total: "Total del Carrito:",
    success_modal_items: "Artículos Pedidos:",
    btn_submit_loading: "Enviando Pedido...",
    success_modal_title: "¡Pedido Realizado!",
    success_modal_text_template: "¡Gracias, {name}! Tu pedido ha sido enviado con éxito a la cocina.",
    success_modal_dessert: "Postre:",
    success_modal_size: "Tamaño:",
    success_modal_fulfillment: "Entrega:",
    success_modal_date: "Fecha Solicitada:",
    success_modal_total: "Precio Total:",
    success_modal_subtext_template: "Se ha enviado una notificación al teléfono del chef. Nos comunicaremos contigo al {phone} en breve para confirmar el precio y la entrega.",
    success_modal_close: "Cerrar Ventana",
    footer_copy: "&copy; 2026 Pastelería Sugar & Crumb. Dulces hechos a mano.",
    footer_admin: "Portal de Administración",
    // Toppings
    topping_walnuts: "Nueces",
    topping_pecans: "Pecanas",
    topping_marshmallow: "Malvavisco",
    topping_caramels_dots: "Gotas de Caramelo",
    topping_chocolate_chips: "Chispas de Chocolate",
    topping_butterscotch_chips: "Chispas de Butterscotch",
    topping_reeses_peanut_butter_chips: "Chips de Mantequilla de Maní Reese's",
    topping_vanilla_chips: "Chispas de Vainilla",
    topping_honey_butter: "Mantequilla de miel al lado",
    // Miscellaneous
    card_starting_at: "Desde",
    card_customizable: "Personalizable",
    card_customize_btn: "Personalizar",
    size_1_roll_title: "Rollo de Canela Individual",
    size_1_roll_desc: "Precio: TBD",
    size_4_pack_title: "Paquete de 4 Rollos",
    size_4_pack_desc: "Precio: TBD",
    size_6_pack_title: "Paquete de 6 Rollos",
    size_6_pack_desc: "Precio: TBD",
    size_full_tray_title: "Bandeja Completa (12 Rollos)",
    size_full_tray_desc: "Precio: TBD"
  }
};

// Database items translation dictionary
const itemTranslations = {
  brownies: {
    name: { en: "Create Your Own Brownie", es: "Crea tu propio brownie" },
    desc: { 
      en: "Rich, fudgy chocolate brownies made with premium cocoa and a perfectly crackled top.", 
      es: "Brownies de chocolate ricos y melosos hechos con cacao premium y una capa superior crujiente." 
    }
  },
  blondies: {
    name: { en: "Create Your Own Blondie", es: "Crea tu propio blondie" },
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
  },
  marshmallow_swirl_brownies: {
    name: { en: "Marshmallow Swirl Brownies", es: "Brownies con Remolino de Malvavisco" },
    desc: { 
      en: "Rich, fudgy chocolate brownies swirled with sweet, gooey melted marshmallow fluff.", 
      es: "Brownies de chocolate ricos y melosos con un remolino de crema de malvavisco dulce y derretida." 
    }
  },
  pina_colada_bars: {
    name: { en: "Piña Colada Bars", es: "Barras de Piña Colada" },
    desc: { 
      en: "Tropical coconut and sweet pineapple curd layered on a buttery shortbread crust, topped with toasted coconut flakes.", 
      es: "Crema de coco tropical y piña dulce sobre una base de galleta de mantequilla, cubierta con hojuelas de coco tostadas." 
    }
  },
  coconut_cream_bars: {
    name: { en: "Coconut Cream Bars", es: "Barras de Crema de Coco" },
    desc: { 
      en: "Rich, velvety coconut custard on a buttery shortbread crust, generously dusted with shredded coconut.", 
      es: "Crema de coco rica y aterciopelada sobre una base de galleta de mantequilla, generosamente espolvoreada con coco rallado." 
    }
  },
  cinnamon_rolls: {
    name: { en: "Artisan Cinnamon Rolls", es: "Rollos de Canela Artesanales" },
    desc: { 
      en: "Soft, fluffy sweet rolls swirled with buttery cinnamon sugar, topped with rich cream cheese icing.", 
      es: "Rollos dulces, suaves y esponjosos con un remolino de azúcar y canela con mantequilla, cubiertos con glaseado de queso crema." 
    }
  },
  carrot_cake_bars: {
    name: { en: "Carrot Cake Bars", es: "Barras de Pastel de Zanahoria" },
    desc: { 
      en: "Artisan carrot cake bars topped with smooth icing and toasted pecans, cut into perfect squares.", 
      es: "Barras artesanales de pastel de zanahoria cubiertas con glaseado suave y nueces pecana tostadas, cortadas en cuadrados perfectos." 
    }
  },
  banana_bread_bars: {
    name: { en: "Banana Bread Bars", es: "Barras de Pan de Guineo" },
    desc: {
      en: "Dense, moist banana bread bars with a golden-brown caramelized crust and a soft, tender crumb — finished with a delicate vanilla glaze drizzle.",
      es: "Barras densas y húmedas de pan de plátano con una costra caramelizada dorada y una miga suave y tierna — terminadas con un delicado chorro de glaseado de vainilla."
    }
  },
  sweet_cornbread: {
    name: { en: "Sweet Cornbread", es: "Pan de Maíz Dulce" },
    desc: {
      en: "Sweet, moist cornbread with a golden crumb and a rich corn flavor.",
      es: "Pan de maíz dulce y húmedo con miga dorada y un rico sabor a maíz."
    }
  }
};


let rollsPricingData = { rolls_prices: [], frostings: [] };
let cart = [];

function t(key, fallback = key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || fallback;
}

function addItemToCart() {
  const select = document.getElementById('dessert-select');
  if (!select || !select.value) {
    alert(currentLang === 'es' ? 'Por favor elige un postre primero.' : 'Please select a dessert first.');
    return;
  }

  const selectedDessert = dessertsData.find(d => d.id === select.value);
  const notes = document.getElementById('order-notes').value;

  // Calculate price & settings
  let basePrice = null;
  let totalPrice = null;
  let size = '';
  let frosting_id = 'classic';
  let finalNotes = notes;
  let sizeLabel = '';

  if (selectedDessert.id === 'cinnamon_rolls') {
    const sizeType = document.querySelector('input[name="roll_size_type"]:checked')?.value || 'regular';
    const qty = parseInt(document.querySelector('input[name="roll_qty"]:checked')?.value || '1');
    const style = document.querySelector('input[name="roll_style"]:checked')?.value || 'cooked';
    frosting_id = document.querySelector('input[name="roll_frosting"]:checked')?.value || 'classic';
    const placement = document.querySelector('input[name="roll_placement"]:checked')?.value || 'on_rolls';

    size = `${sizeType === 'reg' || sizeType === 'regular' ? 'reg' : 'mini'}_${qty}`;

    const szTitle = sizeType === 'regular' 
      ? (currentLang === 'es' ? 'Regular' : 'Regular') 
      : (currentLang === 'es' ? 'Mini' : 'Mini');
    sizeLabel = `${qty} ${szTitle}`;

    const styleLabel = style === 'cooked' 
      ? (currentLang === 'es' ? 'Cocido' : 'Cooked') 
      : (currentLang === 'es' ? 'Crudo' : 'Uncooked');
    const frostingObj = rollsPricingData.frostings.find(f => f.id === frosting_id);
    const frostingLabel = frostingObj ? frostingObj.name : frosting_id;
    const placementLabel = placement === 'on_rolls' 
      ? (currentLang === 'es' ? 'Sobre los rollos' : 'On rolls') 
      : (currentLang === 'es' ? 'Aparte' : 'On side');

    finalNotes = `[${currentLang === 'es' ? 'Opción' : 'Style'}: ${styleLabel}, ${currentLang === 'es' ? 'Glaseado' : 'Frosting'}: ${frostingLabel}, ${currentLang === 'es' ? 'Ubicación' : 'Placement'}: ${placementLabel}]` + (notes ? ` ${notes}` : '');

    const found = rollsPricingData.rolls_prices.find(p => p.size === sizeType && p.quantity === qty);
    basePrice = found && found.price !== null ? found.price : null;
    if (basePrice !== null) {
      totalPrice = basePrice;
      if (frosting_id !== 'classic' && frostingObj && frostingObj.price !== null) {
        totalPrice += qty * frostingObj.price;
      }
    }
  } else {
    const selectedSize = document.querySelector('input[name="size"]:checked')?.value;
    if (!selectedSize) {
      alert(currentLang === 'es' ? 'Por favor elige un tamaño.' : 'Please select a size.');
      return;
    }
    size = selectedSize;

    if (size === '8x5') {
      basePrice = selectedDessert.price_8x5;
      sizeLabel = currentLang === 'es' ? 'Molde 8"x5"' : '8"x5" Pan';
    } else if (size === '8x8') {
      basePrice = selectedDessert.price_8x8;
      sizeLabel = currentLang === 'es' ? 'Molde 8"x8"' : '8"x8" Pan';
    } else {
      const sizeKeys = {
        '1_roll': currentLang === 'es' ? '1 Rollo' : '1 Roll',
        '4_pack': currentLang === 'es' ? 'Paquete de 4' : '4 Pack',
        '6_pack': currentLang === 'es' ? 'Paquete de 6' : '6 Pack',
        'full_tray': currentLang === 'es' ? 'Bandeja Completa' : 'Full Tray'
      };
      sizeLabel = sizeKeys[size] || size;
      const rollPriceMap = {
        '1_roll': selectedDessert.price_1_roll,
        '4_pack': selectedDessert.price_4_pack,
        '6_pack': selectedDessert.price_6_pack,
        'full_tray': selectedDessert.price_12_pack
      };
      basePrice = rollPriceMap[size] !== undefined ? rollPriceMap[size] : null;
    }

    // Carrot cake icing
    if (selectedDessert.id === 'carrot_cake_bars') {
      const icingRadio = document.querySelector('input[name="icing_option"]:checked');
      const icingValue = icingRadio ? icingRadio.value : 'with_icing';
      const icingLabels = currentLang === 'es' ? {
        'with_icing': 'Con Glaseado',
        'no_icing': 'Sin Glaseado',
        'icing_side': 'Glaseado Aparte'
      } : {
        'with_icing': 'With Icing',
        'no_icing': 'No Icing',
        'icing_side': 'Icing on the Side'
      };
      const icingText = icingLabels[icingValue] || icingValue;
      finalNotes = `[${currentLang === 'es' ? 'Glaseado' : 'Icing'}: ${icingText}]` + (notes ? ` ${notes}` : '');
    }

    const toppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked')).map(cb => cb.value);
    const extraToppings = toppings.filter(tVal => {
      const preIncludedMap = {
        'marshmallow_swirl_brownies': ['marshmallow'],
        'butterscotch_blondies': ['butterscotch chips'],
        'caramel_butterscotch_crunch_blondies': ['butterscotch chips', 'caramels dots', 'walnuts'],
        'carrot_cake_bars': ['pecans']
      };
      const included = preIncludedMap[selectedDessert.id] || [];
      if (selectedDessert.id === 'sweet_cornbread' && tVal.toLowerCase().trim() === 'honey butter on the side') {
        return false; // free
      }
      return !included.includes(tVal);
    });

    const EXTRA_TOPPING_PRICE = 0.75;
    const extraToppingsCost = extraToppings.length * EXTRA_TOPPING_PRICE;
    totalPrice = basePrice === null ? null : basePrice + extraToppingsCost;
  }

  const checkedToppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked')).map(cb => cb.value);

  const cartItem = {
    dessert_id: selectedDessert.id,
    name: itemTranslations[selectedDessert.id] ? itemTranslations[selectedDessert.id].name[currentLang] : selectedDessert.name,
    size: size,
    sizeLabel: sizeLabel,
    toppings: checkedToppings,
    notes: finalNotes,
    price: totalPrice,
    frosting_id: frosting_id
  };

  cart.push(cartItem);
  updateCartUI();

  // Reset fields for next item customization
  select.value = '';
  handleDessertChange('');
  document.getElementById('order-notes').value = '';
  updateOrderSummary();
}

window.addItemToCart = addItemToCart;

function removeCartItem(index) {
  cart.splice(index, 1);
  updateCartUI();
}

window.removeCartItem = removeCartItem;

function updateCartUI() {
  const listContainer = document.getElementById('cart-items-list');
  const badge = document.getElementById('cart-count-badge');
  const subtotalPrice = document.getElementById('cart-total-price');
  const checkoutSection = document.getElementById('checkout-details-section');

  if (!listContainer || !badge || !subtotalPrice || !checkoutSection) return;

  badge.textContent = cart.length;

  if (cart.length === 0) {
    listContainer.innerHTML = `<p style="font-style: italic; color: var(--text-muted); text-align: center; margin: 12px 0;" data-i18n="cart_empty">${t('cart_empty', 'Your cart is empty. Add a dessert above to start!')}</p>`;
    subtotalPrice.textContent = '$0.00';
    checkoutSection.classList.add('hidden');
    return;
  }

  checkoutSection.classList.remove('hidden');

  let html = '';
  let totalSum = 0;
  let hasTBD = false;

  cart.forEach((item, index) => {
    const dessertName = itemTranslations[item.dessert_id] ? itemTranslations[item.dessert_id].name[currentLang] : item.name;
    const priceDisplay = item.price === null ? 'TBD' : `$${item.price.toFixed(2)}`;
    if (item.price === null) hasTBD = true;
    else totalSum += item.price;

    const toppingsParts = item.toppings.map(tVal => {
      const key = 'topping_' + tVal.toLowerCase().replace(' ', '_');
      const name = i18n[currentLang][key] || tVal;
      if (tVal === 'honey butter on the side' && item.dessert_id === 'sweet_cornbread') {
        return `${name} (${currentLang === 'es' ? 'Gratis' : 'Free'})`;
      }
      const preIncludedMap = {
        'marshmallow_swirl_brownies': ['marshmallow'],
        'butterscotch_blondies': ['butterscotch chips'],
        'caramel_butterscotch_crunch_blondies': ['butterscotch chips', 'caramels dots', 'walnuts'],
        'carrot_cake_bars': ['pecans']
      };
      const included = preIncludedMap[item.dessert_id] || [];
      return included.includes(tVal) ? `${name} (${currentLang === 'es' ? 'Incluido' : 'Included'})` : `${name} (+$0.75)`;
    });

    const toppingsFormatted = toppingsParts.length > 0 ? toppingsParts.join(', ') : (currentLang === 'es' ? 'Ninguno' : 'None');

    html += `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 12px; background: white; border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div style="text-align: left;">
          <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">${dessertName} (${item.sizeLabel})</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;"><strong>Toppings:</strong> ${toppingsFormatted}</div>
          ${item.notes ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; font-style: italic;">"${item.notes}"</div>` : ''}
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; min-width: 80px;">
          <span style="font-weight: 700; color: var(--primary); font-size: 14px;">${priceDisplay}</span>
          <button type="button" style="background: none; border: none; color: #ef4444; font-size: 11px; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0;" onclick="removeCartItem(${index})">${t('btn_remove', 'Remove')}</button>
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;

  if (hasTBD) {
    subtotalPrice.textContent = totalSum > 0 ? `$${totalSum.toFixed(2)} + TBD` : 'TBD';
  } else {
    subtotalPrice.textContent = `$${totalSum.toFixed(2)}`;
  }
}

window.updateCartUI = updateCartUI;


async function fetchCinnamonRollsPricing() {
  try {
    const response = await fetch('/api/cinnamon-rolls/pricing');
    if (response.ok) {
      rollsPricingData = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch Cinnamon Rolls pricing options:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  detectInitialLanguage();
  fetchDesserts();
  fetchCinnamonRollsPricing();
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

  updateAdditionsCheckboxes();
  const select = document.getElementById('dessert-select');
  if (select) {
    renderSizeOptions(select.value);
  }
}

// Check and disable checkboxes of ingredients already included in the selected dessert
function updateAdditionsCheckboxes() {
  const select = document.getElementById('dessert-select');
  if (!select) return;
  const dessertId = select.value;
  
  const toppingsContainer = document.getElementById('toppings-container');
  if (!toppingsContainer) return;
  
  const toppingsCheckboxes = toppingsContainer.querySelectorAll('input[name="toppings"]');
  
  // Pre-included ingredients mapping
  const preIncludedMap = {
    'marshmallow_swirl_brownies': ['marshmallow'],
    'butterscotch_blondies': ['butterscotch chips'],
    'caramel_butterscotch_crunch_blondies': ['butterscotch chips', 'caramels dots', 'walnuts'],
    'carrot_cake_bars': ['pecans']
  };
  
  const includedToppings = preIncludedMap[dessertId] || [];
  
  toppingsCheckboxes.forEach(cb => {
    const isIncluded = includedToppings.includes(cb.value);
    const span = cb.nextElementSibling;
    if (!span) return;
    
    const i18nKey = span.getAttribute('data-i18n');
    let baseText = i18n[currentLang][i18nKey] || span.textContent;
    
    // Remove any previously appended "Included" labels
    baseText = baseText.replace(/ \((Included|Incluido|Already Included|Ya incluido)\)/i, '');
    
    if (isIncluded) {
      cb.checked = true;
      cb.disabled = true;
      const suffix = currentLang === 'es' ? ' (Ya incluido)' : ' (Included)';
      span.textContent = baseText + suffix;
    } else {
      if (cb.disabled) {
        cb.checked = false;
        cb.disabled = false;
      }
      
      // Remove any previously appended "Free" / "Gratis" labels
      baseText = baseText.replace(/ \((Free|Gratis)\)/i, '');
      
      if (cb.value === 'honey butter on the side' && dessertId === 'sweet_cornbread') {
        const freeSuffix = currentLang === 'es' ? ' (Gratis)' : ' (Free)';
        span.textContent = baseText + freeSuffix;
      } else {
        // Show +$0.75 hint on non-included toppings
        const extraSuffix = currentLang === 'es' ? ' (+$0.75)' : ' (+$0.75)';
        span.textContent = baseText + extraSuffix;
      }
    }
  });
}

// Render dynamic size or quantity options depending on selected dessert
function renderSizeOptions(dessertId) {
  const container = document.getElementById('size-options-container');
  const sectionLabel = document.getElementById('size-section-label');
  const rollsContainer = document.getElementById('cinnamon-rolls-options-container');
  
  if (!container || !sectionLabel) return;
  if (!dessertId) {
    container.innerHTML = '';
    if (rollsContainer) rollsContainer.classList.add('hidden');
    return;
  }

  const prevSelected = container.querySelector('input[name="size"]:checked')?.value;
  let html = '';

  if (dessertId === 'cinnamon_rolls') {
    sectionLabel.classList.add('hidden');
    container.classList.add('hidden');
    if (rollsContainer) {
      rollsContainer.classList.remove('hidden');
      renderCinnamonRollsOptions();
    }
  } else {
    sectionLabel.classList.remove('hidden');
    container.classList.remove('hidden');
    if (rollsContainer) rollsContainer.classList.add('hidden');

    sectionLabel.textContent = currentLang === 'es' ? 'Elige el Tamaño del Molde' : 'Choose Pan Size';
    
    const selectedDessert = dessertsData.find(d => d.id === dessertId);
    let price8x5Text = '';
    let price8x8Text = '';

    if (selectedDessert) {
      price8x5Text = selectedDessert.price_8x5 !== null 
        ? `$${selectedDessert.price_8x5.toFixed(2)}` 
        : i18n[currentLang].form_size_pricing_tbd;
      price8x8Text = selectedDessert.price_8x8 !== null 
        ? `$${selectedDessert.price_8x8.toFixed(2)}` 
        : i18n[currentLang].form_size_pricing_tbd;
    } else {
      price8x5Text = i18n[currentLang].form_size_pricing_tbd;
      price8x8Text = i18n[currentLang].form_size_pricing_tbd;
    }
      
    const is8x5Checked = prevSelected === '8x5' || !prevSelected || (prevSelected !== '8x5' && prevSelected !== '8x8');
    const is8x8Checked = prevSelected === '8x8';

    html += `
      <label class="radio-label">
        <input type="radio" name="size" value="8x5" ${is8x5Checked ? 'checked' : ''}>
        <div class="radio-design">
          <span class="size-title">${i18n[currentLang].form_size_8x5}</span>
          <span class="size-desc">${price8x5Text}</span>
        </div>
      </label>
      <label class="radio-label">
        <input type="radio" name="size" value="8x8" ${is8x8Checked ? 'checked' : ''}>
        <div class="radio-design">
          <span class="size-title">${i18n[currentLang].form_size_8x8}</span>
          <span class="size-desc">${price8x8Text}</span>
        </div>
      </label>
    `;
  }

  container.innerHTML = html;

  // Re-attach event listeners
  const sizeRadios = document.getElementsByName('size');
  sizeRadios.forEach(radio => {
    radio.addEventListener('change', updateOrderSummary);
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
    if (item.price_8x5 === null && item.price_8x8 === null) {
      priceLabel = `<span class="menu-card-price tbd">${currentLang === 'es' ? 'Precio: TBD' : 'Pricing: TBD'}</span>`;
    } else {
      const prices = [];
      if (item.price_8x5 !== null) prices.push(`8x5: $${item.price_8x5.toFixed(2)}`);
      if (item.price_8x8 !== null) prices.push(`8x8: $${item.price_8x8.toFixed(2)}`);
      else prices.push(`8x8: ${currentLang === 'es' ? 'TBD' : 'TBD'}`);
      
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

  const icingRadios = document.getElementsByName('icing_option');
  icingRadios.forEach(radio => {
    radio.addEventListener('change', updateOrderSummary);
  });

  const dateInput = document.getElementById('requested-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

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
  const icingContainer = document.getElementById('icing-container');
  const summaryIcingRow = document.getElementById('summary-icing-row');
  const selectedDessert = dessertsData.find(d => d.id === dessertId);
  
  if (!toppingsContainer) return;
  
  // Update icing selection visibility
  if (icingContainer) {
    if (dessertId === 'carrot_cake_bars') {
      icingContainer.classList.remove('hidden');
      if (summaryIcingRow) summaryIcingRow.classList.remove('hidden');
    } else {
      icingContainer.classList.add('hidden');
      if (summaryIcingRow) summaryIcingRow.classList.add('hidden');
    }
  }
  
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
    
    // Dynamic toppings filtering for Sweet Cornbread vs Brownies/Blondies
    const honeyButterLabel = document.getElementById('topping-honey-butter-label');
    const allCheckboxLabels = toppingsContainer.querySelectorAll('.checkbox-label');
    const toppingsLabelSpan = toppingsContainer.querySelector('label span:not(.label-optional)');
    const toppingsHelpP = toppingsContainer.querySelector('.form-help');
    
    if (dessertId === 'sweet_cornbread') {
      // Show only honey butter
      allCheckboxLabels.forEach(lbl => {
        if (lbl.id === 'topping-honey-butter-label') {
          lbl.classList.remove('hidden');
        } else {
          lbl.classList.add('hidden');
        }
      });
      // Customize label and helper description
      if (toppingsLabelSpan) {
        toppingsLabelSpan.textContent = currentLang === 'es' ? 'Elige Acompañantes' : 'Choose Add-ons';
      }
      if (toppingsHelpP) {
        toppingsHelpP.textContent = currentLang === 'es' ? 'Opcionalmente añade mantequilla de miel al lado.' : 'Optionally add honey butter on the side.';
      }
    } else {
      // Show everything except honey butter
      allCheckboxLabels.forEach(lbl => {
        if (lbl.id === 'topping-honey-butter-label') {
          lbl.classList.add('hidden');
        } else {
          lbl.classList.remove('hidden');
        }
      });
      // Restore standard labels and helper
      if (toppingsLabelSpan) {
        toppingsLabelSpan.textContent = i18n[currentLang].form_label_toppings;
      }
      if (toppingsHelpP) {
        toppingsHelpP.textContent = i18n[currentLang].form_toppings_help;
      }
    }
  } else {
    toppingsContainer.classList.add('hidden');
    // Clear checkmarks on hidden checkboxes
    const checkedBoxes = toppingsContainer.querySelectorAll('input[name="toppings"]:checked');
    checkedBoxes.forEach(cb => { cb.checked = false; });
  }

  renderSizeOptions(dessertId);
  updateAdditionsCheckboxes();
  updateOrderSummary();
}

// Calculate cost and refresh summary box
function updateOrderSummary() {
  const select = document.getElementById('dessert-select');
  if (!select) return;

  const selectedDessert = dessertsData.find(d => d.id === select.value);
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

  // Get translated dessert name
  const translatedName = itemTranslations[selectedDessert.id] ? itemTranslations[selectedDessert.id].name[currentLang] : selectedDessert.name;

  let basePrice = null;
  let totalPrice = null;
  let hasTBD = false;

  const summaryIcingRow = document.getElementById('summary-icing-row');
  const summaryIcingLabel = summaryIcingRow ? summaryIcingRow.querySelector('span:first-child') : null;
  const summaryIcingValue = document.getElementById('summary-icing-value');
  const summaryToppingsRow = document.getElementById('summary-toppings-row');

  if (selectedDessert.id === 'cinnamon_rolls') {
    if (summaryToppingsRow) summaryToppingsRow.classList.add('hidden');
    if (summaryIcingRow) {
      summaryIcingRow.classList.remove('hidden');
      if (summaryIcingLabel) {
        summaryIcingLabel.textContent = currentLang === 'es' ? 'Detalles de Rollos:' : 'Roll Details:';
      }
    }

    const sizeType = document.querySelector('input[name="roll_size_type"]:checked')?.value || 'regular';
    const qty = parseInt(document.querySelector('input[name="roll_qty"]:checked')?.value || '1');
    const style = document.querySelector('input[name="roll_style"]:checked')?.value || 'cooked';
    const frostingId = document.querySelector('input[name="roll_frosting"]:checked')?.value || 'classic';
    const placement = document.querySelector('input[name="roll_placement"]:checked')?.value || 'on_rolls';

    const sizeLabel = sizeType === 'regular' 
      ? (currentLang === 'es' ? 'Regular' : 'Regular') 
      : (currentLang === 'es' ? 'Mini' : 'Mini');
      
    const styleLabel = style === 'cooked' 
      ? (currentLang === 'es' ? 'Cocido' : 'Cooked') 
      : (currentLang === 'es' ? 'Crudo' : 'Uncooked');
      
    const frosting = rollsPricingData.frostings.find(f => f.id === frostingId);
    const frostingLabel = frosting ? frosting.name : frostingId;
    
    const placementLabel = placement === 'on_rolls' 
      ? (currentLang === 'es' ? 'Sobre los rollos' : 'On rolls') 
      : (currentLang === 'es' ? 'Aparte' : 'On side');

    if (summaryIcingValue) {
      summaryIcingValue.textContent = `${qty} ${sizeLabel} [${styleLabel}, ${frostingLabel}, ${placementLabel}]`;
    }

    const sizeText = `${qty} ${sizeLabel}`;
    if (summaryItemName) summaryItemName.textContent = `${translatedName} (${sizeText})`;

    // Lookup base price
    const found = rollsPricingData.rolls_prices.find(p => p.size === sizeType && p.quantity === qty);
    basePrice = found && found.price !== null ? found.price : null;

    if (basePrice !== null) {
      totalPrice = basePrice;
      if (frostingId !== 'classic') {
        const frostingObj = rollsPricingData.frostings.find(f => f.id === frostingId);
        if (frostingObj && frostingObj.price !== null) {
          totalPrice += qty * frostingObj.price;
        }
      }
    } else {
      hasTBD = true;
    }
  } else {
    const size = document.querySelector('input[name="size"]:checked')?.value;
    if (summaryToppingsRow) summaryToppingsRow.classList.remove('hidden');

    if (selectedDessert.id === 'carrot_cake_bars') {
      if (summaryIcingRow) {
        summaryIcingRow.classList.remove('hidden');
        if (summaryIcingLabel) {
          summaryIcingLabel.textContent = currentLang === 'es' ? 'Opción de Glaseado:' : 'Icing Option:';
        }
      }
      const checkedIcing = document.querySelector('input[name="icing_option"]:checked');
      if (checkedIcing) {
        const icingVal = checkedIcing.value;
        const icingMap = {
          'with_icing': i18n[currentLang].option_with_icing,
          'no_icing': i18n[currentLang].option_no_icing,
          'icing_side': i18n[currentLang].option_icing_side
        };
        if (summaryIcingValue) summaryIcingValue.textContent = icingMap[icingVal] || icingVal;
      }
    } else {
      if (summaryIcingRow) summaryIcingRow.classList.add('hidden');
    }

    let sizeText = size || '';
    if (size === '8x5' || size === '8x8' || size === '9x9') {
      sizeText = size;
    } else if (size) {
      const sizeKeys = {
        '1_roll': currentLang === 'es' ? '1 Rollo' : '1 Roll',
        '4_pack': currentLang === 'es' ? 'Paquete de 4' : '4 Pack',
        '6_pack': currentLang === 'es' ? 'Paquete de 6' : '6 Pack',
        'full_tray': currentLang === 'es' ? 'Bandeja Completa' : 'Full Tray'
      };
      sizeText = sizeKeys[size] || size;
    }
    if (summaryItemName) summaryItemName.textContent = `${translatedName} ${sizeText ? `(${sizeText})` : ''}`;

    if (size === '8x5') {
      basePrice = selectedDessert.price_8x5;
    } else if (size === '8x8') {
      basePrice = selectedDessert.price_8x8;
    } else if (size === '9x9') {
      basePrice = selectedDessert.price_9x9;
    } else if (size) {
      const rollPriceMap = {
        '1_roll': selectedDessert.price_1_roll,
        '4_pack': selectedDessert.price_4_pack,
        '6_pack': selectedDessert.price_6_pack,
        'full_tray': selectedDessert.price_12_pack
      };
      basePrice = rollPriceMap[size] !== undefined ? rollPriceMap[size] : null;
    }

    const extraToppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked'))
      .filter(cb => {
        if (cb.disabled) return false;
        if (cb.value === 'honey butter on the side' && selectedDessert.id === 'sweet_cornbread') {
          return false; // Honey butter is free for sweet cornbread!
        }
        return true;
      })
      .map(cb => cb.value);

    const EXTRA_TOPPING_PRICE = 0.75;
    const extraToppingsCost = extraToppings.length * EXTRA_TOPPING_PRICE;
    hasTBD = basePrice === null;
    totalPrice = hasTBD ? null : basePrice + extraToppingsCost;

    if (summaryToppingsList) {
      const allChecked = Array.from(document.querySelectorAll('input[name="toppings"]:checked'));
      if (allChecked.length > 0) {
        const parts = allChecked.map(cb => {
          const key = 'topping_' + cb.value.toLowerCase().replace(' ', '_');
          const name = i18n[currentLang][key] || cb.value;
          let label = '';
          if (cb.value === 'honey butter on the side' && selectedDessert.id === 'sweet_cornbread') {
            label = `${name} (${currentLang === 'es' ? 'Gratis' : 'Free'})`;
          } else {
            label = cb.disabled
              ? `${name} (${currentLang === 'es' ? 'Incluido' : 'Included'})`
              : `${name} (+$${EXTRA_TOPPING_PRICE.toFixed(2)})`;
          }
          return label;
        });
        summaryToppingsList.textContent = parts.join(', ');
      } else {
        summaryToppingsList.textContent = i18n[currentLang].summary_no_toppings;
      }
    }
  }

  if (summaryItemPrice) {
    summaryItemPrice.textContent = basePrice === null ? i18n[currentLang].summary_total_tbd : `$${basePrice.toFixed(2)}`;
  }

  if (summaryTotalPrice) {
    if (hasTBD) {
      summaryTotalPrice.textContent = i18n[currentLang].summary_total_tbd;
    } else {
      summaryTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    }
  }
}

// POST order to API
async function handleFormSubmit(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert(currentLang === 'es' ? 'Tu carrito está vacío.' : 'Your cart is empty.');
    return;
  }

  const submitBtn = document.getElementById('submit-order-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = i18n[currentLang].btn_submit_loading;

  const pickupDelivery = document.getElementById('pickup-delivery').value;
  const requestedDate = document.getElementById('requested-date').value;

  if (!requestedDate) {
    alert(currentLang === 'es' ? 'Por favor elige una fecha.' : 'Please select a date.');
    submitBtn.disabled = false;
    submitBtn.textContent = i18n[currentLang].btn_submit_order;
    return;
  }
  
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerEmail = document.getElementById('customer-email').value;

  // If no email, ask for confirmation before proceeding
  if (!customerEmail.trim()) {
    const msg = currentLang === 'es'
      ? '⚠️ No ingresaste un correo electrónico. Sin él no podremos enviarte actualizaciones de tu pedido.\n\n¿Deseas continuar sin correo?'
      : '⚠️ You didn\'t enter an email address. Without it we won\'t be able to send you order updates.\n\nDo you want to continue without an email?';
    if (!confirm(msg)) {
      submitBtn.disabled = false;
      submitBtn.textContent = i18n[currentLang].btn_submit_order;
      return;
    }
  }

  const orderItems = cart.map(item => ({
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    dessert_id: item.dessert_id,
    size: item.size,
    toppings: item.toppings,
    notes: item.notes,
    pickup_delivery: pickupDelivery,
    frosting_id: item.frosting_id,
    requested_date: requestedDate
  }));

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderItems)
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

    // Populate success items list
    const successListContainer = document.getElementById('success-items-list');
    if (successListContainer) {
      let itemsHtml = '';
      cart.forEach(item => {
        const dessertName = itemTranslations[item.dessert_id] ? itemTranslations[item.dessert_id].name[currentLang] : item.name;
        const priceDisplay = item.price === null ? 'TBD' : `$${item.price.toFixed(2)}`;
        itemsHtml += `
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span>• ${dessertName} (${item.sizeLabel})</span>
            <strong>${priceDisplay}</strong>
          </div>
        `;
      });
      successListContainer.innerHTML = itemsHtml;
    }

    // Translate fulfillment
    const translatedFulfillment = pickupDelivery === 'pickup' ? i18n[currentLang].form_fulfillment_pickup : i18n[currentLang].form_fulfillment_delivery;
    document.getElementById('success-fulfillment').textContent = translatedFulfillment;
    
    // Format requested date nicely for success modal
    const dateParts = requestedDate.split('-');
    let formattedRequestedDate = requestedDate;
    if (dateParts.length === 3) {
      const dObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      formattedRequestedDate = dObj.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    document.getElementById('success-requested-date').textContent = formattedRequestedDate;
    
    // Total price
    document.getElementById('success-price').textContent = result.total_price === 'TBD' ? `${i18n[currentLang].summary_total_tbd} (${currentLang === 'es' ? 'Por confirmar' : 'To be confirmed'})` : `$${result.total_price.toFixed(2)}`;

    // Display group order reference next to the title
    const modalTitle = document.querySelector('#success-modal .modal-title');
    if (modalTitle) {
      modalTitle.innerHTML = `${i18n[currentLang].success_modal_title} <span style="font-size: 14px; display: block; color: var(--primary); margin-top: 6px; font-weight: 600;">Ref: #${result.group_id}</span>`;
    }

    document.getElementById('success-modal').style.display = 'block';

    // Clear/Reset cart and form
    cart = [];
    updateCartUI();
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

// Render custom Cinnamon Rolls selectors dynamically
function renderCinnamonRollsOptions() {
  const container = document.getElementById('cinnamon-rolls-options-container');
  if (!container) return;

  const selectedSize = document.querySelector('input[name="roll_size_type"]:checked')?.value || 'regular';
  const selectedQty = document.querySelector('input[name="roll_qty"]:checked')?.value || '1';
  const selectedStyle = document.querySelector('input[name="roll_style"]:checked')?.value || 'cooked';
  const selectedFrosting = document.querySelector('input[name="roll_frosting"]:checked')?.value || 'classic';
  const selectedPlacement = document.querySelector('input[name="roll_placement"]:checked')?.value || 'on_rolls';

  const isEs = (currentLang === 'es');
  const quantities = selectedSize === 'regular' ? [1, 3, 6, 9] : [1, 3, 6, 9, 12, 15, 18, 21, 24];

  const getPrice = (qty) => {
    const found = rollsPricingData.rolls_prices.find(p => p.size === selectedSize && p.quantity === parseInt(qty));
    return found && found.price !== null ? `$${found.price.toFixed(2)}` : (isEs ? 'TBD' : 'TBD');
  };

  let html = `
    <!-- Roll Size Category -->
    <div style="margin-bottom: 20px;">
      <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">
        ${isEs ? 'Elige el Tamaño del Rollo' : 'Choose Roll Size'}
      </label>
      <div class="radio-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <label class="radio-label" style="padding: 10px;">
          <input type="radio" name="roll_size_type" value="regular" ${selectedSize === 'regular' ? 'checked' : ''} onchange="renderCinnamonRollsOptions(); updateOrderSummary();">
          <div class="radio-design">
            <span class="size-title" style="font-size: 14px;">${isEs ? 'Tamaño Regular (Grande)' : 'Regular Size (Big)'}</span>
          </div>
        </label>
        <label class="radio-label" style="padding: 10px;">
          <input type="radio" name="roll_size_type" value="mini" ${selectedSize === 'mini' ? 'checked' : ''} onchange="renderCinnamonRollsOptions(); updateOrderSummary();">
          <div class="radio-design">
            <span class="size-title" style="font-size: 14px;">${isEs ? 'Tamaño Mini (Pequeño)' : 'Mini Size (Small)'}</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Roll Quantity Selection -->
    <div style="margin-bottom: 20px;">
      <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">
        ${isEs ? 'Cantidad de Rollos' : 'Number of Rolls'}
      </label>
      <div class="radio-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px;">
        ${quantities.map(qty => {
          const isChecked = parseInt(selectedQty) === qty || (quantities.indexOf(parseInt(selectedQty)) === -1 && qty === quantities[0]);
          return `
            <label class="radio-label" style="padding: 8px; text-align: center;">
              <input type="radio" name="roll_qty" value="${qty}" ${isChecked ? 'checked' : ''} onchange="updateOrderSummary();">
              <div class="radio-design" style="flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                <span class="size-title" style="font-size: 14px; font-weight: 700;">${qty}</span>
                <span style="font-size: 11px; opacity: 0.85;">${getPrice(qty)}</span>
              </div>
            </label>
          `;
        }).join('')}
      </div>
      ${selectedSize === 'mini' ? `
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
          * ${isEs ? '12 mini rollos es medio lote, 24 mini rollos es un lote completo.' : '12 mini rolls is a half batch, 24 mini rolls is a full batch.'}
        </p>
      ` : `
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
          * ${isEs ? '9 rollos regulares es un lote completo.' : '9 regular rolls is a full batch.'}
        </p>
      `}
    </div>

    <!-- Bake Style Choice (Cooked vs Uncooked) -->
    <div style="margin-bottom: 20px;">
      <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">
        ${isEs ? 'Opción de Cocción' : 'Baking Style'}
      </label>
      <div class="radio-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <label class="radio-label" style="padding: 10px;">
          <input type="radio" name="roll_style" value="cooked" ${selectedStyle === 'cooked' ? 'checked' : ''} onchange="updateOrderSummary();">
          <div class="radio-design">
            <span class="size-title" style="font-size: 14px;">${isEs ? 'Cocidos (Listos para comer)' : 'Cooked (Ready to Eat)'}</span>
          </div>
        </label>
        <label class="radio-label" style="padding: 10px;">
          <input type="radio" name="roll_style" value="uncooked" ${selectedStyle === 'uncooked' ? 'checked' : ''} onchange="updateOrderSummary();">
          <div class="radio-design">
            <span class="size-title" style="font-size: 14px;">${isEs ? 'Crudos (Para hornear en casa)' : 'Uncooked (Bake at Home)'}</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Frosting Selection -->
    <div style="margin-bottom: 20px;">
      <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">
        ${isEs ? 'Selección de Glaseado' : 'Choose Frosting'}
      </label>
      <div class="radio-group" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        ${rollsPricingData.frostings.map(f => {
          const isChecked = selectedFrosting === f.id;
          const upchargeText = f.price > 0 ? `+$${f.price.toFixed(2)} ${isEs ? 'c/u' : 'ea'}` : (isEs ? 'Incluido' : 'Included');
          return `
            <label class="radio-label" style="padding: 10px;">
              <input type="radio" name="roll_frosting" value="${f.id}" ${isChecked ? 'checked' : ''} onchange="updateOrderSummary();">
              <div class="radio-design" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                <span class="size-title" style="font-size: 14px; font-weight: 600;">${f.name}</span>
                <span style="font-size: 11px; opacity: 0.85; color: var(--accent); font-weight: 500;">${upchargeText}</span>
              </div>
            </label>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Frosting Placement -->
    <div>
      <label style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block;">
        ${isEs ? 'Ubicación del Glaseado' : 'Frosting Placement'}
      </label>
      <div class="radio-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <label class="radio-label" style="padding: 10px;">
          <input type="radio" name="roll_placement" value="on_rolls" ${selectedPlacement === 'on_rolls' ? 'checked' : ''} onchange="updateOrderSummary();">
          <div class="radio-design">
            <span class="size-title" style="font-size: 14px;">${isEs ? 'Sobre los rollos' : 'On the rolls'}</span>
          </div>
        </label>
        <label class="radio-label" style="padding: 10px;">
          <input type="radio" name="roll_placement" value="on_side" ${selectedPlacement === 'on_side' ? 'checked' : ''} onchange="updateOrderSummary();">
          <div class="radio-design">
            <span class="size-title" style="font-size: 14px;">${isEs ? 'Al lado (envase aparte)' : 'On the side'}</span>
          </div>
        </label>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

window.renderCinnamonRollsOptions = renderCinnamonRollsOptions;
